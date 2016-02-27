import React, {Component, PropTypes} from "react";
import {ResizeableWrapper, Tooltip, ToolbarBase} from '../../src';

class Div extends Component {
   render(){
      var style = {
         backgroundColor: 'rgba(98, 177, 254, 1.0)',
         width: '100%',
         height: '100%',
         textAlign: 'center',
         color: 'white'
      };
      return (
         <div style={style} id={this.props.uniqueId}>
            Horizontal+Vertical
            <Tooltip active={!!this.props.active} parent={"#"+this.props.uniqueId}>
               <ToolbarBase actions={this.props.toolbarActions}/>
            </Tooltip>
         </div>
      );
   }
}
export default ResizeableWrapper(Div, {
   resizeSteps: 10,
   vertical: 'absolute'
});
