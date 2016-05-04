import {
   EditorState,
   Modifier,
   SelectionState,
} from 'draft-js';

const cleanupEmpty = (editorState, blockKey, type) => {
   const content = editorState.getCurrentContent();

   // get range of the broken block
   const targetRange = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: 0,
   });

   // convert the block to a unstyled block to make text editing work
   const without = Modifier.setBlockType(
      content,
      targetRange,
      'unstyled'
   );
   const newState = EditorState.push(editorState, without, `remove-${type}`);
   return EditorState.forceSelection(newState, without.getSelectionAfter());
};

// Block-Types to be handled will be stored here
let types = [];
const cleanupEmptyPlugin = (editorState, types) => {
   let newEditorState = editorState;

   // Iterate over blockMap
   editorState.getCurrentContent().get('blockMap').forEach(block => {
      // If the block type is registered within the plugin, and no entity was
      // found, perform cleanup of the block
      if ((types === 'all' || types === '*') && block.get('type') !== 'unstyled' && block.get('type').indexOf('header-') !== 0 && block.getEntityAt(0) === null) {
         newEditorState = cleanupEmpty(editorState, block.get('key'), block.get('type'));
      } else if (Array.isArray(types) && types.indexOf(block.get('type')) !== -1 && block.getEntityAt(0) === null) {
         newEditorState = cleanupEmpty(editorState, block.get('key'), block.get('type'));
      }
   });
   return newEditorState;
};

export default cleanupEmptyPlugin;
// Use this to add one type to the list
export const cleanupType = item => types.push(item);
// Use this to add multiple types to the list
export const cleanupTypes = items => types.push(...items);
