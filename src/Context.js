
"use strict";

const assert = require("assert");
const errmsg = require("./errorMessages.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/

module.exports = class CContext {
//========//========//========//========//========//========//========//========
//- new CContext(CNodeProxy node, Anything type,
//  COutline outline, CSection section)

constructor(node, type, outline, section) {
  assert((arguments.length === 4), errmsg.DEVEL);
  assert((node instanceof CNodeProxy), errmsg.DEVEL);
  //- type can be anything reasonable
  assert((outline === null) || (outline instanceof COutline), errmsg.DEVEL);
  assert((section === null) || (section instanceof CSection), errmsg.DEVEL);
  
//public:

  //- CNodeProxy node { get; }
  //- Anything type { get; }
  //- COutline outline { get; }
  //- CSection section { get; }

//private:

  //- CNodeProxy _node
  //- the node that triggered the creation
  //  of this context object
  this._node = node;

  //- Anything _type
  //- the current type identifier
  //  associated with this context
  //- mainly used to ignore/hide nodes
  this._type = type;
  
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
//- Anything type { get; }

get type() {
  return this._type;
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
