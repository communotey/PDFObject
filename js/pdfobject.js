function loadViewer( url, id, pdfOpenParams, callback ) {
    id = id || "pdf"
    pdfOpenParams = pdfOpenParams || {
		navpanes: 0,
		toolbar: 0,
		statusbar: 0,
		view: "FitH"
    };
    var nocb = (response) => { console.log(response) };
    callback = callback || nocb;

    var cabinet = new PDFViewer({ url, id, pdfOpenParams });
    let success = false;
    let htmlObj = cabinet.embed(id)
    
    if (htmlObj && cabinet.get("pluginTypeFound")) {
        callback(cabinet);
    }
    else {
        callback(false)
    }
}


var PDFViewer = function (obj) {
    if (!obj || !obj.url) {
        return false;
    }

    var pdfobjectversion = "1.2",
        // set reasonable defaults
        id = obj.id || 'pdf',
        width = obj.width || "100%",
        height = obj.height || "100%",
        pdfOpenParams = obj.pdfOpenParams,
        url,
        pluginTypeFound,

        // declare functions
        createAXO,
        hasReaderActiveX,
        hasReader,
        hasGeneric,
        pluginFound,
        setCssForFullWindowPdf,
        buildQueryString,
        get,
        embed;


    /* ----------------------------------------------------
       Supporting functions
       ---------------------------------------------------- */

    createAXO = function (type) {
        var ax;
        try {
            ax = new ActiveXObject(type);
        } catch (e) {
            //ensure ax remains null
            ax = null;
        }
        return ax;
    };

    //Tests specifically for Adobe Reader (aka Acrobat) in Internet Explorer
    hasReaderActiveX = function () {

        var axObj = null;

        if (window.ActiveXObject) {

            axObj = createAXO("AcroPDF.PDF");

            //If "AcroPDF.PDF" didn't work, try "PDF.PdfCtrl"
            if (!axObj) {
                axObj = createAXO("PDF.PdfCtrl");
            }

            //If either "AcroPDF.PDF" or "PDF.PdfCtrl" are found, return true
            if (axObj !== null) {
                return true;
            }

        }

        //If you got to this point, there's no ActiveXObject for PDFs
        return false;

    };



    //Tests specifically for Adobe Reader (aka Adobe Acrobat) in non-IE browsers
    hasReader = function () {

        var i,
        n = navigator.plugins,
            count = n.length,
            regx = /Adobe Reader|Adobe PDF|Acrobat/gi;

        for (i = 0; i < count; i++) {
            if (regx.test(n[i].name)) {
                return true;
            }
        }

        return false;

    };


    //Detects unbranded PDF support
    hasGeneric = function () {

        var mimeCheck = function () {
            return Array.prototype.reduce.call(navigator.plugins, function (supported, plugin) {
                return supported || Array.prototype.reduce.call(plugin, function (supported, mime) {
                    return supported || mime.type == "application/pdf";
                }, supported);
            }, false);
        };

        if (!mimeCheck()) //mimeType is "text/html"
            return "html";
        else { //mimeType is "application/pdf"
            var plugin = navigator.mimeTypes["application/pdf"];
            return (plugin && plugin.enabledPlugin);
        }

    };


    //Determines what kind of PDF support is available: Adobe or generic
    pluginFound = function () {

        var type = null;

        if (hasReader() || hasReaderActiveX()) {

            type = "Adobe";

        } else {
            var plugin = hasGeneric();
            if (plugin) {
                if (plugin == "html") {
                    return plugin;
                }

                type = "generic";
            }
        }

        return type;

    };


    //If setting PDF to fill page, need to handle some CSS first
    setCssForFullWindowPdf = function () {

        var html = document.getElementsByTagName("html"),
            html_style,
            body_style;

        if (!html) {
            return false;
        }

        html_style = html[0].style;
        body_style = document.body.style;

        html_style.height = "100%";
        html_style.overflow = "hidden";
        body_style.margin = "0";
        body_style.padding = "0";
        body_style.height = "100%";
        body_style.overflow = "hidden";

    };


    //Creating a querystring for using PDF Open parameters when embedding PDF
    buildQueryString = function (pdfParams) {

        var string = "",
            prop;

        if (!pdfParams) {
            return string;
        }

        for (prop in pdfParams) {

            if (pdfParams.hasOwnProperty(prop)) {

                string += prop + "=";

                if (prop === "search") {

                    string += encodeURI(pdfParams[prop]);

                } else {

                    string += pdfParams[prop];

                }

                string += "&";

            }

        }

        //Remove last ampersand
        return string.slice(0, string.length - 1);

    };


    //Simple function for returning values from PDFObject
    get = function (prop) {

        var value = null;

        switch (prop) {
            case "url":
                value = url;
                break;
            case "id":
                value = id;
                break;
            case "width":
                value = width;
                break;
            case "height":
                value = height;
                break;
            case "pdfOpenParams":
                value = pdfOpenParams;
                break;
            case "pluginTypeFound":
                value = pluginTypeFound;
                break;
            case "pdfobjectversion":
                value = pdfobjectversion;
                break;
        }

        return value;

    };


    /* ----------------------------------------------------
       PDF Embedding functions
       ---------------------------------------------------- */


    embed = function (targetID) {

        if (!pluginTypeFound) {
            return false;
            // TODO: enable PDF.js
        }

        var targetNode = null;

        if (targetID) {

            //Allow users to pass an element OR an element's ID
            targetNode = (targetID.nodeType && targetID.nodeType === 1) ? targetID : document.getElementById(targetID);

            //Ensure target element is found in document before continuing
            if (!targetNode) {
                return false;
            }

        } else {

            targetNode = document.body;
            setCssForFullWindowPdf();
            width = "100%";
            height = "100%";

        }
        var type = "application/pdf";

        if (pluginTypeFound == "html") {
            type = "text/html";
            url = "pdfjs/web/viewer.html?file=../../"+url + "#zoom=page-width";
        }
        else{
            url = url + "#" + buildQueryString(pdfOpenParams)
        }
        targetNode.innerHTML = '<object data="' + url + '" type="' + type + '" width="' + width + '" height="' + height + '"></object>';

        return targetNode.getElementsByTagName("object")[0];

    };

    //The hash (#) prevents odd behavior in Windows
    //Append optional Adobe params for opening document
    url = encodeURI(obj.url);
    pluginTypeFound = pluginFound();

    this.get = function (prop) {
        return get(prop);
    };
    this.embed = function (id) {
        return embed(id);
    };

    return this;

};
