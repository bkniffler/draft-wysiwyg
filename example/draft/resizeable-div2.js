import React, {Component, PropTypes} from "react";
import {ResizeableWrapper, ToolTip, ToolbarBase} from '../../src';

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
            <ToolTip active={!!this.props.active} position="top" arrow="center" parent={"#"+this.props.uniqueId}>
               <ToolbarBase actions={this.props.toolbarActions}/>
            </ToolTip>
         </div>
      );
   }
}
export default ResizeableWrapper(Div);
