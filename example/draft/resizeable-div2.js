import React, {Component, PropTypes} from "react";
import {ResizeableWrapper, Tooltip, ToolbarBase} from '../../src';

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
            <Tooltip active={!!this.props.active} position="top" arrow="center" parent={"#"+this.props.uniqueId}>
               <ToolbarBase actions={this.props.toolbarActions}/>
            </Tooltip>
         </div>
      );
   }
}
export default ResizeableWrapper(Div);
