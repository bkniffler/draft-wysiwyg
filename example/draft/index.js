export Data from './data';

import Header from './header';
import Youtube from './youtube';
import ResizeableDiv from './resizeable-div';
import ResizeableDiv2 from './resizeable-div2';
/*import Columns2 from './columns2';
import Image from './image';
import Unstyled from './unstyled';*/

var blocks = {
    'header-1': Header(1),
    'header-2': Header(2),
    'header-3': Header(3),
    'header-4': Header(4),
    'header-5': Header(5),
    youtube: Youtube,
    'resizeable-div': ResizeableDiv,
    'resizeable-div2': ResizeableDiv2,
    /*
    columns2: Columns2,
    image: Image,
    unstyled: Unstyled,
    */
}

export const Blocks = blocks;

