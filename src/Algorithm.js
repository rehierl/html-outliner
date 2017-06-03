
"use strict";

const assert = require("assert");
const format = require("util").format;

/* must appear below module.exports (cyclic require statements)
const CStack = require("./Stack.js");
const CContext = require("./Context.js");
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/

module.exports = class CAlgorithm {
//========//========//========//========//========//========//========//========
//- new CAlgorithm() throws AssertionError

constructor() {
  assert((arguments.length === 0), "invalid call");
  
//public:

  //- COutline createOutline(DomNode domNode)
  //  throws AssertionError
  
//private:

  //- void traverseInTreeOrder()
  //- void onEnter()
  //- void onExit()

  //- CContext currentContext()
  //- bool contextChanged(CContext context)
  //- void restoreContext(CContext context)

  //- void onXXX_enter()
  //- void onXXX_exit()

//private:

  //- CNodeProxy startingNode
  //- the SR/SC node that was used to start the algorithm
  this.startingNode = null;
  
  //- CStack<CContext> stack
  //- used to save and restore the current context
  this.stack = new CStack();
  
  //- CNodeProxy node
  //- a reference to the current node
  //- contributes to the current context
  this.node = null;
  
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

createOutline(domNode) {
  assert((arguments.length === 1), "invalid call");
  this.node = new CNodeProxy(domNode, null);
  
  //- must start with a sec content or sec root element
  assert((this.node.isSR || this.node.isSC),
    "domNode must be a sectioning element");
  
  //- if the root node is itself hidden, node.innerOutline will be null
  //- disallow hidden root nodes for the moment;
  //  to make sure outline is set in all the other cases.
  assert(!this.node.isHidden, "domNode must not be a hidden element");
  
  //- traverse the tree and create the outline
  this.traverseInTreeOrder();
  
  assert((this.startingNode === null), "internal error");
  assert(this.stack.isEmpty, "internal error");
  assert((this.node === null), "internal error");
  assert((this.outline !== null), "internal error");
  assert((this.section === null), "internal error");
  
  let outline = this.outline;
  this.outline = null;
  return outline;
}

//========//========//========//========//========//========//========//========
//- void traverseInTreeOrder(CNodeProxy node)

traverseInTreeOrder() {
  this.startingNode = this.node;
  let next = null;
  
  enter: while(this.node !== null) {
    this.onEnter();
    next = this.node.firstChild;
    
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
      
      //- null if node is the starting node
      //- in that case, the walk is over
      next = this.node.parentNode;
      
      if(next === null) {
        assert(this.node === this.startingNode, "internal error");
        this.startingNode = null;
        this.node = null;
        //this.outline = null;
        this.section = null;
      }
      
      this.node = next;
    }//- exit
  }//- enter
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
  assert(false, "internal error");
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
  assert(false, "internal error");
}

//========//========//========//========//========//========//========//========
//# check the context first

//========//========//========//========//========
//- void onContext_enter(CNodeProxy node)

onContext_enter() {
  let context = this.stack.tos;

  if(context.node.isHidden) {
    //- enter the child of a hidden node
    return true;//- ignore
  }

  else if(context.node.isHC) {
    //- enter the child of a heading
    //- could be <strike>, <bold>, etc. ???
    assert(!this.node.isSR, "invalid html");
    assert(!this.node.isSC, "invalid html");
    assert(!this.node.isHC, "invalid html");
  }
}

//========//========//========//========//========
//- void onContext_exit(CNodeProxy node)

onContext_exit() {
  let context = this.stack.tos;

  if(context.node === this.node) {
    //- whoever pushes() onto the stack
    //  should be responsible to pop()
    //this.stack.pop();
  }

  else if(context.node.isHidden) {
    //- exit the child of a hidden node
    //- not the hidden node itself
    return true;//- ignore
  }

  else if(context.node.isHC) {
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
    this.node, this.outline, this.section
  ));
}

//========//========//========//========//========
//- void onHidden_exit(CNodeProxy node)

onHidden_exit() {
  let context = this.stack.pop();
  assert((context.node === this.node), "internal error");
  assert((context.outline === this.outline), "internal error");
  assert((context.section === this.section), "internal error");
  assert(this.node.isHidden, "internal error");
}

//========//========//========//========//========//========//========//========
//# sectioning roots (SR)
//- blockquote, body, details, dialog, fieldset, figure, td

//========//========//========//========//========
//- void onSR_enter(CNodeProxy node)

onSR_enter() {
  //- in case the rootNode is a SR, then this SR must be processed
  //- all other (inner) SRs are optional, because
  //  they must not contribute to ancestor SRs/SCs
  //- although possible, it would be tricky not to do (i.e. ignore) these
  
  if(this.outline !== null) {
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
      this.node, this.outline, this.section
    ));
  }

  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  let outline = new COutline(this.node);
  this.outline = outline;

  //- section.startingNode -> node
  //- does not set node.parentSection!
  let section = new CSection(this.node, null);
  this.section = section;

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  outline.addSection(section);
}

//========//========//========//========//========
//- void onSR_exit(CNodeProxy node)

onSR_exit() {
  if(this.section.hasNoHeading) {
    assert(false, "TODO: still need to test this...");

    //- the current section (inside SR) does not have
    //  a single heading element; it ends with this SR
    this.section.createAndSetImpliedHeading();
  }

  if(this.stack.isEmpty) {
    assert((this.node === this.startingNode), "internal error");
    return;//- the walk is over
  }

  //- this SR is child of some other sectioning element
  assert(false, "TODO: still need to test this...");
  let context = this.stack.pop();
  
  assert((context.node === this.node), "internal error");
  assert((context.outline !== this.outline), "internal error");
  assert((context.section !== this.section), "internal error");
  assert((this.outline === this.node.innerOutline), "internal error");

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

  if(this.outline !== null) {
    //- this SC is child of some other SR/SC

    if(this.section.hasNoHeading) {
      //- this section (in front of this SC) does not yet have a heading
      //- that section ends with the beginning of this SC
      this.section.createAndSetImpliedHeading();
    }

    //- push/save the current context
    this.stack.push(new CContext(
      this.node, this.outline, this.section
    ));
  }

  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  let outline = new COutline(this.node);
  this.outline = outline;

  //- section.startingNode -> node
  //- does not set node.parentSection!
  let section = new CSection(this.node, null);
  this.section = section;

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  outline.addSection(section);
}

//========//========//========//========//========
//- void onSC_exit(CNodeProxy node)

onSC_exit() {
  assert(false, "TODO: still need to test this...");

  if(this.section.hasNoHeading) {
    //- the current section (inside SC) does not have
    //  a single heading element; it ends with this SC
    this.section.createAndSetImpliedHeading();
  }

  if(this.stack.isEmpty) {
    assert((this.node === this.startingNode), "internal error");
    return;//- the walk is over
  }

  //- this SC is child of some other sectioning element
  let context = this.stack.pop();

  assert((context.node === this.node), "internal error");
  assert((context.outline !== this.outline), "internal error");
  assert((context.section !== this.section), "internal error");
  assert((this.outline === this.node.innerOutline), "internal error");

  //- node.innerOutline (inner) and context.outline (outer)
  //  are, up to this point, completely separate from each other
  //- context.section (outer) must still be altered;
  //  SCs do contribute to ancestor sectioning elements
  this.outline = context.outline;
  this.section = context.section;

  //example: h1:A, h2:B, section, h1:C, /section, p
  //- 'section' ends 'h2:B's implicit section
  //- 'p' must be associated with 'h1:A'

  //example: body, h1:A, h1:B, section, ..., /section, p, /body
  //- assume that we are now exiting 'section', i.e. we have reached '/section'
  //- in that case (this.section !== this.outline.lastSection)?
  //question: to what exactly will the implicit section (h1:B) be attached?
  //- same level as the explicit section (body/h1:A), or as its subsection?
  //  h1:A will be the heading of that explicit section; i.e. it
  //  doesn't trigger the creation of a new (implicit) section

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
      this.node, this.outline, this.section));
    return;//- we are done here
  }

  //- when entering a SR/SC, a new section will be created that has no
  //  heading; the first if-statement will set that heading; so, when
  //  reaching this point, the first section will always have a heading
  //- when taking the following code into account, and when reaching
  //  this point, all sections in the current SR/SC have existing headings
  assert(!this.section.hasImpliedHeading, "internal error");
  
  {//- just an optional performance shortcut
    let lastSection = this.outline.lastSection;
    
    //- lastSection always has a heading - see above
    assert(lastSection.hasHeading, "internal error");
    //- lastSection must always be on the same chain
    assert((lastSection === this.section)
      || lastSection.isAncestorOf(this.section), "internal error");
    
    //- if we already know, that we will have to add the new section
    //  to the current outline, then there is no need to go up the chain
    if(this.node.rank >= lastSection.heading.rank) {
      let section = new CSection(this.node, this.node);
      this.outline.addSection(section);
      this.section = section;
      this.stack.push(new CContext(
        this.node, this.outline, this.section));
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
    assert(parentSection.hasHeading, "internal error");

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
        this.node, this.outline, this.section));
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
      let section = new CSection(this.node, this.node);
      this.outline.addSection(section);
      this.section = section;
      this.stack.push(new CContext(
        this.node, this.outline, this.section));
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
  assert((context.node === this.node), "internal error");
  assert((context.outline === this.outline), "internal error");
  assert((context.section === this.section), "internal error");
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
