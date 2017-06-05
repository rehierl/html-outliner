
"use strict";

const assert = require("assert");
const err = require("./errorMessages.js");

module.exports = isObjectInstance;

//========//========//========//========//========//========//========//========
//- bool isObjectInstance(value)

//- true if not null or if value is an instance of any object
//- note: (null instanceof SomeType) will always be false
//- note: Node.js's global isObject() function
//  will return true, if value is a function!
function isObjectInstance(value) {
  assert((arguments.length === 1), err.DEVEL);
  
  //- (null instanceof Object) = false
  //- (false instanceof Object) = false
  //- (123 instanceof Object) = false
  //- ("" instanceof Object) = false
  //- ([] instanceof Object) = true
  //- ({} instanceof Object) = true
  //- (function intstanceof Object) = true
  if((value instanceof Object) !== true) return false;
  
  //- (typeof null) = "object"
  //- (typeof false) = "boolean"
  //- (typeof 123) = "number"
  //- (typeof "") = "string"
  //- (typeof []) = "object"
  //- (typeof {}) = "object"
  //- (typeof function) = "function"
  //if((typeof value) !== "object") return false;
  
  let str = Object.prototype.toString.call(value);
  //- toString([]) = "[object Array]"
  if(str === "[object Array]") return false;
  //- toString(function) = "[object Function]"
  if(str === "[object Function]") return false;
  //- toString({}) = "[object Object]"
  
  //- hope that it really is what it is supposed to be ...
  return true;
}
