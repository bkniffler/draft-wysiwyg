import React, {Component, PropTypes} from "react";
import {Editor, EditorState, RichUtils, Entity} from "draft-js";
import Toolbar from "./toolbar";

export default class DraftToolbar extends Component {
   constructor(props) {
      super(props);
   }

   toggleAction(action, state){
      if(action.toggle){
         action.toggle(action, state, this.props.editorState, this.props.onChange);
      }
   }

   toggleBlockType(blockType) {
      this.props.onChange(
          RichUtils.toggleBlockType(
              this.props.editorState,
              blockType
          )
      );
   }

   toggleInlineStyle(inlineStyle) {
      this.props.onChange(
         RichUtils.toggleInlineStyle(
            this.props.editorState,
            inlineStyle
         )
      );
   }

   render() {
      const {editorState, blockTypes, inlineStyles, actions} = this.props
      var currentStyle = editorState.getCurrentInlineStyle();
      const block = editorState
         .getCurrentContent()
         .getBlockForKey(editorState.getSelection().getStartKey())
      const blockType = block.getType();

      var items = [
         ...blockTypes.map(x=>({icon: x.icon, button: x.button, label: x.label, active: blockType === x.style, toggle: ()=>this.toggleBlockType(x.style)})),
         ...inlineStyles.map(x=>({icon: x.icon, button: x.button, label: x.label, active: currentStyle.has(x.style), toggle: ()=>this.toggleInlineStyle(x.style)})),
         ...actions.map(x=>({
            icon: x.icon, button: x.button, label: x.label,
            active: typeof x.active === 'function' ? x.active(block, this.state, this.props.editorState) : x.active,
            toggle: (state)=>this.toggleAction(x, state)
         }))
      ];
      return (
         <Toolbar {...this.props} actions={items} />
      );
   }
}

DraftToolbar.defaultProps = {
   editorState: null,
   actions: [
      {label: 'Link', button: <span>Link</span>, style: 'link', active: function(block, state, editorState){
         var active, selection = editorState.getSelection();
         block.findEntityRanges(
             (character) => {
                const entityKey = character.getEntity();
                return entityKey !== null && Entity.get(entityKey).getType() === 'link';
             },
             (start, end)=>{
                if(block.getKey()===selection.anchorKey && selection.anchorKey === selection.focusKey){
                   if(selection.anchorOffset >= start && selection.focusOffset <= end){
                      active=true;
                   }
                }
             }
         );
         return active;
      }, toggle: function(action, state, editorState, onChange){
         const selection = editorState.getSelection();
         if (selection.isCollapsed()) {
            return;
         }
         if(state.active){
            onChange(RichUtils.toggleLink(editorState, selection, null));
         }
         else{
            const href = window.prompt('Enter a URL');
            const entityKey = Entity.create('link', 'MUTABLE', {href});
            onChange(RichUtils.toggleLink(editorState, selection, entityKey));
         }
      }}
   ],
   alignmentStyles: [
      {label: 'Left', button: <b>L</b>, style: 'left'},
      {label: 'Center', button: <i>C</i>, style: 'center'},
      {label: 'Justify', button: <i>J</i>, style: 'justify'},
      {label: 'Right', button: <u>R</u>, style: 'right'}
   ],
   inlineStyles: [
      {label: 'Bold', button: <b>B</b>, style: 'BOLD'},
      {label: 'Italic', button: <i>I</i>, style: 'ITALIC'},
      {label: 'Underline', button: <u>U</u>, style: 'UNDERLINE'}
   ],
   blockTypes: [
      {label: 'H1', button: <span>H1</span>, style: 'header-1'},
      {label: 'H2', button: <span>H2</span>, style: 'header-2'},
      {label: 'H3', button: <span>H3</span>, style: 'header-3'},
      {label: 'H4', button: <span>H4</span>, style: 'header-4'},
      {label: 'Blockquote', button: <i>"</i>, style: 'blockquote'},
      {label: 'UL', button: <span>UL</span>, style: 'unordered-list-item'},
      {label: 'OL', button: <span>OL</span>, style: 'ordered-list-item'},
      {label: 'Code Block', button: <span>#</span>, style: 'code-block'}
   ]
}
