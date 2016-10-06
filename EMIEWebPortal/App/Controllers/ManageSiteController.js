EMIEModule.controller("ManageSiteController", function ($scope, ManageSiteService, SharedProperties,LoginService, $sessionStorage, growl, Constants, $location, $rootScope, $route) {

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {

    //Initializing the elements with values
    displayAddNewWebsiteForm();

    //===========================================================================================================================================================================
    //                                                       Implementation of new POP UP
    //===========================================================================================================================================================================
    //Implemetation of new pop up
    $('#PopUpModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    //On click on COnfirm on MODAL
    $scope.Confirm = function (cases, object) {
        switch (cases) {
            case "NULL":
                break;
            case "AddWebsite":
                CheckExistingWebsite(object.siteUrl);
                break;
            case "ExistingWebsite":
                addWebsite(object.siteUrl);
                break;


        }
    }

    //clikcing on the cancel button in the model will reload the controller to clear out the fields
    $scope.CancelValidation = function (cases) {
        switch (cases) {
            case "AddWebsite":
                $route.reload();
                break;
        }
    }

    //clicking on the cancel button when a website exists will clear out the fields
    $scope.CancelValidationFail = function (cases) {
        switch (cases) {
            case "AddWebsite", "ExistingWebsite":
                $route.reload();
                break;
        }
    }

    //===========================================================================================================================================================================
    //                                                       Populate DropDown values
    //===========================================================================================================================================================================
    var getdocmodes = ManageSiteService.GetDocModes();
    getdocmodes.success(function (result) {
        PopulateDropDowns(result);
        //Editing a site
        EditSite(result);
    }).error(function () {
        $('#PopUpModal').modal('toggle');
        $scope.ALERTCONTENT = {
            Title: Constants.PopupTitleError,
            MethodCase: "NULL",
            Type: "error"
        }
        $scope.MESSAGE = Constants.ErrorInGettingDocModes;
    })


    //Populate drop down with DocModes
    function PopulateDropDowns(result) {
        $scope.DocModes = result;
    }



    //Initializing the varriables to use them through out the code
    var siteUrlWithoutPath = null;
    var siteUrlWithPath = null;
    var existingWebsite = false;

    //===========================================================================================================================================================================
    //                                                       Checking URL On Each change to Display another dropdown for subdomain
    //===========================================================================================================================================================================

    //Breakdown the sub url and provide option to select docmode for that as well
    //if user insert a '/' in the url means url has a subdomain path as well so we'll show them another dropdown to select the docmode
    $scope.CheckURL = function (URL) {
        var urlWithoutHttp = trimUrl(URL);
        var indexOfPath = urlWithoutHttp.indexOf("/");
        siteUrlWithPath = urlWithoutHttp;
        if (indexOfPath != -1)
            siteUrlWithPath = siteUrlWithPath.substring(siteUrlWithPath.indexOf("/"), URL.length);
        siteUrlWithoutPath = urlWithoutHttp;
        if (indexOfPath != -1)
            siteUrlWithoutPath = siteUrlWithoutPath.substring(0, siteUrlWithoutPath.indexOf("/"));

        if (indexOfPath == -1) {
            $scope.subURLInfo = false;
        }
        else {
            $scope.subURLInfo = true;
            $scope.domainURL = siteUrlWithoutPath;
            $scope.subURL = siteUrlWithPath;
        }
    }

    //===========================================================================================================================================================================
    //                                                       Save XML
    //===========================================================================================================================================================================

    //Data to store into the list and save into the xml
    //on the addnewwebsite page when information is filled and save button is pressed the data entered will be saved into the xml file 
    //and page will be redirected to the sitelists.html and the information will be displayed on the page 
    function SaveXML(ManageSitesModel) {
        var data = [];
        var domainSite = {
            NotesAboutURL: ManageSitesModel.NotesAboutURL,
            FullURL: ManageSitesModel.DomainURL,
            OpenIn: ManageSitesModel.OpenIn,
            DomainDocMode: ManageSitesModel.DomainDocMode,
            LastModifiedBy: ManageSitesModel.LastModifiedBy,
            ValidateURL: true,
            ParentId: null
        }
        data.push(domainSite);
        if (ManageSitesModel.FullURL.indexOf("/") != -1) {
            var subDomainSite = {
                NotesAboutURL: ManageSitesModel.NotesAboutURL,
                FullURL: ManageSitesModel.FullURL,
                OpenIn: ManageSitesModel.OpenInForSubdomain,
                DomainDocMode: ManageSitesModel.SubDocMode,
                LastModifiedBy: ManageSitesModel.LastModifiedBy,
                ParentId: ManageSitesModel.DomainURL
            }
            data.push(subDomainSite);
        }
        ManageSiteService.BulkAddFromFile(data, true)
            .success(function () { $location.path("/SiteLists") })
        .error(function () { $location.path("/SiteLists") });
    }

    //===========================================================================================================================================================================
    //                                                       Update a Site Information
    //===========================================================================================================================================================================

    //Update the existing website details into the xml file 
    //with the new information provided
    function UpdateXml(data) {
        ManageSiteService.UpdateXml(data).success(function () {
            $location.path("/SiteLists");
        });

    }

    //===========================================================================================================================================================================
    //                                                       Validating URL
    //===========================================================================================================================================================================

    //validate URL 
    $scope.validate = function (IsValidate, url) {
        if (url == undefined) {
            $scope.IsValidate = false;
        }
        else {
            if (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url)) {
            } else {
                $scope.IsValidate = false;
                $scope.URL = "";
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleWarning,
                    MethodCase: "NULL",
                    Type: "warning"
                }
                $scope.MESSAGE = Constants.EnterURLInCorrectFormat;
            }
        }
    }

    //Cancel adding website navigate back to the SiteLists.html page
    $scope.cancel = function () {
        $location.path("/SiteLists");
    }





    //Utility Functions

    //===========================================================================================================================================================================
    //                                                       Trim a URL to get URL without HTTP
    //===========================================================================================================================================================================

    //Trim the URL to get a url without the http
    function trimUrl(url) {
        url = url.trim().replace(/^https?\:\/\//i, "");
        var indexOfParameter = url.indexOf("?");
        if (indexOfParameter != -1)
            url = url.substring(0, url.indexOf('?'));
        if (url.charAt(url.length - 1) == "/")
            url = url.substring(0, url.length - 1);
        return url;
    }

    //===========================================================================================================================================================================
    //                                                       Varribale initialization & Utility Functions
    //===========================================================================================================================================================================

    //this function initilaizes the bydefault value on the page which can be further altered by the user
    function displayAddNewWebsiteForm() {
        $scope.IsEdit = false;
        $scope.siteUrl = "";
        $scope.siteNotes = "";
        $scope.OpenIn = 'IE11';
        $scope.OpenInForPath = 'IE11';
        $scope.IsValidURL = true;
        $scope.siteUrlWithoutPath = "";
        $scope.IsPathIncluded = false;
        $scope.siteUrlWithPath = true;
        $scope.disableSaveButton = true;
        $scope.IsValidate = true;
    };

    //function get the url without the http
    function getUrlWithoutHttp(url) {
        return trimUrl(url);
    };

    //function removes the url after '/' sign and returns the domain path
    function getSiteUrlwithoutPath(urlWithoutHttp) {
        var indexOfPath = urlWithoutHttp.indexOf("/");
        var url = urlWithoutHttp;
        if (indexOfPath != -1)
            url = url.substring(0, url.indexOf("/"));
        return url;
    };

    //function gets the url with path it is only the subdomain path of the url
    function getSiteUrlWithPath(urlWithoutHttp, siteUrl) {
        var indexOfPath = urlWithoutHttp.indexOf("/");
        var url = urlWithoutHttp;
        if (indexOfPath != -1)
            url = url.substring(url.indexOf("/"), siteUrl.length);
        else
            url = null;
        return url;
    };

    //this function checks if the path is also included in the url
    function PathIncluded(urlWithoutHttp) {
        var indexOfPath = urlWithoutHttp.indexOf("/");
        if (indexOfPath != -1 && (indexOfPath + 2) <= urlWithoutHttp.length) {
            return true;
        }
        else return false;
    };

    //this function checks if the path is also included in the url if so 
    //dropdowm of the docmode will be displayed in order to choose docmode for subdomain as well
    $scope.CheckPathIncluded = function (url) {
        CheckPath(url);
    }

    //this function will be called to check if path is included if so show another dropdown for subdomain url
    function CheckPath(url) {
        var urlWithoutHttp = getUrlWithoutHttp(url);
        siteUrlwithoutPath = getSiteUrlwithoutPath(urlWithoutHttp);
        siteUrlWithPath = getSiteUrlWithPath(urlWithoutHttp, url);
        $scope.isPathIncluded = PathIncluded(urlWithoutHttp);
        $scope.siteUrlwithoutPath = siteUrlwithoutPath;
        $scope.siteUrlWithPath = siteUrlWithPath;
        if (url != null && urlWithoutHttp != '')
            $scope.disableSaveButton = false;
        else
            $scope.disableSaveButton = true;
    }


    //===========================================================================================================================================================================
    //                                                       Save or Update a Site Information
    //===========================================================================================================================================================================

    //this function adds  a new website into the list this might update or add a new website
    $scope.addNewItem = function addNewItem() {
        var existingWebsite = false;
        $scope.submitted = true; var siteUrl = getUrlWithoutHttp($scope.siteUrl); $scope.hasSubdomain = siteUrl.indexOf('/') != -1 ? true : false;
        if ($scope.AddWebsite.$valid) {
            var isTobeAdded = true;
            if ($scope.IsValidURL && $scope.IsEdit != true) {
                var validationResult = validateURL(siteUrl);
                var url = getUrlWithHttp(siteUrl);
                //ping the url and check whether its a valid url
                ManageSiteService.pingURL(url).success(function (isValid) {
                    //if not valid url display the confirmation pop up
                        if (isValid == "False" || isValid == "false") {
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleWarning,
                            MethodCase: "AddWebsite",
                            Object: {
                                siteUrl: siteUrl,
                                existingWebsite: existingWebsite,
                                isTobeAdded: isTobeAdded
                            },
                            Type: "warning"
                        }
                        $scope.MESSAGE = Constants.AddURLToSiteLIst;
                    }
                        //if its a valid url proceed whether its existing other wise add it to the sitelist
                    else {
                        CheckExistingWebsite(siteUrl);
                    }
                }).error(function () {
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "NULL",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.ErrorUnableToPingURL;
                });
            }
            if ($scope.IsEdit || !$scope.IsValidURL) {
                CheckExistingWebsite(siteUrl);
            }
            
        }
        else {
            if ($scope.IsEdit != true) {
                growl.error(Constants.EnterAllFields, { title: Constants.TitleEmptyFields });
            }
        }
    };



    //get url with http to ping and check the url validation
    function getUrlWithHttp(siteUrl) {
        if (siteUrl.indexOf("http://") == -1)
            return siteUrl = "http://" + siteUrl + ""
    }

    //This function will chekc whether a wesite exist in already
    function CheckExistingWebsite(siteUrl) {
        var array = SharedProperties.getProperty();
        if (array != null) {
            if ($scope.IsEdit != true) {
                for (var i = 0; i < array.length; i++) {
                    if ((array[i].FullURL === siteUrl)) {
                        existingWebsite = true;
                        break;
                    }
                }
            }
        }

        //if the url already exists then display the pop up for the confirmation
        //this pop is different from the other pop ups specific to this page
        if (existingWebsite && $scope.IsEdit != true) {
            $('#SitelistModal').modal('toggle');
            $scope.LISTCONTENT = {
                Title: Constants.PopupTitleWarning,
                MethodCase: "ExistingWebsite",
                Object: { siteUrl: siteUrl },
                Type: "warning"
            }
            $scope.LISTMESSAGE = "The URL " + siteUrl + " was already added, Do you want to add it to the site list anyway?";

        }
        else addWebsite(siteUrl);
    }

    //This function is used To validate the URL whether it is in right format or not
    function validateURL(url) {
        if (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url)) {
            return 1;

        } else {
            return 0;
        }
    };

    //Selecting proper docmode name
    function getDocumentModeName(docmodeId) {
        switch (docmodeId) {
            case 'IE8Enterprise':
                return "IE8 Enterprise Mode";
            case 'IE7Enterprise':
                return "IE7 Enterprise Mode";
            case 'IE11':
                return "IE11 Document Mode";
            case 'IE10':
                return "IE10 Document Mode";
            case 'IE9':
                return "IE9 Document Mode";
            case 'IE8':
                return "IE8 Document Mode";
            case 'IE7':
                return "IE7 Document Mode";
            case 'IE5':
                return "IE5 Document Mode";
            default: return 'Default Mode';
        }
    }

    //This function collect all the data and send it further for addition or updation of the website 
    function addWebsite(siteUrl) {
        var data; var fullURL = null; var urlToAdd = null;
        fullURL = siteUrl;
        var indexOfParameter;
        var indexOfPath = fullURL.indexOf("/");
        if (indexOfPath != -1 && (indexOfPath + 2) <= fullURL.length) {
            urlToAdd = fullURL.substring(0, fullURL.indexOf("/"));
            indexOfParameter = urlToAdd.indexOf("?");
            if (indexOfParameter != -1)
                urlToAdd = urlToAdd.substring(0, urlToAdd.indexOf('?'));
        }
        else
            urlToAdd = fullURL;

        //checking if the docmode field is selected for domain
        if ($scope.DocModeName != undefined) {
            var a = getDocumentModeName($scope.DocModeName.DocModeName);
        }
        else {
            alert(Constants.SelectDocModeForWebsite);
        }

        //checking if the docmode field is selected for subdomain
        if ($scope.DocModeNameSubURL != undefined)
            var b = getDocumentModeName($scope.DocModeNameSubURL.DocModeName);
        else {
            if (indexOfPath != -1)
                alert(Constants.SelectDocModeForSubDomainURL);
            else
                b = null;
        }


        //collecting the data to be send for addition or updation
        var data = {
            NotesAboutURL: $scope.siteNotes,
            FullURL: fullURL,
            OpenInForSubdomain: $scope.OpenInForPath,
            OpenIn: $scope.OpenIn,
            DomainDocMode: a,
            ValidateURL: $scope.IsValidate,
            LastModifiedBy: $rootScope.User.UserName,
            URLSubstring: $scope.siteUrlWithPath,
            DomainURL: urlToAdd,
            SubDocMode: b
        };
        addOrUpdateWebsite(data);
    }


    //addorupdate website function definition
    function addOrUpdateWebsite(data) {
        if (existingWebsite)
            UpdateXml(data);
        else
            SaveXML(data);
    };

    //===========================================================================================================================================================================
    //                                                       Edit a Site Information
    //===========================================================================================================================================================================

    //Edit a site information
    function EditSite(docModes) {

        var EditInfo = SharedProperties.getProperty();
        try {
            if (EditInfo[1] == true) {
                $scope.siteUrl = EditInfo[0].FullURL;
                $scope.IsEdit = true;
                $scope.disableSaveButton = false;
                $scope.siteNotes = EditInfo[0].NotesAboutURL;
                $scope.OpenIn = EditInfo[0].OpenIn;
                //setting docmode dropdowns

                //$scope.DocModes = EnterPriseDocModes;
                var docmodesubdomain = null;
                var indexOfPath = EditInfo[0].FullURL.indexOf('/');
                if (indexOfPath != -1) {
                    angular.forEach(EditInfo[2], function (value, key) {
                        if (EditInfo[0].FullURL.indexOf(value.FullURL) != -1 && EditInfo[0].FullURL != value.FullURL) {
                            $scope.OpenIn = value.OpenIn;
                            $scope.OpenInForPath = EditInfo[0].OpenIn;
                            docmodesubdomain = value.DomainDocMode;
                        }
                    });
                }
                angular.forEach(docModes, function (value, key) {
                    if (getDocumentModeName(value.DocModeName) == EditInfo[0].DomainDocMode) {
                        if (indexOfPath != -1) {
                            $scope.DocModeNameSubURL = value;
                        }
                        else {
                            $scope.DocModeName = value;
                        }
                    }
                    if (getDocumentModeName(value.DocModeName) == docmodesubdomain) {
                        if (indexOfPath != -1) {
                            $scope.DocModeName = value;
                        }
                        else {
                            $scope.DocModeNameSubURL = value;
                        }
                    }
                })

                CheckPath($scope.siteUrl);
            }
        } catch (e) {

        }

    }
    }
});