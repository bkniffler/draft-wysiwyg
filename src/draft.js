import React, {Component, PropTypes} from "react";
import {Editor, EditorState, CompositeDecorator, ContentState, convertToRaw, convertFromRaw} from "draft-js";
import {Modifier, SelectionState, Entity, CharacterMetadata, ContentBlock, genKey, BlockMapBuilder} from "draft-js";
import {List, Repeat} from 'immutable';
import request from 'superagent';

import Toolbar from './draft-toolbar'

const decorator = new CompositeDecorator([]);
const styleMap = {
   'JUSTIFY': {
      textAlign: 'justify'
   },
};
export default class DraftWysiwyg extends Component {
   constructor(props) {
      super(props);

      // Create empty state and insert value from JSON if exists
      var value = EditorState.createEmpty(decorator);
      if (props.value) {
         value = EditorState.push(value, ContentState.createFromBlockArray(convertFromRaw(props.value)));
      }

      // Set value to state
      this.state = {
         value,
         active: null,
         fileDrag: false
      };
   }

   shouldComponentUpdate(props, state) {
      // Don't update if new value in props, instead setState() with new value
      if (props.value !== this.lastState) {
         if (!props.value) {
            // No value? Empty
            this.setState({
               value: EditorState.createEmpty(decorator)
            });
         }
         else {
            // Got value? Push it.
            this.setState({
               value: EditorState.push(
                  this.state.value,
                  ContentState.createFromBlockArray(convertFromRaw(props.value))
               )
            });
         }
         this.lastState = props.value;
         return false;
      }
      return true;
   }

   // Focus
   focus(){
      this.refs.editor.focus();
   }

   // Remove toolbars and active blocks on blur
   blur(){
      this.setState({active: null});
   }

   // Propagate editorState changes to parent and to state
   updateValue(editorState){
      this.lastState = convertToRaw(editorState.getCurrentContent());
      if (this.props.updateValue) {
         this.props.updateValue(this.lastState);
      }
      this.setState({value: editorState});
   };

   // Handle block dropping
   drop(e) {
      if(containsFiles(e)){
         return;
      }
      // Get data 'text' (anything else won't move the cursor) and expecting kind of data (text/key)
      var data = e.dataTransfer.getData("text") ? e.dataTransfer.getData("text").split(':') : [];
      if(data.length !== 2){
         return;
      }
      e.preventDefault();

      // Set timeout to allow cursor/selection to move to drop location
      setTimeout(()=> {
         // Existing block dropped
         if(data[0] === 'key'){
            var blockKey = data[1];
            // Get content, selection, block
            var block = this.state.value.getCurrentContent().getBlockForKey(blockKey);
            var editorStateAfterInsert = DraftWysiwyg.AddBlock(this.state.value, null, block.getType(), Entity.get(block.getEntityAt(0)).data);
            this.setState({value: DraftWysiwyg.RemoveBlock(editorStateAfterInsert, blockKey)});
         }
         // New block dropped
         else if(data[0] === 'type'){
            var blockType = data[1];
            // Get content, selection, block
            var editorStateAfterInsert = DraftWysiwyg.AddBlock(this.state.value, null, blockType, {});
            this.setState({value: editorStateAfterInsert});
         }
      }, 1);
      return false;
   }

   // Helper function for blocks to set their own data
   setEntityData(block, data) {
      var entityKey = block.getEntityAt(0);
      if (entityKey) {
         Entity.mergeData(entityKey, {...data});
         // Force refresh
         this.updateValue(EditorState.createWithContent(this.state.value.getCurrentContent(), decorator));
      }
      return {...data};
   }

   // Handle block rendering and inject entity data, active state, setEntityData(), activate() to blockProps
   blockRenderer(contentBlock) {
      const entityKey = contentBlock.getEntityAt(0);
      let data = entityKey ? Entity.get(entityKey).data : {};

      // Rely on renderBlock of parent
      if (this.props.renderBlock) {
         return this.props.renderBlock(contentBlock, {
            ...data,
            setEntityData: ::this.setEntityData,
            activate: (active)=>{
               this.setState({active: active ? contentBlock.key : null});
               // Force refresh
               this.updateValue(EditorState.createWithContent(this.state.value.getCurrentContent(), decorator));
            },
            active: this.state.active  === contentBlock.key
         });
      }
   }

