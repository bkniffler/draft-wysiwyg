import React, {Component, PropTypes} from "react";
import DraftEditorBlock from 'draft-js/lib/DraftEditorBlock.react';

export default function(size){
   return class Header extends Component {
      render(){
         return React.createElement('h'+size, { className: 'header' }, <DraftEditorBlock {...this.props}/>)
      }
   }
}
