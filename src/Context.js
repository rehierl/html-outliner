
"use strict";

const assert = require("assert");

const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");

module.exports = class CContext {
//========//========//========//========//========//========//========//========

//- new CContext(Anything type, CNodeProxy node,
//  CSection section, COutline outline)
constructor(type, node, section, outline) {
  assert((this instanceof CContext), "invalid call");
  assert((arguments.length === 4), "invalid call");
  
  //- type can be anything reasonable
  assert((node instanceof CNodeProxy), "invalid call");
  assert((section === null) || (section instanceof CSection), "invalid call");
  assert((outline === null) || (outline instanceof COutline), "invalid call");
  
//public:

  //- Anything type()
  //- CNodeProxy node()
  //- CSection currentSection()
  //- COutline currentOutline()

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

//- Anything type()
type() {
  assert((arguments.length === 0), "invalid call");
  return this._type;
}

//========//========//========//========//========//========//========//========

//- CNodeProxy node()
node() {
  assert((arguments.length === 0), "invalid call");
  return this._node;
}

//========//========//========//========//========//========//========//========

//- CSection currentSection()
currentSection() {
  assert((arguments.length === 0), "invalid call");
  return this._currentSection;
}

//========//========//========//========//========//========//========//========

//- COutline currentOutline()
currentOutline() {
  assert((arguments.length === 0), "invalid call");
  return this._currentOutline;
}

//========//========//========//========//========//========//========//========
};//- module.exports
