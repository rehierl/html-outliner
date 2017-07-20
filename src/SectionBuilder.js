
"use strict";

const assert = require("assert");
const format = require("util").format;
const err = require("./errorMessages.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const COptions = require("./Options.js");
const CNodeProxy = require("./NodeProxy.js");
const COutlineBuilder = require("./OutlineBuilder.js");
//*/

//- this constant is used to represent implied headings
//- it is used when it was determined that a section was completely processed
//  and when no heading element was associated with it
//- this value won't be visible outside of this module/class;
//  i.e. it won't be passed on as a result/return value
const IMPLIED_HEADING = "implied-heading";

module.exports = class CSectionBuilder {
//========//========//========//========//========//========//========//========
//- properties/methods overview
  
//public:

  //- new CSectionBuilder(
  //  COptions options, CNodeProxy startingNode, CNodeProxy heading)

  //- COptions options { get; }
  //- CNodeProxy startingNode { get; }
  
  //- used to implement "associate node X with section Y"
  //- void addInnerNode(CNodeProxy node)
  //- CNodeProxy[] innerNodes { get; }
  
  //- bool hasNoHeading { get; }
  //- void createAndSetImpliedHeading()
  //- bool hasImpliedHeading { get; }
  //- bool hasHeading { get; }
  //- CNodeProxy heading { get; set; }

  //- void addInnerSection(CSectionBuilder section)
  //- CSectionBuilder[] innerSections { get; }
  //- CSectionBuilder lastInnerSection { get; }
  //- CSectionBuilder parentSection { get; set; }
  //- bool isAncestorOf(CSectionBuilder subsection)

  //- COutlineBuilder parentOutline { get; set; }

//========//========//========//========//========//========//========//========
//- new CSectionBuilder(
//  COptions options, CNodeProxy startingNode, CNodeProxy heading)
//- (options, node, null) - create a new section with an unknown heading
//- (options, node, heading) - create a new section with a known heading

constructor(options, node, heading) {
  assert((arguments.length === 3), err.DEVEL);
  assert((options instanceof COptions), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  assert((node.isSR || node.isSC || node.isHC), err.INVARIANT);
  
  if(heading !== null) {
    assert((heading instanceof CNodeProxy), err.DEVEL);
    assert(heading.isHC, err.INVARIANT);
  }
  
  //- don't implicitly associate
  //node.parentSection = this;

//private:

  //- COptions options
  //- the options to use during the next run
  this._options = options;
  
  //- CNodeProxy _startingNode
  //- the node that triggered the creation of this section
  //- a SR, a SC or a heading element
  this._startingNode = node;
  
  //- CNodeProxy _heading
  //- the heading that is associated with this section
  //- when done, this will be non-null for all sections;
  //  i.e. either IMPLIED_HEADING, or a CNodeProxy heading
  this._heading = heading;
  
  //- CNodeProxy[] _innerNodes
  //- the nodes associated with this section
  this._innerNodes = [];
  
  //- CSectionBuilder[] _innerSections
  //- any number of possibly further nested inner sections
  this._innerSections = [];
  
  //- CSectionBuilder _parentSection
  //- the section to which this section is a subsection
  //- (_innerSections[ix]._parentSection === this)
  this._parentSection = null;
  
  //- COutlineBuilder _parentOutline
  //- the outline to which this section belongs
  this._parentOutline = null;
}

//========//========//========//========//========//========//========//========
//- COptions options { get; }

get options() {
  return this._options;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy startingNode { get; }

get startingNode() {
  return this._startingNode;
}

//========//========//========//========//========//========//========//========
//- void addInnerNode(CNodeProxy node)

addInnerNode(node) {
  assert((arguments.length === 1), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  
  this._innerNodes.push(node);
  node.parentSection = this;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy[] innerNodes { get; }

get innerNodes() {
  return this._innerNodes;
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
//- void addInnerSection(CSectionBuilder section)

addInnerSection(section) {
  assert((arguments.length === 1), err.DEVEL);
  assert((section instanceof CSectionBuilder), err.DEVEL);
  
  this._innerSections.push(section);
  section.parentSection = this;
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder[] innerSections { get; }

get innerSections() {
  //- it might become necessary to create a clone
  return this._innerSections;
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder lastInnerSection { get; }

get lastInnerSection() {
  let len = this._innerSections.length;
  assert((len > 0), err.INVARIANT);
  return this._innerSections[len-1];
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder parentSection { get; set; }

get parentSection() {
  return this._parentSection;
}

set parentSection(parentSection) {
  assert((parentSection instanceof CSectionBuilder), err.DEVEL);
  
  if(this._parentSection !== null) {//- do not re-associate
    assert((this._parentSection === parentSection), err.INVARIANT);
  }
  
  this._parentSection = parentSection;
}

//========//========//========//========//========//========//========//========
//- bool isAncestorOf(CSectionBuilder subsection)
//- note - same as subsection.isSubSectionOf(this)

isAncestorOf(subsection) {
  assert((arguments.length === 1), err.DEVEL);
  assert((subsection instanceof CSectionBuilder), err.DEVEL);
  let parent = subsection._parentSection;
  
  while(parent !== null) {
    if(parent === this) return true;
    parent = parent.parentSection;
  }
  
  return false;
}

//========//========//========//========//========//========//========//========
//- COutlineBuilder parentOutline { get; set; }

get parentOutline() {
  return this._parentOutline;
}

set parentOutline(parentOutline) {
  assert((parentOutline instanceof COutlineBuilder), err.DEVEL);
  
  if(this._parentOutline !== null) {//- do not re-associate
    assert((parentOutline === this._parentOutline), err.INVARIANT);
  }
  
  this._parentOutline = parentOutline;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const COptions = require("./Options.js");
const CNodeProxy = require("./NodeProxy.js");
const COutlineBuilder = require("./OutlineBuilder.js");
//*/
