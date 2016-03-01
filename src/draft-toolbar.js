import React, {Component, PropTypes} from "react";
import {Editor, EditorState, RichUtils} from "draft-js";
import Toolbar from "./toolbar";

export default class DraftToolbar extends Component {
   constructor(props) {
      super(props);
   }

   toggleAction(action, state){
      if(action.toggle){
         action.toggle(action, state, this.props.editorState);
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

   toggleAlignment(blockType) {
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
      const {editorState, blockTypes, alignmentStyles, inlineStyles, actions} = this.props
      var currentStyle = editorState.getCurrentInlineStyle();
      const blockType = editorState
         .getCurrentContent()
         .getBlockForKey(editorState.getSelection().getStartKey())
         .getType();

      var items = [
         //...alignmentStyles.map(x=>({icon: x.icon, button: x.button, label: x.label, active: blockType === x.style, toggle: ()=>this.toggleAlignment(x.style)})),
         ...blockTypes.map(x=>({icon: x.icon, button: x.button, label: x.label, active: blockType === x.style, toggle: ()=>this.toggleBlockType(x.style)})),
         ...inlineStyles.map(x=>({icon: x.icon, button: x.button, label: x.label, active: currentStyle.has(x.style), toggle: ()=>this.toggleInlineStyle(x.style)})),
         ...actions.map(x=>({icon: x.icon, button: x.button, label: x.label, active: x.active, toggle: (state)=>this.toggleAction(x, state)}))
      ];
      return (
         <Toolbar {...this.props} actions={items} />
      );
   }
}

DraftToolbar.defaultProps = {
   editorState: null,
   actions: [],
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
      {label: 'H1', button: <span>H1</span>, style: 'header-one'},
      {label: 'H2', button: <span>H2</span>, style: 'header-two'},
      {label: 'Blockquote', button: <i>"</i>, style: 'blockquote'},
      {label: 'UL', button: <span>UL</span>, style: 'unordered-list-item'},
      {label: 'OL', button: <span>OL</span>, style: 'ordered-list-item'},
      {label: 'Code Block', button: <span>#</span>, style: 'code-block'}
   ]
}
