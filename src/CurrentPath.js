
"use strict";

const assert = require("assert");
const format = require("util").format;
const err = require("./errorMessages.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const CNodeProxy = require("./NodeProxy.js");
//*/

module.exports = class CCurrentPath {
//========//========//========//========//========//========//========//========
//- properties/methods overview

//public:

  //- new CCurrentPath()
  
  //- void push(CNodeProxy node)
  //- void pop(CNodeProxy node)
  //- bool isEmpty { get; }
  //- string currentPath { get; }

//private:

  //- string nodeToString(CNodeProxy node)
  //- string textContentOf(CNodeProxy node)

//========//========//========//========//========//========//========//========
//- new CCurrentPath()

constructor() {
  assert((arguments.length === 0), err.DEVEL);

//private:

  //- CNodeProxy[] _path
  //- the internal buffer
  this._path = [];

//- "remember the result" fields
//private, temporary:

  //- string _currentPath
  //- a string representation of the current path
  this._currentPath = undefined;
}

//========//========//========//========//========//========//========//========
//- void push(CNodeProxy node)

push(node) {
  assert((arguments.length === 1), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  assert(node.isDomNode, err.DEVEL);
  this._path.push(node);
  this._currentPath = undefined;
}

//========//========//========//========//========//========//========//========
//- void pop(CNodeProxy node)

pop(node) {
  assert((arguments.length === 1), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  
  let len = this._path.length;
  assert((len > 0), err.DEVEL);
  
  let tos = this._path[len-1];
  assert((tos === node), err.DEVEL);
  
  tos = this._path.pop();
  this._currentPath = undefined;
}

//========//========//========//========//========//========//========//========
//- bool isEmpty { get; }

get isEmpty() {
  return (this._path.length === 0);
}

//========//========//========//========//========//========//========//========
//- string currentPath { get; }

get currentPath() {
  if(this._currentPath === undefined) {
    let ic = this._path.length;
    
    if(ic === 0) {
      this._currentPath = "empty path";
      return this._currentPath;
    }
    
    let path = [];
    
    for(let ix=0, ic=this._path.length; ix<ic; ix++) {
      let node = this._path[ix];
      let text = this.nodeToString(node);
      path.push(text);
    }
    
    path = path.join(" / ");
    this._currentPath = path;
  }
  return this._currentPath;
}

//========//========//========//========//========//========//========//========
//- string nodeToString(CNodeProxy node)

nodeToString(node) {
  let text = node.nodeName;
  
  if(text === "#text") {
    return format("%s(%s)", text, this.textContentOf(node));
  }
  
  if(node.isHC) {
    return format("%s(%s)", text, this.textContentOf(node));
  }
  
  return text;
}

//========//========//========//========//========//========//========//========
//- string textContentOf(CNodeProxy node)

textContentOf(node) {
  const TextLenMax = 16;
  
  let text = node.textContent;
  text = text.trim();
  
  if(text.length > TextLenMax) {
    text = format("%s...", text.substring(0, TextLenMax));
  }
  
  return text;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
//*/
