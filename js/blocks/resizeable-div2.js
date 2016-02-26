import React, {Component, PropTypes} from "react";
import ResizeableWrapper from '../components/resizeable-wrapper';
import ToolTip from 'react-portal-tooltip'

class Div extends Component {
   render(){
      var style = {
         backgroundColor: 'rgba(100, 100, 100, 1.0)',
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
      margin: '0 auto'
   }
});
