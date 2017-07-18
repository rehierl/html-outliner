
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
//- new CSectionBuilder(CNodeProxy startingNode, CNodeProxy heading, COptions options)
//- new CSectionBuilder(node, null, options) - start a new section with an unknown heading
//- new CSectionBuilder(node, heading, options) - start a new section with a known heading

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
  
//public:

  //- COptions options { get; }

  //- CNodeProxy startingNode { get; }
  //- bool isExplicitSection { get; }
  //- bool isImplicitSection { get; }

  //- COutlineBuilder parentOutline { get; set; }
  
  //- bool hasNoHeading { get; }
  //- void createAndSetImpliedHeading()
  //- bool hasImpliedHeading { get; }
  //- bool hasHeading { get; }
  //- CNodeProxy heading { get; set; }

  //- bool isAncestorOf(CSectionBuilder subsection)
  //- void addSubSection(CSectionBuilder section)
  //- bool hasParentSection { get; }
  //- CSectionBuilder parentSection { get; set; }
  //- CSectionBuilder lastSubSection { get; }
  //- CSectionBuilder[] subsections { get; }

//private:

  //- COptions options
  //- the options to use during the next run
  this._options = options;
  
  //- CNodeProxy _startingNode
  //- the node that triggered the creation of this section
  //- a SR, a SC or a heading element
  this._startingNode = node;
  
  //- COutlineBuilder _parentOutline
  //- the outline to which this section belongs
  this._parentOutline = null;
  
  //- CNodeProxy _heading
  //- the heading that is associated with this section
  //- when done, this will be non-null for all sections;
  //  i.e. either IMPLIED_HEADING, or a CNodeProxy heading
  this._heading = heading;
  
  //- CSectionBuilder[] _subsections
  //- any number of possibly further nested subsections
  this._subsections = [];
  
  //- CSectionBuilder _parentSection
  //- the section to which this section is a subsection
  //- (_subsections[ix]._parentSection === this)
  this._parentSection = null;
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
//- bool isExplicitSection { get; }

get isExplicitSection() {
  return !this._startingNode.isHC;
}

//========//========//========//========//========//========//========//========
//- bool isImplicitSection { get; }

get isImplicitSection() {
  return this._startingNode.isHC;
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
//- bool isAncestorOf(CSectionBuilder subsection)

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
//- bool hasParentSection { get; }

get hasParentSection() {
  return (this._parentSection !== null);
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
//- void addSubSection(CSectionBuilder section)

addSubSection(subsection) {
  assert((arguments.length === 1), err.DEVEL);
  assert((subsection instanceof CSectionBuilder), err.DEVEL);
  
  this._subsections.push(subsection);
  subsection.parentSection = this;
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder lastSubSection { get; }

get lastSubSection() {
  let len = this._subsections.length;
  assert((len > 0), err.INVARIANT);
  return this._subsections[len-1];
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder[] subsections { get; }

get subsections() {
  //- it might become necessary to create a clone
  return this._subsections;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const COptions = require("./Options.js");
const CNodeProxy = require("./NodeProxy.js");
const COutlineBuilder = require("./OutlineBuilder.js");
//*/
