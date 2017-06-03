
"use strict";

const assert = require("assert");

/* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/

module.exports = class CContext {
//========//========//========//========//========//========//========//========
//- new CContext(CNodeProxy node, CSection section, COutline outline)

constructor(node, section, outline) {
  assert((arguments.length === 3), "invalid call");
  assert((node instanceof CNodeProxy), "invalid call");
  assert((section === null) || (section instanceof CSection), "invalid call");
  assert((outline === null) || (outline instanceof COutline), "invalid call");
  
//public:

  //- CNodeProxy node { get; }
  //- CSection section { get; }
  //- COutline outline { get; }

//private:

  //- CNodeProxy _node
  //- the node that triggered the creation
  //  of this context object
  this._node = node;
  
  //- CSection _section
  //- the current section at the time
  //  this context object was created
  this._section = section;
  
  //- COutline _outline
  //- the current outline at the time
  //  this context object was created
  this._outline = outline;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy Node { get; }

get node() {
  return this._node;
}

//========//========//========//========//========//========//========//========
//- CSection Section { get; }

get section() {
  return this._section;
}

//========//========//========//========//========//========//========//========
//- COutline outline { get; }

get outline() {
  return this._outline;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/
