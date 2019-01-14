// import { resolve } from 'url'

/* global ActiveXObject, window, jQuery */

export default class PdfObject {
  constructor (conf) {
    this.status = 'initializing'
    if (!conf || !conf.url) {
      this.status = new Error('File not found')
    }
    this.pdfobjectversion = '3.0'
    // set reasonable defaults
    this.targetNode = conf.targetNode || this.getTargetElement(`#${conf.id}`)
    this.width = conf.width || '100%'
    this.height = conf.height || '100%'
    this.pdfOpenParams = conf.pdfOpenParams || {
      navpanes: 0,
      toolbar: 0,
      statusbar: 0,
      view: 'FitH'
    }
    this.progressive = conf.progressive
    this.pluginTypeFound = this.pluginFound()
    this.url = conf.url

    this.onReady = new Promise((resolve, reject) => {
      this._ready = resolve
    })

    this._ready(this.embed(this.targetNode))
  }
  createAXO (type) {
    var ax
    try {
      ax = new ActiveXObject(type)
    } catch (e) {
      // ensure ax remains null
      ax = null
    }
    return ax
  }

  // If either ActiveX support for "AcroPDF.PDF" or "PDF.PdfCtrl" are found, return true
  // Constructed as a method (not a prop) to avoid unneccesarry overhead -- will only be evaluated if needed
  supportsPdfActiveX () { return !!(this.createAXO('AcroPDF.PDF') || this.createAXO('PDF.PdfCtrl')) }
  buildFragmentString (pdfParams) {
    let string = ''

    if (pdfParams) {
      for (let prop in pdfParams) {
        if (pdfParams.hasOwnProperty(prop)) {
          string += encodeURIComponent(prop) + '=' + encodeURIComponent(pdfParams[prop]) + '&'
        }
      }

      // The string will be empty if no PDF Params found
      if (string) {
        string = '#' + string

        // Remove last ampersand
        string = string.slice(0, string.length - 1)
      }
    }
    return string
  }
  getTargetElement (targetSelector) {
    // Default to body for full-browser PDF
    var targetNode = document.body

    // If a targetSelector is specified, check to see whether
    // it's passing a selector, jQuery object, or an HTML element

    if (typeof targetSelector === 'string') {
      // Is CSS selector
      targetNode = document.querySelector(targetSelector)
    } else if (typeof jQuery !== 'undefined' && targetSelector instanceof jQuery && targetSelector.length) {
      // Is jQuery element. Extract HTML node
      targetNode = targetSelector.get(0)
    } else if (typeof targetSelector.nodeType !== 'undefined' && targetSelector.nodeType === 1) {
      // Is HTML element
      targetNode = targetSelector
    }

    return targetNode
  }
  // Tests specifically for Adobe Reader (aka Adobe Acrobat) in non-IE browsers
  hasReader () {
    var n = navigator.plugins

    var regx = /Adobe Reader|Adobe PDF|Acrobat/gi

    for (let i = 0, len = n.length; i < len; i++) {
      if (regx.test(n[i].name)) {
        return true
      }
    }

    return false
  }
  // IE11 still uses ActiveX for Adobe Reader, but IE 11 doesn't expose
  // window.ActiveXObject the same way previous versions of IE did
  // window.ActiveXObject will evaluate to false in IE 11, but "ActiveXObject" in window evaluates to true
  // so check the first one for older IE, and the second for IE11
  // FWIW, MS Edge (replacing IE11) does not support ActiveX at all, both will evaluate false
  // Constructed as a method (not a prop) to avoid unneccesarry overhead -- will only be evaluated if needed
  isIE () { return !!(window.ActiveXObject || 'ActiveXObject' in window) }
  // Determines what kind of PDF support is available: Adobe or generic
  pluginFound () {
    var type = null

    if (this.hasReader() || (this.isIE() && this.supportsPdfActiveX())) {
      type = 'Adobe'
    } else {
      var plugin = this.hasGeneric()
      if (plugin) {
        if (plugin === 'html') {
          return plugin
        }

        type = 'generic'
      }
    }

    return type
  }
  mimeCheck () {
    return Array.prototype.reduce.call(navigator.plugins, function (supported, plugin) {
      return supported || Array.prototype.reduce.call(plugin, function (supported, mime) {
        return supported || mime.type === 'application/pdf'
      }, supported)
    }, false)
  }
  // Detects unbranded PDF support
  hasGeneric () {
    if (!this.mimeCheck()) {
      // mimeType is "text/html"
      return 'html'
    } else {
      // mimeType is "application/pdf"
      const plugin = navigator.mimeTypes['application/pdf']
      return (plugin && plugin.enabledPlugin)
    }
  }
  /* ----------------------------------------------------
     PDF Embedding functions
     ---------------------------------------------------- */

  embed (targetNode) {
    this.status = 'embedding'

    // Ensure target element is found in document before continuing
    if (!targetNode) {
      return false
    }

    // let type = 'application/pdf'

    if (!this.pluginTypeFound) {
      this.url = this.progressive + this.url + '#zoom=page-width'
      const viewer = `<iframe
        height="${this.height}"
        src="${this.url}"
        width="${this.width}"
      ></iframe>`
      // targetNode.innerHTML = '<iframe src="' + this.url + '" width="' + this.width + '" height="' + this.height + '"></iframe>'
      targetNode.innerHTML = viewer
      return 'iframe'
    } else if (this.pluginTypeFound === 'html') {
      const type = 'text/html'
      const viewer = `<object
        data="${this.url}"
        height="${this.height}"
        type="${type}"
        width="${this.width}"
      ></object>`
      // targetNode.innerHTML = '<object data="' + this.url + '" type="' + type + '" width="' + this.width + '" height="' + this.height + '"></object>'
      targetNode.innerHTML = viewer
      return type
    } else {
      const type = 'application/pdf'
      this.url = this.url + '#' + this.buildFragmentString(this.pdfOpenParams)
      const viewer = `<object
        data="${this.url}"
        height="${this.height}"
        type="${type}"
        width="${this.width}"
      ></object>`
      // targetNode.innerHTML = '<object data="' + this.url + '" type="' + type + '" width="' + this.width + '" height="' + this.height + '"></object>'
      targetNode.innerHTML = viewer
      return type
    }

    // return targetNode.getElementsByTagName("object")[0];

    // this.status = 'ready'
    // return targetNode.innerHTML
  }
}
