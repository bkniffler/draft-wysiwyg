import React, {Component, PropTypes} from "react";
import ResizeableWrapper from '../draft/components/resizeable-wrapper';
import ToolTip from '../draft/components/tooltip';
import ToolbarBase from "../draft/components/toolbar-base";

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
            <ToolTip active={!!this.props.active} parent={"#"+this.props.uniqueId}>
               <ToolbarBase actions={this.props.toolbarActions}/>
            </ToolTip>
         </div>
      );
   }
}
export default ResizeableWrapper(Div, {
   resizeSteps: 10,
   vertical: 'absolute'
});
