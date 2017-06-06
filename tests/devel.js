
"use strict";

const process = require("process");
const assert = require("assert");
const format = require("util").format;

//*
const TEST_TO_RUN = "basic-body-tests/body-empty.test";
const CRepository = require("./Repository.js");

(function main() {
  console.log("Node.js version:", process.version);
  
  let repository = new CRepository();
  repository.load("./tests/");
  
  try {
    let script = repository.getScript(TEST_TO_RUN);
    console.log("testing script [%s]...", script.path);
    script.run();
  } catch(error) {
    console.log(error);
  }
  
  return;
})();
//*/
