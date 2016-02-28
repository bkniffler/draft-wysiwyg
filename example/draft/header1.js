import React, {Component, PropTypes} from "react";
import DraftEditorBlock from 'draft-js/lib/DraftEditorBlock.react';

export default class Header1 extends Component {
   render(){
      return (
         <h1 className="ui dividing header">
            <DraftEditorBlock {...this.props}/>
         </h1>
      );
   }
}
