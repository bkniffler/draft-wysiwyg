import React, { Component } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import ReactDOM from 'react-dom';

// Plugin-Editor
import Editor from 'draft-js-plugins-editor-wysiwyg';
import {DefaultDraftBlockRenderMap} from 'draft-js';
import createPlugins from './create-plugins';
import {Map} from 'immutable';

/*// Components
import PlaceholderGithub from '../components/placeholder-github';
import BlockText from '../components/block-text';*/

class WysiwygEditor extends Component {
  constructor(props, context) {
     super(props);
     this.plugins = createPlugins(props);
     this.state = {
      editorState: props.value
         ? EditorState.push(EditorState.createEmpty(), convertFromRaw(props.value))
         : EditorState.createEmpty(),
      draggingOver: false,
     };
     
     this.blockRenderMap = DefaultDraftBlockRenderMap.merge(
       this.customBlockRendering(props)
     );
  }
  
  shouldComponentUpdate(props, state) {
     if(this.suppress) return false;
     if(this.props.value !== props.value && props.value !== this.__raw){
        this.__raw = props.value;
        this.setState({
           editorState: !props.value
              ? EditorState.createEmpty()
              : EditorState.push(this.state.editorState, convertFromRaw(props.value))
        });
        return false;
     }
     else if(this.state.active !== state.active
        || this.state.editorState !== state.editorState
        || this.state.readOnly !== state.readOnly
        || this.props.readOnly !== props.readOnly
        || this.props.fileDrag !== props.fileDrag
        || this.props.uploading !== props.uploading
        || this.props.percent !== props.percent
        || this.force){
        this.force = false;
        return true;
     }
     return false;
  }

  onChange = (editorState) => {
     const force = false;
     if(this.suppress && !force) return;
     this.setState({editorState});
     if (this.props.onChange) {
        this.__raw = convertToRaw(editorState.getCurrentContent());
        this.props.onChange(this.__raw, editorState);
     }
  };
  
  focus = () => {
    this.refs.editor.focus();
  };

  blockRendererFn = (contentBlock) => {
    const { blockTypes } = this.props;
    const type = contentBlock.getType();
    if (blockTypes[type]) {
      return {
        component: blockTypes[type]
      }
    } return undefined;
  }

  customBlockRendering = props => {
    const { blockTypes } = props;
    var newObj = {
      'paragraph': {
        element: 'div',
      },
      'unstyled': {
        element: 'div',
      },
      'block-image': {
        element: 'div',
      },
      'block-table': {
        element: 'div',
      }
    };
    for (var key in blockTypes) {
      newObj[key] = {
        element: 'div'
      };
    } return Map(newObj);
  }
  
  render() {
    const { editorState } = this.state;
    const { isDragging, progress, readOnly } = this.props;
    
    return (
	    <Editor readOnly={readOnly} editorState={editorState}
        plugins={this.plugins}
        blockRenderMap={this.blockRenderMap}
        blockRendererFn={this.blockRendererFn}
	      onChange={this.onChange}
	      ref="editor"
	    />
    );
  }
}

export default WysiwygEditor;