
html-outliner
===============

**volatile / pre-alpha**

The goal of this repository is to get a clear understanding of HTML's outline
algorithm by implementing it using JavaScript and Node.js.

* [Algorithm.js](./src/Algorithm.js) is this repository's main source file.

## TODOs

* get it running ...
* add support for an options object (inner SRs, non-standard headings, etc.)
* use throw statements instead of asserts
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

This implementation is based upon:

* [W3C, HTML 5.2, Editor's Draft, 2017-05-03](https://w3c.github.io/html/)
* [4.3.9 Headings and sections](https://w3c.github.io/html/sections.html/#headings-and-sections)
* [4.3.9.1. Creating an outline](https://w3c.github.io/html/sections.html/#creating-an-outline)

see also:

* [rehierl / html-outliner-spec](https://github.com/rehierl/html-outliner-spec)
  for further details and notes related to the outline algorithm.

## License

MIT
