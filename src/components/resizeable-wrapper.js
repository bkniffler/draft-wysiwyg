import React, {Component, PropTypes} from "react";
import ReactDOM from 'react-dom';

class Wrapper extends Component {
   constructor(props){
      super();
      this.state = {
         hoverPosition: {},
         clicked: false
      };
   }
   activateBlock(active){
      if(this.props.blockProps.activate){
         this.props.blockProps.activate(active);
      }
      else{
         this.setState({active});
      }
   }
   align(position){
      var setEntityData = (this.props.setEntityData || this.props.blockProps.setEntityData);
      setEntityData(this.props.block, {align: position});
      // Reactivate for toolbar to follow
      this.activateBlock(false);
      setTimeout(()=>{
         this.activateBlock(true);
      }, 0);
   }
   click(e){
      if(this.state.clicked || this.state.active) return;
      var component = ReactDOM.findDOMNode(this.refs.div);
      this.activateBlock(true);
      var listener = ()=>{
         component.parentElement.removeEventListener('click', listener, false);
         this.activateBlock(false);
      };
      component.parentElement.addEventListener('click', listener, false);
   }
   mouseDown(e){
      if(!this.state.hoverPosition.resize){
         return;
      }
      const {resizeOptions, resizeSteps, vertical, horizontal} = this.props;
      const {width, height, hoverPosition} = this.state;
      const {isTop, isLeft, isRight, isBottom, resize} = hoverPosition;

      var component = ReactDOM.findDOMNode(this.refs.div);
      var startX, startY, startWidth, startHeight;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(component).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(component).height, 10);

      var doDrag = (e) => {
         var width = (startWidth + e.clientX - startX);
         var height = (startHeight + e.clientY - startY);
         var b = component.parentElement;
         width = b.clientWidth < width ? b.clientWidth : width;
         height = b.clientHeight < height ? b.clientHeight : height;

         var widthPerc = 100/b.clientWidth*width;
         var heightPerc = 100/b.clientHeight*height;

         var newState = {};
         if((isLeft||isRight) && horizontal === 'relative'){
            newState.width = resizeSteps ? round(widthPerc, resizeSteps) : widthPerc;
         }
         else if((isLeft||isRight) && horizontal === 'absolute'){
            newState.width = resizeSteps ? round(width, resizeSteps) : width;
         }

         if((isTop||isBottom) && vertical === 'relative'){
            newState.height = resizeSteps ? round(heightPerc, resizeSteps) : heightPerc;
         }
         else if((isTop||isBottom) && vertical === 'absolute'){
            newState.height = resizeSteps ? round(height, resizeSteps) : height;
         }

         this.setState(newState);
         e.stopPropagation();
         return false;
      }

      var stopDrag = (e) => {
         document.documentElement.removeEventListener('mousemove', doDrag, false);
         document.documentElement.removeEventListener('mouseup', stopDrag, false);

         var setEntityData = (this.props.setEntityData || this.props.blockProps.setEntityData);
         setEntityData(this.props.block, {width: this.state.width, height: this.state.height});

         this.setState({clicked: false, width: null, height: null});

         e.stopPropagation();
         return false;
      }

      document.documentElement.addEventListener('mousemove', doDrag, false);
      document.documentElement.addEventListener('mouseup', stopDrag, false);

      this.setState({clicked: true});
      e.stopPropagation();
      return false;
   }
   move(e){
      const {vertical, horizontal} = this.props;

      var hoverPosition = this.state.hoverPosition;
      var tolerance = 6;
      var pane = ReactDOM.findDOMNode(this.refs.div);

      var b = pane.getBoundingClientRect();
      var x = e.clientX - b.left;
      var y = e.clientY - b.top;

      var isTop = vertical ? y < tolerance : false;
      var isLeft = horizontal ? x < tolerance : false;
      var isRight = horizontal ? x >= b.width - tolerance : false;
      var isBottom = vertical ? y >= b.height - tolerance : false;

      var resize = isTop||isLeft||isRight||isBottom;

      var newHoverPosition = {
         isTop, isLeft, isRight, isBottom, resize
      };
      if(Object.keys(newHoverPosition).filter(key=>hoverPosition[key] !== newHoverPosition[key]).length){
         this.setState({hoverPosition: newHoverPosition});
      }
   }
   startDrag(e){
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.setData("text", this.props.block.key);
   }
   render(){
      const active = this.props.blockProps.active||this.state.active;
      const {width, height, hoverPosition} = this.state;
      const {Children, options, blockProps, resizeOptions, vertical, horizontal} = this.props;
      const {isTop, isLeft, isRight, isBottom, resize} = hoverPosition;

      var style = {
         display: 'block',
         height: '40px',
         position: 'relative',
         marginRight: '5px',
         marginBottom: '5px',
         zIndex: 2,
         ...(this.props.style||{}),
         outline: active ? '3px solid #FFC107' : null
      };

      if(this.props.blockProps.align === 'left' || this.props.blockProps.align === 'right'){
         style.float = this.props.blockProps.align;
         style.margin = '5px';
      }
      else{
         delete style.float;
         style.margin = '0 auto';
      }

      var className = [];

      if(horizontal === 'auto'){
         style.width = 'auto';
      }
      else if(horizontal === 'relative') {
         style.width = (width||blockProps.width||40)+'%';
      }
      else if(horizontal === 'absolute') {
         style.width = (width||blockProps.width||40)+'px';
      }

      if(vertical === 'auto'){
         style.height = 'auto';
      }
      else if(vertical === 'relative') {
         style.height = (height||blockProps.height||40)+'%';
      }
      else if(vertical === 'absolute') {
         style.height = (height||blockProps.height||40)+'px';
      }

      if (isRight && isBottom || isLeft && isTop) {
         style.cursor = 'nwse-resize';
      } else if (isRight && isTop || isBottom && isLeft) {
         style.cursor = 'nesw-resize';
      } else if (isRight || isLeft) {
         style.cursor = 'ew-resize';
      } else if (isBottom || isTop) {
         style.cursor = 'ns-resize';
      } else {
         style.cursor = 'default';
      }

      var actions = [{
         active: this.props.blockProps.align === 'left',
         icon: 'step backward',
         toggle: ()=>this.align('left'),
         label: 'Align left'
      },{
         active: !this.props.blockProps.align || this.props.blockProps.align === 'center',
         icon: 'stop',
         toggle: ()=>this.align('center'),
         label: 'Align center'
      },{
         active: this.props.blockProps.align === 'right',
         icon: 'step forward',
         toggle: ()=>this.align('right'),
         label: 'Align right'
      }];

      return (
         <div ref="div"
              onClick={this.click.bind(this)}
              onMouseMove={this.move.bind(this)}
              onMouseDown={this.mouseDown.bind(this)}
              onDragStart={this.startDrag.bind(this)}
              contentEditable="false"
              draggable={!resize}
              style={style}
              className={className.join(' ')}>
            <Children {...this.state} {...this.props} align={this.align.bind(this)} active={active} toolbarActions={actions} uniqueId={'id-'+this.props.block.key}/>
         </div>
      )
   }
};
Wrapper.defaultProps = {
   horizontal: 'relative',
   vertical: false,
   resizeSteps: 5
}

export default function WrapBlock(e, options){
   return (props)=>{
      return (
         <Wrapper {...props} {...options} Children={e}></Wrapper>
      );
   }
}

function round(x, steps)
{
   return Math.ceil(x/steps)*steps;
}