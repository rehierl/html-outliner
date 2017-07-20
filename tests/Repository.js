
"use strict";

const assert = require("assert");
const format = require("util").format;
const path = require("path");
const fs = require("fs");
const err = require("./errorMessages.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const CScriptFile = require("./ScriptFile.js");
//*/

module.exports = class CRepository {
//========//========//========//========//========//========//========//========
//- properties/methods overview

//public:

  //- new CRepository()

  //- void load(string path)
  //- CScriptFile getScript(string relPath)

//private:

  //- void readDirRecursive(string dir, string[] files)

//========//========//========//========//========//========//========//========
//- new CRepository()

constructor() {
  assert((arguments.length === 0), err.DEVEL);

//private:

  //- { (relPath: CScriptFile)* } _scriptsMap
  this._scriptsMap = null;
}

//========//========//========//========//========//========//========//========
//- CScriptFile getScript(string relPath)

getScript(relPath) {
  assert((arguments.length === 1), err.DEVEL);
  assert(((typeof relPath) === "string"), err.DEVEL);
  assert((this._scriptsMap !== null), err.DEVEL);
  
  assert(this._scriptsMap.hasOwnProperty(relPath), format(
    "script [%s] not found", relPath
  ));
  
  return this._scriptsMap[relPath];
}

//========//========//========//========//========//========//========//========
//- void load(string path)

load(root) {
  //- "./folder" and "./folder/" => "path-to-parent/folder"
  let absRoot = path.resolve(root);
  
  assert(fs.existsSync(absRoot), format(
    "file or folder [%s] does not exist", absRoot
  ));
  
  let files = [];
  
  if(fs.statSync(absRoot).isDirectory()) {
    this.readDirRecursive(absRoot, files);
  } else {
    files.push(absRoot);
    //- absRoot -> parent folder
    absRoot = path.dirname(absRoot);
  }
  
  //- alphabetically sort the absolute path values
  //  i.e. make the list's order obnoxious to the system's order
  files.sort();
  
  let absRootLen = absRoot.length;
  let result = {};
  
  for(let ix=0, ic=files.length; ix<ic; ix++) {
    let absPath = files[ix];
    let relPath = absPath.substring(absRootLen+1);
    
    if(relPath.endsWith(".test") !== true) {
      //- ignore non-script files
      continue;
    }
    
    relPath = relPath.replace(/\\/g, "/");
    let contents = fs.readFileSync(absPath, "utf8");
    
    let file = new CScriptFile();
    file.read(relPath, absPath, contents);
    result[relPath] = file;
  }
  
  this._scriptsMap = result;
}

//========//========//========//========//========//========//========//========
//- void readDirRecursive(string dir, string[] files)

readDirRecursive(dir, files) {
  let children = fs.readdirSync(dir);
  
  for(let ix=0, ic=children.length; ix<ic; ix++) {
    let relChild = children[ix];
    let absChild = path.join(dir, relChild);
    
    if(fs.statSync(absChild).isDirectory()) {
      this.readDirRecursive(absChild, files);
    } else {
      files.push(absChild);
    }
  }
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CScriptFile = require("./ScriptFile.js");
//*/
