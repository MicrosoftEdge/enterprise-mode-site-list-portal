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
    IE11: "IE11"
}

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

function getXMLStringToExport(info) {
    var IsExport = info.data.info.operation[0].value; var websitesList = info.data.info.websitesList;
    var xmlstring = "";// "<rules";  //Adding the root element rules
    //var Title = websitesList[0].EmieVersion;
    //xmlstring = xmlstring + " version=" + '"' + Title + '"' + ">";

    if (websitesList.length > 0) {
        var emieConstruct = "<emie>";   //Adding the starting tag for emie domain constructs - Default or IE8/IE7 Enterprise docmodes
        var docModeConstruct = "<docMode>"; //Adding the starting tag for docmode domain constructs - IE11/10/9/8/7/6 Document modes
        var childElements;
        var isExcluded = false;
        //loop throught each website in the list
        // $.each(websitesList, function (obj, item) {
        for (var i = 0; i < websitesList.length; i++) {
            var item = websitesList[i];
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
                    // angular.forEach(websitesList, function (value, key) {
                    for (var j = 0; j < websitesList.length; j++) {
                        var value = websitesList[j];
                        if (item.FullURL == value.ParentId)
                            childElements.push(value);
                    };

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

                    for (var j = 0; j < websitesList.length; j++) {
                        var value = websitesList[j];
                        if (item.FullURL == value.ParentId)
                            childElements.push(value);
                    };

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
        };
        if (emieConstruct != "<emie>")
            emieConstruct = emieConstruct + "</emie>";
        else
            emieConstruct = "";
        if (docModeConstruct != "<docMode>")
            docModeConstruct = docModeConstruct + "</docMode>";
        else
            docModeConstruct = "";

        xmlstring = xmlstring + emieConstruct + docModeConstruct;
    }
    else
        xmlstring = xmlstring;;

    var formattedXML = formatxmlstring(xmlstring);

    return formattedXML;
}


//event listener
self.addEventListener('message', function (info) {
    if (info.data.info.operation[0].operationName == "SaveSitesInXml")
        var xmlString = getXMLStringToExport(info);
    if (info.data.info.operation[0].operationName == "BulkUpload")
        var xmlString = BulkUploadHelper(info);
    self.postMessage(xmlString);
}, false);

//BUlk Upload
function BulkUploadHelper(info) {
    var listOfWebsitesToAdd = info.data.info.listOfWebsitesToAdd;
    var websitesList = info.data.info.websitesList;
    var user = info.data.info.operation[0].user;
    var listManageSiteModelObj = []; var errorInBulkUpload = [];
    var isV1Schema = listOfWebsitesToAdd[0].siteUrl != null ? true : false;
    for (var i = 0; i < listOfWebsitesToAdd.length; i++) {
        var key = listOfWebsitesToAdd[i];
        var IsAdded = false; var bulkuploadfailed = { data: "", Error: "", AddToList: "" };
        if (isV1Schema)
            var data = {
                NotesAboutURL: key.siteNotes,
                FullURL: key.siteUrl,
                OpenIn: key.openInIE,
                DomainDocMode: key.documentMode,
                LastModifiedBy: user,
                ParentId: key.parentId
            };
        else
            var data = key;
        if (websitesList.length != 0) {
            for (var j = 0; j < websitesList.length; j++) {
                var obj = websitesList[j];
                if (data.FullURL == obj.FullURL) {
                    bulkuploadfailed.Error = "Duplicate(original entry with " + obj.DomainDocMode + ")";
                    bulkuploadfailed.data = data;
                    if (errorInBulkUpload.indexOf(bulkuploadfailed) == -1)
                        errorInBulkUpload.push(bulkuploadfailed);
                    IsAdded = true;
                    break;
                }
            }

        }
        if (IsAdded != true) {
            if (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(data.FullURL)) {
                listManageSiteModelObj.push(data);
            }
            else {
                bulkuploadfailed.Error = "Validation Failed";
                bulkuploadfailed.data = data;
                if (errorInBulkUpload.indexOf(bulkuploadfailed) == -1)
                    errorInBulkUpload.push(bulkuploadfailed);
            }
        }
    }

    var result = { listManageSiteModelObj: listManageSiteModelObj, errorInBulkUpload: errorInBulkUpload };
    return result;
}