   // Handle keydown events on blocks
   keyDown(e){
      if(!this.state.active){
         return;
      }
      var key = e.keyCode || e.charCode;
      // Remove if backspace
      if(key === 8 || key === 46){
         this.setState({
            value: DraftWysiwyg.RemoveBlock(this.state.value, this.state.active)
         });
         e.preventDefault();
         return false;
      }
       // Select start of next range if arrow down/right
      else if(key === 39 || key === 40){
         var block = DraftWysiwyg.GetNextBlock(this.state.value, this.state.active);
         if(block){
            this.setState({
               active: null,
               value: DraftWysiwyg.SetSelectionToBlock(this.state.value, block.getKey(), 'start')
            });
            e.preventDefault();
            return false;
         }
      }
      // Select end of previous range if arrow up/left
      else if(key === 37 || key === 38){
         var block = DraftWysiwyg.GetPreviousBlock(this.state.value, this.state.active);
         if(block){
            this.setState({
               active: null,
               value: DraftWysiwyg.SetSelectionToBlock(this.state.value, block.getKey(), 'end')
            });
            e.preventDefault();
            return false;
         }
      }
   }

   // Render the default-toolbar
   renderToolbar(){
      const editorState = this.state.value;
      const onChange = ::this.updateValue;
      // Get current selection (from draft)
      const selectionState = this.state.value.getSelection();
      // Nothing selected? No toolbar please.
      if (selectionState.isCollapsed()) {
         return null;
      }

      // Get current selection (natively)
      var selected = getSelected();
      // Get selection rectangle (position, size) and set to state
      if(!selected.rangeCount){
         return null;
      }
      var rect = selected.getRangeAt(0).getBoundingClientRect();

      var info = {left: rect.left, top: rect.top, width: rect.width};
      return this.props.renderToolbar
          ? this.props.renderToolbar({...info, editorState, selectionState, onChange})
          : <Toolbar {...info} editorState={editorState} selectionState={selectionState} onChange={onChange}/>;
   }

   // Handle drag-over
   dragOverFile(e) {
      if(this.state.fileDrag === true || !containsFiles(e)){
         return;
      }
      this.setState({fileDrag: true});
   }

   // Handle drag-leave
   dragLeaveFile(e) {
      if(!containsFiles(e)){
         return;
      }
      this.setState({fileDrag: false});
   }

   // Handle drop
   dropFile(e, files){
      this.setState({fileDrag: false, uploading: true});

      var data = new FormData();
      for(var key in files){
         data.append('files', files[key]);
      }
      request.post('/upload')
          .accept('application/json')
          .send(data)
          .on('progress', ({ percent }) => {
             this.setState({percent: percent !== 100 ? percent : null});
          })
          .end((err, res) => {
             this.setState({uploading: false, uploadError: err});
             if (err) {
                console.log(err);
             }
             else if(res.body.files && res.body.files.length){
                var value = this.state.value;
                res.body.files.forEach(function(x){
                   value = DraftWysiwyg.AddBlock(value, e, 'image', x);
                });
                this.setState({value});
             }
          });
      return false;
   }

   render() {
      const {fileDrag, percent} = this.state;
      const classNames = ['wrapper'];;
      if(fileDrag){
         classNames.push('uploading');
      }
      // Set drag/drop handlers to outer div as editor won't fire those
      return (
         <div className={classNames.join(' ')} onKeyDown={::this.keyDown} onDragOver={::this.dragOverFile} onDragLeave={::this.dragLeaveFile} onClick={::this.focus} onDrop={::this.drop} onBlur={::this.blur}>
            <Editor customStyleMap={styleMap}
                    editorState={this.state.value}
                    onChange={::this.updateValue}
                    ref="editor"
                    handleDroppedFiles={::this.dropFile}
                    blockRendererFn={::this.blockRenderer}
                {...this.props} />
            {this.renderToolbar()}
            {percent ? <div className="uploading-progress">{percent}%</div> : null}
         </div>
      );
   }
}

DraftWysiwyg.defaultProps = {
   renderBlock: null,
   renderToolbar: null,
   value: null,
   updateValue: null
};

DraftWysiwyg.DisableWarnings = function(){
   var consoleError = console.error;
   console.error = function(err){
      if(err !== 'Warning: A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional.'){
         consoleError(err);
      }
   }
}

