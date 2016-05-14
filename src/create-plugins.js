import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor-wysiwyg';
import createCleanupEmptyPlugin from 'draft-js-cleanup-empty-plugin';
import createEntityPropsPlugin from 'draft-js-entity-props-plugin';
import createFocusPlugin, { FocusDecorator } from 'draft-js-focus-plugin';
import createDndPlugin, { DraggableDecorator } from 'draft-js-dnd-plugin';
import createToolbarPlugin, { ToolbarDecorator } from 'draft-js-toolbar-plugin';
import createAlignmentPlugin, { AlignmentDecorator } from 'draft-js-alignment-plugin';
import createResizeablePlugin, { ResizeableDecorator } from 'draft-js-resizeable-plugin';
// Blocks
import createImagePlugin, { imageCreator, imageStyles } from 'draft-js-image-plugin';
import createTablePlugin, { tableCreator, tableStyles } from 'draft-js-table-plugin';

// Styles
import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import 'draft-js-table-plugin/lib/plugin.css';
import 'draft-js-toolbar-plugin/lib/plugin.css';

// Utils
import addBlock from 'draft-js-dnd-plugin/lib/modifiers/addBlock';
import { RichUtils } from 'draft-js';

const image = ResizeableDecorator({
  resizeSteps: 10,
  handles: true,
  vertical: 'auto'
})(
  DraggableDecorator(
    FocusDecorator(
      AlignmentDecorator(
        ToolbarDecorator()(
          imageCreator({ theme: imageStyles })
        )
      )
    )
  )
);
const table = FocusDecorator(
  DraggableDecorator(
    ToolbarDecorator()(
      tableCreator({ theme: tableStyles, Editor })
    )
  )
);

// Init Plugins
export default ({ handleUpload, handleDefaultData }) => [
  createCleanupEmptyPlugin({
    types: ['block-image', 'block-table']
  }),
  createEntityPropsPlugin({ }),
  createToolbarPlugin({
    __toolbarHandler: {
      add: props => console.log('Add toolbar', props),
      remove: props => console.log('Remove toolbar', props),
    }, textActions: [{
      button: <span>H1</span>,
      label: 'Make H1',
      active: (block, editorState) => block.get('type') === 'header-1',
      toggle: (block, action, editorState, setEditorState) => setEditorState(RichUtils.toggleBlockType(
        editorState,
        'header-1'
      )),
    }, {
      button: <span>H2</span>,
      label: 'Make H2',
      active: (block, editorState) => block.get('type') === 'header-2',
      toggle: (block, action, editorState, setEditorState) => setEditorState(RichUtils.toggleBlockType(
        editorState,
        'header-2'
      )),
    }, {
      button: <span>Table</span>,
      label: 'Create a table',
      active: (block, editorState) => editorState.getSelection().isCollapsed(),
      toggle: (block, action, editorState, setEditorState) => setEditorState(addBlock(editorState, editorState.getSelection(), 'block-table', {})),
    }]
  }),
  createFocusPlugin({}),
  createAlignmentPlugin({}),
  createDndPlugin({
    allowDrop: true,
    handleUpload,
    handleDefaultData,
    handlePlaceholder: (state, selection, data) => {
      const { type } = data;
      if (type.indexOf('image/') === 0) {
        return 'block-image';
      } else if (type.indexOf('text/') === 0 || type === 'application/json') {
        return 'placeholder-github';
      } return undefined;
    }, handleBlock: (state, selection, data) => {
      const { type } = data;
      if (type.indexOf('image/') === 0) {
        return 'block-image';
      } else if (type.indexOf('text/') === 0 || type === 'application/json') {
        return 'block-text';
      } return undefined;
    },
  }),
  createResizeablePlugin({}),
  // Blocks
  createImagePlugin({ component: image }),
  createTablePlugin({ component: table, Editor }),
];
