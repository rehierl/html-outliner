
"use strict";

const assert = require("assert");
const err = require("./errorMessages.js");

/* must appear below module.exports
//- TODO - this could change with ES6 modules
const CContext = require("./Context.js");
//*/

module.exports = class CStack {
//========//========//========//========//========//========//========//========
//- properties/methods overview
  
//public:

  //- new CStack()

  //- void push(CContext context)
  //- CContext pop()

  //- CContext tos { get; }
  //- bool isEmpty { get; }

//========//========//========//========//========//========//========//========
//- new CStack()

constructor() {
  assert((arguments.length === 0), err.DEVEL);

//private:

  //- CContext[] _buffer
  //- an array used as the actual stack
  this._buffer = [];
}

//========//========//========//========//========//========//========//========
//- void push(CContext context)

push(context) {
  assert((arguments.length === 1), err.DEVEL);
  assert((context instanceof CContext), err.DEVEL);
  this._buffer.push(context);
}

//========//========//========//========//========//========//========//========
//- CContext pop()

pop() {
  assert((arguments.length === 0), err.DEVEL);
  let len = this._buffer.length;
  assert((len > 0), err.INVARIANT);
  return this._buffer.pop();
}

//========//========//========//========//========//========//========//========
//- CContext tos { get; }

get tos() {
  let len = this._buffer.length;
  assert((len > 0), err.INVARIANT);
  return this._buffer[len-1];
}

//========//========//========//========//========//========//========//========
//- bool isEmpty { get; }

get isEmpty() {
  return (this._buffer.length === 0);
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports
//  due to Node.js having an issue with cyclic require statements.
const CContext = require("./Context.js");
//*/
