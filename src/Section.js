
"use strict";

const assert = require("assert");
const format = require("util").format;

const err = require("./errorMessages.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const CNodeProxy = require("./NodeProxy.js");
const COutline = require("./Outline.js");
//*/

//- this constant is use to represent implied headings
//- used when it was determined that a section definitely has no heading
//- this value won't be visible outside of this module;
//  this includes that it won't be passed on as a result/return value
const IMPLIED_HEADING = 0;

module.exports = class CSection {
//========//========//========//========//========//========//========//========
//- new CSection(CNodeProxy startingNode, CNodeProxy heading)
//- new CSection(node, null) - start a new section with an unknown heading
//- new CSection(node, heading) - start a new section with a known heading

constructor(node, heading) {
  assert((arguments.length === 2), err.DEVEL);

  assert((node instanceof CNodeProxy), err.DEVEL);
  assert((node.isSR || node.isSC || node.isHC), err.INVARIANT);
  
  if(heading !== null) {
    assert((heading instanceof CNodeProxy), err.DEVEL);
    assert(heading.isHC, err.INVARIANT);
  }
  
  //- don't implicitly associate
  //node.parentSection = this;
  
//public:

  //- CNodeProxy startingNode { get; }
  //- bool isImpliedSection { get; }
  //- COutline parentOutline { get; set; }
  
  //- bool hasNoHeading { get; }
  //- void createAndSetImpliedHeading()
  //- bool hasImpliedHeading { get; }
  //- bool hasHeading { get; }
  //- CNodeProxy heading { get; set; }

  //- bool isAncestorOf(CSection subsection)
  //- void addSubSection(CSection section)
  //- bool hasParentSection { get; }
  //- CSection parentSection { get; set; }
  //- CSection lastSubSection { get; }
  //- CSection[] subsections { get; }

//private:
  
  //- CNodeProxy _startingNode
  //- the node that triggered the creation of this section
  //- a SR, a SC or a heading element
  this._startingNode = node;
  
  //- COutline _parentOutline
  //- the outline to which this section belongs
  this._parentOutline = null;
  
  //- CNodeProxy _heading
  //- the heading that is associated with this section
  //- when done, this will be non-null for all sections;
  //  i.e. either IMPLIED_HEADING, or a CNodeProxy heading
  this._heading = heading;
  
  //- CSection[] _subsections
  //- any number of possibly further nested subsections
  this._subsections = [];
  
  //- CSection _parentSection
  //- the section to which this section is a subsection
  //- (_subsections[ix]._parentSection === this)
  this._parentSection = null;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy startingNode { get; }

get startingNode() {
  return this._startingNode;
}

//========//========//========//========//========//========//========//========
//- bool isImpliedSection { get; }

get isImpliedSection() {
  return this._startingNode.isHC;
}

//========//========//========//========//========//========//========//========
//- COutline parentOutline { get; set; }

get parentOutline() {
  return this._parentOutline;
}

set parentOutline(parentOutline) {
  assert((parentOutline instanceof COutline), err.DEVEL);
  
  if(this._parentOutline !== null) {//- do not re-associate
    assert((parentOutline === this._parentOutline), err.INVARIANT);
  }
  
  this._parentOutline = parentOutline;
}

//========//========//========//========//========//========//========//========
//- bool hasNoHeading { get; }

//- true if, and only if, no heading was set;
//  not even createAndSetImpliedHeading() was executed
get hasNoHeading() {
  return (this._heading === null);
}

//========//========//========//========//========//========//========//========
//- void createAndSetImpliedHeading()

//- calling this is equivalent to the statement:
//  this section does not contain any heading element
createAndSetImpliedHeading() {
  assert((arguments.length === 0), err.DEVEL);
  //- i.e. do not overwrite, not even an implied one
  assert(this._heading === null, err.INVARIANT);
  this._heading = IMPLIED_HEADING;
}

//========//========//========//========//========//========//========//========
//- bool hasImpliedHeading { get; }

get hasImpliedHeading() {
  //- i.e. no-heading-at-all does not count as an implied one
  return (this._heading === IMPLIED_HEADING);
}

//========//========//========//========//========//========//========//========
//- bool hasHeading { get; }

get hasHeading() {
  let heading = this._heading;
  return (heading instanceof CNodeProxy);
}

//========//========//========//========//========//========//========//========
//- CNodeProxy heading { get; set; }
//- when the outliner is done, heading must be one of two:
//- null - representing an implied heading, or
//- heading - the first heading element in that section

get heading() {
  assert((this._heading !== null), err.INVARIANT);//- we are not done yet
  if(this._heading === IMPLIED_HEADING) return null;
  return this._heading;
}

set heading(heading) {
  assert((heading instanceof CNodeProxy), err.DEVEL);
  assert(heading.isHC, err.INVARIANT);
  
  //- i.e. do not overwrite, not even an implied one
  assert((this._heading === null), err.INVARIANT);

  this._heading = heading;
}

//========//========//========//========//========//========//========//========
//- bool isAncestorOf(CSection subsection)

isAncestorOf(subsection) {
  assert((arguments.length === 1), err.DEVEL);
  assert((subsection instanceof CSection), err.DEVEL);
  let parent = subsection._parentSection;
  
  while(parent !== null) {
    if(parent === this) return true;
    parent = parent.parentSection;
  }
  
  return false;
}

//========//========//========//========//========//========//========//========
//- bool hasParentSection { get; }

get hasParentSection() {
  return (this._parentSection !== null);
}

//========//========//========//========//========//========//========//========
//- CSection parentSection { get; set; }

get parentSection() {
  return this._parentSection;
}

set parentSection(parentSection) {
  assert((parentSection instanceof CSection), err.DEVEL);
  
  if(this._parentSection !== null) {//- do not re-associate
    assert((this._parentSection === parentSection), err.INVARIANT);
  }
  
  this._parentSection = parentSection;
}

//========//========//========//========//========//========//========//========
//- void addSubSection(CSection section)

addSubSection(subsection) {
  assert((arguments.length === 1), err.DEVEL);
  assert((subsection instanceof CSection), err.DEVEL);
  
  this._subsections.push(subsection);
  subsection.parentSection = this;
}

//========//========//========//========//========//========//========//========
//- CSection lastSubSection { get; }

get lastSubSection() {
  let len = this._subsections.length;
  assert((len > 0), err.INVARIANT);
  return this._subsections[len-1];
}

//========//========//========//========//========//========//========//========
//- CSection[] subsections { get; }

get subsections() {
  //- it might become necessary to create a clone
  return this._subsections;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const COutline = require("./Outline.js");
//*/
