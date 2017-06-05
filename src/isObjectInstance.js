
"use strict";

const assert = require("assert");
const err = require("./errorMessages.js");

module.exports = isObjectInstance;

function toString(value) {
  return Object.prototype.toString.call(value);
}

//========//========//========//========//========//========//========//========
//- bool isObjectInstance(value)

//- true if not null or if value is an instance of any object
//- note: (null instanceof SomeType) will always be false
//- note: Node.js's global isObject() function
//  will return true, if value is a function!
function isObjectInstance(value) {
  assert((arguments.length === 1), err.DEVEL);
  if(value === null) return false;
  //- (typeof null) = "object"
  //- (typeof false) = "boolean"
  //- (typeof 123) = "number"
  //- (typeof []) = "object"
  //- (typeof {}) = "object"
  //- (typeof function) = "function"
  if((typeof value) !== "object") return false;
  //- toString(null) = "[object Null]"
  //- toString({}) = "[object Object]"
  //- toString([]) = "[object Array]"
  //- toString(function) = "[object Function]"
  if(toString(value) !== "[object Object]") return false;
  return true;
}