DraftWysiwyg.SetSelectionToBlock = function(editorState, key, range){
   var contentState = editorState.getCurrentContent();
   var block = contentState.getBlockForKey(key);
   if(!block){
      return;
   }
   var selectionSate = new SelectionState({
      anchorKey: block.getKey(),
      anchorOffset: !range || range === 'start' ? 0 : block.getLength(),
      focusKey: block.getKey(),
      focusOffset: range === 'start' ? 0 : block.getLength()
   });
   var newContent = contentState.merge({
      selectionBefore: editorState.getSelection(),
      selectionAfter: selectionSate.set('hasFocus', true)
   });
   return EditorState.push(editorState, newContent, 'insert-fragment');
}
DraftWysiwyg.GetNextBlock = function(editorState, key){
   var contentState = editorState.getCurrentContent();
   var blocks = contentState.getBlocksAsArray();
   for(var i=0; i<blocks.length; i++){
      if(key === blocks[i].getKey()){
         return (i+1) < blocks.length ? blocks[i+1] : null;
      }
   }
}
DraftWysiwyg.GetPreviousBlock = function(editorState, key){
   var contentState = editorState.getCurrentContent();
   var blocks = contentState.getBlocksAsArray();
   for(var i=0; i<blocks.length; i++){
      if(key === blocks[i].getKey()){
         return (i>0) ? blocks[i-1] : null;
      }
   }
}
DraftWysiwyg.RemoveBlock = function(editorState, key){
   var contentState = editorState.getCurrentContent();
   var block = contentState.getBlockForKey(key);
   if(!block){
      return editorState;
   }
   var selectionSate = new SelectionState({
      anchorKey: block.getKey(),
      anchorOffset: 0,
      focusKey: block.getKey(),
      focusOffset: block.getLength()
   });
   var afterRemoval = Modifier.removeRange(contentState, selectionSate, 'backward');
   // Workaround, removeRange removed entity, but not the block
   var rawContent = convertToRaw(afterRemoval);
   rawContent.blocks = rawContent.blocks.filter(x=>x.key !== block.getKey());
   var newState = EditorState.push(editorState, ContentState.createFromBlockArray(convertFromRaw(rawContent)), 'remove-range');
   return newState;
}
// Expose AddBlock helper function to allow adding blocks externally, easily
DraftWysiwyg.AddBlock = function (editorState, selection, type, data, asJson) {
   // Get editorstate
   // If none -> get empty
   if (!editorState) {
      editorState = EditorState.createEmpty(decorator);
   }
   // If json -> convert to editorstate
   else if (asJson) {
      editorState = EditorState.push(
         EditorState.createEmpty(decorator),
         ContentState.createFromBlockArray(convertFromRaw(editorState))
      );
   }

   var contentState = editorState.getCurrentContent(), selectionState = editorState.getSelection();

   // Convert selection from string
   if (typeof selection === 'string') {
      var blocks = contentState.getBlocksAsArray();
      if (selection === 'start' && blocks.length) {
         selection = new SelectionState({
            anchorKey: blocks[0].getKey(),
            anchorOffset: 0,
            focusKey: blocks[0].getKey(),
            focusOffset: 0
         });
      }
      else if (selection === 'end' && blocks.length) {
         selection = new SelectionState({
            anchorKey: blocks[blocks.length - 1].getKey(),
            anchorOffset: blocks[blocks.length - 1].getLength(),
            focusKey: blocks[blocks.length - 1].getKey(),
            focusOffset: blocks[blocks.length - 1].getLength()
         });
      }
   }
   if (selection !== null) {
      selectionState = selection;
   }
   var insertionTarget, asMedia, selectedBlock = contentState.getBlockForKey(selectionState.anchorKey);

   // If dropped next to text
   if (selectionState.anchorKey === selectionState.focusKey && selectedBlock && !selectedBlock.text) {
      insertionTarget = selectionState;
      asMedia = Modifier.setBlockType(contentState, insertionTarget, type);
   }
   // If dropped next to empty
   else {
      var afterRemoval = Modifier.removeRange(contentState, selectionState, 'backward');
      var targetSelection = afterRemoval.getSelectionAfter();
      var afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
      afterSplit = Modifier.splitBlock(afterSplit, targetSelection);

      //afterSplit = Modifier.insertText(afterSplit, afterSplit.getSelectionAfter(), ' ');

      insertionTarget = afterSplit.getSelectionAfter();
      asMedia = Modifier.setBlockType(afterSplit, insertionTarget, type);
   }

   // Create entity etc.
   var entityKey = Entity.create('TOKEN', 'MUTABLE', data);
   var charData = CharacterMetadata.create({entity: entityKey});
   var fragment = BlockMapBuilder.createFromArray([
      new ContentBlock({
         key: genKey(),
         type: type,
         text: ' ',
         characterList: List(Repeat(charData, 1))
      })
   ]);
   var withMedia = Modifier.replaceWithFragment(asMedia, insertionTarget, fragment);
   var newContent = withMedia.merge({
      selectionBefore: selectionState,
      selectionAfter: withMedia.getSelectionAfter().set('hasFocus', true),
   });

   // Push editorstate with new content
   editorState = EditorState.push(editorState, newContent, 'insert-fragment');

   if (asJson) {
      // Return JSON
      return convertToRaw(editorState.getCurrentContent());
   }
   // Return default
   return editorState;
}

// Helper functions
function getSelected() {
   var t = '';
   if (window.getSelection) {
      t = window.getSelection();
   } else if (document.getSelection) {
      t = document.getSelection();
   } else if (document.selection) {
      t = document.selection.createRange().text;
   }
   return t;
}
function containsFiles(event) {
   if (event.dataTransfer.types) {
      for (var i = 0; i < event.dataTransfer.types.length; i++) {
         if (event.dataTransfer.types[i] == "Files") {
            return true;
         }
      }
   }
   return false;
}