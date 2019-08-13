
html-outliner
===============

The goal of this repository is to get a clear understanding of HTML's outline
algorithm by implementing it using JavaScript and Node.js.

* [Algorithm.js](./src/Algorithm.js) is the main source file.

I now consider this attempt a **failure** since the "official" outline
algorithm, as defined in 2017-07-06, can only be considered broken.
However, I intend to use the source code in this repository once I have
a design that deserves to get implemented.

## Main Features

* ignores hidden elements and their descendants.
* (optional) read-only access is possible
  -- the outliner won't modify the dom tree in any way.
* (optional) ignore inner sectioning root elements
  -- if chosen, these will be treated as if they were hidden elements.
* (optional) support for non-standard heading elements (e.g. &lt;h&gt;)
  -- these will be treated like &lt;h1&gt; heading elements (highest rank)

## Related Links

* [The W3C-WHATWG memorandum, 2019-05-28](https://www.w3.org/blog/2019/05/w3c-and-whatwg-to-work-together-to-advance-the-open-web-platform/)
* Note that, due to this memorandum, links targeted at the W3C resources
  will now be forwarded to WHATWAG resources.

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

## License

MIT
