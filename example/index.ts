import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { MyComponent, type MyComponentProps } from './MyComponent.js';

const props: MyComponentProps = {
  name: 'Oxsome',
  values: [1, 2, 3],
};

const element = createElement(MyComponent, props);
console.log(renderToStaticMarkup(element));
