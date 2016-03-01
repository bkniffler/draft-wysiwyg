import React, {Component, PropTypes} from "react";
import DraftEditorBlock from 'draft-js/lib/DraftEditorBlock.react';

export default class Paragraph extends Component {
   render(){
      return (
          <div className="paragraph">
             <DraftEditorBlock {...this.props}/>
          </div>
      )
   }
}