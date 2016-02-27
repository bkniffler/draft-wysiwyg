import React, {Component, PropTypes} from "react";
import Portal from 'react-portal';
import ReactDOM from 'react-dom';

export default class Tooltip extends Component {
   constructor(props) {
      super(props);
      this.state = {};
   }

   shouldComponentUpdate(newProps, newState){
      if(this.update){
         this.update = false;
         return true;
      }
      if(this.props.parent !== newProps.parent){
         this.update = true;
         return true;
      }
      if(this.props.top !== newProps.top){
         this.update = true;
         return true;
      }
      if(this.props.left !== newProps.left){
         this.update = true;
         return true;
      }
      return false;
   }

   componentDidMount(){
      var {left, top, width} = this.props;
      if(this.props.parent){
         var parentEl = document.querySelector(this.props.parent);
         if(!parentEl){
            return;
         }
         var rect = parentEl.getBoundingClientRect();
         left = rect.left, top = rect.top, width = rect.width;
      }
      this.update = true;

      var ref = ReactDOM.findDOMNode(this.refs.tooltip);
      console.log(ref);
      if(ref){
         var refRect = ref.getBoundingClientRect();
         this.setState({
            top: top-(refRect.height),
            left: left-(refRect.width/2)+(width/2)
         });
      }
   }

   componentDidUpdate(){
      if(this.update){
         this.update = false;
         this.componentDidMount();
      }
   }

   render() {
      var visible = this.state.top && this.state.left;
      return (
         <Portal isOpened={true}>
            <div ref="tooltip" style={{width: '100px', height: '25px', zIndex:3, backgroundColor: 'black', position: 'absolute', left: this.state.left+'px', top: this.state.top+'px'}}>
               {this.props.children}
            </div>
         </Portal>
      );
   }
}
