
"use strict";

const assert = require("assert");
const format = require("util").format;
const err = require("./errorMessages.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const COptions = require("./Options.js");
const CNodeProxy = require("./NodeProxy.js");
const CSectionBuilder = require("./SectionBuilder.js");
//*/

module.exports = class COutlineBuilder {
//========//========//========//========//========//========//========//========
//- properties/methods overview

//public:

  //- new COutlineBuilder(COptions options, CNodeProxy owner)

  //- COptions options { get; }
  //- CNodeProxy outlineOwner { get; }

  //- void addInnerSection(CSectionBuilder section)
  //- CSectionBuilder[] innerSections { get; }
  //- CSectionBuilder lastInnerSection { get; }

//========//========//========//========//========//========//========//========
//- new COutlineBuilder(COptions options, CNodeProxy owner)

constructor(options, node) {
  assert((arguments.length === 2), err.DEVEL);
  assert((options instanceof COptions), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  assert(node.isSE, err.INVARIANT);

//private:

  //- COptions options
  //- the options to use during the next run
  this._options = options;
  
  //- CNodeProxy _outlineOwner
  //- the outline's starting CNodeProxy object
  //- the node that triggered the creation of this outline
  this._outlineOwner = node;
  
  //- CSectionBuilder[] _innerSections
  //- the inner top-level sections of an SE
  this._innerSections = [];
}

//========//========//========//========//========//========//========//========
//- COptions options { get; }

get options() {
  return this._options;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy outlineOwner { get; }

get outlineOwner() {
  return this._outlineOwner;
}

//========//========//========//========//========//========//========//========
//- void addInnerSection(CSectionBuilder section)
//- add the given section as the new last inner section

addInnerSection(section) {
  assert((arguments.length === 1), err.DEVEL);
  assert((section instanceof CSectionBuilder), err.DEVEL);
  this._innerSections.push(section);
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder[] innerSections { get; }

get innerSections() {
  return this._innerSections;
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder lastInnerSection { get; }

get lastInnerSection() {
  let len = this._innerSections.length;
  assert((len > 0), err.INVARIANT);
  return this._innerSections[len-1];
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const COptions = require("./Options.js");
const CNodeProxy = require("./NodeProxy.js");
const CSectionBuilder = require("./SectionBuilder.js");
//*/
