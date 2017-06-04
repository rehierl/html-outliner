
module.exports = {
//========//========//========//========//========//========//========//========

//- a simple development error
DEVEL: "a-development-error",

//- an important invariant was violated
//  while the outline algorithm was running
INVARIANT: "invariant-violated",

//- the outliner received an invalid root
//- e.g. a non-object value
//- e.g. not a dom element object
//- e.g. a hidden element
//- e.g. not a sectioning element (SR or SC)
INVALID_ROOT: "invalid-root",

//- the outliner received an invalid options object
//- e.g. a non-object value
INVALID_OPTIONS: "invalid-options",

//- the outliner was able to determine that the dom tree
//  does not represent valid HTML
//- e.g. SR/SC/HC inside a HC
INVALID_HTML: "invalid-html"

//========//========//========//========//========//========//========//========
};//- module.exports
