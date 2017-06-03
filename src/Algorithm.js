
"use strict";

const assert = require("assert");
const format = require("util").format;
const errmsg = require("./errorMessages.js");
const isObjectInstance = require("./isObjectInstance.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const CStack = require("./Stack.js");
const CContext = require("./Context.js");
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/

//- context type identifier values
const CT_NONE = -1;//- initial/default context identifier
const CT_HIDE = 0; //- hidden nodes, inner sectioning root nodes (SR)
const CT_SR = 1;   //- top-level SR, inner SRs
const CT_SC = 2;   //- sectioning content nodes (SC)
const CT_HC = 3;   //- heading content (HC)

module.exports = class CAlgorithm {
//========//========//========//========//========//========//========//========
//- new CAlgorithm() throws AssertionError

constructor() {
  assert((arguments.length === 0), errmsg.DEVEL);
  
//public:

  //- COutline createOutline(DomNode node) throws AssertionError
  //- COutline createOutline(DomNode node, Object options) throws AssertionError
  
//private:

  //- void validateInput(DomNode node, Object options)
  //- void traverseInTreeOrder()

  //- void onEnter()
  //- void onExit()

  //- void onXXX_enter()
  //- void onXXX_exit()

//private:

  //- Object options
  //- an options object
  this.options = null;

  //- CNodeProxy startingNode
  //- the SR/SC node that was used to start the algorithm
  this.startingNode = null;
  
  //- inner SRs are optional and can be ignored
  //- this flag is used to determine what to do when
  //  entering the next inner SR
  this.ignoreNextSR = false;
  
  //- CStack<CContext> stack
  //- used to save and restore the current context
  this.stack = new CStack();
  
  //- CNodeProxy node
  //- a reference to the current node
  //- contributes to the current context
  this.node = null;
  
  //- int type
  //- the current context type indicator
  //- in general, its value indicates in which kind
  //  of subtree we are currently in
  this.type = CT_NONE;
  
  //- COutline outline
  //- a reference to the current outline
  //- contributes to the current context
  this.outline = null;
  
  //- CSection section
  //- a reference to the current section
  //- contributes to the current context (optional)
  this.section = null;
}

//========//========//========//========//========//========//========//========
//- COutline createOutline(DomNode node)
//- COutline createOutline(DomNode node, Object options)

createOutline(node, options) {
  if(arguments.length === 1) {
    this.validateInput(node, null);
  } else if(arguments.length === 2) {
    this.validateInput(node, options);
  } else {
    assert(false, errmsg.DEVEL);
  }

  this.node = this.startingNode;
  this.traverseInTreeOrder();
  
  assert((this.startingNode === null), errmsg.INVARIANT);
  assert(this.stack.isEmpty, errmsg.INVARIANT);
  assert((this.node === null), errmsg.INVARIANT);
  assert((this.type === CT_NONE), errmsg.INVARIANT);
  assert((this.outline !== null), errmsg.INVARIANT);
  assert((this.section === null), errmsg.INVARIANT);
  
  let outline = this.outline;
  this.outline = null;
  return outline;
}

//========//========//========//========//========//========//========//========
//- void validateInput(DomNode domNode, Object options)

validateInput(domNode, options) {
  let node = null;
  
  //- check the root node
  if(true) {
    assert(isObjectInstance(domNode), errmsg.INVALID_ROOT);
    node = new CNodeProxy(domNode, null);
    
    assert(node.isElement, errmsg.INVALID_ROOT);
    
    //- if the root node is itself hidden, node.innerOutline will be null
    //- disallow hidden root nodes for the moment;
    //  to make sure outline is set in all the other cases.
    assert(!node.isHidden, errmsg.INVALID_ROOT);
    
    //- must starti with a sec root or a sec content element
    assert((node.isSR || node.isSC), errmsg.INVALID_ROOT);
  }
  
  //- check the options object
  if(options === null) {
    //- use default options only
    this.options = null;
  } else {
    assert(isObjectInstance(options), errmsg.INVALID_OPTIONS);
    //- TODO - now that's a big one
    //- currently no external settings supported ...
    this.options = null;
  }
  
  this.startingNode = node;
}

//========//========//========//========//========//========//========//========
//- void traverseInTreeOrder(CNodeProxy node)

traverseInTreeOrder() {
  let next = null;
  
  enter: while(this.node !== null) {
    this.onEnter();
    
    if(this.type === CT_HIDE) {
      next = null;//- hide all child nodes, if any
    } else {
      next = this.node.firstChild;
    }
    
    if(next !== null) {
      this.node = next;
      continue enter;
    }
    
    exit: while(this.node !== null) {
      this.onExit();
      
      next = this.node.nextSibling;
      
      if(next !== null) {
        this.node = next;
        continue enter;
      }
      
      //- null, if node is the startingNode
      //- in that case, the walk is over
      next = this.node.parentNode;
      
      if(next === null) {
        assert(this.stack.isEmpty, errmsg.INVARIANT);
        assert(this.node === this.startingNode, errmsg.INVARIANT);
        assert((this.type === CT_NONE), errmsg.INVARIANT);
      }
      
      this.node = next;
    }//- exit
  }//- enter
  
  this.startingNode = null;
  this.node = null;
  //this.type = CT_NONE;
  //this.outline = null;
  this.section = null;
}

//========//========//========//========//========//========//========//========
//- void onEnter()

onEnter() {
  //# check the current context first
  if(!this.stack.isEmpty) {
    let leave = this.onContext_enter();
    if(leave === true) return;//- ignore
  }
  
  //# non-element nodes
  //- TEXT_NODE, COMMENT_NODE, etc.
  if(!this.node.isElement) {
    this.onNode_enter(); return;
  }
  
  //# hidden elements
  if(this.node.isHidden) {
    this.onHidden_enter(); return;
  }
  
  //# sectioning root (SR) elements
  //- blockquote, body, details, dialog, fieldset, figure, td
  if(this.node.isSR) {
    this.onSR_enter(); return;
  }
  
  //# sectioning content (SC) elements
  //- section, article, nav, aside
  if(this.node.isSC) {
    this.onSC_enter(); return;
  }
  
  //# heading content (HC)
  //- h1, h2, h3, h4, h5, h6
  if(this.node.isHC) {
    this.onHC_enter(); return;
  }

  //# other elements
  if(true) {//- if(this.node.isElement) {
    this.onOther_enter(); return;
  }
  
  //# should have left by now
  assert(false, errmsg.INVARIANT);
}

//========//========//========//========//========//========//========//========
//- void onExit()

onExit() {
  //# check the current context first
  if(!this.stack.isEmpty) {
    let leave = this.onContext_exit();
    if(leave === true) return;//- ignore
  }
  
  //# non-element nodes
  //- TEXT_NODE, COMMENT_NODE, etc.
  if(!this.node.isElement) {
    this.onNode_exit(); return;
  }
  
  //# hidden elements
  if(this.node.isHidden) {
    this.onHidden_exit(); return;
  }
  
  //# sectioning root (SR) elements
  //- blockquote, body, details, dialog, fieldset, figure, td
  if(this.node.isSR) {
    this.onSR_exit(); return;
  }
  
  //# sectioning content (SC) elements
  //- section, article, nav, aside
  if(this.node.isSC) {
    this.onSC_exit(); return;
  }
  
  //# heading content (HC)
  //- h1, h2, h3, h4, h5, h6
  if(this.node.isHC) {
    this.onHC_exit(); return;
  }

  //# other elements
  if(true) {//- if(this.node.isElement) {
    this.onOther_exit(); return;
  }
  
  //# should have left by now
  assert(false, errmsg.INVARIANT);
}

//========//========//========//========//========//========//========//========
//# check the context first

//========//========//========//========//========
//- void onContext_enter(CNodeProxy node)

onContext_enter() {
  let context = this.stack.tos;

  if(context.type === CT_HIDE) {
    //- enter the child of a hidden node
    //- same with inner SRs, if it was decided
    //  to also ignore these
    return true;//- ignore
  }

  else if(context.type === CT_HC) {
    //- enter the child of a heading
    //- could be <strike>, <bold>, etc. ???
    assert(!this.node.isSR, errmsg.INVALID_HTML);
    assert(!this.node.isSC, errmsg.INVALID_HTML);
    assert(!this.node.isHC, errmsg.INVALID_HTML);
  }
}

//========//========//========//========//========
//- void onContext_exit(CNodeProxy node)

onContext_exit() {
  let context = this.stack.tos;

  if(context.node === this.node) {
    //- whoever pushes() onto the stack
    //  is responsible to pop()
    //this.stack.pop();
  }

  else if(context.type === CT_HIDE) {
    //- exit the child of a hidden node,
    //  not the hidden node itself
    //- same with inner SRs, if it was decided
    //  to also ignore these
    return true;//- ignore
  }

  else if(context.type === CT_HC) {
    //- exit the child of a heading
    //- not the heading itself
  }
}

//========//========//========//========//========//========//========//========
//# non-element nodes
//- TEXT_NODE, COMMENT_NODE, etc.

//========//========//========//========//========
//- void onNode_enter(CNodeProxy node)

onNode_enter() {
  //- ignore for the moment
}

//========//========//========//========//========
//- void onNode_exit(CNodeProxy node)

onNode_exit() {
  //- that would be step (5)
  //- node.parentSection = this.section?
}

//========//========//========//========//========//========//========//========
//# hidden elements

//========//========//========//========//========
//- void onHidden_enter(CNodeProxy node)

onHidden_enter() {
  //- ignore hidden nodes and any child nodes
  this.stack.push(new CContext(
    this.node, this.type, this.outline, this.section));
  this.type = CT_HIDE;
}

//========//========//========//========//========
//- void onHidden_exit(CNodeProxy node)

onHidden_exit() {
  let context = this.stack.pop();
  assert((context.node === this.node), errmsg.INVARIANT);
  assert((context.type !== CT_HIDE), errmsg.INVARIANT);
  assert((context.outline === this.outline), errmsg.INVARIANT);
  assert((context.section === this.section), errmsg.INVARIANT);
  this.type = context.type;
}

//========//========//========//========//========//========//========//========
//# sectioning roots (SR)
//- blockquote, body, details, dialog, fieldset, figure, td

//========//========//========//========//========
//- void onSR_enter(CNodeProxy node)

onSR_enter() {
  if(this.ignoreNextSR === true) {
    //- this is a next/inner SR, ignore it
    
    this.stack.push(new CContext(
      this.node, this.type, this.outline, this.section));
    
    //- indicate that all child nodes, if any, need to be ignored
    this.type = CT_HIDE;
    return;//- we are done here
  }
  
  if(this.outline === null) {
    //- this.rootNode is a SR, it must be processed
    //- all other (inner) SRs are therefore optional;
    //  they must not contribute to ancestor SRs/SCs
    assert((this.node === this.rootNode), errmsg.INVARIANT);
    this.ignoreNextSR = false;//- TODO - make optional
  }
  
  else {//- if(this.outline !== null) {
    assert(false, "TODO: still need to test this...");
    //- this SR is child of some other SR/SC

    if(this.section.hasNoHeading) {
      //- this section (preceeding this SR) does not yet have a heading
      //
      //example: hX, dialog, ..., /dialog, p
      //- 'p' must be associated with 'hX'
      //- 'dialog' does not end 'hX's section
      //
      //example: body, dialog, ..., /dialog, hX, /body
      //- 'dialog' cannot determine if 'body' has a heading or not
      //- 'body' might still have one, we just didn't reach it yet
      //
      //this.section.createAndSetImpliedHeading();
    }

    //- push/save the current context
    this.stack.push(new CContext(
      this.node, this.type, this.outline, this.section));
  }

  //- indicate that we have entered a SR
  this.type = CT_SR;
  
  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  this.outline = new COutline(this.node);

  //- section.startingNode -> node
  //- does not set node.parentSection!
  this.section = new CSection(this.node, null);

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  this.outline.addSection(this.section);
}

//========//========//========//========//========
//- void onSR_exit(CNodeProxy node)

onSR_exit() {
  if(this.ignoreNextSR === true) {
    let context = this.stack.pop();
    assert((context.type === CT_HIDE), errmsg.INVARIANT);
    assert((context.node === this.node), errmsg.INVARIANT);
    assert((context.outline === this.outline), errmsg.INVARIANT);
    assert((context.section === this.section), errmsg.INVARIANT);
    return;//- ignore this inner SR
  }
  
  if(this.section.hasNoHeading) {
    assert(false, "TODO: still need to test this...");

    //- the current section (inside this SR) does not have
    //  a single heading element; it ends with this SR
    this.section.createAndSetImpliedHeading();
  }

  if(this.stack.isEmpty) {
    assert((this.node === this.startingNode), errmsg.INVARIANT);
    return;//- the walk is over
  }

  //- this SR is child of some other sectioning element
  assert(false, "TODO: still need to test this...");
  
  let context = this.stack.pop();
  assert((context.type === CT_SR), errmsg.INVARIANT);
  assert((context.node === this.node), errmsg.INVARIANT);
  assert((context.outline !== this.outline), errmsg.INVARIANT);
  assert((context.section !== this.section), errmsg.INVARIANT);

  //- node.innerOutline (inner) and context.outline (outer)
  //  are, up to this point, completely separate from each other
  //- context.section (outer) must not be altered;
  //  SRs must not contribute to ancestor sectioning elements
  this.outline = context.outline;
  this.section = context.section;

  //- implement a hierarchy of outlines?
  //- make node.innerOutline an inner outline of this.outline?
  //context.outline.appendOutline(node.innerOutline)
}

//========//========//========//========//========//========//========//========
//# sectioning content (SC) elements
//- section, article, nav, aside

//========//========//========//========//========
//- void onSC_enter(CNodeProxy node)

onSC_enter() {
  assert(false, "TODO: still need to test this...");
  
  if(this.outline === null) {
    //- this.rootNode is a SC, not a SR
    //- all SRs are therefore optional
    assert((this.node === this.rootNode), errmsg.INVARIANT);
    this.ignoreNextSR = false;//- TODO - make optional
  }
  
  else {//- if(this.outline !== null) {
    //- this SC is child of some other SR/SC

    if(this.section.hasNoHeading) {
      //- this section (in front of this SC) does not yet have a heading
      //- that section ends with the beginning of this SC
      this.section.createAndSetImpliedHeading();
    }

    //- push/save the current context
    this.stack.push(new CContext(
      CT_SC, this.node, this.outline, this.section
    ));
  }

  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  this.outline = new COutline(this.node);

  //- section.startingNode -> node
  //- does not set node.parentSection!
  this.section = new CSection(this.node, null);

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  this.outline.addSection(this.section);
}

//========//========//========//========//========
//- void onSC_exit(CNodeProxy node)

onSC_exit() {
  assert(false, "TODO: still need to test this...");

  if(this.section.hasNoHeading) {
    //- the current section (inside this SC) does not have
    //  a single heading element; it ends with this SC
    this.section.createAndSetImpliedHeading();
  }

  if(this.stack.isEmpty) {
    assert((this.node === this.startingNode), errmsg.INVARIANT);
    return;//- the walk is over
  }

  //- this SC is child of some other sectioning element
  let context = this.stack.pop();
  assert((context.type === CT_SC), errmsg.INVARIANT);
  assert((context.node === this.node), errmsg.INVARIANT);
  assert((context.outline !== this.outline), errmsg.INVARIANT);
  assert((context.section !== this.section), errmsg.INVARIANT);

  //- node.innerOutline (inner) and context.outline (outer)
  //  are, up to this point, completely separate from each other
  //- context.section (outer) must still be altered;
  //  SCs do contribute to ancestor sectioning elements
  this.outline = context.outline;
  this.section = context.section;

  //example: body, h1-A, h2-B, section, p, /body
  //- 'section' ends h2-B's implicit section
  //- 'p' must be associated with body's explicit section;
  //  h1-A will become the heading of body's explicit section

  //example: body, h1-A, h1-B, section, ..., /section, p, /body
  //- exit 'section', i.e. we have reached '/section';
  //  in that case (this.section !== this.outline.lastSection)?

  //- currentSection = currentOutline.lastSection
  this.section = this.outline.lastSection;

  //- Section.appendOutline(outline) -> unclear meaning of this operation
  //- currentSection.appendOutline(node.innerOutline);
  //- shouldn't it say currentOutline.appendOutline() ???
  let sections = this.node.innerOutline.sections;

  for(let ix=0, ic=sections.length; ix<ic; ix++) {
    let section = sections[ix];
    //- currentSection.lastSubSection -> section
    //- section.parentSection -> currentSection
    this.section.addSubSection(section);
  }

  //- implement a hierarchy of outlines?
  //- make node.innerOutline an inner outline of this.outline?
  //context.outline.appendOutline(node.innerOutline)
}

//========//========//========//========//========//========//========//========
//# heading content (HC)
//- h1, h2, h3, h4, h5, h6
//- h1 has highest rank, h6 has lowest rank

//========//========//========//========//========
//- voidHC on_enter(CNodeProxy node)

onHC_enter() {
  //- this heading element is the first one in the current
  //  section, use it as the section's heading element
  //- this is independent of the heading's actual rank
  if(this.section.hasNoHeading) {
    this.section.heading = this.node;
    this.stack.push(new CContext(
      CT_HC, this.node, this.outline, this.section));
    return;//- we are done here
  }

  //- when entering a SR/SC, a new section will be created that has no
  //  heading; the first if-statement will set that heading; so, when
  //  reaching this point, the first section will always have a heading
  //- when taking the following code into account, and when reaching
  //  this point, all sections in the current SR/SC have existing headings
  assert(!this.section.hasImpliedHeading, errmsg.INVARIANT);
  
  if(true) {//- just an optional performance shortcut
    let lastSection = this.outline.lastSection;
    
    //- lastSection always has a heading - see above
    assert(lastSection.hasHeading, errmsg.INVARIANT);
    //- lastSection must always be on the same chain
    assert((lastSection === this.section)
      || lastSection.isAncestorOf(this.section), errmsg.INVARIANT);
    
    //- if we already know, that we will have to add the new section
    //  to the current outline, then there is no need to go up the chain
    if(this.node.rank >= lastSection.heading.rank) {
      let section = new CSection(this.node, this.node);
      this.outline.addSection(section);
      this.section = section;
      this.stack.push(new CContext(
        CT_HC, this.node, this.outline, this.section));
      return;//- we are done here
    }
  }
    
  //- the current heading node must now be used to create a new implied
  //  section, with itself as the new section's heading element
  //- before that, we need to figure out where to put that new section
  let parentSection = this.section;
  
  while(true) {
    //- parentSection.heading.rank will fail for non-headings;
    //  rank is only defined for existing headings; i.e. not for
    //  implied ones, and certainly not for null values.
    assert(parentSection.hasHeading, errmsg.INVARIANT);

    //- if(node.rank < currentSection.heading.rank), then
    //  add the new section as a sub-section to currentSection,
    //  otherwise go up the chain/hierarchy
    if(this.node.rank < parentSection.heading.rank) {
      //
      //example: body; h1-A; h2-B; /body
      //- enter h2-B; won't loop; add subsection to h1-A
      //
      //example: body; h1-A; h2-B; h3-C /body
      //- enter h3-C; won't loop; add subsection to h2-B
      //
      //example: body; h1-A; h2-B; h2-C /body
      //- enter h2-C; loop once; add subsection to h1-A
      //
      let section = new CSection(this.node, this.node);
      parentSection.addSubSection(section);
      this.section = section;
      this.stack.push(new CContext(
        CT_HC, this.node, this.outline, this.section));
      return;//- we are done here
    }

    //- if(node.rank >= any-rank-in-that-chain), then
    //  add the new implied section to the current outline
    if(!parentSection.hasParentSection) {
      //
      //example: body; h1-A; h1-B /body
      //- enter h1-B; add a new section to the current outline
      //
      //example: body; h2-A; h1-B /body
      //- enter h1-B; add a new section to the current outline
      //
      assert((parentSection === this.outline.lastSection), errmsg.INVARIANT);
      let section = new CSection(this.node, this.node);
      this.outline.addSection(section);
      this.section = section;
      this.stack.push(new CContext(
        CT_HC, this.node, this.outline, this.section));
      return;//- we are done here
    }
    
    //- heading elements are part of their surrounding parent sectioning
    //  element, and not of any other ancestor sectioning element
    //- this requires that going up the chain using the section's
    //  parentSection property must not leave the current outline
    //- that is a guaranteed fact; see how SRs/SCs are dealt with
    parentSection = parentSection.parentSection;
  }//- while
}

//========//========//========//========//========
//- void onHC_exit(CNodeProxy node)

onHC_exit() {
  let context = this.stack.pop();
  assert((context.type === CT_HC), errmsg.INVARIANT);
  assert((context.node === this.node), errmsg.INVARIANT);
  assert((context.outline === this.outline), errmsg.INVARIANT);
  assert((context.section === this.section), errmsg.INVARIANT);
}

//========//========//========//========//========//========//========//========
//# all other node elements

//========//========//========//========//========
//- void onOther_enter(CNodeProxy node)

onOther_enter() {
  //- ignore for the moment
}

//========//========//========//========//========
//- void onOther_exit(CNodeProxy node)

onOther_exit() {
  //- that would be step (4's last statement)
  //- node.parentSection = this.section?
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const CStack = require("./Stack.js");
const CContext = require("./Context.js");
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/
