export default function(editorState, key){
    var contentState = editorState.getCurrentContent();
    var blocks = contentState.getBlocksAsArray();
    for(var i=0; i<blocks.length; i++){
        if(key === blocks[i].getKey()){
            return (i+1) < blocks.length ? blocks[i+1] : null;
        }
    }
}
