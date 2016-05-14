import React, {Component, PropTypes} from "react";

import { FocusDecorator } from 'draft-js-focus-plugin';
import { DraggableDecorator } from 'draft-js-dnd-plugin';
import { ToolbarDecorator } from 'draft-js-toolbar-plugin';
import { AlignmentDecorator } from 'draft-js-alignment-plugin';
import { ResizeableDecorator } from 'draft-js-resizeable-plugin';

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
      const { style, className, ratioContentStyle, ratioContainerStyle, createRatioPlaceholder } = this.props;
      var action = {
         active: false,
         button: <span>URL</span>,
         toggle: ()=>this.setUrl(),
         label: 'URL'
      };
      var styles = {
         width: '100%',
         height: '100%',
         position: 'relative',
         zIndex: 1,
         margin: '3px',
         ...style,
         ...ratioContainerStyle
      };
      return (
         <div style={style} contentEditable={false} className={className}>
            {createRatioPlaceholder()}
            <iframe width="100%" height="100%" style={ratioContentStyle} src={this.props.blockProps.url||defaultVideo} frameBorder="0" allowFullScreen />
            {/*<Toolbar active={this.props.active} parent={"#"+this.props.uniqueId} actions={[action, ...this.props.actions]}/>*/}
         </div>
      );
   }
}

export default ResizeableDecorator({
   resizeSteps: 10,
   ratio: 2/3,
   vertical: 'auto',
   handles: true,
   caption: true
})(
  DraggableDecorator(
    FocusDecorator(
      AlignmentDecorator(
        ToolbarDecorator()(
          Div
        )
      )
    )
  )
);