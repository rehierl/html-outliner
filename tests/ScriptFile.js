
"use strict";

const assert = require("assert");
const format = require("util").format;

const JSDOM = require("jsdom").JSDOM;

/* must appear below module.exports (cyclic require statements)
const CAlgorithm = require("../src/Algorithm.js");
//*/

module.exports = class CScriptFile {
//========//========//========//========//========//========//========//========
//- new CScriptFile()

constructor() {
  assert((arguments.length === 0), "invalid call");
  
//public:

  //- String path { get; }
  //- String pathAbs { get; }
  //- void read(String relPath, String absPath, String contents)
  //- void run()
  
//private:

  //- void execCommands(String contents)
  //- void onCmdHtml(String cmd, String text, String selector)
  //- void onCmdOutline(String cmd, String text, String line) - TODO
  
//private:
  
  //- the relative path of a script file
  //- may only contain forward slashes
  this._relPath = undefined;
  
  //- the absolute path of a script file
  //- may contain forward and/or backward slashes
  this._absPath = undefined;

  //- the html document string from which to create the outline.
  this._htmlContent = undefined;
  
  //- the selector that defines the parent node where to start
  //  creating the outline.
  this._htmlSelector = undefined;

//private, temporary:
}

//========//========//========//========//========//========//========//========
//- String path { get; }

get path() {
  return this._relPath;
}

//========//========//========//========//========//========//========//========
//- String pathAbs { get; }

get pathAbs() {
  return this._absPath;
}

//========//========//========//========//========//========//========//========
//- void read(String relPath, String absPath, String contents)

read(relPath, absPath, contents) {
  this._relPath = relPath;
  this._absPath = absPath;
  
  this.execCommands(contents);
  
  assert(this._htmlContent, format(
    "script [%s]: has no $html() command", this._absPath
  ));
}

//========//========//========//========//========//========//========//========
//- void execCommands(String contents)

execCommands(contents) {
  const rxTest = /\$test\./gi;
  const rxCommand = /^\$test\.\$([a-z]+)\(([^\)]*)\)/i;
  let offsets = [];
  
  while(true) {
    let result = rxTest.exec(contents);
    if(result === null) break;
    offsets.push(result.index);
  }
  
  assert((offsets.length > 0), format(
    "script [%s]: has no command at all", this._absPath
  ));
  
  let commands = {
    "html": "onCmdHtml",
    "outline": "onCmdOutline"
  };
  
  let ic = offsets.length;
  offsets.push(contents.length);
  
  for(let ix=0; ix<ic; ix++) {
    let command = contents.substring(offsets[ix], offsets[ix+1]);
    let result = rxCommand.exec(command);
    
    assert((result !== null), format(
      "script [%s]: has invalid command syntax", this._absPath
    ));
    
    //- "$test.$name(param) text" => name(name, text, param)
    //- "$test.$name(p1; p2) text" => name(name, text, p1, p2)
    //- "$test.$name()" => name(name, "", "")
    //- there will always be a at least one parameter, even if
    //  its value is set to ""
    
    let name = result[1];
    name = commands[name];
    
    //- ignore unknown commands
    if(!name) continue;
    
    let params = result[2].split(";");
    let text = contents.substring(result[0].length);
    params.unshift(name, text);
    
    for(let ix=0, ic=params.length; ix<ic; ix++) {
      params[ix] = params[ix].trim();
    }
    
    let fn = this[name];
    
    assert(fn, format(
      "script [%s]: [%s] is an unknown command",
      this._absPath, name
    ));
    
    //- execute: void name(name, text, p1, p2, ...)
    fn.apply(this, params);
  }
}

//========//========//========//========//========//========//========//========
//- void onCmdHtml(String cmd, String text, String selector)

onCmdHtml(name, text, selector) {
  assert(!this._htmlContent, format(
    "script [%s]: multiple $html() commands not supported", this._absPath
  ));
  this._htmlContent = text;
  this._htmlSelector = (selector !== "") ? selector: "body";
}

//========//========//========//========//========//========//========//========
//- void onCmdOutline(String cmd, String text, String line)

onCmdOutline(name, text, line) {
  //- currently ignored
}

//========//========//========//========//========//========//========//========
//- void run()

run() {
  let dom = null;
  
  try {//- read the dom tree
    dom = new JSDOM(this._htmlContent, {
      url: "about:blank",
      referrer: undefined,
      contentType: "text/html",
      userAgent: "jsdom/${jsdomVersion}",
      includeNodeLocations: false
    });
  } catch(error) {
    let outer = new Error(format(
      "script [%s]: failed to read the DOM tree", this._absPath
    ));
    outer.inner = error;
    throw outer;
  }
  
  let outline = null;
  
  try {//- create the outline
    let doc = dom.window.document;
    let root = doc.querySelector(this._htmlSelector);
    
    assert((root !== null), format(
      "script [%s]: no node found using selector [%s]",
      this._absPath, this._htmlSelector
    ));
    
    let algorithm = new CAlgorithm();
    outline = algorithm.createOutline(root);

    //- @todo - continue here
  } catch(error) {
    let outer = new Error(format(
      "script [%s]: failed to create the outline", this._absPath
    ));
    outer.inner = error;
    throw outer;
  } finally {
    dom.window.close();
  }
  
  return;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CAlgorithm = require("../src/Algorithm.js");
//*/
