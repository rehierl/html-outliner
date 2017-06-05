
"use strict";

const assert = require("assert");
const format = require("util").format;

const err = require("./errorMessages.js");
const JSDOM = require("jsdom").JSDOM;

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const COutliner = require("../src/Algorithm.js");
//*/

module.exports = class CScriptFile {
//========//========//========//========//========//========//========//========
//- new CScriptFile()

constructor() {
  assert((arguments.length === 0), err.DEVEL);
  
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
  
  //- the options argument to use when running the outliner.
  this._optionsArg = undefined;

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
    "script [%s]: contains no commands", this._absPath
  ));
  
  let ic = offsets.length;
  offsets.push(contents.length);
  
  let commandsMap = {
    "html": "onCmdHtml",
    "options": "onCmdOptions",
    "outline": "onCmdOutline"
  };
  
  for(let ix=0; ix<ic; ix++) {
    let command = contents.substring(offsets[ix], offsets[ix+1]);
    let match = rxCommand.exec(command);
    
    assert((match !== null), format(
      "script [%s]: has invalid command syntax", this._absPath
    ));
    
    //- "$test.$name() text" => name(name, text, "")
    //  i.e. there will always be at least one parameter,
    //  even if its value is set to ""
    //- "$test.$name(param) text" => name(name, text, param)
    //- "$test.$name(p1; p2) text" => name(name, text, p1, p2)
    
    let name = match[1];
    
    if(commandsMap.hasOwnProperty(name) !== true) {
      //- ignore unknown commands
      continue;
    }
    
    let params = match[2].split(";");
    let text = command.substring(match[0].length);
    params.unshift(name, text);
    
    //- trim all the arguments
    for(let ix=0, ic=params.length; ix<ic; ix++) {
      params[ix] = params[ix].trim();
    }
    
    //- select the command's handler function
    name = commandsMap[name];
    let fn = this[name];
    
    //- if this fails, update the commandsMap
    assert((fn !== undefined), format(
      "script [%s]: [%s] is an unknown command",
      this._absPath, name
    ));
    
    //- execute: void name(name, text, p1, p2, ...)
    fn.apply(this, params);
  }
}

//========//========//========//========//========//========//========//========

onCmdOptions(name, text) {
  assert((this._optionsArg === undefined), format(
    "script [%s]: multiple $options() commands not supported", this._absPath
  ));
  
  let options = undefined;
  
  try {
    //- note that "null", "false", "123", "[]", "{}", etc.
    //  are all complete and valid JSON strings
    options = JSON.parse(text);
  } catch(error) {
    let outer = new Error(format(
      "script [%s]: failed JSON text from the $options() command", this._absPath));
    outer.inner = error;
    throw outer;
  }
  
  assert(((typeof options) === "object"), format(
    "script [%s]: the $options() command must define an object", this._absPath
  ));
  
  //- could still be 
  let result = Object.prototype.toString.call(options);
  
  assert((result === "[object Object]"), format(
    "script [%s]: the $options() command must define an object", this._absPath
  ));
  
  this._optionsArg = options;
}

//========//========//========//========//========//========//========//========
//- void onCmdHtml(String cmd, String text, String selector)

onCmdHtml(name, text, selector) {
  assert((this._htmlContent === undefined), format(
    "script [%s]: multiple $html() commands not supported", this._absPath
  ));
  
  this._htmlContent = text;
  this._htmlSelector = (selector !== "") ? selector : "body";
}

//========//========//========//========//========//========//========//========
//- void onCmdOutline(String cmd, String text, String line)

onCmdOutline(name, text, line) {
  //- TODO - currently ignored
  return;
}

//========//========//========//========//========//========//========//========
//- void run()

run() {
  let dom = null;
  
  assert((this._htmlContent !== undefined), format(
    "script [%s]: has no HTML content", this._absPath));
  
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
      "script [%s]: failed to read the DOM tree", this._absPath));
    outer.inner = error;
    throw outer;
  }
  
  let outline = null;
  
  try {//- create the outline
    let doc = dom.window.document;
    let root = doc.querySelector(this._htmlSelector);
    
    assert((root !== null), format(
      "script [%s]: no node found using the supplied selector [%s]",
      this._absPath, this._htmlSelector));
    
    if(this._optionsArg === undefined) {
      let outliner = new COutliner();
      outline = outliner.createOutline(root, {});
    } else {
      let outliner = new COutliner();
      outline = outliner.createOutline(root, this._optionsArg);
    }

    //- TODO - continue here
  } catch(error) {
    let outer = new Error(format(
      "script [%s]: failed to create the outline", this._absPath));
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
const COutliner = require("../src/Algorithm.js");
//*/
