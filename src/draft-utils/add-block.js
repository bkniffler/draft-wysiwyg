import {List, Repeat} from 'immutable';
import {Modifier, CharacterMetadata, BlockMapBuilder, EditorState, ContentBlock, ContentState, Entity, genKey, convertToRaw} from "draft-js";

export default function (editorState, selection, type, data, asJson) {
    // Get editorstate
    // If none -> get empty
    if (!editorState) {
        editorState = EditorState.createEmpty(decorator);
    }
    // If json -> convert to editorstate
    else if (asJson) {
        editorState = EditorState.push(
            EditorState.createEmpty(decorator),
            convertFromRaw(editorState)
        );
    }

    var contentState = editorState.getCurrentContent(), selectionState = editorState.getSelection();

    // Convert selection from string
    if (typeof selection === 'string') {
        var blocks = contentState.getBlocksAsArray();
        if (selection === 'start' && blocks.length) {
            selection = new SelectionState({
                anchorKey: blocks[0].getKey(),
                anchorOffset: 0,
                focusKey: blocks[0].getKey(),
                focusOffset: 0
            });
        }
        else if (selection === 'end' && blocks.length) {
            selection = new SelectionState({
                anchorKey: blocks[blocks.length - 1].getKey(),
                anchorOffset: blocks[blocks.length - 1].getLength(),
                focusKey: blocks[blocks.length - 1].getKey(),
                focusOffset: blocks[blocks.length - 1].getLength()
            });
        }
    }
    if (selection !== null) {
        selectionState = selection;
    }
    var insertionTarget, asMedia, selectedBlock = contentState.getBlockForKey(selectionState.anchorKey);

    // If dropped next to text
    if (selectionState.anchorKey === selectionState.focusKey && selectedBlock && !selectedBlock.text) {
        insertionTarget = selectionState;
        asMedia = Modifier.setBlockType(contentState, insertionTarget, type);
    }
    // If dropped next to empty
    else {
        var afterRemoval = Modifier.removeRange(contentState, selectionState, 'backward');
        var targetSelection = afterRemoval.getSelectionAfter();
        var afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
        afterSplit = Modifier.splitBlock(afterSplit, targetSelection);

        //afterSplit = Modifier.insertText(afterSplit, afterSplit.getSelectionAfter(), ' ');

        insertionTarget = afterSplit.getSelectionAfter();
        asMedia = Modifier.setBlockType(afterSplit, insertionTarget, type);
    }

    // Create entity etc.
    var entityKey = Entity.create('TOKEN', 'MUTABLE', data);
    var charData = CharacterMetadata.create({entity: entityKey});
    var fragment = BlockMapBuilder.createFromArray([
        new ContentBlock({
            key: genKey(),
            type: type,
            text: ' ',
            characterList: List(Repeat(charData, 1))
        })
    ]);
    var withMedia = Modifier.replaceWithFragment(asMedia, insertionTarget, fragment);
    var newContent = withMedia.merge({
        selectionBefore: selectionState,
        selectionAfter: withMedia.getSelectionAfter().set('hasFocus', true),
    });

    // Push editorstate with new content
    editorState = EditorState.push(editorState, newContent, 'insert-fragment');

    if (asJson) {
        // Return JSON
        return convertToRaw(editorState.getCurrentContent());
    }
    // Return default
    return editorState;
}