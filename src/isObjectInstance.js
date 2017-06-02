
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

//========//========//========//========//========//========//========//========

function test() {
  //*/
  {//- undefined
    //- value: "undefined"
    //- typeof: "undefined"
    //- Object.toString(): "[object Undefined]"
    //- Instance.toString(): "ERROR"
    console.log("");
    console.log("# undefined");
    testValue(undefined);
  }//*/
  
  //*/
  {//- null
    //- value: "null"
    //- typeof: "object"
    //- Object.toString(): "[object Null]"
    //- Instance.toString(): "ERROR"
    console.log("");
    console.log("# null");
    testValue(null);
  }//*/
  
  //*/
  {//- Test0
    //- value: <function source code>
    //- typeof: "function"
    //- Object.toString(): "[object Function]"
    //- Instance.toString(): <function source code>
    console.log("");
    console.log("# Test0");
    testValue(Test0);
  }//*/
  
  //*/
  {//- new Test1()
    //- value: "Test1 { property: true }"
    //- typeof: "object"
    //- Object.toString(): "[object Object]"
    //- Instance.toString(): "test-1"
    console.log("");
    console.log("# new Test1()");
    testValue(new Test1());
  }//*/
  
  //*/
  {//- new Test2()
    //- value: "Test2 { property: true, toString: [Function] }"
    //- typeof: "object"
    //- Object.toString(): "[object Object]"
    //- Instance.toString(): "test-2"
    console.log("");
    console.log("# new Test2()");
    testValue(new Test2());
  }//*/
}

//========//========//========//========//========//========//========//========

function testValue(value) {
  console.log("value:", value);
  console.log("typeof:", (typeof value));
  
  try {
    let result = Object.prototype.toString.call(value);
    console.log("Object.toString():", result);
  } catch(error) {
    console.log("Object.toString():", "ERROR");
  }
  
  try {
    let result = value.toString();
    console.log("Instance.toString():", result);
  } catch(error) {
    console.log("Instance.toString():", "ERROR");
  }
}

//========//========//========//========//========//========//========//========

function Test0() {
  //- an ordinary function
}

//========//========//========//========//========//========//========//========

function Test1() {
  this.property = true;
}

Test1.prototype.toString = function() {
  return "test-1";
};

//========//========//========//========//========//========//========//========

function Test2() {
  this.property = true;
  this.toString = function() {
    return "test-2";
  };
}
