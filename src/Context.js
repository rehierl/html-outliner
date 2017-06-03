
"use strict";

const assert = require("assert");

/* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/

module.exports = class CContext {
//========//========//========//========//========//========//========//========
//- new CContext(Anything type, CNodeProxy node,
//  CSection section, COutline outline)

constructor(type, node, section, outline) {
  assert((arguments.length === 4), "invalid call");
  
  //- type can be anything reasonable
  assert((node instanceof CNodeProxy), "invalid call");
  assert((section === null) || (section instanceof CSection), "invalid call");
  assert((outline === null) || (outline instanceof COutline), "invalid call");
  
//public:

  //- Anything type { get; }
  //- CNodeProxy node { get; }
  //- CSection currentSection { get; }
  //- COutline currentOutline { get; }

//private:

  //- Anything _type
  //- used to identify the reason for
  //  creating this context object
  this._type = type;

  //- CNodeProxy _node
  //- the node that triggered the creation
  //  of this context object
  this._node = node;
  
  //- CSection _currentSection
  //- the current section at the time
  //  this context object was created
  this._currentSection = section;
  
  //- COutline _currentOutline
  //- the current outline at the time
  //  this context object was created
  this._currentOutline = outline;
}

//========//========//========//========//========//========//========//========
//- Anything type { get; }

get type() {
  return this._type;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy node { get; }

get node() {
  return this._node;
}

//========//========//========//========//========//========//========//========
//- CSection currentSection { get; }

get currentSection() {
  return this._currentSection;
}

//========//========//========//========//========//========//========//========
//- COutline currentOutline { get; }

get currentOutline() {
  return this._currentOutline;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/
