# draft-wysiwyg
Draft-JS is really hot right now and here is a try for reproducing wysiwyg functionality using draft.

**Warning, this repo is WIP! There are still bugs, The API will most likely change, only tested in Chrome/Safari.**

## Demo
https://draft-wysiwyg.herokuapp.com/

## Features
Currently, these are the features that work
- Drag & Drop uploading
- Inline toolbar for text
- Block drag/drop
- Block resizing (horizontal/vertical with absolute/relative sizes and aspect ratios)
- Block toolbars
- Interactive Youtube block
- Block keydown handling to remove blocks (backspace) or move cursor to next/previous block
- Nesting draft-js
- Links
- Some more things

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
- Themes
- Clean and optimize code, figure out proper API, make it more customizable
- Write documentation ...

## Contributing
Pull requests are very welcome, feel free to commit your ideas!
