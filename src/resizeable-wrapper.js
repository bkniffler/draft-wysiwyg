import React, {Component, PropTypes} from "react";
import ReactDOM from 'react-dom';
import DraftNestedEditor from './draft-nested-editor';

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
      //this.listener();
   }
   // Activate the current block
   activateBlock(active){
      if(this.props.blockProps.editorProps.readOnly) return;
      if(this.props.blockProps.activate){
         this.props.blockProps.activate(active);
      }
      else{
         this.setState({active});
      }
   }
   // Set alignment of current block ('left', 'right', 'center')
   align(position){
      if(this.props.blockProps.editorProps.readOnly) return;
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
      if(this.props.blockProps.editorProps.readOnly) return;

      const active = this.props.blockProps.active||this.state.active;
      const {clicked} = this.state;

      if(clicked || active) return;

      this.activateBlock(true);

      var component = ReactDOM.findDOMNode(this.refs.div);
      // Handle click outside of block to deactivate
      component.parentElement.parentElement.addEventListener('mousedown', this.listener, false);
   }
   listener(){
      if(this.props.blockProps.editorProps.readOnly) return;
      var component = ReactDOM.findDOMNode(this.refs.div);
      component.parentElement.parentElement.removeEventListener('mousedown', this.listener, false);
      this.activateBlock(false);
   };

   // Handle mouse-move and setState if mouse on edges for resizing
   leave(e){
      if(this.props.blockProps.editorProps.readOnly) return;
      if(!this.state.clicked){
         this.setState({hoverPosition: {}});
      }
   }
   move(e){
      if(this.props.blockProps.editorProps.readOnly) return;
      if(this.state.clicked){
         return;
      }
      const {vertical, horizontal} = this.props;

      var hoverPosition = this.state.hoverPosition;
      var tolerance = 6;
      var pane = ReactDOM.findDOMNode(this.refs.div);

      var b = pane.getBoundingClientRect();
      var x = e.clientX - b.left;
      var y = e.clientY - b.top;

      var isTop = vertical && vertical !== 'auto' ? y < tolerance : false;
      var isLeft = horizontal ? x < tolerance : false;
      var isRight = horizontal ? x >= b.width - tolerance : false;
      var isBottom = vertical && vertical !== 'auto' ? y >= b.height - tolerance && y < b.height : false;

      var canResize = isTop||isLeft||isRight||isBottom;

      var newHoverPosition = {
         isTop, isLeft, isRight, isBottom, canResize
      };

      if(Object.keys(newHoverPosition).filter(key=>hoverPosition[key] !== newHoverPosition[key]).length){
         this.setState({hoverPosition: newHoverPosition});
      }
   }
   // Handle mousedown for resizing
   mouseDown(e){
      if(this.props.blockProps.editorProps.readOnly) return;
      // No mouse-hover-position data? Nothing to resize!
      if(!this.state.hoverPosition.canResize){
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
         var b = component.parentElement.parentElement;
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
         e.preventDefault();
         return false;
      }

      // Finished dragging
      var stopDrag = (e) => {
         document.removeEventListener('mousemove', doDrag, false);
         document.removeEventListener('mouseup', stopDrag, false);

         const {setEntityData} = this.props.blockProps;
         setEntityData(this.props.block, {width: this.state.width, height: this.state.height});

         this.setState({clicked: false, width: null, height: null});

         e.stopPropagation();
         return false;
      }

      document.addEventListener('mousemove', doDrag, false);
      document.addEventListener('mouseup', stopDrag, false);

      this.setState({clicked: true});
      e.stopPropagation();
      e.preventDefault();
      return false;
   }
   // Handle start-drag and setData with blockKey
   startDrag(e){
      if(this.props.blockProps.editorProps.readOnly) return;
      e.dataTransfer.dropEffect = 'move';
      // Declare data and give info that its an existing key and a block needs to be moved
      e.dataTransfer.setData("text", 'key:'+this.props.block.key);
   }
   render(){
      const {width, height, hoverPosition, clicked} = this.state;
      const {Children, blockProps, vertical, horizontal, ratio, handles, caption} = this.props;
      const readOnly = this.props.blockProps.editorProps.readOnly;
      const {isTop, isLeft, isRight, isBottom, canResize} = hoverPosition;
      const active = !!(this.props.blockProps.active||this.state.active)&&!readOnly;

      // Compose style
      var style = {
         ...(this.props.style||{}),
         height: 'auto'
      };
      var innerstyle = {
         height: '100%',
         width: '100%'
      };

      // ClassNames
      var classes = ["draft-resizeable-wrapper"];
      var classesRatio = ['ratiobox'];
      if(active) classesRatio.push('active');

      // Handle alignment for float/margin
      if(this.props.blockProps.align === 'left' || this.props.blockProps.align === 'right'){
         style.float = this.props.blockProps.align;
         classes.push('draft-float-'+this.props.blockProps.align)
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
         innerstyle.width = style.width = (width||blockProps.width||40)+'px';
      }
      if(vertical === 'auto'){
         innerstyle.height = 'auto';
      }
      else if(vertical === 'relative') {
         innerstyle.height = (height||blockProps.height||40)+'%';
      }
      else if(vertical === 'absolute') {
         innerstyle.height = (height||blockProps.height||40)+'px';
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
              readOnly={this.props.blockProps.editorProps.readOnly}
              active={active}
              actions={actions}
              uniqueId={'id-'+this.props.block.key}/>
      );

      // Wrap into ratiobox to maintain aspect-ratio
      if(vertical === 'auto' && ratio){
         classesRatio.push('ratio'+round(ratio*100, 5));
         content = (
             <div className={"ratiobox-content"} stye={innerstyle}>
                {content}
             </div>
         )
      }

      return (
         <div contentEditable="false"
              className={classes.join(' ')}
              style={style}>
            <div className={classesRatio.join(' ')}
                 onDragStart={::this.startDrag}
                 draggable={!canResize && !readOnly}
                 ref="div"
                 style={innerstyle}
                 onClick={::this.click}
                 onMouseMove={::this.move}
                 onMouseLeave={::this.leave}
                 onMouseDown={::this.mouseDown}>
               {canResize && clicked && !readOnly ? <div className="overlay"></div> : null}
               {/*There might be more elegan ways, handles for resizing*/}
               {handles && !readOnly ? <div className="overlay-m">&#9673;</div> : null}
               {handles && !readOnly ? <div className="overlay-l"></div> : null}
               {handles && !readOnly ? <div className="overlay-r"></div> : null}
               {handles && !readOnly ? <div className="overlay-t"></div> : null}
               {handles && !readOnly ? <div className="overlay-b"></div> : null}
               {content}
            </div>
            {caption ? <div className="caption-text" onClick={e=>e.stopPropagation()} style={{minHeight: '40px'}}>
               <DraftNestedEditor {...this.props}
                   readOnly={this.props.blockProps.editorProps.readOnly}
                   placeholder={'Titel ...'}
                   value={this.props.blockProps.caption||defaultCaption}
                   onChange={(v)=>this.props.blockProps.setEntityData(this.props.block, {caption: v})}/>
            </div> : null}
         </div>
      );
   }
};
// DefaultProps
Wrapper.defaultProps = {
   horizontal: 'relative',
   vertical: false,
   ratio: null,
   resizeSteps: 5,
   handles: false,
   caption: false
}
var defaultCaption = {
   "entityMap": {},
   "blocks": [
      {
         "key": "2fo22",
         "text": "Caption ...",
         "type": "unstyled",
         "depth": 0,
         "inlineStyleRanges": [],
         "entityRanges": []
      }
   ]
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