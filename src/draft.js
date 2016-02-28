import React, {Component, PropTypes} from "react";
import {Editor, EditorState, CompositeDecorator, ContentState, convertToRaw, convertFromRaw} from "draft-js";
import {Modifier, SelectionState, Entity, CharacterMetadata, ContentBlock, genKey, BlockMapBuilder} from "draft-js";
import {List, Repeat} from 'immutable';

import Toolbar from './draft-toolbar'

const decorator = new CompositeDecorator([]);

export default class DraftWysiwyg extends Component {
   constructor(props) {
      super(props);

      // Create empty state and insert value from JSON if exists
      var value = EditorState.createEmpty(decorator);
      if (props.value) {
         value = EditorState.push(value, ContentState.createFromBlockArray(convertFromRaw(props.value)));
      }

      // Set value to state
      this.state = {value, active: null};
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
      this.setState({toolbar: null, active: null});
   }

   // Propagate editorState changes to parent and to state
   updateValue(editorState){
      this.lastState = convertToRaw(editorState.getCurrentContent());
      if (this.props.updateValue) {
         this.props.updateValue(this.lastState);
      }
      this.setState({value: editorState});
   };

   // Track text-selection for toolbar
   mouseUp() {
      // Insert timeout to allow selection to be up-to-date
      setTimeout(()=> {
         // Get current selection (from draft)
         var selection = this.state.value.getSelection();
         // Nothing selected? No toolbar please.
         if (selection.isCollapsed()) {
            return this.setState({toolbar: null});
         }
         else {
            // Get current selection (natively)
            var selected = getSelected();
            // Get selection rectangle (position, size) and set to state
            var rect = selected.getRangeAt(0).getBoundingClientRect();
            this.setState({toolbar: {left: rect.left, top: rect.top, width: rect.width}});
         }
      }, 1)
   }

   // Handle block dropping
   drop(e) {
      var blockKey = e.dataTransfer.getData("text");
      // Set timeout to allow cursor/selection to move to drop location
      setTimeout(()=> {
         console.log('Go2');
         // Get content, selection, block
         var block = this.state.value.getCurrentContent().getBlockForKey(blockKey);
         var editorStateAfterInsert = DraftWysiwyg.AddBlock(this.state.value, null, block.getType(), Entity.get(block.getEntityAt(0)).data);

         block = editorStateAfterInsert.getCurrentContent().getBlockForKey(blockKey);
         // Get block range and remove dragged block
         var targetRange = new SelectionState({
            anchorKey: block.getKey(),
            anchorOffset: 0,
            focusKey: block.getKey(),
            focusOffset: block.getLength()
         });
         console.log(targetRange);
         var afterRemoval = Modifier.removeRange(editorStateAfterInsert.getCurrentContent(), targetRange, 'backward');

         // Workaround, removeRange removed entity, but not the block
         var rawContent = convertToRaw(afterRemoval);
         rawContent.blocks = rawContent.blocks.filter(x=>x.key !== block.getKey());
         var newState = EditorState.push(this.state.value, ContentState.createFromBlockArray(convertFromRaw(rawContent)), 'remove-range');
         this.setState({value: newState});
      }, 1);
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

   // Render the default-toolbar
   renderToolbar(info, editorState, onChange){
      return (
         <Toolbar {...info} editorState={editorState} onChange={onChange}/>
      );
   }
   
   render() {
      var renderToolbar = this.props.renderToolbar || this.renderToolbar;
      // Set drag/drop handlers to outer div as editor won't fire those
      return (
         <div onClick={::this.focus} onDrop={::this.drop} onMouseUp={::this.mouseUp} onBlur={::this.blur}>
            <Editor editorState={this.state.value} onChange={::this.updateValue} ref="editor" blockRendererFn={::this.blockRenderer}/>
            {this.state.toolbar ? renderToolbar(this.state.toolbar, this.state.value, ::this.updateValue) : null}
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
      console.log('Go1', selectionState);
      var afterRemoval = Modifier.removeRange(contentState, selectionState, 'backward');
      var targetSelection = afterRemoval.getSelectionAfter();
      var afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
      afterSplit = Modifier.splitBlock(afterSplit, targetSelection);

      //afterSplit = Modifier.insertText(afterSplit, afterSplit.getSelectionAfter(), ' ');

      insertionTarget = afterSplit.getSelectionAfter();
      asMedia = Modifier.setBlockType(afterSplit, insertionTarget, type);
   }

   // Create entity etc.
   var entityKey = Entity.create('TOKEN', 'IMMUTABLE', data);
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

// Helper function
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