
"use strict";

const assert = require("assert");
const format = require("util").format;

const isObjectInstance = require("./isObjectInstance.js");
const CSection = require("./Section.js");
const COutline = require("./Outline.js");

//========//========//========//========//========//========//========//========

//- (DomNode node).nodeType values
const ELEMENT_NODE = 1;

//- a regular expression used to test if an element is a
//  sectioning root (SR) element
const rxSR = /^(blockquote|body|details|dialog|fieldset|figure|td)$/i;

//- a regular expression used to test if an element is a
//  sectioning content (SC) element
const rxSC = /^(article|aside|nav|section)$/i;

//- a regular expression used to test if an element is a
//  heading content element; i.e. h1, h2, h3, h4, h5, h6
const rxHC = /^h[1-6]$/i;

module.exports = class CNodeProxy {
//========//========//========//========//========//========//========//========

//- new CNodeProxy(DomNode node, CNodeProxy parentNode)
//- new CNodeProxy(node, null) - the root node to traverse
//- new CNodeProxy(node, node) - a node inside root's subtree
constructor(node, parentNode) {
  assert((this instanceof CNodeProxy), "invalid call");
  assert((arguments.length === 2), "invalid call");
  
  //- must be a non-null DomNode instance
  assert(isObjectInstance(node), "invalid call");

  if(parentNode === null) {
    //- used to create a root node
  } else {
    //- parentNode must be a CNodeProxy instance
    assert((parentNode instanceof CNodeProxy), "invalid call");
  }
  
//public:

  //- DomNode domNode()

  //- bool isDomNode()
  //- String nodeName()
  //- CNodeProxy parentNode()
  //- CNodeProxy firstChild()
  //- CNodeProxy nextSibling()

  //- bool isElement()
  //- bool isHidden()
  //- String tagName()
  //- bool isSC()
  //- bool isSR()
  //- bool isHC()
  //- int rank()

  //- CSection parentSection()
  //- void parentSection(CSection parentSection)
  
  //- COutline innerOutline()
  //- void innerOutline(COutline innerOutline)

//private:
  
  //- DomNode _node
  //- the DOM node represented by this CNodeProxy object
  //- null if this node represents an implied heading
  this._node = node;
  
  //- CNodeProxy _parentNode
  //- null, or _node's wrapped up parent node
  this._parentNode = parentNode;

  //- CNodeProxy _firstChild
  //- null, or _node's wrapped up first child node
  this._firstChild = undefined;
  
  //- CNodeProxy _nextSibling
  //- null, or _node's wrapped up next sibling node
  this._nextSibling = undefined;
  
  //- CSection _parentSection
  //- the section to which this node belongs
  //  i.e. the section with which this node is associated
  //- when done, this should be non-null for all nodes
  //- except for the root node ???
  this._parentSection = null;
  
  //- COutline _innerOutline
  //- null, or the inner outline of a SR or SC element
  this._innerOutline = null;

//- "remember the result" variables
//private, temporary:
  
  //- bool _isDomNode
  //- true if _node has the DOM Node properties required by this proxy
  this._isDomNode = undefined;
  
  //- String _nodeName
  //- "", or _node.nodeName
  //- same as _node.tagName
  this._nodeName = undefined;
  
  //- bool _isElement
  //- true if _node actually does represent a DOM Element
  this._isElement = undefined;
  
  //- bool _isHidden
  //- true if _node has the 'hidden' attribute set
  this._isHidden = undefined;
  
  //- bool _isSR
  //- true if _node is one of (blockquote, body, fieldset, figure, td)
  this._isSR = undefined;
  
  //- bool _isSC
  //- true if _node is one of (article, aside, nav, section)
  this._isSC = undefined;
  
  //- bool _isHC
  //- true if _node is one of (h1, h2, h3, h4, h5, h6)
  this._isHC = undefined;
  
  //- int _rank in [-1,-6]
  //- the current heading's rank value
  this._rank = undefined;
}

//========//========//========//========//========//========//========//========

//- DomNode domNode()
domNode() {
  assert((arguments.length === 0), "invalid call");
  return this._node;
}

//========//========//========//========//========//========//========//========

//- String toString()
toString() {
  if(this.isDomNode()) {
    return this._node.nodeName;
  } else {
    return Object.toString(this._node);
  }
}

//========//========//========//========//========//========//========//========

//- bool isDomNode()
isDomNode() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._isDomNode === undefined) {
    try {
      let result = undefined;
      assert(isObjectInstance(this._node), "not even an object");
      
      result = this._node.nodeType;
      assert((typeof result === "number"), "not a node");
      assert(((result % 1) === 0), "not a node");
      
      result = this._node.nodeName;//- same as .tagName
      assert((typeof result === "string"), "not a node");

      result = this._node.firstChild;
      assert(((result === null) || isObjectInstance(result)), "not a node");

      result = this._node.nextSibling;
      assert(((result === null) || isObjectInstance(result)), "not a node");

      this._isDomNode = true;
    } catch(error) {
      this._isDomNode = false;
    }
  }
  
  return this._isDomNode;
}

