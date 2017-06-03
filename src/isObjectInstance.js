
"use strict";

const assert = require("assert");
const errmsg = require("./errorMessages.js");

module.exports = isObjectInstance;

//========//========//========//========//========//========//========//========
//- bool isObjectInstance(value)

//- true if not null or if value is an instance of any object
//- note: (null instanceof SomeType) will always be false
//- note: Node.js's global isObject() function
//  will return true, if value is a function!
function isObjectInstance(value) {
  assert((arguments.length === 1), errmsg.DEVEL);
  if(value === null) return false;
  if((typeof value) !== "object") return false;
  return true;
}
