import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FocusDecorator } from 'draft-js-focus-plugin';
import { DraggableDecorator } from 'draft-js-dnd-plugin';
import { ToolbarDecorator } from 'draft-js-toolbar-plugin';
import { AlignmentDecorator } from 'draft-js-alignment-plugin';
import { ResizeableDecorator } from 'draft-js-resizeable-plugin';

const getDisplayName = WrappedComponent => {
  const component = WrappedComponent.WrappedComponent || WrappedComponent;
  return component.displayName || component.name || 'Component';
};

const getComponent = WrappedComponent => class BlockWrapper extends Component {
  static displayName = `BlockWrapper(${getDisplayName(WrappedComponent)})`;
  static WrappedComponent = WrappedComponent.WrappedComponent || WrappedComponent;
  constructor(props) {
    super(props);
    this.state = {};
  }
  setEntityData = patch => {
    const { blockProps, block } = this.props;
    const {setEntityData} = blockProps;
    setEntityData(patch);
    this.setState({
      ...patch
    });
  }
  render() {
    const {blockProps} = this.props;
    const readOnly = blockProps.pluginEditor.getReadOnly();
    return <WrappedComponent {...this.props} {...blockProps.entityData} {...this.state} setEntityData={this.setEntityData} readOnly={readOnly} />
  }
}

export default options => WrappedComponent => {
  const {resizeable, draggable, focus, alignment, toolbar} = options || {};
  let component = getComponent(WrappedComponent);
  if (toolbar !== false) {
    component = ToolbarDecorator(toolbar || {})(component);
  }
  if (alignment !== false) {
    component = AlignmentDecorator(component);
  }
  if (focus !== false) {
    component = FocusDecorator(component);
  }
  if (draggable !== false) {
    component = DraggableDecorator(component);
  }
  if (resizeable !== false) {
    component = ResizeableDecorator(resizeable || {})(component);
  }
  return component;
}