
"use strict";

const assert = require("assert");

const err = require("./errorMessages.js");

module.exports = class COptions {
//========//========//========//========//========//========//========//========

constructor() {
  assert((arguments.length === 0), err.DEVEL);

//public: 

  //- bool isDefault { get; }
  //- bool verifyInvariants { get; }
  //- bool ignoreInnerSR { get; }
  //- bool verifyValidHtml { get; }
  //- RegExp rxSR { get; }
  //- RegExp rxSC { get; }
  //- RegExp rxHC { get; }

//private:

  //- a flag to indicate that all options have default values
  this._isDefault = true;
  
  //- set to verify all invariants
  //- false = trust that the outliner works perfectly
  this._verifyInvariants = true;
  
  //- set to ignore all inner sectioning root (SR) elements
  //- false = also create outlines for these inner SRs
  this._ignoreInnerSR = false;
  
  //- set to verify (on the fly) that the
  //  dom tree represents valid HTML
  //- false = ignore these checks
  //- e.g. headings have invalid child elements
  this._verifyValidHtml = true;
  
  //- a regular expression used to classify an element
  //  as sectioning root (SR) element
  //- dom will return a node's name/tag in uppercase letters
  this._rxSR = /^(blockquote|body|details|dialog|fieldset|figure|td)$/i;
  
  //- a regular expression used to classify an element
  //  as sectioning content (SC) element
  //- dom will return a node's name/tag in uppercase letters
  this._rxSC = /^(article|aside|nav|section)$/i;
  
  //- a regular expression used to classify an element
  //  as heading content (HC) element
  //- non-standard heading elements will be associated with
  //  the highest rank; i.e. treated as <h1> elements
  //- dom will return a node's name/tag in uppercase letters
  this._rxHC = /^(h[1-6])$/i;
}

//========//========//========//========//========//========//========//========
//- bool isDefault { get; }

get isDefault() {
  return this._isDefault;
}

//========//========//========//========//========//========//========//========
//- bool verifyInvariants { get; }

get verifyInvariants() {
  return this._verifyInvariants;
}

//========//========//========//========//========//========//========//========
//- bool ignoreInnerSR { get; }

get ignoreInnerSR() {
  return this._ignoreInnerSR;
}

//========//========//========//========//========//========//========//========
//- bool verifyValidHtml { get; }

get verifyValidHtml() {
  return this._verifyValidHtml;
}

//========//========//========//========//========//========//========//========
//- RegExp rxSR { get; }

get rxSR() {
  return this._rxSR;
}

//========//========//========//========//========//========//========//========
//- RegExp rxSC { get; }

get rxSC() {
  return this._rxSC;
}

//========//========//========//========//========//========//========//========
//- RegExp rxHC { get; }

get rxHC() {
  return this._rxHC;
}

//========//========//========//========//========//========//========//========
//- void combine(Object optionsArg)
//- void combine(String optionsArg)
//- void combine(COptions optionsArg)

combine(optionsArg) {
  //- i.e. needs to be implemented
  assert(false, err.DEVEL);
  this._isDefault = false;
}

//========//========//========//========//========//========//========//========
};//- module.exports
