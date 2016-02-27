# draft-wysiwyg
Draft-JS is really hot right now and here is a try for reproducing wysiwyg functionality using draft.

## Warning, this is WIP!
Currently, these are the features that work
- Inline toolbar for text
- Block drag/drop
- Block resizing (horizontal/vertical)
- Block toolbars

## Installation
You can clone/download this project and
```
node server.js
```

## Usage
You can also use it in your own project, but its too early yet for a real how-to/documentation
Just check out:
- Importing/using the custom draft editor: https://github.com/bkniffler/draft-js-drag-drop/blob/master/js/container.js
- Wrapping blocks: https://github.com/bkniffler/draft-js-drag-drop/blob/master/js/blocks/resizeable-div.js

## Todo
There is a lot of stuff that needs to be done
- Removing semantic-ui dependency, I'd be happy accepting pull requests for custom/themable CSS solutions
- Themes
- Clean and optimize code, figure out proper API, make it more customizable
- Drag/Drop handling of files on editor (maybe)
- Write documentation
- ...
