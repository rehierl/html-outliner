
"use strict";

const assert = require("assert");
const format = require("util").format;
const err = require("./errorMessages.js");
const isObjectInstance = require("./isObjectInstance.js");

/* must appear below module.exports (cyclic require statements)
//- TODO - this could change with ES6 modules
const COptions = require("./Options.js");
const CSectionBuilder = require("./SectionBuilder.js");
const COutlineBuilder = require("./OutlineBuilder.js");
//*/

//- (DomNode node).nodeType values
//- used to test if a node represents an element
const ELEMENT_NODE = 1;

//- a regular expression used to test if a heading element is a standard HCE;
//  i.e. can the heading's rank value be derived from the heading's name/tag?
//- note - dom will return a node's name/tag in uppercase letters
const rxHR = /^(h[1-6])$/i;

module.exports = class CNodeProxy {
//========//========//========//========//========//========//========//========
//- properties/methods overview
  
//public:

  //- new CNodeProxy(COptions options, DomNode node, CNodeProxy parentNode)

  //- COptions options { get; }
  //- DomNode domNode { get; }

  //- bool isDomNode { get; }
  //- string nodeName { get; }
  //- string textContent { get; }
  //- CNodeProxy parentNode { get; }
  //- CNodeProxy firstChild { get; }
  //- CNodeProxy nextSibling { get; }

  //- bool isElement { get; }
  //- string tagName { get; }
  //- bool isHidden { get; }
  //- CNodeProxy querySelector(string selector)

  //- bool isSR { get; }
  //- bool isSC { get; }
  //- bool isHC { get; }
  //- int rank { get; }

  //- used to implement "associate node X with section Y"
  //- CSectionBuilder parentSection { get; set; }
  //- COutlineBuilder innerOutline { get; set; }

//========//========//========//========//========//========//========//========
//- new CNodeProxy(COptions options, DomNode node, CNodeProxy parentNode)
//- (options, node, null) - the root node to traverse
//- (options, node, node) - a node inside the root's sub-tree

constructor(options, node, parentNode) {
  assert((arguments.length === 3), err.DEVEL);
  assert((options instanceof COptions), err.DEVEL);
  assert(isObjectInstance(node), err.DEVEL);

  if(parentNode === null) {
    //- represents the starting root node
  } else {
    //- represents a node inside the root's sub-tree
    assert((parentNode instanceof CNodeProxy), err.DEVEL);
  }

//private:

  //- COptions options
  //- the options to use during the next run
  this._options = options;
  
  //- DomNode _node
  //- the DOM node represented by this CNodeProxy object
  //- null if this node represents an implied heading
  this._node = node;
  
  //- CNodeProxy _parentNode
  //- null, or the _node's wrapped up parent node
  //- this node represents the starting node, if _parentNode is null
  this._parentNode = parentNode;

  //- CNodeProxy _firstChild
  //- null, or _node's wrapped up first child node
  this._firstChild = undefined;
  
  //- CNodeProxy _nextSibling
  //- null, or _node's wrapped up next sibling node
  this._nextSibling = undefined;
  
  //- CSectionBuilder _parentSection
  //- the section with which this node is associated
  //- when done, this should be non-null for all nodes
  //- except for the root node ???
  this._parentSection = null;
  
  //- COutlineBuilder _innerOutline
  //- null, or the inner outline of a SR or SC element
  this._innerOutline = null;

//- "remember the result" variables
//private, temporary:
  
  //- bool _isDomNode
  //- true if _node actually represents a DOM Node
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
//- COptions options { get; }

get options() {
  return this._options;
}

//========//========//========//========//========//========//========//========
//- DomNode domNode { get; }

get domNode() {
  return this._node;
}

//========//========//========//========//========//========//========//========
//- bool isDomNode { get; }

get isDomNode() {
  if(this._isDomNode === undefined) {
    try {
      let result = undefined;
      assert(isObjectInstance(this._node));//- not even an object
      
      //- nodes must have a nodeType property
      result = this._node.nodeType;
      assert(typeof result === "number");//- not a node
      assert((result % 1) === 0);//- not a node
      
      //- nodes must have a nodeName property
      result = this._node.nodeName;//- same as .tagName
      assert(typeof result === "string");//- not a node
      
      //- nodes must have a textContent property
      result = this._node.textContent;
      assert((result === null) || (typeof result === "string"));//- not a node

      //- nodes must have a firstChild property
      result = this._node.firstChild;
      assert((result === null) || isObjectInstance(result));//- not a node

      //- nodes must have a nextSibling property
      result = this._node.nextSibling;
      assert((result === null) || isObjectInstance(result));//- not a node

      this._isDomNode = true;
    } catch(error) {
      this._isDomNode = false;
    }
  }
  return this._isDomNode;
}

//========//========//========//========//========//========//========//========
//- string nodeName { get; }

get nodeName() {
  if(this._nodeName === undefined) {
    this._nodeName = this._node.nodeName;
  }
  return this._nodeName;
}

//========//========//========//========//========//========//========//========
//- string textContent { get; }

get textContent() {
  let textContent = this._node.textContent;
  return (textContent !== null) ? textContent : "";
}

//========//========//========//========//========//========//========//========
//- CNodeProxy parentNode { get; }

get parentNode() {
  return this._parentNode;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy firstChild { get; }

get firstChild() {
  if(this._firstChild === undefined) {
    let child = this._node.firstChild;
    
    if(isObjectInstance(child) !== true) {
      this._firstChild = null;
    } else {
      this._firstChild = new CNodeProxy(
        this._options, child, this
      );
    }
  }
  return this._firstChild;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy nextSibling { get; }

get nextSibling() {
  if(this._nextSibling === undefined) {
    let sibling = this._node.nextSibling;
    
    if(isObjectInstance(sibling) !== true) {
      this._nextSibling = null;
    } else if(this._parentNode === null) {
      //- when using an inner node as starting node, returning
      //  a non-null value would make the tree traversal leave the
      //  subtree defined by the starting node.
      //- we are at the starting node, if _parentNode is null
      this._nextSibling = null;
    } else {
      this._nextSibling = new CNodeProxy(
        this._options, sibling, this._parentNode
      );
    }
  }
  return this._nextSibling;
}

//========//========//========//========//========//========//========//========
//- bool isElement { get; }

get isElement() {
  if(this._isElement === undefined) {
    try {
      assert(this.isDomNode === true);//- not even a dom node
      let result = undefined;
      
      //- the nodeType property of elements must have the value ELEMENT_NODE(1)
      result = this._node.nodeType;
      assert(result === ELEMENT_NODE);//- not an element
      
      //- only elements have a tagName property
      result = this._node.tagName;//- same as .nodeName
      assert(typeof result === "string");//- not an element
      
      //- only elements have a hasAttribute() function
      result = this._node.hasAttribute("hidden");
      assert(typeof result === "boolean");//- not an element
      
      //- only elements have a querySelector() function
      result = this._node.querySelector;
      assert(typeof result === "function");//- not an element
      
      this._isElement = true;
    } catch(error) {
      this._isElement = false;
    }
  }
  return this._isElement;
}

//========//========//========//========//========//========//========//========
//- string tagName { get; }

get tagName() {
  //- by definition (.nodeName === .tagName)
  return this.nodeName;
}

//========//========//========//========//========//========//========//========
//- bool isHidden { get; }

get isHidden() {
  if(this._isHidden === undefined) {
    if(this.isElement !== true) {
      this._isHidden = false;
    } else {
      this._isHidden = this._node.hasAttribute("hidden");
    }
  }
  return this._isHidden;
}

//========//========//========//========//========//========//========//========
//- CNodeProxy querySelector(string selector)

querySelector(selector) {
  let node = null;
  
  try {
    node = this._node.querySelector(selector);
  } catch(error) {
    //- silently ignore
    node = null;
  }
  
  if(node === null) {
    return null;
  } else {
    return new CNodeProxy(this._options, node, null);
  }
}

//========//========//========//========//========//========//========//========
//- bool isSR { get; }

get isSR() {
  if(this._isSR === undefined) {
    let nodeName = this.nodeName;
    this._isSR = this._options.rxSR.test(nodeName);
  }
  return this._isSR;
}

//========//========//========//========//========//========//========//========
//- bool isSC { get; }

get isSC() {
  if(this._isSC === undefined) {
    let nodeName = this.nodeName;
    this._isSC = this._options.rxSC.test(nodeName);
  }
  return this._isSC;
}

//========//========//========//========//========//========//========//========
//- bool isHC { get; }

get isHC() {
  if(this._isHC === undefined) {
    let nodeName = this.nodeName;
    this._isHC = this._options.rxHC.test(nodeName);
  }
  return this._isHC;
}

//========//========//========//========//========//========//========//========
//- int rank { get; }
//- h1 has highest rank, h6 has lowest rank

get rank() {
  if(this._rank === undefined) {
    assert(this.isHC, err.DEVEL);
    
    let nodeName = this.nodeName;
    //- essentially defaults to highest rank!
    let rank = -1;
    
    if(rxHR.test(nodeName)) {
      rank = nodeName.charAt(1);
      rank = (-1) * Number.parseInt(rank);
    }
    
    this._rank = rank;
  }
  return this._rank;
}

//========//========//========//========//========//========//========//========
//- CSectionBuilder parentSection { get; set; }

get parentSection() {
  return this._parentSection;
}

set parentSection(parentSection) {
  assert((parentSection instanceof CSectionBuilder), err.DEVEL);
  
  if(this._parentSection !== null) {
    //- i.e. do not re-associate
    assert((this._parentSection === parentSection), err.DEVEL);
  }
  
  this._parentSection = parentSection;
}

//========//========//========//========//========//========//========//========
//- COutlineBuilder innerOutline { get; set; }

get innerOutline() {
  return this._innerOutline;
}

set innerOutline(innerOutline) {
  assert((innerOutline instanceof COutlineBuilder), err.DEVEL);
  
  if(this._innerOutline !== null) {
    //- i.e. do not re-associate
    assert((this._innerOutline === innerOutline), err.DEVEL);
  }
  
  this._innerOutline = innerOutline;
}

//========//========//========//========//========//========//========//========
};//- module.exports

//* must appear below module.exports (cyclic require statements)
const COptions = require("./Options.js");
const CSectionBuilder = require("./SectionBuilder.js");
const COutlineBuilder = require("./OutlineBuilder.js");
//*/
