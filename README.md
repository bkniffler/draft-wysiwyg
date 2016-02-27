# draft-wysiwyg
Draft-JS is really hot right now and here is a try for reproducing wysiwyg functionality using draft. 
Its too early to tell wether this will, in future, only be an example, a package on NPM, a sandbox for new features. It mainly depends on what direction facebooks draft-js will take, what features they are going to implement. 

So take this as an example for now and keep a close look at the official draft-js repo, though I will also try to keep this repository up to date and give info about changes!

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
