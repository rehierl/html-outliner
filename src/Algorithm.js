
"use strict";

const assert = require("assert");
const format = require("util").format;

const err = require("./errorMessages.js");
const isObjectInstance = require("./isObjectInstance.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const COptions = require("./Options.js");
const CCurrentPath = require("./CurrentPath.js");
const CContext = require("./Context.js");
const CStack = require("./Stack.js");
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/

//- identifiers for the states of this outliner automaton
const STATE_START  = "start"; //- initial identifier
const STATE_IGNORE = "ignore";//- when nodes have to be ignored; hidden or inner SRs
const STATE_SR     = "sr";    //- for top-level and inner sectioning root (SR) elements
const STATE_SC     = "sc";    //- for sectioning content (SC) elements
const STATE_HC     = "hc";    //- for heading content (HC) elements

//state automaton:
//- in general, the state identifiers point out what kind of subtree is processed.
//- if(state == START): the stack is empty; otherwise, the stack is non-empty.
//- if(state == IGNORE): the walk function traverseInTreeOrder() can use this
//  state identifier to skip child nodes. these child nodes can be children of
//  a hidden element, or an inner SR. the IGNORE state, when compared with the
//  outliner's official/previous steps, can be seen as a generalization of the
//  hidden attribute.

//stack operations:
//- pushing the current node onto the stack is still necessary; it allows to
//  determine when to restore the previous context. see the onContext_exit handler.
//- when compared with the outliner's official/previous steps, also pushing the
//  current section onto the stack is what makes a read-only mode possible.
//  see the onSR_enter/exit handlers.

//construct of implied headings:
//- if a section has ended and has no heading, it will be associated with an
//  implied heading - i.e. implied headings represent two statements:
//  (1) the section has ended - (2) the section has no heading.
//- example tag sequence - body, SCE, /SCE, h1-A, /body
//- depending on how exactly inner SCE's are merged into their first outer SE,
//  an implied heading allows to prevent associating h1-A with SCE's inner
//  last section - which is also SCE's only section
//- depending on how exactly inner SCE's are merged into their first outer SE,
//  the construct of implied headings mit not even be absolutely necessary

//TODOs:
//- in general a better error handling; use exceptions instead of asserts

module.exports = class CAlgorithm {
//========//========//========//========//========//========//========//========
//- new CAlgorithm() throws AssertionError

constructor() {
  assert((arguments.length === 0), err.DEVEL);
  
//public:

  //- COutline createOutline(DomNode root, Object optionsArg) throws AssertionError
  //- COutline createOutline(DomNode root) throws AssertionError
  
//private:

  //- void validateOptionsArg(Object optionsArg)
  //- void validateDomNode(DomNode root)

  //- void traverseInTreeOrder()
  //- void reset()

  //- void onEnter()
  //- void onXXX_enter()
  
  //- void onExit()
  //- void onXXX_exit()

//private:

  //- Object _options
  //- an options object initialized to the default options
  this._options = new COptions();

  //- CNodeProxy _startingNode
  //- the SR/SC node that was used to start the algorithm
  this._startingNode = null;
  
  //- bool _ignoreNextSR
  //- inner SRs are optional and can be ignored
  //- this flag is used to determine what to do when
  //  entering the next SR
  //- the first SR could be the root element itself:
  //  ignoreNextSR must be initialized to 'false'
  this._ignoreNextSR = false;
  
  {//- current context; see CContext class
    //- CNodeProxy node
    //- a reference to the current node
    this._node = null;

    //- Anything _state
    //- the current state identifier
    this._state = STATE_START;

    //- COutline _outline
    //- a reference to the current outline
    this._outline = null;

    //- CSection _section
    //- a reference to the current section
    this._section = null;
  }//- current context
  
  //- CStack<CContext> _stack
  //- used to save and restore the current context
  this._stack = new CStack();
  
  //- CCurrentPath _path
  //- a breadcrumb path for debugging purposes only
  //- used to maintain a path to the current node
  //- see COptions.maintainPath
  this._path = new CCurrentPath();
}

//========//========//========//========//========//========//========//========
//- void reset()

reset() {
  this._options = new COptions();
  this._startingNode = null;
  this._ignoreNextSR = false;
  this._node = null;
  this._state = STATE_START;
  this._outline = null;
  this._section = null;
  this._stack = new CStack();
  this._path = new CCurrentPath();
}

//========//========//========//========//========//========//========//========
//- COutline createOutline(DomNode root, Object optionsArg)
//- COutline createOutline(DomNode root)

/*
 * @param {DomNode} root
 * -- the DOM node to start with.
 * @param {Object} optionsArg
 * -- the options argument (i.e. { (option: value)* }) to use.
 * -- The outliner begins with the default options, overrides these using the
 * supplied options argument object and uses the resulting configuration.
 * -- If optionsArg is missing, the previous options will be used. If the outliner
 * runs for the first time, the previous options will match the default
 * configuration.
 * -- Use an empty object (i.e. {}) to reset the outliner to the default options.
 * @returns {Outline}
 * -- the resulting outline object.
 */
createOutline(root, optionsArg) {
  if(arguments.length === 1) {
    //- use previous or default options if only one argument is provided?
    //- comment to use previous options, uncomment to use default options
    //this._options = new COptions();
    this.validateDomNode(root);
  } else if(arguments.length === 2) {
    //- must check optionsArg first
    this.validateOptionsArg(optionsArg);
    this.validateDomNode(root);
  } else {
    assert(false, err.DEVEL);
  }

  try {
    this.traverseInTreeOrder();
  } catch(error) {
    //- TODO - better error handling
    //- exceptions rather than asserts
    this._path.currentPath;
    this.reset();//- do a full reset
    throw error;
  }
  
  if(this._options.verifyInvariants) {
    //- verify that we have a clean exit
    //assert(this._options.isDefault, err.INVARIANT);//- not required
    assert((this._startingNode === null), err.INVARIANT);
    assert((this._ignoreNextSR === false), err.INVARIANT);
    assert((this._node === null), err.INVARIANT);
    assert((this._state === STATE_START), err.INVARIANT);
    //- in the future, this._outine may be null for hidden root nodes
    //assert((this._outline !== null), err.INVARIANT);//- result
    assert((this._section === null), err.INVARIANT);
    assert(this._stack.isEmpty, err.INVARIANT);
    assert(this._path.isEmpty, err.INVARIANT);
  }
  
  let outline = this._outline;
  //this._outline = null;
  this.reset();//- safer
  return outline;
}

//========//========//========//========//========//========//========//========
//- void validateOptionsArg(Object optionsArg)

validateOptionsArg(optionsArg) {
  assert((arguments.length === 1), err.DEVEL);
  //- an options argument; i.e. { (option: value)* }
  assert(isObjectInstance(optionsArg), err.INVALID_OTPIONS);
  let options = new COptions();
  
  try {
    options.combine(optionsArg);
  } catch(error) {
    assert(false, err.INVALID_OTPIONS);
  }
  
  //- looks fine; use it
  this._options = options;
}

//========//========//========//========//========//========//========//========
//- void validateDomNode(DomNode root)

validateDomNode(root) {
  assert((arguments.length === 1), err.DEVEL);
  assert(isObjectInstance(root), err.INVALID_ROOT);
  
  //- now, that root is an object, wrap it up
  let node = new CNodeProxy(this._options, root, null);

  //- verify that root supports the properties of a DOM element
  assert(node.isElement, err.INVALID_ROOT);
  
  if(this._options.selector !== "") {
    //- body.querySelector("body") will return null
    node = node.querySelector(this._options.selector);
    
    assert((node !== null), err.INVALID_OPTIONS);
    assert(node.isElement, err.INVALID_OPTIONS);
    
    //- make sure the tree traversal won't leave the subtree
    //  that is defined by this selected starting node.
    node = new CNodeProxy(this._options, node.domNode, null);
  }

  //- root must be a sectioning root (SR) or a sectioning content (SC) element
  assert((node.isSR || node.isSC), err.INVALID_ROOT);

  //- if the starting node itself is hidden, its outline will be a null value
  //assert((node.isHidden !== true), err.INVALID_ROOT);
  
  //- looks fine; use it
  this._startingNode = node;
}

//========//========//========//========//========//========//========//========
//- void traverseInTreeOrder(CNodeProxy node)

traverseInTreeOrder() {
  this._node = this._startingNode;
  let next = null;
  
  enter: while(this._node !== null) {
    if(this._options.maintainPath) {
      this._path.push(this._node);
      console.log("[%s] enter", this._path.currentPath);
    }
    
    this.onEnter();
    
    if((this._state === STATE_IGNORE)
    && (this._options.usePerformanceShortcuts)) {
      next = null;//- ignore all child nodes, if any
    } else {
      next = this._node.firstChild;
    }
    
    if(next !== null) {
      this._node = next;
      continue enter;
    }
    
    exit: while(this._node !== null) {
      this.onExit();
      
      if(this._options.maintainPath) {
        console.log("[%s] exit", this._path.currentPath);
        this._path.pop(this._node);
      }
      
      next = this._node.nextSibling;
      
      if(next !== null) {
        this._node = next;
        continue enter;
      }
      
      //- null, if node is the startingNode
      next = this._node.parentNode;
      
      if((next === null) && this._options.verifyInvariants) {
        //- verify that we have a clean exit
        assert((this._node === this._startingNode), err.INVARIANT);
        assert((this._state === STATE_START), err.INVARIANT);
        //assert((this._outline !== null), err.INVARIANT);//- result
        assert((this._section === null), err.INVARIANT);
        assert(this._stack.isEmpty, err.INVARIANT);
        assert(this._path.isEmpty, err.INVARIANT);
      }
      
      this._node = next;
    }//- exit
  }//- enter
  
  this._startingNode = null;
  this._ignoreNextSR = false;
}

//========//========//========//========//========//========//========//========
//- void onEnter()

onEnter() {
  //- check the current context first
  if(this._state !== STATE_START) {
    let leave = this.onContext_enter();
    if(leave === true) return;//- ignore
  }
  
  //- non-element nodes
  //- TEXT_NODE, COMMENT_NODE, etc.
  if(this._node.isElement !== true) {
    this.onNonElement_enter(); return;
  }
  
  //- hidden attributes/elements
  if(this._node.isHidden
  && (this._options.ignoreHiddenAttributes !== true)) {
    this.onHiddenElement_enter(); return;
  }
  
  //- sectioning root (SR) elements
  //- blockquote, body, details, dialog, fieldset, figure, td
  if(this._node.isSR) {
    this.onSRE_enter(); return;
  }
  
  //- sectioning content (SC) elements
  //- section, article, nav, aside
  if(this._node.isSC) {
    this.onSCE_enter(); return;
  }
  
  //- heading content (HC)
  //- h1, h2, h3, h4, h5, h6
  if(this._node.isHC) {
    this.onHCE_enter(); return;
  }

  //- other elements
  if(true) {//- if(this._node.isElement) {
    this.onOtherElement_enter(); return;
  }
  
  //- should have left by now
  assert(false, err.DEVEL);
}

//========//========//========//========//========//========//========//========
//- void onExit()

onExit() {
  //- check the current context first
  if(this._state !== STATE_START) {
    let leave = this.onContext_exit();
    if(leave === true) return;//- ignore
  }
  
  //- non-element nodes
  //- TEXT_NODE, COMMENT_NODE, etc.
  if(this._node.isElement !== true) {
    this.onNonElement_exit(); return;
  }
  
  //- hidden attributes/elements
  if(this._node.isHidden
  && (this._options.ignoreHiddenAttributes !== true)) {
    this.onHiddenElement_exit(); return;
  }
  
  //- sectioning root (SR) elements
  //- blockquote, body, details, dialog, fieldset, figure, td
  if(this._node.isSR) {
    this.onSRE_exit(); return;
  }
  
  //- sectioning content (SC) elements
  //- section, article, nav, aside
  if(this._node.isSC) {
    this.onSCE_exit(); return;
  }
  
  //- heading content (HC)
  //- h1, h2, h3, h4, h5, h6
  if(this._node.isHC) {
    this.onHCE_exit(); return;
  }

  //- other elements
  if(true) {//- if(this._node.isElement) {
    this.onOtherElement_exit(); return;
  }
  
  //- should have left by now
  assert(false, err.DEVEL);
}

//========//========//========//========//========//========//========//========
//- check the context first

//========//========//========//========//========
//- void onContext_enter(CNodeProxy node)

onContext_enter() {
  if(this._options.verifyInvariants) {
    assert((this._stack.isEmpty !== true), err.INVARIANT);
  }
  
  if(this._state === STATE_IGNORE) {
    //- should no longer happen - see traverseInTreeOrder()
    //- enter the child of a to-be-ignored node;
    //  e.g. hidden elements, inner SRs, etc.
    return true;//- leave/ignore
  }

  if(this._state === STATE_HC) {
    //- enter the child of a heading
    //- content model of headings: phrasing content (i.e. no SR/SC/HC)
    assert((this._node.isSR !== true), err.INVALID_HTML);
    assert((this._node.isSC !== true), err.INVALID_HTML);
    assert((this._node.isHC !== true), err.INVALID_HTML);
    return false;//- continue
  }
  
  //- otherwise
  return false;//- continue
}

//========//========//========//========//========
//- void onContext_exit(CNodeProxy node)

onContext_exit() {
  if(this._options.verifyInvariants) {
    assert((this._stack.isEmpty !== true), err.INVARIANT);
  }
  
  let context = this._stack.tos;

  if(this._node === context.node) {
    //- exit the node that is responsible for the current state
    //- whoever pushes() onto the stack is responsible to pop()
    return false;//- continue
  }
  
  if(this._state === STATE_IGNORE) {
    //- should no longer happen - see traverseInTreeOrder()
    //- exit the child of a to-be-ignored node;
    //  e.g. hidden elements, inner SRs, etc.
    return true;//- leave/ignore
  }
  
  //- otherwise
  return false;//- continue
}

//========//========//========//========//========//========//========//========
//- non-element nodes
//- TEXT_NODE, COMMENT_NODE, etc.

//========//========//========//========//========
//- void onNonElement_enter(CNodeProxy node)

onNonElement_enter() {
  return;//- TODO - add code
}

//========//========//========//========//========
//- void onNonElement_exit(CNodeProxy node)

onNonElement_exit() {
  //- that would be step (5)
  //- node.parentSection = this._section?
  return;//- TODO - add code
}

//========//========//========//========//========//========//========//========
//- hidden elements

//========//========//========//========//========
//- void onHiddenElement_enter(CNodeProxy node)

onHiddenElement_enter() {
  this._stack.push(new CContext(
    this._node, this._state, this._outline, this._section));
  this._state = STATE_IGNORE;
}

//========//========//========//========//========
//- void onHiddenElement_exit(CNodeProxy node)

onHiddenElement_exit() {
  let context = this._stack.pop();
  
  if(this._options.verifyInvariants) {
    assert((context.node === this._node), err.INVARIANT);
    //- context.state can't be STATE_IGNORE
    //- context.state could be STATE_START, STATE_SR, STATE_SC, STATE_HC
    //  STATE_START if the root node has the hidden attribute
    assert((context.outline === this._outline), err.INVARIANT);
    assert((context.section === this._section), err.INVARIANT);
  }
  
  this._state = context.state;
}

//========//========//========//========//========//========//========//========
//- sectioning roots (SR)
//- blockquote, body, details, dialog, fieldset, figure, td

//========//========//========//========//========
//- void onSRE_enter(CNodeProxy node)

onSRE_enter() {
  if(this._ignoreNextSR) {
    //- this SR is an inner SR, ignore it
    
    if(this._options.verifyInvariants) {
      assert((this._state !== STATE_START), err.INVARIANT);
    }
    
    this._stack.push(new CContext(
      this._node, this._state, this._outline, this._section));
    this._state = STATE_IGNORE;
    
    return;//- leave, we are done here
  }
  
  if(this._state === STATE_START) {
    //- this SR is the root sectioning element, it must be processed
    
    if(this._options.verifyInvariants) {
      assert((this._node === this._startingNode), err.INVARIANT);
      //assert((this._state === STATE_START), err.INVARIANT);
      assert((this._outline === null), err.INVARIANT);
      assert((this._section === null), err.INVARIANT);
    }
    
    //- inner SRs do not contribute to the outlines of their ancestors
    //- all other SRs are inner SRs and therefore optional
    this._ignoreNextSR = this._options.ignoreInnerSR;
  }
  
  else {//- if(this._state !== STATE_START) {
    //- this SR is an inner SR of some other SE
    
    if(this._options.verifyInvariants) {
      assert((this._node !== this._startingNode), err.INVARIANT);
      //assert((this._state !== STATE_START), err.INVARIANT);
      assert((this._outline !== null), err.INVARIANT);
      assert((this._section !== null), err.INVARIANT);
    }

    if(this._section.hasNoHeading) {
      //- this section (in front of this SR) does not yet have a heading
      //- it *does not end* with the beginning of this inner SR
      //- it extends beyond this inner SR
      //
      //example: hX, dialog, ..., /dialog, p
      //- 'p' must be associated with 'hX's section
      //- 'dialog' does not end 'hX's section
      //
      //example: body, dialog, ..., /dialog, hX, /body
      //- 'dialog' cannot determine if 'body' has a heading or not
      //- 'body' might still have one, we just didn't reach it yet
      //
      //- must not be executed here
      //this._section.createAndSetImpliedHeading();
    }
  }
  
  //- backup the current/surrounding context,
  //  even if it is the initial/starting context
  this._stack.push(new CContext(
    this._node, this._state, this._outline, this._section));
  this._state = STATE_SR;
  
  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  //- TODO - implement an outline hierarchy?
  this._outline = new COutline(this._options, this._node);

  //- section.startingNode -> node
  //- does not set node.parentSection
  //- TODO - to which section does a SR belong?
  //  to the section it starts, or to the next outer section?
  this._section = new CSection(this._options, this._node, null);

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  this._outline.addSection(this._section);
}

//========//========//========//========//========
//- void onSRE_exit(CNodeProxy node)

onSRE_exit() {
  //- get/retrieve the surrounding context
  let context = this._stack.pop();
  
  //- this SR is an ignored inner SR
  
  if(this._state === STATE_IGNORE) {
    //- no inner section, so this must be first - see hasNoHeading
    
    if(this._options.verifyInvariants) {
      assert((context.node === this._node), err.INVARIANT);
      //- context.state can't be STATE_START, STATE_IGNORE
      //- context.state could be STATE_SR, STATE_SC, STATE_HC
      assert((context.outline === this._outline), err.INVARIANT);
      assert((context.section === this._section), err.INVARIANT);
    }
    
    this._state = context.state;
    return;//- leave, ignore this inner SR
  }
  
  //- this SR was processed
  
  if(this._section.hasNoHeading) {
    //- the current/last section (inside this SR) does not have
    //  a heading element; it ends with this SR
    this._section.createAndSetImpliedHeading();
  }

  //- this SR is a top-level SR
  
  if(context.state === STATE_START) {
    if(this._options.verifyInvariants) {
      assert((context.node === this._node), err.INVARIANT);
      //assert((context.state === STATE_START), err.INVARIANT);
      assert((context.outline === null), err.INVARIANT);//- result
      assert((context.section === null), err.INVARIANT);
      assert((this._node === this._startingNode), err.INVARIANT);
      assert((this._state === STATE_SR), err.INVARIANT);
      assert(this._stack.isEmpty, err.INVARIANT);
    }
    this._state = STATE_START;
    this._section = null;
    return;//- leave, the walk is over
  }

  //- this SR is an inner SR
  
  if(this._options.verifyInvariants) {
    assert((context.node === this._node), err.INVARIANT);
    //- context.state can't be STATE_START, STATE_IGNORE
    //- context.state could be STATE_SR, STATE_SC, STATE_HC
    assert((context.outline !== this._outline), err.INVARIANT);
    assert((context.section !== this._section), err.INVARIANT);
  }

  //- restore the surrounding context
  //- this._outline (inner) and context.outline (outer)
  //  are, up to this point, completely separate from each other
  this._state = context.state;
  this._outline = context.outline;
  //- continue the section (in front of this SR)
  this._section = context.section;
}

//========//========//========//========//========//========//========//========
//- sectioning content (SC) elements
//- section, article, nav, aside

//========//========//========//========//========
//- void onSCE_enter(CNodeProxy node)

onSCE_enter() {
  if(this._state === STATE_START) {
    //- this SC is the root sectioning element
    
    if(this._options.verifyInvariants) {
      assert((this._node === this._startingNode), err.INVARIANT);
      //assert((this._state === STATE_START), err.INVARIANT);
      assert((this._outline === null), err.INVARIANT);
      assert((this._section === null), err.INVARIANT);
    }
    
    //- therefore, all SRs (if any) are optional inner SRs
    //- inner SRs do not contribute to the outlines of their ancestors
    //  and thus may be completely ignored
    this._ignoreNextSR = this._options.ignoreInnerSR;
  }
  
  else {//- if(this._state !== STATE_START) {
    //- this SC is child of some other SE
    assert(false, "TEST THIS");
    
    if(this._options.verifyInvariants) {
      assert((this._node !== this._startingNode), err.INVARIANT);
      //- this._state can't be STATE_START, STATE_IGNORE
      //- this._state could be STATE_SR, STATE_SC, STATE_HC
      assert((this._outline !== null), err.INVARIANT);
      assert((this._section !== null), err.INVARIANT);
    }

    if(this._section.hasNoHeading) {
      //- this section (in front of this SC) does not yet have a heading;
      //  it ends with the beginning of this SC
      //
      //example: hX, section, ..., /section, p, hY
      //- TODO - to which section does 'p' belong?
      //- if hY's section, but then heading-after-paragraph...
      //- so probably the parent's section
      //
      //- must be executed here
      this._section.createAndSetImpliedHeading();
    }
  }

  //- backup the surrounding context,
  //  even if it is the initial/starting context
  this._stack.push(new CContext(
    this._node, this._state, this._outline, this._section));
  this._state = STATE_SC;

  //- outline.outlineOwner -> node
  //- node.innerOutline -> outline
  //- TODO - implement an outline hierarchy?
  this._outline = new COutline(this._options, this._node);

  //- section.startingNode -> node
  //- does not set node.parentSection
  this._section = new CSection(this._options, this._node, null);

  //- outline.lastSection -> section
  //- section.parentOutline -> outline
  this._outline.addSection(this._section);
}

//========//========//========//========//========
//- void onSCE_exit(CNodeProxy node)

onSCE_exit() {
  //- get/retrieve the surrounding context
  let context = this._stack.pop();
  
  //- this SCE was processed
  
  if(this._section.hasNoHeading) {
    //- the current/last section (inside this SC) does not have
    //  a heading element; it ends with this SC
    this._section.createAndSetImpliedHeading();
  }

  //- this SC is a top-level SC
  
  if(context.state === STATE_START) {
    if(this._options.verifyInvariants) {
      assert((context.node === this._node), err.INVARIANT);
      //assert((context.state === STATE_START), err.INVARIANT);
      assert((context.outline === null), err.INVARIANT);
      assert((context.section === null), err.INVARIANT);
      assert((this._node === this._startingNode), err.INVARIANT);
      assert((this._state === STATE_SC), err.INVARIANT);
      assert(this._stack.isEmpty, err.INVARIANT);
    }
    this._state = STATE_START;
    this._section = null;
    return;//- the walk is over
  }

  //- this SC is an inner SC
  
  if(this._options.verifyInvariants) {
    assert((context.node === this._node), err.INVARIANT);
    //- context.state can't be STATE_START, STATE_IGNORE
    //- context.state could be STATE_SR, STATE_SC, STATE_HC
    assert((context.outline !== this._outline), err.INVARIANT);
    assert((context.section !== this._section), err.INVARIANT);
  }

  //example: body, h1-A, h2-B, section, p, /body
  //- h1-A will become the heading of body's first explicit section
  //- 'section' ends h2-B's implicit section
  //- 'p' must be associated with body's explicit section;

  //example: body, h1-A, h1-B, section, ..., /section, p, /body
  //- exit 'section', i.e. we have reached '/section';
  //  in that case (this._section !== this._outline.lastSection)?
  
  //- SCs do contribute to ancestor sectioning elements
  //- this._outline (inner) and context.outline (outer)
  //  are, up to this point, completely separate from each other
  //- context.section has ended with the beginning of this SC

  //- pseudocode-27: currentOutline = stack.pop()
  //- pseudocode-28: currentSection = currentOutline.lastSection
  //- pseudocode-29: currentSection.appendOutline(node.innerOutline);
  
  assert(false, "TEST THIS");
  //----------------- why add to lastSection and not to the outline itself ?!?
  this._section = context.outline.lastSection;
  let sections = this._outline.sections;

  for(let ix=0, ic=sections.length; ix<ic; ix++) {
    let section = sections[ix];
    //- currentSection.lastSubSection -> section
    //- section.parentSection -> currentSection
    this._section.addSubSection(section);
  }

  //- restore the surrounding context
  this._state = context.state;
  this._outline = context.outline;
  //- context.section is no longer relevant
  //this._section = context.section;
}

//========//========//========//========//========//========//========//========
//- heading content (HC)
//- h1, h2, h3, h4, h5, h6
//- h1 has highest rank, h6 has lowest rank

//========//========//========//========//========
//- voidHC on_enter(CNodeProxy node)

onHCE_enter() {
  //- this heading element is the first one in the current
  //  section, use it as the section's heading element
  //- this is independent of the heading's actual rank
  //- example tag sequence - body, section, /section, h1-A, /body
  if(this._section.hasNoHeading) {
    this._section.heading = this._node;
    
    this._stack.push(new CContext(
      this._node, this._state, this._outline, this._section));
    this._state = STATE_HC;
    
    return;//- leave, we are done here
  }

  if(this._options.verifyInvariants) {
    //- when entering a SR/SC, a new section will be created that has no
    //  heading; the if-statement above will set that heading; so, when
    //  reaching this point, the first section will always have an existing
    //  heading that has a rank associated with it
    //- when taking the following code into account, and when reaching
    //  this point after having entered previous headings, it can be assumed
    //  that all sections in the current SR/SC have an existing heading
    //- for each section within this sectioning element, the following is true:
    //  (section.heading.rank < section.parentSection.heading.rank)
    //- siblings don't necessarily have equal rank
    assert(this._section.hasHeading, err.INVARIANT);
  }
  
  if(this._options.usePerformanceShortcuts) {
    //- this is just an optional performance shortcut
    
    //- the closest section that has highest rank
    let lastSection = this._outline.lastSection;

    if(this._options.verifyInvariants) {
      //- lastSection always has a heading - see above
      assert(lastSection.hasHeading, err.INVARIANT);
      //- lastSection must be an ancestor of the current section
      assert((lastSection === this._section)
        || lastSection.isAncestorOf(this._section), err.INVARIANT);
    }
    
    //- if we already know, that we'll have to add the new section
    //  to the current outline, then there is no need to go up the hierarchy
    if(this._node.rank >= lastSection.heading.rank) {
      let section = new CSection(this._options, this._node, this._node);
      this._outline.addSection(section);
      this._section = section;
      
      this._stack.push(new CContext(
        this._node, this._state, this._outline, this._section));
      this._state = STATE_HC;
      return;//- leave, we are done here
    }
    
    //- can't take that shortcut, so
    //- start with this._section and go up the chain
  }
    
  //- the current heading element must now be used to create a new implied
  //  section, with itself as the new section's heading element
  //- before that, we need to figure out where to put that new section
  let parentSection = this._section;
  
  while(true) {
    if(this._options.verifyInvariants) {
      //- parentSection.heading.rank will fail for non-headings
      //- rank is only defined for existing headings; i.e. not for
      //  implied ones, and certainly not for null values.
      //- but, as stated before, all sections inside the current sectioning
      //  element, when reaching this point, already have a heading element
      assert(parentSection.hasHeading, err.INVARIANT);
    }

    if(this._node.rank < parentSection.heading.rank) {
      //- add the new section as a sub-section to parentSection
      
      //example: body; h1-A; h2-B; /body
      //- enter h2-B; won't loop; add subsection to h1-A
      //
      //example: body; h1-A; h2-B; h2-C /body
      //- enter h2-C; loop once; add subsection to h1-A
      //
      //example: body; h1-A; h2-B; h3-C /body
      //- enter h3-C; won't loop; add subsection to h2-B
      //
      //example: body: h1-A; h3-B; h2-C; /body
      //- enter h2-C; loop once; add subsection to h1-A
      //- i.e. siblings don't necessarily have the same rank!
      
      let section = new CSection(this._options, this._node, this._node);
      parentSection.addSubSection(section);
      this._section = section;
      
      this._stack.push(new CContext(
        this._node, this._state, this._outline, this._section));
      this._state = STATE_HC;
      return;//- leave, we are done here
    }

    if(parentSection.hasParentSection !== true) {
      //- add the new implied section to the current outline
      //- see the performance shortcut above
    
      //- the closest section that has highest rank
      let lastSection = this._outline.lastSection;

      if(this._options.verifyInvariants) {
        assert((parentSection === lastSection), err.INVARIANT);
        assert((this._node.rank >= lastSection.heading.rank), err.INVARIANT);
        //- the shortcut should already have handeled this case
        assert((this._options.usePerformanceShortcuts !== true), err.INVARIANT);
      }
      
      //example: body; h1-A; h1-B /body
      //- enter h1-B; add a new section to the current outline
      //
      //example: body; h2-A; h1-B /body
      //- enter h1-B; add a new section to the current outline
      
      let section = new CSection(this._options, this._node, this._node);
      this._outline.addSection(section);
      this._section = section;
      
      this._stack.push(new CContext(
        this._node, this._state, this._outline, this._section));
      this._state = STATE_HC;
      return;//- leave, we are done here
    }
    
    //- otherwise go up the chain/hierarchy
    //- heading elements are part of their surrounding parent sectioning
    //  element, and not of any other ancestor sectioning element
    //- this requires that going up the chain using the section's
    //  parentSection property must not leave the current outline
    //- that is a guaranteed fact; see how SRs/SCs are dealt with
    parentSection = parentSection.parentSection;
  }//- while
  
  //- should have left by now
  assert(false, err.DEVEL);
}

//========//========//========//========//========
//- void onHCE_exit(CNodeProxy node)

onHCE_exit() {
  //- get/retrieve the surrounding context
  let context = this._stack.pop();
  
  if(this._options.verifyInvariants) {
    assert((context._node === this._node), err.INVARIANT);
    //- context.state can't be STATE_START, STATE_IGNROE
    //- context.state could be STATE_SR, STATE_SC, STATE_HC
    assert((context._outline === this._outline), err.INVARIANT);
    assert((context._section === this._section), err.INVARIANT);
  }
  
  this._state = context.state;
}

//========//========//========//========//========//========//========//========
//- all other elements

//========//========//========//========//========
//- void onOtherElement_enter(CNodeProxy node)

onOtherElement_enter() {
  return;//- TODO - add code
}

//========//========//========//========//========
//- void onOtherElement_exit(CNodeProxy node)

onOtherElement_exit() {
  //- that would be step (4's last statement)
  //- node.parentSection = this._section?
  return;//- TODO - add code
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const COptions = require("./Options.js");
const CCurrentPath = require("./CurrentPath.js");
const CContext = require("./Context.js");
const CStack = require("./Stack.js");
const CNodeProxy = require("./NodeProxy.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");
//*/
