
"use strict";

const assert = require("assert");

const err = require("./errorMessages.js");

module.exports = class COptions {
//========//========//========//========//========//========//========//========

constructor() {
  assert((arguments.length === 0), err.DEVEL);

//public: 

//private:

  //- a flag to indicate that all option values
  //  are default values
  this._isDefault = true;
}

//========//========//========//========//========//========//========//========
//- get bool isDefault()

get isDefault() {
  return this._isDefault;
}

//========//========//========//========//========//========//========//========
//- void combine(Object optionsArg)
//- void combine(String optionsArg)
//- void combine(COptions optionsArg)

combine(optionsArg) {
  this._isDefault = false;
}

//========//========//========//========//========//========//========//========
};//- module.exports
