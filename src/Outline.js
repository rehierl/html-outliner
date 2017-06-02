
"use strict";

const assert = require("assert");
const format = require("util").format;

const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");

module.exports = class COutline {
//========//========//========//========//========//========//========//========

//- new COutline(CNodeProxy owner)
constructor(node) {
  assert((this instanceof COutline), "invalid call");
  assert((arguments.length === 1), "invalid call");
  
  //- NetBeans, stop trolling me ...
  //assert((node instanceof CNodeProxy), "invalid call");
  assert((node.isSR() || node.isSC()), "invalid call");
  
  //- implicitly associate node with this outline
  node.innerOutline(this);

//public:

  //- CNodeProxy outlineOwner()
  //- bool isImpliedOutline()

  //- void addSection(CSection section)
  //- CSection lastSection()
  //- CSection[] sections()

//private:
  
  //- CNodeProxy _outlineOwner
  //- the outline's starting CNodeProxy object
  //- the node that triggered the creation of this outline
  //- a SR, or a SC element
  this._outlineOwner = node;
  
  //- CSection[] _sections
  //- the inner top-level sections of a SR or SC element
  this._sections = [];
}

//========//========//========//========//========//========//========//========

//- CNodeProxy outlineOwner
outlineOwner() {
  assert((arguments.length === 0), "invalid call");
  return this._outlineOwner;
}

//========//========//========//========//========//========//========//========

//- bool isImpliedOutline()
isImpliedOutline() {
  assert((arguments.length === 0), "invalid call");
  return this._outlineOwner.isSC();
}

//========//========//========//========//========//========//========//========

//- void addSection(CSection section)
addSection(section) {
  assert((arguments.length === 1), "invalid call");
  
  //- NetBeans, stop trolling me ...
  //assert((section instanceof CSection), "invalid call");
  
  this._sections.push(section);
  section.parentOutline(this);
}

//========//========//========//========//========//========//========//========

//- CSection lastSection()
lastSection() {
  assert((arguments.length === 0), "invalid call");
  
  let ic = this._sections.length;
  assert((ic > 0), "Outline.lastSection(): "
    + "the outline does not have any sections");
  
  return this._sections[ic-1];
}

//========//========//========//========//========//========//========//========

//- CSection[] sections()
sections() {
  assert((arguments.length === 0), "invalid call");
  return this._sections;
}

//========//========//========//========//========//========//========//========
};//- module.exports
