import React, {Component, PropTypes} from "react";
import {Editor, Entity, EditorState, CompositeDecorator, ContentState, convertToRaw, convertFromRaw, Modifier, SelectionState} from "draft-js";
import {ContainsFiles, GetSelected} from './utils';
import {AddBlock, RemoveBlock, GetNextBlock, GetPreviousBlock, SelectBlock} from './draft-utils';
import Toolbar from './draft-toolbar'

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
   focus(e){
      this.refs.editor.focus();
      e.preventDefault();
      e.stopPropagation();
      return false;
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
      var raw = e.dataTransfer.getData("text");
      var data = raw ? raw.split(':') : [];
      if(data.length !== 2){
         return;
      }
      this.suppress = true;
      var value = this.state.value;
      // Set timeout to allow cursor/selection to move to drop location
      setTimeout(()=> {
         var selection = this.state.value.getSelection();
         // Ugly workaround as dropped text (as in raw, e.g. 'type:xy') is inserted to editor, due to setTimeout
         var newContent = value.getCurrentContent().merge({
            selectionBefore: value.getSelection(),
            selectionAfter: new SelectionState({
               anchorKey: selection.anchorKey,
               anchorOffset: selection.anchorOffset-raw.length,
               focusKey: selection.focusKey,
               focusOffset: selection.focusOffset-raw.length
            }).set('hasFocus', true)
         });
         // Existing block dropped
         this.suppress = false;
         if(data[0] === 'key'){
            var blockKey = data[1];
            // Get content, selection, block
            var block = value.getCurrentContent().getBlockForKey(blockKey);
            var editorStateAfterInsert = AddBlock(EditorState.push(value, newContent, 'insert-fragment'), null, block.getType(), Entity.get(block.getEntityAt(0)).data);
            this.setState({value: RemoveBlock(editorStateAfterInsert, blockKey)});
         }
         // New block dropped
         else if(data[0] === 'type'){
            var blockType = data[1];
            // Get content, selection, block
            var editorStateAfterInsert = AddBlock(EditorState.push(value, newContent, 'insert-fragment'), null, blockType, {});
            this.setState({value: editorStateAfterInsert});
         }
      }, 1);
      e.preventDefault();
      e.stopPropagation();
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
      /*e.preventDefault();
      e.stopPropagation();
      return false;*/
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
         e.preventDefault();
         e.stopPropagation();
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
            <Editor editorState={this.state.value}
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

/*
 function getComponent(){
 return class Xy extends Component{
 componentDidMount(){
 console.log('Mount', this.props)
 }
 render(){
 return <a {...this.props} href="www.google.de">{this.props.children}</a>;
 }
 }
 }
const styleMap = {
   'JUSTIFY': {
      textAlign: 'justify'
   },
};

function findWithRegex(regex, contentBlock, callback) {
   const text = contentBlock.getText();
   let matchArr, start;
   while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index;
      callback(start, start + matchArr[0].length);
   }
}

function linkStrategy(contentBlock, callback) {
   findWithRegex(LINK_REGEX, contentBlock, callback);
}

const LINK_REGEX = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;;
*/
function findLinkEntities(contentBlock, callback) {
   contentBlock.findEntityRanges(
       (character) => {
          const entityKey = character.getEntity();
          return entityKey !== null && Entity.get(entityKey).getType() === 'link';
       },
       callback
   );
}
const Link = (props) => {
   const {href} = Entity.get(props.entityKey).getData();
   return (
       <a href={href} target="_blank">
          {props.children}
       </a>
   );
};
const decorator = new CompositeDecorator([{
   strategy: findLinkEntities,
   component: Link,
}]);