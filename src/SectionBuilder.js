
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
//- it is used when it was determined that a section was completely
//  processed and when no heading element was associated with it
//- this value won't be visible outside of this module/class;
//  i.e. it won't be passed on as a result/return value
const IMPLIED_HEADING = "implied-heading";

module.exports = class CSectionBuilder {
//========//========//========//========//========//========//========//========
//- properties/methods overview

//public:

  //- new CSectionBuilder(COptions options, CNodeProxy node, CNodeProxy heading)

  //- COptions options { get; }
  //- CNodeProxy startingNode { get; }

  //- void addInnerNode(CNodeProxy node)
  //- CNodeProxy[] innerNodes { get; }

  //- bool hasNoHeading { get; }
  //- void createAndSetImpliedHeading()
  //- bool hasImpliedHeading { get; }
  //- bool hasHeading { get; }
  //- CNodeProxy heading { get; set; }

  //- void addSubSection(CSectionBuilder section)
  //- CSectionBuilder[] subSections { get; }
  //- CSectionBuilder lastSubSection { get; }
  //- CSectionBuilder parentSection { get; set; }
  //- bool isAncestorOf(CSectionBuilder section)

  //- COutlineBuilder parentOutline { get; set; }
  //- COutlineBuilder firstOuterOutline { get; }

//========//========//========//========//========//========//========//========
//- new CSectionBuilder(COptions options, CNodeProxy node, CNodeProxy heading)
//- node represents the starting node that triggered the creation of this section
//- (options, node, null) - create a new section with an unknown heading
//- (options, node, heading) - create a new section with a known heading

constructor(options, node, heading) {
  assert((arguments.length === 3), err.DEVEL);
  assert((options instanceof COptions), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  assert((node.isSE || node.isHC), err.INVARIANT);

  if(heading !== null) {
    assert((heading instanceof CNodeProxy), err.DEVEL);
    assert(heading.isHC, err.INVARIANT);
  }

//private:

  //- COptions options
  //- the options to use during the next run
  this._options = options;

  //- CNodeProxy _startingNode
  //- the node that triggered the creation of this section
  //- this node does not necessarily have to be an inner node of this section;
  //  i.e. (this._innerNodes[ix] === this._startingNode) may be true for some ix
  //- e.g. successive HCs will trigger the creation of new implied sections;
  //  in these cases, the HC will be an inner node of these sections
  //- e.g. SE, when entered, will trigger the creation of a first inner section;
  //  in these cases, those SE won't be part of these sections
  //- must be a SE, or a HC
  this._startingNode = node;

  //- CNodeProxy _heading
  //- the heading that is associated with this section
  //- when done, this will be non-null for all sections;
  //  i.e. either IMPLIED_HEADING, or a CNodeProxy heading
  //- (this._innerNodes[ix] === this._heading) must be true for some ix
  this._heading = heading;

  //- CNodeProxy[] _innerNodes
  //- all nodes associated with this section
  this._innerNodes = [];

  //- CSectionBuilder[] _subSections
  //- any number of possibly further nested sub-sections
  this._subSections = [];

  //- CSectionBuilder _parentSection
  //- set if this section is a sub-section of some other section
  //- (this.subSections[ix].parentSection === this)
  //- not set if this section is an inner section of some outline - WRN SC!
  this._parentSection = null;

  //- COutlineBuilder _parentOutline
  //- the outline to which this section is an inner section
  //- set if this section is an inner section of some outline
  //- not set if this section is merely a sub-section to some other section
  //- will be non-null for some this(.parentSection)*.parentOutline
  //- see this.firstOuterOutline
  this._parentOutline = null;

  //notes
  //- (parentOutline !== null) OR (parentSection !== null) will always be true;
  //  i.e. at least one of those properties will always be set
  //- (parentOutline !== null) XOR (parentSection !== null) is usually true;
  //  i.e. usually only one of those properties will be set
  //- this condition is not met if, and only if, a section is an inner section
  //  of the outline of an inner SC - in such a case, both properties are set
  //- see how, when exiting one, a SC is merged into its first outer SE
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
//- implements "associate section X with node Y"

addInnerNode(node) {
  assert((arguments.length === 1), err.DEVEL);
  assert((node instanceof CNodeProxy), err.DEVEL);
  this._innerNodes.push(node);
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
//- when the outliner is done, the heading property will be one of two:
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
//- void addSubSection(CSectionBuilder section)
//- add the given section as this section's new last sub-section

addSubSection(section) {
  assert((arguments.length === 1), err.DEVEL);
  assert((section instanceof CSectionBuilder), err.DEVEL);
  this._subSections.push(section);
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder[] subSections { get; }

get subSections() {
  //- it might become necessary to create a clone
  return this._subSections;
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder lastSubSection { get; }

get lastSubSection() {
  let len = this._subSections.length;
  assert((len > 0), err.INVARIANT);
  return this._subSections[len-1];
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder parentSection { get; set; }
//- this property will only be set if this section is an inner sub-section
//  to another parent section; i.e. there exists a direct relationship

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
//- if this operation existed, same as subsection.isSubSectionOf(this)

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
//- this property will only be set if this section is an inner section of an
//  outline; i.e. there exists a direct relationship
//- will be non-null for some this(.parentSection)*.parentOutline

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
//- COutlineBuilder firstOuterOutline { get; }
//- returns the first parentOutline that is non-null;
//  i.e. this(.parentSection)*.parentOutline
//- returns null if this section is not part of any outline

get firstOuterOutline() {
  let section = this;

  while(true) {
    if(section._parentOutline !== null) {
      //- this section is a top-level section of an outline
      return section.parentOutline;
    }

    if(section._parentSection === null) {
      //- this section is not (yet) part of any outline
      return null;
    }

    section = section._parentSection;
  }
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const COptions = require("./Options.js");
const CNodeProxy = require("./NodeProxy.js");
const COutlineBuilder = require("./OutlineBuilder.js");
//*/
