import React, {Component, PropTypes} from "react";
import {ResizeableWrapper, Toolbar} from '../../src';

class Div extends Component {
   render(){
      var style = {
         backgroundColor: 'rgba(100, 100, 100, 1.0)',
         width: '100%',
         height: '100%',
         textAlign: 'center',
         color: 'white'
      };
      return (
         <div style={style} id={this.props.uniqueId}>
            Horizontal only
            <Toolbar active={this.props.active} parent={"#"+this.props.uniqueId} actions={this.props.actions}/>
         </div>
      );
   }
}
export default ResizeableWrapper(Div);
