EMIEModule.controller("SiteListsController", function ($scope, ManageSiteService, CommonFunctionsFactory, LoginService, ProdChangesService, SharedProperties, $compile, $sessionStorage, Constants, $rootScope, filterFilter, $route, $location, FileSaver, Blob, $http, growl) {

    //HIDE MODAL
    $('#PopUpModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    /// <summary>
    ///this if condition is for checking if the call is made from the production sites page
    //in that case the code under this will work else ,else part will work
    /// </summary>
    if ($route.current.$$route.originalPath == '/ProductionSites') {
        if (LoginService.getUserWithRoleAtRedirectionForUser(false)) {
            //calling the function to display the production sites
            var productionSites; ShowProductionSites();
            
            //setting the items per page varriable from constatnt
            $scope.itemsPerPage = Constants.ItemsPerPageSiteListTool;
            
            
            /// <summary>
            /// Applying the filters to the columns of the production sites display page
            /// </summary>
            var PropertyToSort; $scope.IsAscending = false;
            //filter by url
            $scope.filterByUrl = function (productionUrls) {
                PropertyToSort = Constants.SortByFullURL;
                SortSiteListData(productionUrls, PropertyToSort);
            }
            //filetr by compat mode
            $scope.filterByCompatmode = function (productionUrls) {
                PropertyToSort = Constants.SortByDomainDocMode;
                SortSiteListData(productionUrls, PropertyToSort);
            }
            //filter by open in browser
            $scope.filterByOpenIn = function (productionUrls) {
                PropertyToSort = Constants.SortByOpenIn;
                SortSiteListData(productionUrls, PropertyToSort);
            }
            
            /// <summary>
            /// Implementing the search functionality on the display production sites page
            /// </summary>
            var searchProdBackup;
            $scope.SearchProductionSites = function Search(search) {
                $rootScope.productionsiteInfo = searchProdBackup == undefined ? $rootScope.productionsiteInfo : searchProdBackup;
                $rootScope.productionsiteInfo.map(function (repo) {
                    repo.value = repo.FullURL.toLowerCase() + ' ' + repo.DomainDocMode.toLowerCase() + ' ' + repo.OpenIn.toLowerCase() ;
                });
                //restore data when user delete the search data
                if (search == undefined || search == "")
                    $rootScope.productionsiteInfo = productionSites;
                searchProdBackup = $rootScope.productionsiteInfo;
                if (search.length > 1)
                    $rootScope.productionsiteInfo = $rootScope.productionsiteInfo.filter(createFilterFor(search));
            }
        }
    }
    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    //false-if this page is not accessible other than emie champ role
   else if (LoginService.getUserWithRoleAtRedirectionForEMIEChamp(false)) {
        $scope.IsDuplicate = false; $scope.disableAll = false;

       

        $scope.itemsPerPage = Constants.ItemsPerPageSiteListTool;

        //===========================================================================================================================================================================
        //                                                        Get All site Info To display on UI
        //===========================================================================================================================================================================


        //Load all the added URL's on the UI on page load
        GetSiteInfo();
        var websitesList = [];
        var bulkUploadCounts = 0;
        function GetSiteInfo() {
            $scope.disableAll = true;
            // for Waiting Bar to be diplayed untill service is processed
            var getdata = ManageSiteService.GetSiteInfo();
            getdata.success(function (result) {
                $scope.disableAll = false;
                $scope.siteInfo = result;
                websitesList = result;
                if (result.length != 0) {
                    $scope.disableSave = false;
                    $scope.disableExport = false;
                    $scope.disableClear = false;
                }
                else {
                    $scope.disableSave = true;
                    $scope.disableExport = true;
                    $scope.disableClear = true;
                }
                SharedProperties.setProperty(result);
            }).error(function (error) {

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "ENABLE",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorSiteInformation;
            });
        }


        //On click on COnfirm on MODAL
        $scope.Confirm = function (cases, object) {
            switch (cases) {
                case "NULL":
                    break;
                case "RELOAD":
                    $scope.HideCancelModal = false;
                    $scope.disableAll = false;
                    $route.reload();
                    break;
                case "ENABLE":
                    $scope.disableAll = false;
                    break;
                case "CLEAR":
                    ManageSiteService.ClearLists();
                    $route.reload();
                    break;
                case "IMPORTV1":
                    ImportHelper(object.listOfWebsitesToAdd);
                    break;
                case "DELETE":
                    var response = ManageSiteService.DeleteSite(object);
                    response.success(function () {
                        $route.reload();
                    });
                case "AddValidationFailedWebsites":
                    var portions = sendPortion(object.count, object.itemsToUpload);
                    bulkUploadCounts = portions.length;
                    angular.forEach(portions, function (obj, index) {
                        BulkUpload(obj);
                    })

            }
        }

        //On selecting the cancel option in the pop up
        $scope.CancelValidation = function (cases) {
            switch (cases) {
                case "AddValidationFailedWebsites", "IMPORTV1":
                    $route.reload();
                    break;
            }
        }

        //Navigate to ManageSite page on "AddNewSite" button
        $scope.AddNewWebsite = function () {
            $location.path("/ManageSite");
        }

        //===========================================================================================================================================================================
        //                                                       Save as Xml File For V1 & V2 Version
        //===========================================================================================================================================================================

        //Save the XML file of the v1 version on the click of the "SaveAsXml" button
        $scope.SaveAsXml = function (info, version) {
            var IsExport = false;
            if (version == "version1") {
                var portions = sendPortion(websitesList.length, websitesList);
                bulkUploadCounts = portions.length;
                saveXmlPortion(false, portions);
            }
            else if (version == "version2") {
                var data = EMIEModule.Utility.getXmlStringV2(info, false);
                var xmldata = new Blob([data], { type: 'text/plain' });
                FileSaver.saveAs(xmldata, Constants.XMlDownloadFileName);
            }
        }

        //clear version value of model
        $scope.ClearVersionOfModel = function () {
            $scope.version = null;
        };

        /// <summary>
        /// sending the data into potions for generating the xmlstring as sending larger data throws exception as well as take a lot of time to complete the process
        /// </summary>

        function saveXmlPortion(IsExport, portions) {
            var xml = "<rules"; xml = xml + " version=" + '"' + websitesList[0].EmieVersion + '"' + ">";
            //show the progress bar and disable the contents on the page untill the download completes
            $scope.disableAll = true;
            var portionIndex = 0; var emieConstruct = ""; var docmodeConstruct = "";
            //to inform that the operation to be performed is Export
            var operation = { operationName: 'SaveSitesInXml', value: IsExport ? true : false };
            var operationDetails = []; operationDetails.push(operation);
            angular.forEach(portions, function (sites, index) {
                var info = { websitesList: sites, operation: operationDetails };
                ManageSiteService.asyncSavexml(info).then(function (data) {
                    emieConstruct += data;
                    bulkUploadCounts--;
                    if (bulkUploadCounts == 0) {
                        xml += emieConstruct + "\r\n</rules>";
                        var xmldata = new Blob([xml], { type: 'text/plain' });
                        FileSaver.saveAs(xmldata, IsExport ? Constants.DownloadedTextFileName : Constants.XMlDownloadFileName);
                    }
                }, function () {
                    $scope.disableAll = false;
                })
            });
            $scope.disableAll = false;
            return xml;
        }
        //===========================================================================================================================================================================
        //                                                        Clear All Sites Information
        //===========================================================================================================================================================================

        //Clear the list of the websites added into the emie list 
        $scope.ClearLists = function () {
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleWarning,
                MethodCase: "CLEAR",
                Type: "warning"
            }
            $scope.MESSAGE = Constants.RemoveAllWebSiteMessages;
        }

        //===========================================================================================================================================================================
        //                                                        Bulk Upload For V1 & V2 Version
        //===========================================================================================================================================================================

        //Bulk upload from file where the wesites in the uploaded file will be merged with the existing websites
        function execute(xmlString, isV1Schema) {
            var listOfWebsitesToAdd = null; var listManageSiteModelObj = []; var errorInBulkUpload = []; var sites = [];
            //if no websites are added show the counts as 0
            $scope.validUrls = 0;
            //Calling the parse method to get objects rom the xml string uploaded by the user
            listOfWebsitesToAdd = isV1Schema ? EMIEModule.Utility.parseBulkAddTextAsXml(xmlString, $rootScope.User.UserName) : EMIEModule.Utility.parseBulkAddV2(xmlString, $rootScope.User.UserName);
            //preparing the object to inform the async call what operation is going to be performed
            var operation = { operationName: 'BulkUpload', value: true, user: $rootScope.User.UserName };
            var operationDetails = []; operationDetails.push(operation);
            var info = { listOfWebsitesToAdd: listOfWebsitesToAdd, websitesList: websitesList, operation: operationDetails };
            ManageSiteService.asyncSavexml(info).then(function (data) {
                listManageSiteModelObj = data.listManageSiteModelObj; errorInBulkUpload = data.errorInBulkUpload;
                if (listManageSiteModelObj.length != 0) {
                    var count = listManageSiteModelObj.length;
                    var portions = sendPortion(count, listManageSiteModelObj);
                    bulkUploadCounts = portions.length;
                    angular.forEach(portions, function (obj, index) {
                        BulkUpload(obj);

                        $scope.disableAll = false;
                        $scope.validUrls = listManageSiteModelObj.length;
                        if (errorInBulkUpload.length == 0)
                            $route.reload();
                        else {
                            $scope.IsDuplicate = true;
                            $scope.failedBulkUpload = errorInBulkUpload;
                        }

                    })
                }
                else {
                    if (errorInBulkUpload.length == 0) {
                        $route.reload();
                    }
                    else {
                        $scope.IsDuplicate = true;
                        $scope.failedBulkUpload = errorInBulkUpload;
                        $scope.disableAll = false;
                    }
                }
            });
        }

        /// <summary>
        /// This function will show all the validation websites and asks user to choose which website he would like to proceed further with
        /// </summary>

        $scope.showContent = function ($fileContent) {
            $scope.disableAll = true;
            try {
                var file = document.getElementById('file').files[0].name.toLowerCase();
                if (file.indexOf('.xml') == -1)
                    throw "";

                var isV1Version = EMIEModule.Utility.checkXmlVersion($fileContent);
                //calling the v1 format bulk upload
                if (isV1Version)
                    execute($fileContent, isV1Version);

                    //Calling the v2 format Bulk Upload
                else if (!isV1Version)
                    execute($fileContent, isV1Version);
                else {
                    throw "";
                }

            } catch (e) {
                $("#file")[0].value = '';
                $scope.disableAll = false;
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "Error"
                }
                $scope.MESSAGE = Constants.InvalidFileFormat; // TODO: Include file format
            }
        }

        //getting user confirmation for the addition of bulk urls which have failed validation
        $scope.checkAllCheckboxes = function () {
            if ($scope.checkAll) {
                $scope.checkAll = true;
            }
            else
                $scope.checkAll = false;
            angular.forEach($scope.failedBulkUpload, function (obj, index) {
                obj.AddToList = $scope.checkAll;
            })
        }

        //if any of the checkbox is unchecked this should make the all check checkbox as unchecked 
        $scope.UncheckAllCheckCheckBox = function (IsAddToList) {
            if (!IsAddToList)
                $scope.checkAll = false;
            var isAllCheked = true;
            angular.forEach($scope.failedBulkUpload, function (obj, index) {
                if (!obj.AddToList)
                    isAllCheked = false;
                return false;
            })

            if (isAllCheked)
                $scope.checkAll = true;
            else
                $scope.checkAll = false;
        }

        //if user cancel the bulk upload for the failed validation websites
        $scope.CancelBulkUpload = function () {
            $route.reload();
        }

        //if user chooses "OK" then add the validation failed websites as well
        var IsLessThanFiveThousand = false;
        $scope.AddValidationFailedWebsites = function (failedBulkUpload) {
            AddWebsitesToDisplay(failedBulkUpload, false);
        }

        /// <summary>
        /// This function will detect which websites are choosen to be uploaded and then
        /// finally add the websites in the display list
        /// </summary>

        function AddWebsitesToDisplay(failedBulkUpload, isProduction) {
            var itemsToUpload = []; $scope.IsDuplicate = false;

            angular.forEach(failedBulkUpload, function (obj, index) {
                if (obj.AddToList)
                    itemsToUpload.push(obj.data);
            })

            //check the count of the websites if it more tha 3000 notify user that it might take few minutes to complete the process
            var count = Object.keys(itemsToUpload).length;
            if (count > 5000) {
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleWarning,
                    MethodCase: "AddValidationFailedWebsites",
                    Object: {
                        itemsToUpload: itemsToUpload,
                        count: count
                    },
                    Type: "warning"
                }
                $scope.MESSAGE = Constants.ProcessWaitMessage;
            }
            else if (count < 5000) {
                bulkUploadCounts = 1;
                BulkUpload(itemsToUpload);
            }
        }


        /// <summary>
        /// This function will divide the larger number of the data into portions of 1000 wesites packets
        /// </summary>

        function sendPortion(count, itemsToUpload) {
            var portionIndex = 0;
            $scope.disableAll = true;
            var portions = []; var index = 0;
            for (i = 0; i < count / 1000; i++) {
                var note = [];
                for (var j = 0; j < 1000; j++) {
                    if (itemsToUpload[j + index] != null)
                        note.push(itemsToUpload[j + index]);
                    else
                        break;
                };
                index += j;
                portions.push(note);
            }
            return portions;
        }

        /// <summary>
        /// This function will call the BulkAddFromFIle service to bulk upload data 
        /// </summary>

        function BulkUpload(itemsToUpload) {
            if (itemsToUpload.length != 0) {
                var response = ManageSiteService.BulkAddFromFile(itemsToUpload, false);
                response.success(function () {
                    bulkUploadCounts--;
                    if (bulkUploadCounts == 0) {
                        if (!$scope.IsDuplicate)
                            $route.reload();
                        $scope.disableAll = false;
                    }
                }).error(function (error) {
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "NULL",
                        Type: "Error"
                    }
                    $scope.MESSAGE = Constants.BulkUploadError + " " + error + "";
                })
            }
            else
                $route.reload();
        }


        /// <summary>
        /// This function will find the parents for each websites in the v2 schema
        /// </summary>
        function getParentWebsitesV2(websitesList, allSiteList) {
            var websites = []; var parentId = null;
            $.each(allSiteList, function (index, obj) {
                var siteUrlWithoutPath = obj.url.substring(0, obj.url.indexOf("/"));
                parentId = siteUrlWithoutPath == "" ? null : siteUrlWithoutPath;
                var data = {
                    NotesAboutURL: null,
                    FullURL: obj.url,
                    OpenIn: obj.openin,
                    DomainDocMode: obj.compatmode,
                    LastModifiedBy: $rootScope.User.UserName,
                    ParentId: parentId
                };
                websites.push(data);
            })
            return websites;
        }
        //===========================================================================================================================================================================
        //                                                        Import From Text File For V1 and V2 Version
        //===========================================================================================================================================================================
        //Import from the text file
        function ImportTextFile(textString, isV2Schema) {
            var listOfWebsitesToAdd = null;
            var listManageSiteModelObj = []; var sites = [];
            var IsImport = true;
            listOfWebsitesToAdd = isV2Schema ? EMIEModule.Utility.parseBulkAddV2(textString, $rootScope.User.UserName) : EMIEModule.Utility.parseBulkAddTextAsXml(textString, $rootScope.User.UserName);
            $("#fileImport")[0].value = '';
            if (websitesList.length > 0) {
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleWarning,
                    MethodCase: "IMPORTV1",
                    Object: {
                        listOfWebsitesToAdd: listOfWebsitesToAdd
                    },
                    Type: "warning"
                }
                $scope.MESSAGE = Constants.RemoveAllWebSiteMessages;
            }

            else
                ImportHelper(listOfWebsitesToAdd);
        }

        /// <summary>
        /// This function will help the importing websites by dividing the portions and calling the bulkupload function
        /// </summary>
        function ImportHelper(listOfWebsitesToAdd) {
            var cleared = ManageSiteService.ClearLists();
            $scope.disableAll = true;
            var count = Object.keys(listOfWebsitesToAdd).length;
            var portions = sendPortion(count, listOfWebsitesToAdd);
            bulkUploadCounts = portions.length;
            angular.forEach(portions, function (obj, index) {
                BulkUpload(obj);
            })
        }

        /// <summary>
        /// This function will be called when user selects a file to import
        /// </summary>
        $scope.ImportTextFile = function ($fileContent) {

            try {
                var file = document.getElementById('fileImport').files[0].name.toLowerCase();
                if (file.indexOf('.emie') == -1)
                    throw "";

                var isV1Version = EMIEModule.Utility.checkXmlVersion($fileContent);
                //calling the v1 format bulk upload
                //since import also read from xml as bulk upload which is saved in text format same function can be used for import as well
                if (isV1Version) {
                    ImportTextFile($fileContent, false);
                }
                    //Calling the v2 format Bulk Upload
                    //since import also read from xml as bulk upload which is saved in text format same function can be used for import as well
                else if (!isV1Version) {
                    ImportTextFile($fileContent, true);
                }
                else {
                    throw "";
                }

            }
            catch (e) {
                $scope.disableAll = false;
                $("#fileImport")[0].value = '';
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "Error"
                }
                $scope.MESSAGE = Constants.InvalidFileFormat;
            }
        }




        //===========================================================================================================================================================================
        //                                                       Edit a Site Information
        //===========================================================================================================================================================================

        //Edit the site information 
        //this will redirect the page to manage site page where IsEdit is set to true and when we click on the save button it will edit the site instead of adding 
        var IsEdit = false;
        $scope.EditSite = function (siteInfo) {
            var EditInfo = []; IsEdit = true;
            EditInfo.push(siteInfo);
            EditInfo.push(IsEdit);
            EditInfo.push(websitesList);
            SharedProperties.setProperty(EditInfo);
            $location.path("/ManageSite");
        }

        //===========================================================================================================================================================================
        //                                                        Delete a Site Information
        //===========================================================================================================================================================================

        //Delete the site info
        $scope.DeleteSite = function (siteInfo) {
            //if the website selected to delete is domain url then this confirmation message will be displayed
            if (siteInfo.FullURL.indexOf('/') == -1) {

                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleAreYouSure,
                    MethodCase: "DELETE",
                    Object: siteInfo,
                    Type: "warning"
                }
                $scope.MESSAGE = Constants.DeleteAllDomainMessage;

            }
            else {
                //if the website selected to delete is subdomain url then this confirmation message will be displayed
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleAreYouSure,
                    MethodCase: "DELETE",
                    Object: siteInfo,
                    Type: "Warning"
                }
                $scope.MESSAGE = Constants.DeleteWebsiteEntry;

            }
        }

        //===========================================================================================================================================================================
        //                                                        Export From Text File For V1 & V2 Version
        //===========================================================================================================================================================================

        //Function to export the siteinfo
        $scope.Export = function (info, version) {
            if (version == "version1") {
                var portions = sendPortion(websitesList.length, websitesList);
                bulkUploadCounts = portions.length;
                saveXmlPortion(true, portions);
            }
            else if (version == "version2") {
                var data = EMIEModule.Utility.getXmlStringV2(info, true);
                var exportData = new Blob([data], { type: 'text/plain' });
                FileSaver.saveAs(exportData, Constants.DownloadedTextFileName);
            }

        }

        //===========================================================================================================================================================================
        //                                                        Serch Functionality Implementation
        //===========================================================================================================================================================================
        var searchBackup;
        $scope.Search = function (search) {
            $scope.siteInfo = searchBackup == undefined ? $scope.siteInfo : searchBackup;
            $scope.siteInfo.map(function (repo) {
                repo.value = repo.FullURL.toLowerCase() + ' ' + repo.DomainDocMode.toLowerCase() + ' ' + repo.NotesAboutURL.toLowerCase() + ' ' + repo.OpenIn.toLowerCase() + ' ' + repo.LastModifiedBy.toLowerCase();
            });

            if (search == undefined || search == "")
                $scope.siteInfo = websitesList;
            searchBackup = $scope.siteInfo;
            if (search.length > 1)
                $scope.siteInfo = $scope.siteInfo.filter(createFilterFor(search));
        }
       

        //===========================================================================================================================================================================
        //                                                        Sort Functionality Implementation
        //===========================================================================================================================================================================
        $scope.IsAscending = false;
        $scope.SortByURL = function (siteInfo) {
            var PropertyToSort = Constants.SortByFullURL;
            SortSiteListData(siteInfo, PropertyToSort)
        }
        $scope.SortByDocMode = function (siteInfo) {
            var PropertyToSort = Constants.SortByDomainDocMode;
            SortSiteListData(siteInfo, PropertyToSort)
        }
        $scope.SortByNotesAboutURL = function (siteInfo) {
            var PropertyToSort = Constants.SortByNotesAboutURL;
            SortSiteListData(siteInfo, PropertyToSort)
        }

        
    }
    //===========================================================================================================================================================================
    //                                                        Displaying the production sites in to the tool
    //===========================================================================================================================================================================

    /// <summary>
    /// This function will get all the information about the websites and displays it on the productionsite page
    /// </summary>
    function ShowProductionSites() {
        var sites = []; $rootScope.productionsiteInfo = null; $scope.disableProduction = true;
        var getdata = ManageSiteService.getSitesFromProduction();
        getdata.success(function (data) {
            var isV1Schema = EMIEModule.Utility.checkXmlVersion(data);
            if ($rootScope.User != null)
                var websitesToAdd = isV1Schema ? EMIEModule.Utility.parseBulkAddTextAsXml(data, $rootScope.User.UserName) : EMIEModule.Utility.parseBulkAddV2(data, $rootScope.User.UserName);
            angular.forEach(websitesToAdd, function (obj, index) {
                var site = {
                    FullURL: obj.FullURL,
                    DomainDocMode: obj.DomainDocMode,
                    //NotesAboutURL: 'Added In Production',
                    OpenIn: obj.OpenIn
                    //LastModifiedBy: data.comments[index].Owner,
                    //TicketId: data.comments[index].TicketId,
                    //ApplicationName: data.comments[index].Name
                }
                sites.push(site);
            })
            $scope.disableProduction = false;
            productionSites = sites;
            $rootScope.productionsiteInfo=sites;
        }).error(function () {
            $scope.disableProduction = false;
        });
    }

    //===========================================================================================================================================================================
    //                                                        common function for sorting
    //===========================================================================================================================================================================

    //common function to sort data
    //dataToSort-data to be sorted,PropertyToSort-object property to sort
    function SortSiteListData(dataToSort, PropertyToSort) {
        var sortedData = CommonFunctionsFactory.sortData($scope, dataToSort, PropertyToSort, $scope.IsAscending);
        if ($scope.IsAscending == true)
            $scope.IsAscending = false;
        else
            $scope.IsAscending = true;
    }

    /**
       * Create filter function for a query string
       */
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.value.indexOf(lowercaseQuery) != -1);
        };
    }

    //===========================================================================================================================================================================
    //                                                        Bulk add sites to the production list
    //===========================================================================================================================================================================

    $scope.bulkAddToProduction = function() {
        $scope.disableAll = true;

        // Create array of tickets
        var tickets = [];

        // Create a ticket for each site
        for (var i = 0; i < websitesList.length; i++) {
            var ticket = {
                RequestedBy: $rootScope.User,
                DocMode: {
                    DocModeID: Constants.CompatModeIDs[EMIEModule.Utility.getDocumentModeIdV2(websitesList[i].DomainDocMode)],
                },
                AppSiteUrl: websitesList[i].FullURL,
                DomainOpenInEdge: (Constants.OpenIn[websitesList[i].OpenIn] > 1),
            };

            tickets.push(ticket);
        }

        ManageSiteService.DirectAddToFile(tickets).then(function (result) {
            if (result.data == 'True') {
                $scope.HideCancelModal = true;

                // Delete from site list manager
                var promises = [];
                for (var i = websitesList.length - 1; i >= 0; i--) {
                    promises.push(ManageSiteService.DeleteSite(websitesList[i]));
                }

                Promise.all(promises).then(function () {
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleSuccess,
                        MethodCase: "RELOAD",
                        Type: "success"
                    }
                    $scope.MESSAGE = Constants.SuccessBulkImport;
                });
            }
            else {
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "ENABLE",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorBulkImport;
            }
        });
    }

});

//===========================================================================================================================================================================
//                                                        Adding Directive to the Module for File Selection & Reading
//===========================================================================================================================================================================

//Adding a directive for the file selection and reading the content of the file 
EMIEModule.directive('onReadFile', function ($parse) {

    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function (onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function (onLoadEvent) {
                    scope.$apply(function () {
                        fn(scope, { $fileContent: onLoadEvent.target.result });
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };

});

