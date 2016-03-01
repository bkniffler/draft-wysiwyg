import React, {Component, PropTypes} from "react";
import {ResizeableWrapper, Toolbar} from '../../src';

class Img extends Component {
   render(){
      var style = {
         width: '100%',
         height: '100%'
      };

      return (
          <div style={style} id={this.props.uniqueId}>
             <img src={this.props.blockProps.url} width="100%" height="auto"/>
             <Toolbar active={this.props.active} parent={"#"+this.props.uniqueId} actions={this.props.actions}/>
          </div>
      );
   }
}

export default ResizeableWrapper(Img, {
   resizeSteps: 10,
   vertical: 'auto'
});
