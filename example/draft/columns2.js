import React, {Component, PropTypes} from 'react';
import DraftEditorBlock from '../../src/draft-nested-editor';

class TextComponentBlock extends Component{
   render(){
      return (
         <div style={{width: '100%'}}>
            <div style={{outline: '1px solid rgba(0, 0, 0, 0.08)', width: '50%', float: 'left', minHeight: '30px'}}>
               <DraftEditorBlock {...this.props}
                  placeholder={'Titel ...'}
                  value={this.props.blockProps.col1}
                  onChange={(v)=>this.props.blockProps.setEntityData(this.props.block, {col1: v})}/>
            </div>
            <div style={{outline: '1px solid rgba(0, 0, 0, 0.08)', width: '50%', float: 'left', minHeight: '30px'}}>
               <DraftEditorBlock {...this.props}
                  placeholder={'Titel ...'}
                  value={this.props.blockProps.col2}
                  onChange={(v)=>this.props.blockProps.setEntityData(this.props.block, {col2: v})}/>
            </div>
            <div style={{clear:"both"}} />
         </div>
      );
   }
}

export default TextComponentBlock;

