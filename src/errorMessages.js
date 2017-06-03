
module.exports = class ERR {
//========//========//========//========//========//========//========//========

constructor() {
  //- a simple development error
  this.DEVEL = "a-development-error";
  
  //- an important invariant was violated
  //  while the outline algorithm was running
  this.INVARIANT = "invariant-violated";
  
  //- the outliner received an invalid root
  //- e.g. a non-object value
  //- e.g. not a dom element object
  //- e.g. a hidden element
  //- e.g. not a sectioning element (SR or SC)
  this.INVALID_ROOT = "invalid-root";
  
  //- the outliner received an invalid options object
  //- e.g. a non-object value
  this.INVALID_OPTIONS = "invalid-options";
  
  //- the outliner was able to determine that the dom tree
  //  does not represent valid HTML
  //- e.g. SR/SC/HC inside a HC
  this.INVALID_HTML = "invalid-html";
}//- constructor

//========//========//========//========//========//========//========//========
};//- module.exports
