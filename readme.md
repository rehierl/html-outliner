
html-outliner
===============

**volatile / pre-alpha**

The goal of this repository is to get a clear understanding of HTML's outline
algorithm by implementing it using JavaScript and Node.js.

* [Algorithm.js](./src/Algorithm.js) is this repository's main source file.

## TODOs

* get it running ...
* rework the error handling - custom exception types instead of asserts
* publish on [npmjs.com](https://www.npmjs.com/)
* and many more things to do ...

## Main Features

* completely ignores any hidden elements
  -- the outliner won't even visit their child nodes
* (optional) read-only access is possible
  -- the outliner won't modify the dom tree in any way.
* (optional) ignore inner sectioning root elements
  -- if chosen, these will be treated as if they were hidden elements.
* (optional) support for non-standard heading elements (e.g. &lt;h&gt;)
  -- these will be treated like &lt;h1&gt; heading elements (highest rank)

## Related Links

W3C, HTML 5.2, Editor's Draft, 2017-07-06

* [W3C, HTML Editor's Draft repository](https://github.com/w3c/html)
* [W3C, HTML 5.2, Editor's Draft, 2017-05-03](https://w3c.github.io/html/)
* [4.3.9. Headings and sections](https://w3c.github.io/html/sections.html#headings-and-sections)
* [4.3.9.1. Creating an outline](https://w3c.github.io/html/sections.html#creating-an-outline)

W3C, HTML 5.2, Working Draft, 2017-05-09

* [W3C, HTML 5.2, Working Draft, 2017-05-09](https://www.w3.org/TR/html52/)
* [4.3.9. Headings and sections](https://www.w3.org/TR/html52/sections.html#headings-and-sections)
* [4.3.9.1. Creating an outline](https://www.w3.org/TR/html52/sections.html#creating-an-outline)

W3C, DOM 4.1, Editor's Draft, 2017-07-05

* [W3C, DOM Editor's Draft repository](https://github.com/w3c/dom)
* [W3C, DOM 4.1, Editor's Draft, 2017-07-05](https://w3c.github.io/dom/)

See also:

* [rehierl / html-outliner-spec](https://github.com/rehierl/html-outliner-spec)
  for further details and notes related to the outline algorithm.

## License

MIT
