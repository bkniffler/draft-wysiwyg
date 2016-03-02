import {SelectionState, EditorState} from "draft-js";

export default function(editorState, key, range){
    var contentState = editorState.getCurrentContent();
    var block = contentState.getBlockForKey(key);
    if(!block){
        return;
    }
    var selectionSate = new SelectionState({
        anchorKey: block.getKey(),
        anchorOffset: !range || range === 'start' ? 0 : block.getLength(),
        focusKey: block.getKey(),
        focusOffset: range === 'start' ? 0 : block.getLength()
    });
    var newContent = contentState.merge({
        selectionBefore: editorState.getSelection(),
        selectionAfter: selectionSate.set('hasFocus', true)
    });
    return EditorState.push(editorState, newContent, 'insert-fragment');
}