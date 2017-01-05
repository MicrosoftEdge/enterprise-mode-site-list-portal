EMIEModule.Utility = (function () {
    // 'use strict';

    /// <summary>
    /// This is the constants declarations to avoid the hard coding of the docmodes and other values
    /// </summary>
    var DocModes = {

        //Document modes
        IE5DocMode: "IE5 Document Mode",
        IE7DocMode: "IE7 Document Mode",
        IE8DocMode: "IE8 Document Mode",
        IE9DocMode: "IE9 Document Mode",
        IE10DocMode: "IE10 Document Mode",
        IE11DocMode: "IE11 Document Mode",

        //EnterpriseModes
        IE7EnterpriseMode: "IE7 Enterprise Mode",
        IE8EnterpriseMode: "IE8 Enterprise Mode",

        //Default DocumentMode
        DefaultMode: "Default Mode",

        //this is not actually a docmode this is to find the docmodes (means other than enterprisemode and default mode)
        DocumentMode: "Document Mode",


    }
    //Other string values to avoid hardcoding
    var OpenInBrowser = {
        //Open in IE11 Browser
        IE11: "IE11",
        MsEdge: "MSEdge",
        None:"None"
    }


    /// <summary>
    /// This function is used to format the xml string generated in V1 format in  proper formatted form
    /// </summary>
    function formatxmlstring(text) {
        var ar = text.replace(/>\s{0,}</g, "><")
				 .replace(/</g, "~::~<")
				 .replace(/\s*xmlns\:/g, "~::~xmlns:")
				 .replace(/\s*xmlns\=/g, "~::~xmlns=")
				 .split('~::~'),
                 len = ar.length,
		inComment = false,
		deep = 0,
		str = '',
		ix = 0;

        for (var i = 0; i < len; i++) {
            var newline = "\r\n";
            var space = " ";
            if (ar[i].search("<rules") > -1 || ar[i].search("</path>") > -1)
                str += ar[i];
            //EMIE Section
            if (ar[i].search("<emie>") > -1 || ar[i].search("</emie>") > -1 || ar[i].search("<docMode>") > -1 || ar[i].search("</docMode>") > -1)
                str += newline + space + ar[i];
            //Common Section
            //for domain add two space
            if (ar[i].search("<domain") > -1) {
                str += newline + space + space + ar[i];
                //if there is no path then use the next array element without new line or space and advance the loop by 1 as it is already added
                //say continue so that other entry might not affect
                if (ar[i + 1].search("</domain>") > -1) {
                    str += ar[i + 1]; i += 1; continue;
                }
            }
            if (ar[i].search("<path") > -1) {
                //if this is the second path in a domain we need to put it in new line otherwise keep it in same line without space
                if (ar[i - 2].search("<path") > -1)
                    str += newline + space + space + space + ar[i];
                else
                    str += ar[i];
            }
            if (ar[i].search("</domain>") > -1)
                str += newline + space + space + ar[i];
            if (ar[i].search("</rules>") > -1)
                str += newline + ar[i];
        }
        return (str[0] == '\n') ? str.slice(1) : str;
    }

    /// <summary>
    /// This function is used to get the date time in the required format in V2 format of the xml schema
    /// </summary>
    function getCurrentDateTime() {
        var now = new Date();
        var date = [(now.getDate()) < 10 ? ['0', (now.getDate())].join("") : (now.getDate())].join("");
        var month = [(now.getMonth() + 1) < 10 ? ['0', (now.getMonth() + 1)].join("") : (now.getMonth() + 1)].join("");
        var year = now.getFullYear();
        var hour = [(now.getHours()) < 10 ? ['0', (now.getHours())].join("") : (now.getHours())].join("");
        var minute = [(now.getMinutes()) < 10 ? ['0', (now.getMinutes())].join("") : (now.getMinutes())].join("");
        var seconds = [(now.getSeconds()) < 10 ? ['0', (now.getSeconds())].join("") : (now.getSeconds())].join("");
        var currentdatetime = [[year, month, date].join(""), [hour, minute, seconds].join("")].join(".");
        return currentdatetime;

    }

    /// <summary>
    /// This function is used to get the proper name of the docmodes while converting a xml string into the websites list objects
    /// which will be further send to for the bulk upload
    /// </summary>
    function getDocumentModeName(docmodeId) {
        switch (docmodeId) {
            case 'edge':
                return DocModes.IE11DocMode;
            case '11':
                return DocModes.IE11DocMode;
            case '10':
                return DocModes.IE10DocMode;
            case '9':
                return DocModes.IE9DocMode;
            case '8':
                return DocModes.IE8DocMode;
            case '7':
                return DocModes.IE7DocMode;
            case '5':
                return DocModes.IE5DocMode;
            default: return DocModes.DefaultMode;
        }
    }

    /// <summary>
    /// This function will return the docmode id in the required format of the V1 xml schema 
    /// In the V1 schema whole name of the docmode is not mentioned instead docmode id is used this fumction will provide the id's
    /// </summary>
    function getDocumentModeId(docmodename) {
        switch (docmodename) {
            case DocModes.IE11DocMode:
                return 'edge';
            case DocModes.IE10DocMode:
                return '10';
            case DocModes.IE9DocMode:
                return '9';
            case DocModes.IE8DocMode:
                return '8';
            case DocModes.IE7DocMode:
                return '7';
            case DocModes.IE5DocMode:
                return '5';
            default: return 'edge';
        }
    }

    /// <summary>
    /// This function will return the docmode id in the required format of the V2 xml schema format
    /// </summary>
    //Giving proper docmode name in v2 format
    function getDocumentModeIdV2(docmode) {
        switch (docmode) {
            case DocModes.IE11DocMode:
                return 'IE11';
            case DocModes.IE10DocMode:
                return 'IE10';
            case DocModes.IE9DocMode:
                return 'IE9';
            case DocModes.IE8DocMode:
                return 'IE8';
            case DocModes.IE7DocMode:
                return 'IE7';
            case DocModes.IE5DocMode:
                return 'IE5';
            case DocModes.IE7EnterpriseMode:
                return 'IE7Enterprise';
            case DocModes.IE8EnterpriseMode:
                return 'IE8Enterprise';
            default: return 'Default';
        }
    }

    /// <summary>
    /// This function will return the proper whole name of the docmode reading the docmode id of the V2 schema format
    /// Note that the ids in v2 is different that those in the v1 schema
    /// </summary>
    //Getting docmode name from the docmodeid
    function getDocumentModeNameV2(docmodeId) {
        switch (docmodeId) {
            case 'edge':
                return DocModes.IE11DocMode;
            case 'IE11':
                return DocModes.IE11DocMode;
            case 'IE10':
                return DocModes.IE10DocMode;
            case 'IE9':
                return DocModes.IE9DocMode;
            case 'IE8':
                return DocModes.IE8DocMode;
            case 'IE7':
                return DocModes.IE7DocMode;
            case 'IE5':
                return DocModes.IE5DocMode;
            case "IE7Enterprise":
                return DocModes.IE7EnterpriseMode;
            case "IE8Enterprise":
                return DocModes.IE8EnterpriseMode;
            default: return DocModes.DefaultMode;
        }
    }


    /// <summary>
    /// This function will detect the version of the xml schema
    /// </summary>
    function checkXmlVersion($fileContent) {
        var isV1Version; var xmlDom;
        var parser = new DOMParser();
        xmlDom = parser.parseFromString($fileContent, "text/xml");
        var siteElements = xmlDom.documentElement.getElementsByTagName("site");
        var emieElements = xmlDom.documentElement.getElementsByTagName("emie");
        var docmodeElements = xmlDom.documentElement.getElementsByTagName("docMode");
        if (emieElements.length != 0 || docmodeElements.length != 0) {
            isV1Version = true;
        }
        else if (siteElements.length != 0) {
            isV1Version = false;
        }
        return isV1Version;
    }


    //To save the urls in V1 text file
    /// <summary>
    /// This function will generate the xml string for exporting the text file
    /// </summary>
    function getXMLStringToExport(websitesList, IsExport) {
        var xmlstring = "<rules";  //Adding the root element rules
        var Title = websitesList[0].EmieVersion;
        xmlstring = xmlstring + " version=" + '"' + Title + '"' + ">";

        if (websitesList.length > 0) {
            var emieConstruct = "<emie>";   //Adding the starting tag for emie domain constructs - Default or IE8/IE7 Enterprise docmodes
            var docModeConstruct = "<docMode>"; //Adding the starting tag for docmode domain constructs - IE11/10/9/8/7/6 Document modes
            var childElements;
            var isExcluded = false;
            //loop throught each website in the list
            $.each(websitesList, function (obj, item) {
                childElements = [];
                //check if it is the parent domain site link, 
                //1. if yes add the domain
                //2. add the subdomain entries in path element
                if (item.ParentId === null) {

                    //If its not the document mode entry - (Default or IE8/IE7 Enterprise docmodes)
                    if (item.DomainDocMode.indexOf(DocModes.DocumentMode) == -1) {

                        emieConstruct = emieConstruct + "<domain"; //Adding the starting tag to add domain value

                        //add comments
                        if (item.NotesAboutURL !== null && item.NotesAboutURL !== "" && IsExport)
                            emieConstruct = emieConstruct + " comment=" + '"' + item.NotesAboutURL + '"' + "";

                        //1.set attribute exclude='false for IE8/IE7 Enterprise docmodes
                        //2. set attribute exclude='true for Default mode                    
                        if (item.DomainDocMode.indexOf(DocModes.DefaultMode) == -1) {
                            isExcluded = false;
                            emieConstruct = emieConstruct + ' exclude="false"';
                        }
                        else {
                            emieConstruct = emieConstruct + ' exclude="true"';
                            isExcluded = true;
                        }


                        //If open in IE is checked - set attribute doNotTransition='true'
                        if (item.OpenIn != OpenInBrowser.IE11)
                            emieConstruct = emieConstruct + ' doNotTransition="true"';

                        //set attribute forceCompatView='true' if IE7 Enterprise Mode
                        if (item.DomainDocMode == DocModes.IE7EnterpriseMode)
                            emieConstruct = emieConstruct + ' forceCompatView="true"';



                        //adding the closing tag for domain entry and adding the url 
                        emieConstruct = emieConstruct + ">" + item.FullURL;

                        //Find all child elementa to Add sub domain entries in the path 
                        angular.forEach(websitesList, function (value, key) {
                            if (item.FullURL == value.ParentId)
                                childElements.push(value);
                        });

                        //If any of the child belongs to document mode then an entry for this domain to be added in docmode section
                        var IsDocModeTobeAdded = false; //To identify if any of the child belongs to document mode
                        var forDocModeTobeAdded = "<domain"; //To construct the domain entry if any of the child belongs to document mode

                        forDocModeTobeAdded = forDocModeTobeAdded + ">" + item.FullURL;

                        var ischildInEmie = true;
                        var emieConstructElement = "<path";
                        childElements.forEach(function (obj) {

                            emieConstructElement = "<path";
                            //1.if the subdomain is in Default or IE8/IE7 Enterprise docmodes, add it to emie domain section
                            if (obj.DomainDocMode.indexOf(DocModes.DefaultMode) != -1 || obj.DomainDocMode.indexOf(DocModes.DocumentMode) == -1) {
                                ischildInEmie = true;
                                //add comments
                                if (obj.NotesAboutURL !== null && obj.NotesAboutURL !== "" && IsExport)
                                    emieConstructElement = emieConstructElement + " comment=" + '"' + obj.NotesAboutURL + '"' + "";
                                if (obj.OpenIn != OpenInBrowser.IE11)
                                    emieConstructElement = emieConstructElement + ' doNotTransition="true"';
                                if (obj.DomainDocMode == DocModes.IE7EnterpriseMode)
                                    emieConstructElement = emieConstructElement + ' forceCompatView="true"';
                                if (obj.DomainDocMode.indexOf(DocModes.DefaultMode) != -1)
                                    emieConstructElement = emieConstructElement + ' exclude="true"';
                                else
                                    emieConstructElement = emieConstructElement + ' exclude="false"';
                            }
                                //2.if the subdomain is NOT in Default or IE8/IE7 Enterprise docmodes, add it to docmode domain section
                            else {
                                ischildInEmie = false;
                                IsDocModeTobeAdded = true;
                                forDocModeTobeAdded = forDocModeTobeAdded + "<path";
                                //add comments
                                if (obj.NotesAboutURL !== null && obj.NotesAboutURL !== "" && IsExport) {
                                    forDocModeTobeAdded = forDocModeTobeAdded + " comment=" + '"' + obj.NotesAboutURL + '"' + "";
                                }
                                forDocModeTobeAdded = forDocModeTobeAdded + " docMode=" + '"' + getDocumentModeId(obj.DomainDocMode) + '"' + "";
                                if (obj.OpenIn != OpenInBrowser.IE11)
                                    forDocModeTobeAdded = forDocModeTobeAdded + ' doNotTransition="true"';

                                forDocModeTobeAdded = forDocModeTobeAdded + ">" + obj.FullURL.substring(obj.FullURL.indexOf('/'), obj.FullURL.length) + "</path>";
                            }
                            if (ischildInEmie || (!ischildInEmie && !isExcluded)) {
                                if (obj.DomainDocMode.indexOf(DocModes.DocumentMode) != -1)
                                    emieConstructElement = emieConstructElement + ' exclude="true"';
                                emieConstruct = emieConstruct + emieConstructElement + ">" + obj.FullURL.substring(obj.FullURL.indexOf('/'), obj.FullURL.length) + "</path>";
                            }
                        });

                        //If any of the child belongs to document mode then add an entry for this domain in docmode section
                        if (IsDocModeTobeAdded)
                            docModeConstruct = docModeConstruct + forDocModeTobeAdded + "</domain>";

                        emieConstruct = emieConstruct + "</domain>";
                    }
                        //If its the document mode entry IE11/10/9/8/7/6 Document modes - (Not in Default or IE8/IE7 Enterprise docmodes)
                    else {
                        docModeConstruct = docModeConstruct + "<domain";
                        //add comments
                        if (item.NotesAboutURL !== null && item.NotesAboutURL !== "" && IsExport)
                            docModeConstruct = docModeConstruct + " comment=" + '"' + item.NotesAboutURL + '"' + "";
                        docModeConstruct = docModeConstruct + " docMode=" + '"' + getDocumentModeId(item.DomainDocMode) + '"' + "";
                        if (item.OpenIn != OpenInBrowser.IE11)
                            docModeConstruct = docModeConstruct + ' doNotTransition="true"';

                        docModeConstruct = docModeConstruct + ">" + item.FullURL;

                        //If any of the child belongs to Default or IE8/IE7 Enterprise docmodes then add an entry for this domain in emie section
                        var IsEmieEntryTobeAdded = false;
                        var forEmieEntryTobeAdded = '<domain exclude="true"';
                        //add comments
                        if (item.NotesAboutURL !== null && item.NotesAboutURL !== "" && IsExport)
                            forEmieEntryTobeAdded = forEmieEntryTobeAdded + " comment=" + '"' + item.NotesAboutURL + '"' + "";
                        forEmieEntryTobeAdded = forEmieEntryTobeAdded + ">" + item.FullURL;

                        angular.forEach(websitesList, function (value, key) {
                            if (item.FullURL == value.ParentId)
                                childElements.push(value);
                        });

                        childElements.forEach(function (obj) {
                            if (obj.DomainDocMode.indexOf(DocModes.DefaultMode) != -1 || obj.DomainDocMode.indexOf(DocModes.DocumentMode) == -1) {
                                IsEmieEntryTobeAdded = true;
                                forEmieEntryTobeAdded = forEmieEntryTobeAdded + "";
                                forEmieEntryTobeAdded = forEmieEntryTobeAdded + "<path";
                                //add comments
                                if (obj.NotesAboutURL !== null && obj.NotesAboutURL !== "" && IsExport)
                                    forEmieEntryTobeAdded = forEmieEntryTobeAdded + " comment=" + '"' + obj.NotesAboutURL + '"' + "";
                                if (obj.DomainDocMode.indexOf(DocModes.DefaultMode) != -1)
                                    forEmieEntryTobeAdded = forEmieEntryTobeAdded + ' exclude="true"';
                                else
                                    forEmieEntryTobeAdded = forEmieEntryTobeAdded + ' exclude="false"';
                                if (obj.DomainDocMode == DocModes.IE7EnterpriseMode)
                                    forEmieEntryTobeAdded = forEmieEntryTobeAdded + ' forceCompatView="true"';
                                if (obj.OpenIn != OpenInBrowser.IE11)
                                    forEmieEntryTobeAdded = forEmieEntryTobeAdded + ' doNotTransition="true"';
                                forEmieEntryTobeAdded = forEmieEntryTobeAdded + ">" + obj.FullURL.substring(obj.FullURL.indexOf('/'), obj.FullURL.length) + "</path>";
                            }
                            else {
                                docModeConstruct = docModeConstruct + "<path";
                                //add comments
                                if (obj.NotesAboutURL !== null && obj.NotesAboutURL !== "" && IsExport)
                                    docModeConstruct = docModeConstruct + " comment=" + '"' + obj.NotesAboutURL + '"' + "";
                                if (obj.OpenIn != OpenInBrowser.IE11)
                                    docModeConstruct = docModeConstruct + ' doNotTransition="true"';
                                docModeConstruct = docModeConstruct + " docMode=" + '"' + getDocumentModeId(obj.DomainDocMode) + '"' + "";
                                docModeConstruct = docModeConstruct + ">" + obj.FullURL.substring(obj.FullURL.indexOf('/'), obj.FullURL.length) + "</path>";
                            }
                        });

                        if (IsEmieEntryTobeAdded)
                            emieConstruct = emieConstruct + forEmieEntryTobeAdded + "</domain>";

                        docModeConstruct = docModeConstruct + "</domain>";
                    }
                }
            });

            emieConstruct = emieConstruct + "</emie>";
            docModeConstruct = docModeConstruct + "</docMode>";

            xmlstring = xmlstring + emieConstruct + docModeConstruct + "</rules>";
        }
        else
            xmlstring = xmlstring + "</rules>";

        var formattedXML = formatxmlstring(xmlstring);

        return formattedXML;
    }

    /// <summary>
    /// This function is used to format the string generated in the v2 format 
    /// </summary>
    //This is for formatting the xmlstring for the v2 schema
    function formatV2(text) {
        var ar = text.replace(/>\s{0,}</g, "><")
               .replace(/</g, "~::~<")
               .replace(/\s*xmlns\:/g, "~::~xmlns:")
               .replace(/\s*xmlns\=/g, "~::~xmlns=")
               .split('~::~'),
               len = ar.length,
      inComment = false,
      str = '';
        for (var i = 0; i < len; i++) {
            var newline = "\r\n";
            var space = " ";
            if (ar[i].search("<site-list") > -1)
                str += ar[i];
            if (ar[i].search("<created-by>") > -1 || ar[i].search("</created-by>") > -1 || ar[i].search("<site ") > -1 || ar[i].search("</site>") > -1) {
                str += newline + space + ar[i];
            }
            if (ar[i].search("<tool>") > -1 || ar[i].search("<version>") > -1 || ar[i].search("<date-created>") > -1 || ar[i].search("<compat-mode>") > -1 || ar[i].search("<open-in>") > -1) {
                str += newline + space + space + ar[i] + ar[i + 1]; i++; continue;
            }
            if (ar[i].search("</site-list") > -1)
                str += newline + ar[i];
        }
        return (str[0] == '\n') ? str.slice(1) : str;
    }

    /// <summary>
    /// This function is used to generate the string in the V2 format using the websitelist inforamtion
    /// </summary>
    //This is for saving the xml in v2 format
    function getXmlStringV2(websitesList, IsExport) {
        var now = new Date();
        var strDateTime = getCurrentDateTime();
        var xmlstring = "<site-list";
        if (websitesList.length != 0)
            var title = websitesList[0].EmieVersion;
        xmlstring = xmlstring + " version='" + title + "'>";
        xmlstring = xmlstring + "<created-by>";
        xmlstring = xmlstring + "<tool>EMIESiteListManager</tool><version>10.0.10586.0</version><date-created>" + strDateTime + "</date-created></created-by>";
        if (websitesList.length > 0) {
            angular.forEach(websitesList, function (obj, index) {
                var url = obj.FullURL;
                if (IsExport)
                    xmlstring = xmlstring + "<site url=" + '"' + url + '"' + " comment=" + '"' + obj.NotesAboutURL + '"' + "><compat-mode>" + getDocumentModeIdV2(obj.DomainDocMode) + "</compat-mode><open-in>" + obj.OpenIn + "</open-in></site>";
                else
                    xmlstring = xmlstring + "<site url=" + '"' + url + '"' + "><compat-mode>" + getDocumentModeIdV2(obj.DomainDocMode) + "</compat-mode><open-in>" + obj.OpenIn + "</open-in></site>";
            })

        }
        xmlstring = xmlstring + "</site-list>";
        var formattedXML = formatV2(xmlstring);
        return formattedXML;
    }


    /// <summary>
    /// This function is used to trim the URL to make it http free website name
    /// </summary>
    //Trim URL and return a url without http
    function trimUrl(url) {
        url = url.trim().replace(/^https?\:\/\//i, "");
        var indexOfParameter = url.indexOf("?");
        if (indexOfParameter != -1)
            url = url.substring(0, url.indexOf('?'));
        if (url.charAt(url.length - 1) == "/")
            url = url.substring(0, url.length - 1);
        return url;
    }


    /// <summary>
    /// This function is used to parse the xmlstring received into V2 format into the list of the websites which will be further send to service for the bulk upload
    /// </summary>
    //parsing the xml string of the v2 version to convert it into the objects for the bulk addition of sites
    function parseBulkAddV2(xmlString, username) {
        try {
            var xmlDom;
            var parser = new DOMParser();
            xmlDom = parser.parseFromString(xmlString, "text/xml");
            var websiteList = []; var subElements;
            subElements = xmlDom.documentElement.getElementsByTagName("site");
            for (var j = 0; j < subElements.length; j++) {
                var siteEntery;
                var url;
                var compatmode;
                var openin;
                url = subElements[j].getAttribute("url");
                var siteUrlWithoutPath = url.substring(0, url.indexOf("/"));
                parentId = siteUrlWithoutPath == "" ? null : siteUrlWithoutPath;
                compatmode = getDocumentModeNameV2(subElements[j].getElementsByTagName("compat-mode")[0].textContent.trim());
                openin = subElements[j].getElementsByTagName("open-in")[0].textContent;
                siteEntery = {
                    NotesAboutURL: null,
                    FullURL: url,
                    OpenIn: openin,
                    DomainDocMode: compatmode,
                    LastModifiedBy: username,
                    ParentId: parentId
                }
                websiteList.push(siteEntery);
            }

            return websiteList;
        } catch (e) {
            alert("The file format is invalid.");
            return false;
        }

    }


    /// <summary>
    /// This function will parse the EMIE entries in the xml file
    /// </summary>
    function getEMIEList(xmlDom, emieList) {
        elements = xmlDom.documentElement.getElementsByTagName("emie");
        emieList = parseHelperMethod(elements);
        return emieList;
    }

    /// <summary>
    /// This function will parse the DocMode Entry in the xml file
    /// </summary>
    function getDocModeList(xmlDom, docmodeList) {
        elements = xmlDom.documentElement.getElementsByTagName("docMode");
        docmodeList = parseHelperMethod(elements);
        return docmodeList;
    }

    /// <summary>
    /// This function will a helper function for getting the EMIEList and DocmodeList
    /// </summary>
    function parseHelperMethod(elements) {
        var cURL; var sitesList = [];
        var cisExclude;
        var cdoNotTransition;
        var cforceCompatView;
        var ccomments;
        var cdocMode;
        var pathEntry;
        var domainEntry;
        var pathList = [];
        var pathElement;
        var docMode;
        if (elements.length > 0) {
            var URL;
            var isExclude;
            var doNotTransition;
            var forceCompatView;
            var subelements;
            var comments;
            var domain = [];
            for (var i = 0; i < elements.length; i++) {
                docMode = "";
                domain = [];
                subelements = elements[i].getElementsByTagName("domain");
                for (var j = 0; j < subelements.length; j++) {
                    URL = subelements[j].childNodes[0].data;
                    URL = trimUrl(URL);
                    isExclude = JSON.parse(subelements[j].getAttribute("exclude"));
                    comments = subelements[j].getAttribute("comment");
                    doNotTransition = JSON.parse(subelements[j].getAttribute("doNotTransition"));
                    forceCompatView = JSON.parse(subelements[j].getAttribute("forceCompatView"));
                    docMode = subelements[j].getAttribute("docMode");
                    pathList = [];
                    pathElement = subelements[j].getElementsByTagName("path");
                    if (pathElement && pathElement.length > 0) {
                        for (var k = 0; k < pathElement.length; k++) {
                            if (pathElement[k].textContent)
                                cURL = pathElement[k].textContent;
                            else
                                cURL = pathElement[k].nodeTypedValue;
                            try {
                                cisExclude = JSON.parse(pathElement[k].getAttribute("exclude"));
                            }
                            catch (ex) {
                                cisExclude = false;
                            }
                            cdoNotTransition = JSON.parse(pathElement[k].getAttribute("doNotTransition"));
                            cforceCompatView = JSON.parse(pathElement[k].getAttribute("forceCompatView"));
                            ccomments = pathElement[k].getAttribute("comments");
                            cdocMode = pathElement[k].getAttribute("docMode");
                            pathEntry = {
                                url: cURL,
                                isExclude: cisExclude,
                                doNotTransition: cdoNotTransition,
                                comments: ccomments,
                                forceCompatView: cforceCompatView,
                                docMode: cdocMode
                            };

                            pathList.push(pathEntry);
                        }
                    }
                    domainEntry = {
                        url: URL,
                        doNotTransition: doNotTransition,
                        isExclude: isExclude,
                        comments: comments,
                        forceCompatView: forceCompatView,
                        docMode: docMode,
                        pathList: pathList
                    };
                    sitesList.push(domainEntry);
                }
            }
        }
        return sitesList;
    }

    /// <summary>
    /// This function will parse the xml file data received and generated the list of the websites
    /// </summary>
    //Parsing the xml string to convert it into objects and use those for bulk addition of websites
    function parseBulkAddTextAsXml(xmlString, username) {
        try {
            var xmlDom;
            var rulesList = [];
            var emieList = [];
            var docmodeList = [];
            var parser = new DOMParser();
            xmlDom = parser.parseFromString(xmlString, "text/xml");
            var websiteList = [];
            emieList = getEMIEList(xmlDom, emieList);
            docmodeList = getDocModeList(xmlDom, docmodeList);
            rulesList.push(emieList);
            rulesList.push(docmodeList);
            websiteList = getListOfWebsitesToAdd(rulesList, username);
            return websiteList;
        }
        catch (e) {
            alert("The file format is invalid.");
            return false;
        }
    }


    /// <summary>
    /// This function will generate the list of the objects to be send to the service in the V1 format using the rulelist received from the parsing function
    /// </summary>
    function getListOfWebsitesToAdd(rulesList, username) {
        var websiteobj;
        var listOfWebsitesToAdd = [];
        //docMode section
        if (rulesList[1].length > 0) {
            $.each(rulesList[1], function (obj, item) {
                if (item.docMode === null || item.docMode === "") {
                    //entry in emie section exists
                }
                else {
                    websiteobj = {
                        Title: item.url,
                        FullURL: item.url,
                        siteNotes: item.comments,
                        ParentId: null,
                        LastModifiedBy: username,
                        OpenIn: item.doNotTransition ? OpenInBrowser.None : OpenInBrowser.IE11,
                        DomainDocMode: getDocumentModeName(item.docMode)
                    };
                    listOfWebsitesToAdd.push(websiteobj);
                }

                if (item.pathList.length > 0) {
                    $.each(item.pathList, function (obj1, path) {
                        websiteobj = {
                            Title: item.url + path.url,
                            FullURL: item.url + path.url,
                            siteNotes: path.comments,
                            ParentId: item.url,
                            LastModifiedBy: username,
                            OpenIn: path.doNotTransition ? OpenInBrowser.None : OpenInBrowser.IE11,
                            DomainDocMode: getDocumentModeName(path.docMode)
                        };
                        listOfWebsitesToAdd.push(websiteobj);
                    });
                }
            });
        }

        //emie section
        if (rulesList[0].length > 0) {
            $.each(rulesList[0], function (obj, item) {
                if (!item.isExclude) {
                    websiteobj = {
                        Title: item.url,
                        FullURL: item.url,
                        siteNotes: item.comments,
                        ParentId: null,
                        LastModifiedBy: username,
                        OpenIn: item.doNotTransition ? OpenInBrowser.None : OpenInBrowser.IE11,
                        DomainDocMode: item.forceCompatView ? DocModes.IE7EnterpriseMode : DocModes.IE8EnterpriseMode
                    };
                    listOfWebsitesToAdd.push(websiteobj);
                }
                else {
                    //check if entry exists in docMode section else add as Default mode
                    var result = $.grep(listOfWebsitesToAdd, function (e) {
                        return e.Title == item.url;
                    });
                    if (result.length === 0) {
                        websiteobj = {
                            Title: item.url,
                            FullURL: item.url,
                            siteNotes: item.comments,
                            ParentId: null,
                            LastModifiedBy: username,
                            OpenIn: item.doNotTransition ? OpenInBrowser.None : OpenInBrowser.IE11,
                            DomainDocMode: DocModes.DefaultMode
                        };
                        listOfWebsitesToAdd.push(websiteobj);
                    }
                }

                if (item.pathList.length > 0) {
                    $.each(item.pathList, function (obj1, path) {
                        if (path.isExclude === false) {
                            websiteobj = {
                                Title: item.url + path.url,
                                FullURL: item.url + path.url,
                                siteNotes: path.comments,
                                ParentId: item.url,
                                LastModifiedBy: username,
                                OpenIn: path.doNotTransition ? OpenInBrowser.None : OpenInBrowser.IE11,
                                DomainDocMode: path.forceCompatView ? DocModes.IE7EnterpriseMode : DocModes.IE8EnterpriseMode
                            };
                            listOfWebsitesToAdd.push(websiteobj);
                        }
                        else {
                            //check if entry exists in docMode section else add as Default mode
                            var result = $.grep(listOfWebsitesToAdd, function (e) {
                                return e.Title == item.url + path.url;
                            });
                            if (result.length === 0) {
                                websiteobj = {
                                    Title: item.url + path.url,
                                    FullURL: item.url + path.url,
                                    siteNotes: path.comments,
                                    ParentId: item.url,
                                    LastModifiedBy: username,
                                    OpenIn: path.doNotTransition ? OpenInBrowser.None : OpenInBrowser.IE11,
                                    DomainDocMode: DocModes.DefaultMode
                                };
                                listOfWebsitesToAdd.push(websiteobj);
                            }
                        }
                    });
                }
            });
        }

        return listOfWebsitesToAdd;
    }


    return {
        getXMLStringToExport: getXMLStringToExport,
        getListOfWebsitesToAdd: getListOfWebsitesToAdd,
        parseBulkAddTextAsXml: parseBulkAddTextAsXml,
        trimUrl: trimUrl,
        getXmlStringV2: getXmlStringV2,
        parseBulkAddV2: parseBulkAddV2,
        formatxmlstring: formatxmlstring,
        checkXmlVersion: checkXmlVersion,
        getDocumentModeIdV2: getDocumentModeIdV2
    };

})();




