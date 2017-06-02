
"use strict";

const assert = require("assert");

/* must appear below module.exports
const CContext = require("./Context.js");
//*/

module.exports = class CStack {
//========//========//========//========//========//========//========//========

//- new CStack()
constructor() {
  assert((this instanceof CStack), "invalid call");
  assert((arguments.length === 0), "invalid call");
  
//public:

  //- void push(CContext context)
  //- CContext pop()
  //- CContext tos()
  //- bool isEmpty()

//private:

  //- CContext[] _buffer
  //- an array used as the actual stack
  this._buffer = [];
}

//========//========//========//========//========//========//========//========

//- void push(CContext context)
push(context) {
  assert((arguments.length === 1), "invalid call");
  assert((context instanceof CContext), "invalid call");
  this._buffer.push(context);
}

//========//========//========//========//========//========//========//========

//- CContext pop()
pop() {
  let len = this._buffer.length;
  assert((len > 0), "invalid call");
  return this._buffer.pop();
}

//========//========//========//========//========//========//========//========

//- CContext tos()
tos() {
  let len = this._buffer.length;
  assert((len > 0), "invalid call");
  return this._buffer[len-1];
}

//========//========//========//========//========//========//========//========

//- bool isEmpty()
isEmpty() {
  let len = this._buffer.length;
  return (len === 0);
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports
//  due to Node.js having an issue with cyclic require statements.
const CContext = require("./Context.js");
//*/
