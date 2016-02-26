import React, {Component, PropTypes} from "react";
import ToolTip from 'react-portal-tooltip'
import ResizeableWrapper from '../components/resizeable-wrapper';

class Div extends Component {
   render(){
      var style = {
         backgroundColor: 'rgba(98, 177, 254, 1.0)',
         width: '100%',
         height: '100%'
      };
      return (
         <div style={style} id={this.props.uniqueId}>
            <ToolTip active={this.props.active} position="top" arrow="center" parent={"#"+this.props.uniqueId}>
               Hallo
            </ToolTip>
         </div>
      );
   }
}
export default ResizeableWrapper(Div, {
   style: {
      float: 'left'
   },
   resizeSteps: 10
});
