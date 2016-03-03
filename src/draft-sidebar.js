import React, {Component, PropTypes} from "react";
import {Editor, EditorState, RichUtils, Entity} from "draft-js";
import Tooltip from "./tooltip";
import {AddBlock} from "./draft-utils";

export default class DraftToolbar extends Component {
   constructor(props) {
      super(props);
   }

   mouseDown(e){
      e.preventDefault();
      return false;
   }

   add(key){
      this.props.onChange(
          AddBlock(this.props.editorState, null, key)
      );
   }

   render() {
      const {editorState, blockTypes, inlineStyles, actions} = this.props
      var currentStyle = editorState.getCurrentInlineStyle();
      const block = editorState
         .getCurrentContent()
         .getBlockForKey(editorState.getSelection().getStartKey())
      const blockType = block.getType();

      return (
          <Tooltip {...this.props} forceLeft={300} position="left">
             <div onMouseDown={::this.mouseDown} className="draft-sidebar">
                <div className="item">
                   <button>
                      +
                   </button>
                   <div className="menu">
                      {Object.keys(this.props.blockTypes).filter(key=>key.indexOf('header-')!==0&&key!=='unstyled').map((key)=>
                         <button onClick={()=>this.add(key)} key={key} data-tooltip={key}>
                            {key.substr(0, 2)}
                         </button>
                      )}
                   </div>
                </div>
             </div>
          </Tooltip>
      );
   }
}
