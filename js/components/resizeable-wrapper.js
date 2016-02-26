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
   click(e){
      if(this.state.clicked || this.state.active) return;
      var component = ReactDOM.findDOMNode(this.refs.div);
      this.setState({
         active: true
      });
      component.parentElement.addEventListener('click', ()=>{
         this.setState({
            active: false
         });
      }, false);
   }
   mouseDown(e){
      if(!this.state.hoverPosition.resize){
         return;
      }
      const {resizeMode, resizeOptions, resizeSteps} = this.props;

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

         if(resizeMode === 'options' || resizeOptions){
            var closest = Object.keys(resizeOptions).reduce(function (prev, curr) {
               return (Math.abs(curr - widthPerc) < Math.abs(prev - widthPerc) ? curr : prev);
            });

            this.setState({width: closest, height: heightPerc});
         }
         else if(resizeMode === 'relative'){
            this.setState({width: resizeSteps ? round(widthPerc, resizeSteps) : widthPerc, height: heightPerc});
         }
         else{
            this.setState({width: resizeSteps ? round(width, resizeSteps) : width, height});
         }
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
      var hoverPosition = this.state.hoverPosition;
      var tolerance = 6;
      var pane = ReactDOM.findDOMNode(this.refs.div);

      var b = pane.getBoundingClientRect();
      var x = e.clientX - b.left;
      var y = e.clientY - b.top;

      var isTop = y < tolerance;
      var isLeft = x < tolerance;
      var isRight = x >= b.width - tolerance;
      var isBottom = y >= b.height - tolerance;

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
      const {width, hoverPosition, active} = this.state;
      const {Children, options, blockProps, resizeOptions, resizeMode} = this.props;
      const {isTop, isLeft, isRight, isBottom, resize} = hoverPosition;

      console.log('Active', active);
      var style = {
         display: 'block',
         height: '40px',
         position: 'relative',
         marginRight: '5px',
         marginBottom: '5px',
         zIndex: 2,
         ...(this.props.style||{}),
         boxShadow: active ? '0 0 0 3px #FFC107' : null
      };
      var className = [];
      if(resizeMode === 'options' || resizeOptions){
         className.push(resizeOptions[(width||blockProps.width||40)]);
      }
      else if(resizeMode === 'relative'){
         style.width = (width||blockProps.width||40)+'%';
      }
      else{
         style.width = (width||blockProps.width||40)+'px';
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
            <Children {...this.state} {...this.props} uniqueId={'id-'+this.props.block.key}/>
         </div>
      )
   }
};
Wrapper.defaultProps = {
   resizeMode: 'relative',
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

/*var resizeOptions = {
 bootstrap: {
 16.6: 'col-md-2',
 33.3: 'col-md-4',
 50: 'col-md-6',
 66.6: 'col-md-8',
 83.3: 'col-md-10',
 100: 'col-md-12'
 },
 semantic: {
 12.5: 'two wide column',
 25: 'four wide column',
 37.5: 'six wide column',
 50: 'eight wide column',
 62.5: 'ten wide column',
 75: 'twelve wide column',
 87.5: 'fourteen wide column',
 100: 'sixteen wide column'
 }
 }*/