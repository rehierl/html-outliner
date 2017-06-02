
"use strict";

const assert = require("assert");
const format = require("util").format;

const TEST_TO_RUN = "basic-tests/body-12321.test";
const CRepository = require("./Repository.js");

(function main() {
  let repository = new CRepository();
  repository.load("./tests/");
  
  //*
  try {
    let script = repository.getScript(TEST_TO_RUN);
    
    console.log(format(
      "testing script [%s]...", script.path
    ));
    
    script.run();
  } catch(error) {
    console.log(error);
  }//*/
  
  return;
})();
