import React, {Component, PropTypes} from "react";
import ReactDOM from 'react-dom';

class Wrapper extends Component {
   constructor(props){
      super(props);
      this.state = {
         hoverPosition: {},
         clicked: false
      };
      this.listener = this.listener.bind(this);
   }
   componentWillUnmount(){
      this.listener();
   }
   // Activate the current block
   activateBlock(active){
      if(this.props.blockProps.activate){
         this.props.blockProps.activate(active);
      }
      else{
         this.setState({active});
      }
   }
   // Set alignment of current block ('left', 'right', 'center')
   align(position){
      const {setEntityData} = this.props.blockProps;

      setEntityData(this.props.block, {align: position});
      // Reactivate for toolbar to follow
      this.activateBlock(false);
      setTimeout(()=>{
         this.activateBlock(true);
      }, 0);
   }

   // Handle click to activate block
   click(e){
      const active = this.props.blockProps.active||this.state.active;
      const {clicked} = this.state;

      if(clicked || active) return;

      this.activateBlock(true);

      var component = ReactDOM.findDOMNode(this.refs.div);
      // Handle click outside of block to deactivate
      component.parentElement.addEventListener('click', this.listener, false);
   }
   listener(){
      var component = ReactDOM.findDOMNode(this.refs.div);
      component.parentElement.removeEventListener('click', this.listener, false);
      this.activateBlock(false);
   };

   // Handle mouse-move and setState if mouse on edges for resizing
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
   // Handle mousedown for resizing
   mouseDown(e){
      // No mouse-hover-position data? Nothing to resize!
      if(!this.state.hoverPosition.resize){
         return;
      }
      const {resizeSteps, vertical, horizontal} = this.props;
      const {hoverPosition} = this.state;
      const {isTop, isLeft, isRight, isBottom} = hoverPosition;

      var component = ReactDOM.findDOMNode(this.refs.div);
      var startX, startY, startWidth, startHeight;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(component).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(component).height, 10);

      // Do the actual drag operation
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

      // Finished dragging
      var stopDrag = (e) => {
         document.documentElement.removeEventListener('mousemove', doDrag, false);
         document.documentElement.removeEventListener('mouseup', stopDrag, false);

         const {setEntityData} = this.props.blockProps;
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
   // Handle start-drag and setData with blockKey
   startDrag(e){
      e.dataTransfer.dropEffect = 'move';
      // Declare data and give info that its an existing key and a block needs to be moved
      e.dataTransfer.setData("text", 'key:'+this.props.block.key);
   }
   render(){
      const active = !!(this.props.blockProps.active||this.state.active);
      const {width, height, hoverPosition, clicked} = this.state;
      const {Children, blockProps, vertical, horizontal, ratio, handles} = this.props;
      const {isTop, isLeft, isRight, isBottom, resize} = hoverPosition;

      // Compose style
      var style = {
         ...(this.props.style||{})
      };

      // Handle alignment for float/margin
      if(this.props.blockProps.align === 'left' || this.props.blockProps.align === 'right'){
         style.float = this.props.blockProps.align;
         style.margin = '5px';
         if(this.props.blockProps.align === 'left'){
            style.marginLeft = 0;
         }
         if(this.props.blockProps.align === 'right'){
            style.marginRight = 0;
         }
      }
      else{
         delete style.float;
         style.margin = '0 auto';
      }

      // Handle width/height
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

      // Handle cursor
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

      // Default toolbar actions
      var actions = [{
         active: this.props.blockProps.align === 'left',
         button: <span>L</span>,
         toggle: ()=>this.align('left'),
         label: 'Align left'
      },{
         active: !this.props.blockProps.align || this.props.blockProps.align === 'center',
         button: <span>C</span>,
         toggle: ()=>this.align('center'),
         label: 'Align center'
      },{
         active: this.props.blockProps.align === 'right',
         button: <span>R</span>,
         toggle: ()=>this.align('right'),
         label: 'Align right'
      }];

      var content = (
          <Children {...this.state}
              {...this.props}
              align={::this.align}
              active={active}
              actions={actions}
              uniqueId={'id-'+this.props.block.key}/>
      );

      // ClassNames
      var classes = ["draft-resizeable-wrapper"];
      if(active) classes.push('active');

      // Wrap into ratiobox to maintain aspect-ratio
      if(vertical === 'auto' && ratio){
         content = (
             <div className={"ratiobox-content"}>
                {content}
             </div>
         )

         classes.push('ratiobox');
         classes.push('ratio'+round(ratio*100, 5));
      }

      return (
         <div ref="div"
              onClick={::this.click}
              onMouseMove={::this.move}
              onMouseDown={::this.mouseDown}
              onDragStart={::this.startDrag}
              contentEditable="false"
              draggable={!resize}
              className={classes.join(' ')}
              style={style}>
            {resize && clicked? <div className="overlay"></div> : null}
            {/*There might be more elegan ways, handles for resizing*/}
            {handles ? <div className="overlay-m"></div> : null}
            {handles ? <div className="overlay-l"></div> : null}
            {handles ? <div className="overlay-r"></div> : null}
            {handles ? <div className="overlay-t"></div> : null}
            {handles ? <div className="overlay-b"></div> : null}
            {content}
         </div>
      )
   }
};
// DefaultProps
Wrapper.defaultProps = {
   horizontal: 'relative',
   vertical: false,
   ratio: null,
   resizeSteps: 5,
   handles: false
}

// Export
export default function WrapBlock(e, options){
   return (props)=>{
      return (
         <Wrapper {...props} {...options} Children={e}></Wrapper>
      );
   }
}

// Helper for rounding (steps)
function round(x, steps) {
   return Math.ceil(x/steps)*steps;
}