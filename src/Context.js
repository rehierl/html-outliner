
"use strict";

const assert = require("assert");
const err = require("./errorMessages.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/

module.exports = class CContext {
//========//========//========//========//========//========//========//========
//- properties/methods overview
  
//public:
  
  //- new CContext(CNodeProxy node, Anything type,
  //  COutline outline, CSection section)

  //- CNodeProxy node { get; }
  //- anything state { get; }
  //- COutline outline { get; }
  //- CSection section { get; }

//========//========//========//========//========//========//========//========
//- new CContext(CNodeProxy node, Anything type,
//  COutline outline, CSection section)

constructor(node, state, outline, section) {
  assert((arguments.length === 4), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  assert((outline === null) || (outline instanceof COutline), err.DEVEL);
  assert((section === null) || (section instanceof CSection), err.DEVEL);

//private:

  //- CNodeProxy _node
  //- the node that triggered the creation
  //  of this context object
  this._node = node;

  //- anything _state
  //- the current type identifier
  //  associated with this context
  //- mainly used to ignore/hide nodes
  this._state = state;
  
  //- COutline _outline
  //- the current outline at the time
  //  this context object was created
  this._outline = outline;
  
  //- CSection _section
  //- the current section at the time
  //  this context object was created
  this._section = section;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy node { get; }

get node() {
  return this._node;
}

//========//========//========//========//========//========//========//========
//- Anything state { get; }

get state() {
  return this._state;
}

//========//========//========//========//========//========//========//========
//- COutline outline { get; }

get outline() {
  return this._outline;
}

//========//========//========//========//========//========//========//========
//- CSection section { get; }

get section() {
  return this._section;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/
