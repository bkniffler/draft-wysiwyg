import React, {Component, PropTypes} from "react";
import {ResizeableWrapper, Toolbar} from '../../src';

var defaultVideo = 'https://www.youtube.com/embed/zalYJacOhpo';
class Div extends Component {
   setUrl(){
      var url = window.prompt("URL", this.props.blockProps.url||defaultVideo);
      if(url){
         const {setEntityData} = this.props.blockProps;
         setEntityData(this.props.block, {url});
      }
   }
   render(){
      var action = {
         active: false,
         button: <span>URL</span>,
         toggle: ()=>this.setUrl(),
         label: 'URL'
      };
      var style = {
         width: '100%',
         height: '100%',
         position: 'relative'
      };
      return (
         <div id={this.props.uniqueId} style={style}>
            <iframe width="100%" height="100%" src={this.props.blockProps.url||defaultVideo} frameBorder="0" allowFullScreen />
            <Toolbar active={this.props.active} parent={"#"+this.props.uniqueId} actions={[action, ...this.props.actions]}/>
         </div>
      );
   }
}
export default ResizeableWrapper(Div, {
   resizeSteps: 10,
   ratio: 2/3,
   vertical: 'auto',
   handles: true,
   caption: true
});
