
"use strict";

const assert = require("assert");

module.exports = isObjectInstance;

//========//========//========//========//========//========//========//========

//- bool isObjectInstance(value)
//- true if not null or if value is an instance of any object
//- note: (null instanceof SomeType) will always be false
//- note: Node.js's global isObject() global function
//  will also return true, if value is a function!
function isObjectInstance(value) {
  assert((arguments.length === 1), "invalid call");
  if(value === null) return false;
  if((typeof value) !== "object") return false;
  return true;
}