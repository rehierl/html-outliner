
"use strict";

const assert = require("assert");
const format = require("util").format;

const isObjectInstance = require("./isObjectInstance.js");
const CStack = require("./Stack.js");
const CContext = require("./Context.js");
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");

//- context type constants used in combination with CContext objects
const CT_HIDE = 0;//- "has-hidden-attribute";
const CT_SR = 1;//- "sectioning-root";
const CT_SC = 2;//- "sectioning-content";
const CT_HC = 3;//- "heading-content";

module.exports = class CAlgorithm {
//========//========//========//========//========//========//========//========

//- new CAlgorithm()
//  throws AssertionError
constructor() {
  assert((this instanceof CAlgorithm), "invalid call");
  assert((arguments.length === 0), "invalid call");
  
//public:

  //- COutline createOutline(DomNode domNode)
  //  throws AssertionError
  
//private:

  //- void traverseInTreeOrder(CNodeProxy node)
  //- void onEnter(CNodeProxy node)
  //- void onExit(CNodeProxy node)

  //- CContext currentContext(Anything type, CNodeProxy node)
  //- bool contextChanged(CContext context)
  //- void restoreContext(CContext context)

  //- void onXXX_enter(CNodeProxy node)
  //- void onXXX_exit(CNodeProxy node)

//private:

  //- CNodeProxy startingNode
  //- the SR/SC node that was used to start the algorithm
  this.startingNode = null;
  
  //- CStack<CContext> stack
  //- used to save and restore the current context
  this.stack = new CStack();
  
  //- COutline outline
  //- a reference to the current outline
  //- contributes to the current context
  this.currentOutline = null;
  
  //- CSection currentSection
  //- a reference to the current section
  //- contributes to the current context
  this.currentSection = null;
}

//========//========//========//========//========//========//========//========

//- COutline createOutline(DomNode node)
createOutline(domNode) {
  assert((arguments.length === 1), "invalid call");
  let node = new CNodeProxy(domNode, null);
  
  //- must start with a sec content or sec root element
  assert((node.isSC() || node.isSR()), format(
    "can only create an outline for a "
    + "sectioning content or a sectioning root element"
  ));
  
  //- if the root node is itself hidden, node.innerOutline() will be null
  //- disallow hidden root nodes for the moment to make sure outline is
  //  set in all the other cases.
  assert(!node.isHidden(), format(
    "can't create the outline for a hidden element"
  ));
  
  this.traverseInTreeOrder(node);
  
  assert((this.startingNode === null), "internal error");
  assert(this.stack.isEmpty(), "internal error");
  assert((this.currentSection === null), "internal error");
  assert((this.currentOutline === null), "internal error");
  assert((node.innerOutline() !== null), "internal error");
  
  return node.innerOutline();
}

//========//========//========//========//========//========//========//========

//- void traverseInTreeOrder(CNodeProxy node)
traverseInTreeOrder(node) {
  this.startingNode = node;
  let next = null;
  
  enter: while(node !== null) {
    this.onEnter(node);
    next = node.firstChild();
    
    if(next !== null) {
      node = next;
      continue enter;
    }
    
    exit: while(node !== null) {
      this.onExit(node);
      next = node.nextSibling();
      
      if(next !== null) {
        node = next;
        continue enter;
      }
      
      //- null if node is the starting node
      //- in that case, the walk is over
      next = node.parentNode();
      
      if(next === null) {
        assert(node === this.startingNode, "internal error");
        this.startingNode = null;
      }
      
      node = next;
    }//- exit
  }//- enter
}

//========//========//========//========//========//========//========//========

//- void onEnter(CNodeProxy node)
onEnter(node) {
  //# check the current context first
  if(!this.stack.isEmpty()) {
    let leave = this.onContext_enter(node);
    if(leave === true) return;//- ignore
  }
  
  //# non-element nodes
  //- TEXT_NODE, COMMENT_NODE, etc.
  if(!node.isElement()) {
    this.onNode_enter(node); return;
  }
  
  //# hidden elements
  if(node.isHidden()) {
    this.onHidden_enter(node); return;
  }
  
  //# sectioning root (SR) elements
  //- blockquote, body, details, dialog, fieldset, figure, td
  if(node.isSR()) {
    this.onSR_enter(node); return;
  }
  
  //# sectioning content (SC) elements
  //- section, article, nav, aside
  if(node.isSC()) {
    this.onSC_enter(node); return;
  }
  
  //# heading content (HC)
  //- h1, h2, h3, h4, h5, h6
  if(node.isHC()) {
    this.onHC_enter(node); return;
  }

  //# other elements
  if(node.isElement()) {
    this.onOther_enter(node); return;
  }
  
  //# should have left by now
  assert(false, "internal error");
}

//========//========//========//========//========//========//========//========

//- void onExit(CNodeProxy node)
onExit(node) {
  //# check the current context first
  if(!this.stack.isEmpty()) {
    let leave = this.onContext_exit(node);
    if(leave === true) return;//- ignore
  }
  
  //# non-element nodes
  //- TEXT_NODE, COMMENT_NODE, etc.
  if(!node.isElement()) {
    this.onNode_exit(node); return;
  }
  
  //# hidden elements
  if(node.isHidden()) {
    this.onHidden_exit(node); return;
  }
  
  //# sectioning root (SR) elements
  //- blockquote, body, details, dialog, fieldset, figure, td
  if(node.isSR()) {
    this.onSR_exit(node); return;
  }
  
  //# sectioning content (SC) elements
  //- section, article, nav, aside
  if(node.isSC()) {
    this.onSC_exit(node); return;
  }
  
  //# heading content (HC)
  //- h1, h2, h3, h4, h5, h6
  if(node.isHC()) {
    this.onHC_exit(node); return;
  }

  //# other elements
  if(node.isElement()) {
    this.onOther_exit(node); return;
  }
  
  //# should have left by now
  assert(false, "internal error");
}

//========//========//========//========//========//========//========//========

//- CContext currentContext(Anything type, CNodeProxy node)
currentContext(type, node) {
  assert((arguments.length === 2), "invalid call");
  assert((node instanceof CNodeProxy), "invalid call");
  
  let context = new CContext(type, node,
    this.currentSection, this.currentOutline);
  return context;
}

//========//========//========//========//========

//- bool contextChanged(CContext context)
contextChanged(context) {
  assert((arguments.length === 1), "invalid call");
  assert((context instanceof CContext), "invalid call");
  
  if(context.currentSection() !== this.currentSection) return true;
  if(context.currentOutline() !== this.currentOutline) return true;
  return false;
}

//========//========//========//========//========

//- void restoreContext(CContext context)
restoreContext(context) {
  assert((arguments.length === 1), "invalid call");
  assert((context instanceof CContext), "invalid call");
  
  this.currentSection = context.currentSection();
  this.currentOutline = context.currentOutline();
}

//========//========//========//========//========//========//========//========
//# check the current context first

//- void onContext_enter(CNodeProxy node)
onContext_enter(node) {
  let context = this.stack.tos();

  if(context.type() === CT_HIDE) {
    //- enter the child of a hidden node
    return true;//- ignore
  }

  else if(context.type() === CT_HC) {
    //- enter the child of a heading
    //- could be <strike>, <bold>, etc. ???
    assert(!node.isSR(), "invalid html");
    assert(!node.isSC(), "invalid html");
    assert(!node.isHC(), "invalid html");
  }
}

//========//========//========//========//========

//- void onContext_exit(CNodeProxy node)
onContext_exit(node) {
  let context = this.stack.tos();

  if(context.node() === node) {
    //- whoever pushes() onto the stack
    //  should be responsible to pop()
    //this.stack.pop();
  }

  else if(context.type() === CT_HIDE) {
    //- exit the child of a hidden node
    //- not the hidden node itself
    return true;//- ignore
  }

  else if(context.type() === CT_HC) {
    //- exit the child of a heading
    //- not the heading itself
  }
}

//========//========//========//========//========//========//========//========
//# non-element nodes
//- TEXT_NODE, COMMENT_NODE, etc.

//- void onNode_enter(CNodeProxy node)
onNode_enter(node) {
  //- ignore for the moment
}

//========//========//========//========//========

//- void onNode_exit(CNodeProxy node)
onNode_exit(node) {
  //- that would be step (5)
  //- node.parentSection(this.currentSection)?
}

//========//========//========//========//========//========//========//========
//# hidden elements

//- void onHidden_enter(CNodeProxy node)
onHidden_enter(node) {
  //- ignore hidden nodes and any child nodes
  this.stack.push(this.currentContext(CT_HIDE, node));
}

//========//========//========//========//========

//- void onHidden_exit(CNodeProxy node)
onHidden_exit(node) {
  let context = this.stack.pop();
  assert((context.type() === CT_HIDE), "internal error");
  assert((context.node() === node), "internal error");
  assert(!this.contextChanged(context), "internal error");
}

//========//========//========//========//========//========//========//========
//# sectioning roots (SR)
//- blockquote, body, details, dialog, fieldset, figure, td

//- void onSR_enter(CNodeProxy node)
onSR_enter(node) {
  //- in case the rootNode is a SR, then this SR must be processed
  //- all other (inner) SRs are optional, because
  //  they must not contribute to ancestor SRs/SCs
  //- although possible, it would be tricky not to do (i.e. ignore) these
  
  if(this.currentOutline !== null) {
    assert(false, "TODO: still need to test this...");
    //- this SR is child of some other SR/SC

    if(this.currentSection.hasNoHeading()) {
      //- this section (preceeding this SR) does not yet have a heading
      //example: hX, dialog, ..., /dialog, p
      //- 'p' must be associated with 'hX'
      //- 'dialog' does not end 'hX's section
      //example: body, dialog, ..., /dialog, hX, /body
      //- 'dialog' cannot determine if 'body' has a heading or not
      //- 'body' might still have one, we just didn't reach it yet
      //this.currentSection.createAndSetImpliedHeading();
    }

    //- push/save the current context
    this.stack.push(this.currentContext(CT_SR, node));
  }

  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  let outline = new COutline(node);
  this.currentOutline = outline;

  //- section.startingNode -> node
  //- does not set node.parentSection!
  let section = new CSection(node, null);
  this.currentSection = section;

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  outline.addSection(section);
}

//========//========//========//========//========

//- void onSR_exit(CNodeProxy node)
onSR_exit(node) {
  if(this.currentSection.hasNoHeading()) {
    assert(false, "TODO: still need to test this...");

    //- the current section (inside SR) does not have
    //  a single heading element; it ends with this SR
    this.currentSection.createAndSetImpliedHeading();
  }

  if(this.stack.isEmpty()) {
    //- the walk is over
    assert((node === this.startingNode, "internal error"));
    this.currentSection = null;
    this.currentOutline = null;
    return;//- done
  }

  //- this SR is child of some other sectioning element
  assert(false, "TODO: still need to test this...");
  let context = this.stack.pop();

  assert((context.type() === CT_SR), "internal error");
  assert((context.node() === node), "internal error");
  assert(this.contextChanged(), "internal error");
  assert((this.currentOutline === node.innerOutline()), "internal error");

  //- node.innerOutline (inner) and context.currentOutline (outer)
  //  are, up to this point, completely separate from each other
  //- context.currentSection (outer) must not be altered;
  //  SRs must not contribute to ancestor sectioning elements
  this.contextRestore(context);

  //- implement a hierarchy of outlines?
  //- make node.innerOutline() an inner outline of this.currentOutline?
  //context.currentOutline.appendOutline(node.innerOutline)
}

//========//========//========//========//========//========//========//========
//# sectioning content (SC) elements
//- section, article, nav, aside

//- void onSC_enter(CNodeProxy node)
onSC_enter(node) {
  assert(false, "TODO: still need to test this...");

  if(this.currentOutline !== null) {
    //- this SC is child of some other SR/SC

    if(this.currentSection.hasNoHeading()) {
      //- this section (in front of this SC) does not yet have a heading
      //- that section ends with the beginning of this SC
      this.currentSection.createAndSetImpliedHeading();
    }

    //- push/save the current context
    this.stack.push(this.currentContext(CT_SC, node));
  }

  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  let outline = new COutline(node);
  this.currentOutline = outline;

  //- section.startingNode -> node
  //- does not set node.parentSection!
  let section = new CSection(node, null);
  this.currentSection = section;

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  outline.addSection(section);
}

//========//========//========//========//========

//- void onSC_exit(CNodeProxy node)
onSC_exit(node) {
  assert(false, "TODO: still need to test this...");

  if(this.currentSection.hasNoHeading()) {
    //- the current section (inside SC) does not have
    //  a single heading element; it ends with this SC
    this.currentSection.createAndSetImpliedHeading();
  }

  if(this.stack.isEmpty()) {
    //- the walk is over
    assert((node === this.startingNode, "internal error"));
    this.currentSection = null;
    this.currentOutline = null;
    return;//- done
  }

  //- this SC is child of some other sectioning element
  let context = this.stack.pop();

  assert((context.type() === CT_SC), "internal error");
  assert((context.node() === node), "internal error");
  assert(this.contextChanged(context), "internal error");
  assert((this.currentOutline === node.innerOutline()), "internal error");

  //- node.innerOutline (inner) and context.currentOutline (outer)
  //  are, up to this point, completely separate from each other
  //- context.currentSection (outer) must still be altered;
  //  SCs do contribute to ancestor sectioning elements
  this.contextRestore(context);

  //example: h1:A, h2:B, section, h1:C, /section, p
  //- 'section' ends 'h2:B's implicit section
  //- 'p' must be associated with 'h1:A'

  //example: body, h1:A, h1:B, section, ..., /section, p, /body
  //- assume that we are now exiting 'section', i.e. we have reached '/section'
  //- in that case (this.currentSection !== this.currentOutline.lastSection)?
  //question: to what exactly will the implicit section (h1:B) be attached?
  //- same level as the explicit section (body/h1:A), or as its subsection?
  //  h1:A will be the heading of that explicit section; i.e. it
  //  doesn't trigger the creation of a new (implicit) section

  //- currentSection = currentOutline.lastSection
  this.currentSection = this.currentOutline.lastSection();

  //- Section.appendOutline(outline) -> unclear meaning of this operation
  //- currentSection.appendOutline(node.innerOutline());
  //- shouldn't it say currentOutline.appendOutline() ???
  let sections = node.innerOutline().sections();

  for(let ix=0, ic=sections.length; ix<ic; ix++) {
    let section = sections[ix];
    //- currentSection.lastSubSection -> section
    //- section.parentSection -> currentSection
    this.currentSection.addSubSection(section);
  }

  //- implement a hierarchy of outlines?
  //- make node.innerOutline() an inner outline of this.currentOutline?
  //context.currentOutline.appendOutline(node.innerOutline)
}

//========//========//========//========//========//========//========//========
//# heading content (HC)
//- h1, h2, h3, h4, h5, h6
//- h1 has highest rank, h6 has lowest rank

//- voidHC on_enter(CNodeProxy node)
onHC_enter(node) {
  //- this heading element is the first one in the current
  //  section, use it as the section's heading element
  //- this is independent of the heading's actual rank
  if(this.currentSection.hasNoHeading()) {
    this.currentSection.heading(node);
    this.stack.push(this.currentContext(CT_HC, node));
    return;//- we are done here
  }

  //- when entering a SR/SC, a new section will be created that has no
  //  heading; the first if-statement will set that heading; so, when
  //  reaching this point, the first section will always have a heading
  //- when taking the following code into account, and when reaching
  //  this point, all sections in the current SR/SC have existing headings
  assert(!this.currentSection.hasImpliedHeading(), "internal error");
  
  {//- just an optional performance shortcut
    let lastSection = this.currentOutline.lastSection();
    
    //- lastSection always has a heading - see above
    assert(lastSection.hasHeading(), "internal error");
    //- lastSection must always be on the same chain
    assert((lastSection === this.currentSection)
      || lastSection.isAncestorOf(this.currentSection), "internal error");
    
    //- if we already know, that we will have to add the new section
    //  to the current outline, then there is no need to go up the chain
    if(node.rank() >= lastSection.heading().rank()) {
      let section = new CSection(node, node);
      this.currentOutline.addSection(section);
      this.currentSection = section;
      this.stack.push(this.currentContext(CT_HC, node));
      return;//- we are done here
    }
  }
    
  //- the current heading node must now be used to create a new implied
  //  section, with itself as the new section's heading element
  //- before that, we need to figure out where to put that new section
  let parentSection = this.currentSection;
  
  while(true) {
    //- parentSection.heading.rank will fail for non-headings;
    //  rank is only defined for existing headings; i.e. not for
    //  implied ones, and certainly not for null values.
    assert(parentSection.hasHeading(), "internal error");

    //- if(node.rank < currentSection.heading.rank), then
    //  add the new section as a sub-section to currentSection,
    //  otherwise go up the chain/hierarchy
    if(node.rank() < parentSection.heading().rank()) {
      //
      //example: body, h1:A, h2:B, /body
      //- entering h2:B, won't loop, add subsection to h1:A
      //
      //example: body, h1:A, h2:B, h3:C /body
      //- entering h3:C, won't loop, add subsection to h2:B
      //
      //example: body, h1:A, h2:B, h2:C /body
      //- entering h2:C, loop once, add subsection to h1:A
      //
      let section = new CSection(node, node);
      parentSection.addSubSection(section);
      this.currentSection = section;
      this.stack.push(this.currentContext(CT_HC, node));
      return;//- we are done here
    }

    //- if(node.rank >= any-rank-in-that-chain), then
    //  add the new implied section to the current outline
    if(!parentSection.hasParentSection()) {
      //
      //example: body, h1:A, h1:B /body
      //- entering h1:B, add a new section to the current outline
      //
      //example: body, h2:A, h1:B /body
      //- entering h1:B, add a new section to the current outline
      //
      let section = new CSection(node, node);
      this.currentOutline.addSection(section);
      this.currentSection = section;
      this.stack.push(this.currentContext(CT_HC, node));
      return;//- we are done here
    }
    
    //- heading elements are part of their surrounding parent sectioning
    //  element, and not of any other ancestor sectioning element
    //- this requires that going up the chain using the section's
    //  parentSection property must not leave the current outline
    //- that is a guaranteed fact; see how SRs/SCs are dealt with
    parentSection = parentSection.parentSection();
  }//- while
}

//========//========//========//========//========

//- void onHC_exit(CNodeProxy node)
onHC_exit(node) {
  let context = this.stack.pop();
  assert(context.type() === CT_HC);
  assert(context.node() === node, "internal error");
  assert(!this.contextChanged(context), "internal error");
}

//========//========//========//========//========//========//========//========
//# all other node elements

//- void onOther_enter(CNodeProxy node)
onOther_enter(node) {
  //- ignore for the moment
}

//========//========//========//========//========

//- void onOther_exit(CNodeProxy node)
onOther_exit(node) {
  //- that would be step (4's last statement)
  //- node.parentSection(this.currentSection)?
}

//========//========//========//========//========//========//========//========
};//- module.exports
