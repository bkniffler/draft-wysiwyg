export default function(){
    var consoleError = console.error;
    console.error = function(err){
        if(err !== 'Warning: A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional.'){
            consoleError(err);
        }
    }
}