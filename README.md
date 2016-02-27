# draft-wysiwyg
Draft-JS is really hot right now and here is a try for reproducing wysiwyg functionality using draft.

## Warning, this is WIP! The API will most likely change.
Currently, these are the features that work
- Inline toolbar for text
- Block drag/drop
- Block resizing (horizontal/vertical)
- Block toolbars

## Installation
```
npm install draft-wysiwyg
or
sudo npm install draft-wysiwyg
```

## Usage
Just check out the example:
- Importing/using the custom draft editor: https://github.com/bkniffler/draft-wysiwyg/blob/master/example/container.js
- Wrapping blocks: https://github.com/bkniffler/draft-wysiwyg/blob/master/example/draft/resizeable-div.js

Sorry, didn't get to write documentation yet!

## Todo
There is a lot of stuff that needs to be done
- Removing semantic-ui dependency, I'd be happy accepting pull requests for custom/themable CSS solutions
- Themes
- Clean and optimize code, figure out proper API, make it more customizable
- Drag/Drop handling of files on editor (maybe)
- Write documentation ...