//========//========//========//========//========//========//========//========

//- CNodeProxy parentNode()
parentNode() {
  assert((arguments.length === 0), "invalid call");
  return this._parentNode;
}

//========//========//========//========//========//========//========//========

//- CNodeProxy firstChild()
firstChild() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._firstChild === undefined) {
    let child = this._node.firstChild;
    
    if(!isObjectInstance(child)) {
      this._firstChild = null;
    } else {
      this._firstChild = new CNodeProxy(child, this);
    }
  }
  
  return this._firstChild;
}

//========//========//========//========//========//========//========//========

//- CNodeProxy nextSibling()
nextSibling() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._nextSibling === undefined) {
    let sibling = this._node.nextSibling;
    
    if(!isObjectInstance(sibling)) {
      this._nextSibling = null;
    } else {
      this._nextSibling = new CNodeProxy(sibling, this._parentNode);
    }
  }
  
  return this._nextSibling;
}

//========//========//========//========//========//========//========//========

//- String nodeName()
nodeName() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._nodeName === undefined) {
    this._nodeName = this._node.nodeName;
  }
  
  return this._nodeName;
}

//========//========//========//========//========//========//========//========

//- bool isElement()
isElement() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._isElement === undefined) {
    try {
      assert(this.isDomNode(), "not even a node");
      let result = undefined;
      
      result = this._node.nodeType;
      assert((result === ELEMENT_NODE), "not an element");
      
      result = this._node.hasAttribute("hidden");
      assert((typeof result === "boolean"), "not an element");
      
      result = this._node.tagName;//- same as .nodeName
      assert((typeof result === "string"), "not an element");
      
      this._isElement = true;
    } catch(error) {
      this._isElement = false;
    }
  }
  
  return this._isElement;
}

//========//========//========//========//========//========//========//========

//- bool isHidden()
isHidden() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._isHidden === undefined) {
    if(!this.isElement()) {
      this._isHidden = false;
    } else {
      this._isHidden = this._node.hasAttribute("hidden");
    }
  }
  
  return this._isHidden;
}

//========//========//========//========//========//========//========//========

//- string tagName()
tagName() {
  //- by definition (.nodeName === .tagName)
  return this.nodeName();
}

//========//========//========//========//========//========//========//========

//- bool isSR()
isSR() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._isSR === undefined) {
    let nodeName = this.nodeName();
    this._isSR = rxSR.test(nodeName);
  }
  
  return this._isSR;
}

//========//========//========//========//========//========//========//========

//- bool isSC()
isSC() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._isSC === undefined) {
    let nodeName = this.nodeName();
    this._isSC = rxSC.test(nodeName);
  }
  
  return this._isSC;
}

//========//========//========//========//========//========//========//========

//- bool isHC()
isHC() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._isHC === undefined) {
    let nodeName = this.nodeName();
    this._isHC = rxHC.test(nodeName);
  }
  
  return this._isHC;
}

//========//========//========//========//========//========//========//========

//- int rank()
//- h1 has highest rank, h6 has lowest rank
rank() {
  assert((arguments.length === 0), "invalid call");
  
  if(this._rank === undefined) {
    assert(this.isHC(), "invalid call");
    let nodeName = this.nodeName();
    let rank = nodeName.charAt(1);
    rank = Number.parseInt(rank);
    this._rank = (-1) * rank;
  }
  
  return this._rank;
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

//- COutline innerOutline()
//- void innerOutline(COutline innerOutline)
innerOutline(innerOutline) {
  if(arguments.length === 0) {
    return this._innerOutline;
  }
  
  assert((arguments.length === 1), "invalid call");
  assert((innerOutline instanceof COutline), "invalid call");
  
  if(this._innerOutline !== null) {
    //- i.e. do not re-associate
    assert((this._innerOutline === innerOutline), "invalid call");
  }
  
  this._innerOutline = innerOutline;
}

//========//========//========//========//========//========//========//========
};//- module.exports
