import React, {Component, PropTypes} from "react";
import {Editor, Entity, EditorState, CompositeDecorator, ContentState, convertToRaw, convertFromRaw} from "draft-js";
import {ContainsFiles, GetSelected} from './utils';
import {AddBlock, RemoveBlock, GetNextBlock, GetPreviousBlock, SelectBlock} from './draft-utils';
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
      if(this.suppress) return false;
      if(this.state.active !== state.active 
          || this.state.value !== state.value
          || this.state.readOnly !== state.readOnly
          || this.props.readOnly !== props.readOnly
          || this.props.fileDrag !== props.fileDrag 
          || this.props.uploading !== props.uploading 
          || this.props.percent !== props.percent
          || this.force){
         this.force = false;
         return true;
      }
      return false;
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
   updateValue(editorState, force){
      if(this.suppress && !force) return;
      this.setState({value: editorState});
      if (this.props.updateValue) {
         this.props.updateValue(convertToRaw(editorState.getCurrentContent()), editorState);
      }
   };

   // Handle block dropping
   drop(e) {
      if(ContainsFiles(e)){
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
            var editorStateAfterInsert = AddBlock(this.state.value, null, block.getType(), Entity.get(block.getEntityAt(0)).data);
            this.setState({value: RemoveBlock(editorStateAfterInsert, blockKey)});
         }
         // New block dropped
         else if(data[0] === 'type'){
            var blockType = data[1];
            // Get content, selection, block
            var editorStateAfterInsert = AddBlock(this.state.value, null, blockType, {});
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
         // workaround to refresh data (try updateValue with this.state.value -> blocks will not be resized)
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
            setReadOnly: (state)=>{
               this.setState({readOnly: state ? true : undefined});
            },
            editorProps: this.props,
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
            value: RemoveBlock(this.state.value, this.state.active)
         });
         e.preventDefault();
         return false;
      }
       // Select start of next range if arrow down/right
      else if(key === 39 || key === 40){
         var block = GetNextBlock(this.state.value, this.state.active);
         if(block){
            this.setState({
               active: null,
               value: SelectBlock(this.state.value, block.getKey(), 'start')
            });
            e.preventDefault();
            return false;
         }
      }
      // Select end of previous range if arrow up/left
      else if(key === 37 || key === 38){
         var block = GetPreviousBlock(this.state.value, this.state.active);
         if(block){
            this.setState({
               active: null,
               value: SelectBlock(this.state.value, block.getKey(), 'end')
            });
            e.preventDefault();
            return false;
         }
      }
   }

   // Render the default-toolbar
   renderToolbar(){
      if(this.props.readOnly === true || this.state.readOnly === true){
         return null;
      }
      const editorState = this.state.value;
      const onChange = ::this.updateValue;
      // Get current selection (from draft)
      const selectionState = this.state.value.getSelection();
      // Nothing selected? No toolbar please.
      if (selectionState.isCollapsed()) {
         return null;
      }

      // Get current selection (natively)
      var selected = GetSelected();
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
      if(this.state.fileDrag === true || !ContainsFiles(e)){
         return;
      }
      this.setState({fileDrag: true});
   }

   // Handle drag-leave
   dragLeaveFile(e) {
      if(!ContainsFiles(e)){
         return;
      }
      this.setState({fileDrag: false});
   }

   // Handle drop
   dropFile(e, files){
      if(this.props.upload){
         this.setState({fileDrag: false, uploading: true});

         var data = new FormData();
         for(var key in files){
            data.append('files', files[key]);
         }
         this.setState({uploading: true});
         this.props.upload(data, (files, tag)=>{
            // Success, tag can be function that returns editorState or a tag-type (default: image)
            var value = this.state.value;
            files.forEach(function(x){
               value = typeof tag === 'function' ? tag(x) : AddBlock(value, e, tag||'image', x);
            });
            this.setState({uploading: false, uploadError: null, value});
         }, (err)=>{
            // Failed
            this.setState({uploading: false, uploadError: err});
         }, (percent)=>{
            // Progress
            this.setState({percent: percent !== 100 ? percent : null});
         });
         return false;
      }
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
                  {...this.props}
                  readOnly={this.state.readOnly === undefined ? this.props.readOnly : this.state.readOnly}/>
            {this.renderToolbar()}
            {percent ? <div className="uploading-progress">{percent}%</div> : null}
         </div>
      );
   }
}

DraftWysiwyg.defaultProps = {
   upload: null,
   renderBlock: null,
   renderToolbar: null,
   value: null,
   updateValue: null
};