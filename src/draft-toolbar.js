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

   toggleInlineStyle(inlineStyle) {
      this.props.onChange(
         RichUtils.toggleInlineStyle(
            this.props.editorState,
            inlineStyle
         )
      );
   }

   render() {
      var currentStyle = this.props.editorState.getCurrentInlineStyle();
      const blockType = this.props.editorState
         .getCurrentContent()
         .getBlockForKey(this.props.editorState.getSelection().getStartKey())
         .getType();

      var items = [
         ...this.props.blockTypes.map(x=>({icon: x.icon, label: x.label, active: blockType === x.style, toggle: ()=>this.toggleBlockType(x.style)})),
         ...this.props.inlineStyles.map(x=>({icon: x.icon, label: x.label, active: currentStyle.has(x.style), toggle: ()=>this.toggleInlineStyle(x.style)})),
         ...this.props.actions.map(x=>({icon: x.icon, label: x.label, active: x.active, toggle: (state)=>this.toggleAction(x, state)}))
      ];
      return (
         <Toolbar {...this.props} actions={items} />
      );
   }
}

DraftToolbar.defaultProps = {
   actions: [],
   inlineStyles: [
      {label: 'Bold', icon: 'bold', style: 'BOLD'},
      {label: 'Italic', icon: 'italic', style: 'ITALIC'},
      {label: 'Underline', icon: 'underline', style: 'UNDERLINE'}
   ],
   blockTypes: [
      {label: 'H1', icon: 'header', style: 'header-one'},
      {label: 'H2', icon: 'header', style: 'header-two'},
      {label: 'Blockquote', icon: 'quote left', style: 'blockquote'},
      {label: 'UL', icon: 'list', style: 'unordered-list-item'},
      {label: 'OL', icon: 'ordered list', style: 'ordered-list-item'},
      {label: 'Code Block', icon: 'code', style: 'code-block'},
   ]
}
