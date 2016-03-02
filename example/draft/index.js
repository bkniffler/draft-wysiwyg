export Data from './data';

import Columns2 from './columns2';
import Header from './header';
import Image from './image';
import ResizeableDiv from './resizeable-div';
import ResizeableDiv2 from './resizeable-div2';
import Unstyled from './unstyled';
import Youtube from './youtube';

var blocks = {
    columns2: Columns2,
    'header-1': Header(1),
    'header-2': Header(2),
    'header-3': Header(3),
    'header-4': Header(4),
    'header-5': Header(5),
    image: Image,
    'resizeable-div': ResizeableDiv,
    'resizeable-div2': ResizeableDiv2,
    unstyled: Unstyled,
    youtube: Youtube
}

export const Blocks = blocks;

