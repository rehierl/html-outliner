
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
  //- void commandsMap()
  //- void onCmdOptions(String cmd, String text)
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
    "script [%s]: has no commands", this._absPath
  ));
  
  let ic = offsets.length;
  offsets.push(contents.length);
  let commandsMap = this.commandsMap();
  
  for(let ix=0; ix<ic; ix++) {
    let command = contents.substring(offsets[ix], offsets[ix+1]);
    let match = rxCommand.exec(command);
    
    assert((match !== null), format(
      "script [%s]: contains invalid command syntax", this._absPath
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
    
    //- select the command handler
    let handler = null;
    
    {//- select and check the referenced function call
      let entry = commandsMap[name];
      let offset = entry.indexOf(":");
      //- check the entries of commandsMap()
      assert((offset > 0), "internal error");
      
      let argc = Number.parseInt(entry.substring(offset+1));

      assert((params.length === argc), format(
        "script [%s]: [%s] invalid number of arguments",
        this._absPath, name
      ));
      
      handler = this[entry.substring(0, offset)];

      //- if this fails, update the commandsMap
      assert((handler !== undefined), format(
        "script [%s]: [%s] is an unknown command",
        this._absPath, name
      ));
    }
    
    //- execute the command handler
    handler.apply(this, params);
  }
}

//========//========//========//========//========//========//========//========
//- void commandsMap()

//- return { (name: "function:argc")* }
//- name - the command's name
//- function - the name of the function that acts as a handler for "name"
//- argc - the number of arguments supported by "function" (i.e. not by "name")
//  - you will always have at least 3 arguments (name, text, arg0) - even if
//  (text == "") and (arg0 == "")
commandsMap() {
  return {
    "options": "onCmdOptions:3",
    "html": "onCmdHtml:3",
    "outline": "onCmdOutline:3"
  };
}

//========//========//========//========//========//========//========//========
//- void onCmdOptions(String cmd, String text)

onCmdOptions(name, text, arg0) {
  assert((this._optionsArg === undefined), format(
    "script [%s]: multiple $options() commands not supported",
    this._absPath
  ));
  
  arg0 = arg0.trim();
  
  assert((arg0 === ""), format(
    "script [%s]: $options() command doesn't support any arguments",
    this._absPath
  ));
  
  text = text.trim();
  
  assert((text !== ""), format(
    "script [%s]: an $options() command must have an options object",
    this._absPath
  ));
  
  let options = undefined;
  
  try {
    //- note that "null", "false", "123", "[]", "{}", etc.
    //  are all complete and valid JSON strings
    options = JSON.parse(text);
  } catch(error) {
    let outer = new Error(format(
      "script [%s]: failed to parse the $options() command",
      this._absPath));
    outer.inner = error;
    throw outer;
  }
  
  assert(((typeof options) === "object"), format(
    "script [%s]: the $options() command must define an object",
    this._absPath
  ));
  
  let result = Object.prototype.toString.call(options);
  
  assert((result === "[object Object]"), format(
    "script [%s]: the $options() command must define an object",
    this._absPath
  ));
  
  this._optionsArg = options;
}

//========//========//========//========//========//========//========//========
//- void onCmdHtml(String cmd, String text, String selector)

onCmdHtml(name, text, selector) {
  assert((this._htmlContent === undefined), format(
    "script [%s]: multiple $html() commands not supported",
    this._absPath
  ));
  
  text = text.trim();
  
  assert((text !== ""), format(
    "script [%s]: an $html() command must have html content",
    this._absPath
  ));
  
  selector = selector.trim();
  
  assert((text !== ""), format(
    "script [%s]: an $html() command must have a non-empty selector",
    this._absPath
  ));
  
  this._htmlContent = text;
  this._htmlSelector = selector;
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
