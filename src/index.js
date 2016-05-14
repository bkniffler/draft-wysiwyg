import React, { Component } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';

// Plugin-Editor
import Editor from 'draft-js-plugins-editor-wysiwyg';
import createPlugins from './create-plugins';

/*// Components
import PlaceholderGithub from '../components/placeholder-github';
import BlockText from '../components/block-text';*/

class SimpleWysiwygEditor extends Component {
  constructor(props, context) {
     super(props);
     this.plugins = createPlugins(props);
     this.state = {
        editorState: props.value
           ? EditorState.push(EditorState.createEmpty(), convertFromRaw(props.value))
           : EditorState.createEmpty(),
        draggingOver: false,
     };
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
    }
    return undefined;
    if (type === 'placeholder-github') {
      return { component: PlaceholderGithub };
    } else if (type === 'block-text') {
      return { component: BlockText };
    } return undefined;
  }

  render() {
    const { editorState } = this.state;
    const { isDragging, progress } = this.props;
    
    return (
	    <Editor editorState={editorState}
	      onChange={this.onChange}
	      blockRendererFn={this.blockRendererFn}
	      plugins={this.plugins}
	      ref="editor"
	    />
    );
  }
}

export default SimpleWysiwygEditor;
