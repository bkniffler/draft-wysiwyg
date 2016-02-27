import React, {Component, PropTypes} from "react";
import Portal from 'react-portal';
import ReactDOM from 'react-dom';

export default class Tooltip extends Component {
   constructor(props) {
      super(props);
      this.state = {};
   }

   shouldComponentUpdate(newProps, newState){
      // Explicitly set to update in componentDidMount
      if(this.shouldUpdate){
         this.shouldUpdate = false;
         return true;
      }
      // Relevant props changed
      if(this.props.parent !== newProps.parent
          || this.props.top !== newProps.top
          || this.props.left !== newProps.left
          || this.props.width !== newProps.width){
         this.shouldUpdate = true;
         return true;
      }
      return false;
   }

   componentDidMount(){
      var {left, top, width} = this.props;

      // Was props.parent set? Query parent element and get its rect
      if(this.props.parent){
         var parentEl = document.querySelector(this.props.parent);
         if(!parentEl){
            return;
         }
         var rect = parentEl.getBoundingClientRect();
         left = rect.left, top = rect.top, width = rect.width;
      }

      // Get tooltip ref for width centering
      var ref = ReactDOM.findDOMNode(this.refs.tooltip);
      if(ref){
         // Should update next time
         this.shouldUpdate = true;
         var refRect = ref.getBoundingClientRect();

         var scrollY = window.scrollY ? window.scrollY : window.pageYOffset;
         var scrollX = window.scrollX ? window.scrollX : window.pageXOffset;
         // Set state
         this.setState({
            top: top-(refRect.height) + scrollY,
            left: left-(refRect.width/2)+(width/2)+scrollX
         });
      }
   }

   componentDidUpdate(){
      // Should update by componentShouldUpdate set
      if(this.shouldUpdate){
         this.shouldUpdate = false;
         this.componentDidMount();
      }
   }

   render() {
      // Is server?
      if(typeof window === 'undefined'){
         return null;
      }
      return (
         <Portal isOpened={true}>
            <div ref="tooltip" style={{width: '100px', height: '25px', zIndex:3, backgroundColor: 'black', position: 'absolute', left: this.state.left+'px', top: this.state.top+'px'}}>
               {this.props.children}
            </div>
         </Portal>
      );
   }
}
