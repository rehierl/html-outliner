
"use strict";

const assert = require("assert");
const format = require("util").format;

/* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const COutline = require("./Outline.js");
//*/

const IMPLIED_HEADING = "implied-heading";

module.exports = class CSection {
//========//========//========//========//========//========//========//========

//- new CSection(CNodeProxy startingNode, CNodeProxy heading)
//- new CSection(node, null) - start a new section with an unknown heading
//- new CSection(node, heading) - start a new section with a known heading
constructor(node, heading) {
  assert((this instanceof CSection), "invalid call");
  assert((arguments.length === 2), "invalid call");

  assert((node instanceof CNodeProxy), "invalid call");
  assert((node.isSR() || node.isSC() || node.isHC()), "invalid call");
  
  if(heading !== null) {
    assert((heading instanceof CNodeProxy), "invalid call");
    assert(heading.isHC(), "invalid call");
  }
  
  //- don't implicitly associate
  //node.parentSection(this);
  
//public:

  //- CNodeProxy startingNode()
  //- bool isImpliedSection()
  
  //- COutline parentOutline()
  //- void parentOutline(COutline parentOutline)
  
  //- bool hasNoHeading()
  //- void createAndSetImpliedHeading()
  //- bool hasImpliedHeading()
  //- bool hasHeading()
  //- CNodeProxy heading()
  //- void heading(CNodeProxy node)

  //- bool isAncestorOf(CSection subsection)
  //- void addSubSection(CSection section)
  //- bool hasParentSection()
  //- CSection parentSection()
  //- void parentSection(CSection parentSection)
  //- CSection lastSubSection()
  //- CSection[] subsections()

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

//- CNodeProxy startingNode()
startingNode() {
  assert((arguments.length === 0), "invalid call");
  return this._startingNode;
}

//========//========//========//========//========//========//========//========

//- bool isImpliedSection()
isImpliedSection() {
  assert((arguments.length === 0), "invalid call");
  return this._startingNode.isHC();
}

//========//========//========//========//========//========//========//========

//- COutline parentOutline()
//- void parentOutline(COutline parentOutline)
parentOutline(parentOutline) {
  if(arguments.length === 0) {
    return this._parentOutline;
  }
  
  assert((arguments.length === 1), "invalid call");
  assert((parentOutline instanceof COutline), "invalid call");
  
  if(this._parentOutline !== null) {
    //- i.e. do not re-associate
    assert((parentOutline === this._parentOutline), "invalid call");
  }
  
  this._parentOutline = parentOutline;
}

//========//========//========//========//========//========//========//========

//- bool hasNoHeading()
//- true if, and only if, no heading was set;
//  not even createAndSetImpliedHeading() was executed
hasNoHeading() {
  assert((arguments.length === 0), "invalid call");
  return (this._heading === null);
}

//========//========//========//========//========//========//========//========

//- void createAndSetImpliedHeading()
//- calling this is equivalent to the statement:
//  this section does not contain any heading element
createAndSetImpliedHeading() {
  assert((arguments.length === 0), "invalid call");
  //- i.e. do not overwrite, not even an implied one
  assert(this._heading === null, "invalid call");
  this._heading = IMPLIED_HEADING;
}

//========//========//========//========//========//========//========//========

//- bool hasImpliedHeading()
hasImpliedHeading() {
  assert((arguments.length === 0), "invalid call");
  //- i.e. no-heading-at-all does not count as an implied one
  return (this._heading === IMPLIED_HEADING);
}

//========//========//========//========//========//========//========//========

//- bool hasHeading()
hasHeading() {
  assert((arguments.length === 0), "invalid call");
  let heading = this._heading;
  
  return (heading instanceof CNodeProxy);
  //return ((heading !== null) && (heading !== IMPLIED_HEADING));
}

//========//========//========//========//========//========//========//========

//- CNodeProxy heading()
//- void heading(CNodeProxy heading)
//- when the outliner is done, heading must be one of two:
//- - null - representing an implied heading
//- - heading - the first heading element in that section
heading(heading) {
  if(arguments.length === 0) {
    assert((this._heading !== null), "invalid call");//- not done yet
    if(this._heading === IMPLIED_HEADING) return null;
    return this._heading;
  }
  
  assert((arguments.length === 1), "invalid call");
  assert((heading instanceof CNodeProxy), "invalid call");
  assert(heading.isHC(), "invalid call");
  
  //- i.e. do not overwrite, not even an implied one
  assert((this._heading === null), "invalid call");

  this._heading = heading;
}

//========//========//========//========//========//========//========//========

//- bool isAncestorOf(CSection subsection)
isAncestorOf(subsection) {
  assert((arguments.length === 1), "invalid call");
  assert((subsection instanceof CSection), "invalid call");
  let parent = subsection._parentSection;
  
  while(parent !== null) {
    if(parent === this) {
      return true;
    }
    parent = parent._parentSection;
  }
  
  return false;
}

//========//========//========//========//========//========//========//========

//- bool hasParentSection()
hasParentSection() {
  assert((arguments.length === 0), "invalid call");
  return (this._parentSection !== null);
}

//========//========//========//========//========//========//========//========

//- CSection parentSection()
//- void parentSection(CSection parentSection)
parentSection(parentSection) {
  if(arguments.length === 0) {
    return this._parentSection;
  }
  
  assert((arguments.length === 1), "invalid call");
  assert((parentSection instanceof CSection), "invalid call");
  
  if(this._parentSection !== null) {
    //- i.e. do not re-associate
    assert((this._parentSection === parentSection), "invalid call");
  }
  
  this._parentSection = parentSection;
}

//========//========//========//========//========//========//========//========

//- void addSubSection(CSection section)
addSubSection(subsection) {
  assert((arguments.length === 1), "invalid call");
  assert((subsection instanceof CSection), "invalid call");
  
  this._subsections.push(subsection);
  subsection.parentSection(this);
}

//========//========//========//========//========//========//========//========

//- CSection lastSubSection()
lastSubSection() {
  assert((arguments.length === 0), "invalid call");
  
  let ic = this._subsections.length;
  assert((ic > 0), "CSection.lastSubSection(): "
    + "the section does not have any subsections");
  
  return this._subsections[ic-1];
}

//========//========//========//========//========//========//========//========

//- CSection[] subsections()
subsections() {
  assert((arguments.length === 0), "invalid call");
  //- it might become necessary to create a clone
  return this._subsections;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CNodeProxy = require("./NodeProxy.js");
const COutline = require("./Outline.js");
//*/
