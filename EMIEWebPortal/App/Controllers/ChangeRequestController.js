EMIEModule.controller("CRCntrl", function ($scope, CRService,CommonFunctionsFactory, LoginService, SharedProperties, Constants, $location, $route, $rootScope, $sessionStorage, growl, modalService) {

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {

        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();


        $scope.NewCRDisabled = true;
        $scope.IsEdit = false;
        $scope.IsAddAppDisabled = true;
        var Tickets = null;
        var docmodeid = null
        $scope.saveSubdomainDocmode = null;
        $rootScope.IsNavigated = false;
        if ($route.current.$$route.originalPath == "/RequestPage" || $route.current.$$route.originalPath == "/Request") {
            $scope.IsSubmitted = true;
            $scope.IsDisabledForEdit = true;
        }
        else {
            $scope.IsSubmitted = false;
            $scope.IsAddAppDisabled = false;
            $scope.IsDisabledForEdit = false;
            SharedProperties.setProperty(null);
        }
        $scope.IsEditDisabled = true;
        $scope.isPathIncluded = false;


        //Handled Required functionality
        $scope.DisableDocMode = false;
        $scope.DisableSubDocMode = false;
        $scope.DisableReasonfrChng = false;
        $scope.DisabledApplicationName = true;
        $scope.IsNewRequest = true;
        $scope.IsOldRequest = true;
        $scope.disableSelectBtn = true;

        $(".status li").removeClass("Status-Selected");
        $(".status #First-child").addClass("Status-Selected");
        //Calling initial method to populate fields
        PopulateData();
        init();

        function init() {
            //Make sure they're warned if they made a change but didn't save it
            //Call to $on returns a "deregistration" function that can be called to
            //remove the listener (see routeChange() for an example of using it)
            onRouteChangeOff = $scope.$on('$routeChangeStart', routeChange);
        }

        //Populate the data with selected Ticket ID when selected any Ticket to view
        function PopulateData() {
            var Ticket = SharedProperties.getProperty();
            if (Ticket == "")
                if ($sessionStorage.TicketIdToShow != "") {
                    Ticket = $sessionStorage.TicketIdToShow;
                }
            $(".status #First-child").removeClass("Completed");
            $(".status #Middle-child-1").removeClass("Completed");
            $(".status #Middle-child-2").removeClass("Completed");
            $(".status #Middle-child-3").removeClass("Completed");
            $(".status #Last-child").removeClass("Completed");
            $(".status #Middle-child-1").removeClass("RolledBack");
            $(".status #First-child").removeClass("Current");
            $(".status #Middle-child-1").removeClass("Current");
            $(".status #Middle-child-2").removeClass("Current");
            $(".status #Middle-child-3").removeClass("Current");
            $(".status #Last-child").removeClass("Current");

            if ($route.current.$$route.originalPath == "/NewCR" || $route.current.$$route.originalPath == "/SignInSuccess") {

                PopulateDropdown();
                $(".status #Middle-child-1").addClass("ng");
            }
            else {


                if (Ticket != "" && Ticket != null) {
                    $scope.NewCRDisabled = true;
                    if (Ticket.value == "NonEditableModeOn" || $route.current.$$route.originalPath == "/RequestPage" ||  $route.current.$$route.originalPath == "/Request") {

                        $scope.isDisabled = true;
                        $scope.IsNewRequest = true;
                        $scope.IsOldRequest = false;
                        $scope.TicketId = Ticket.TicketId;

                        //Gets the ticket tada from the ticket ID
                        CRService.GetTicketData(Ticket.TicketId).success(function (TicketsData) {

                            Tickets = TicketsData;
                            if (Tickets.Tickets[0].FinalTicketStatus < Constants.TicketStatus['ApprovalPending']) {
                                $(".status #First-child").addClass("Completed");
                                $(".status #Middle-child-1").addClass("Current");
                                DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #Middle-child-1,.status #First-child");
                            }
                            else if (Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['ApprovalPending'] || Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['PartiallyApproved']) {
                                $(".status #First-child,.status #Middle-child-1").addClass("Completed");
                                $(".status #Middle-child-2").addClass("Current");
                                DisableTicketProgressBar(".status #Last-child,.status #Middle-child-3", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                            }
                            else if (Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['Approved']) {
                                $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                                $(".status #Middle-child-3").addClass("Current");
                                DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                            }
                            else if (Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['Rejected']) {
                                $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                                DisableTicketProgressBar(".status #Last-child,.status #Middle-child-3", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                            }
                            else if (Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['ProductionReady']) {
                                $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3").addClass("Completed");
                                $(".status #Last-child").addClass("Current");
                                DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                            }
                            else if (Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['SignedOff']) {
                                $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child").addClass("Completed");
                                DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                            }
                            else if (Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['RolledBack']) {
                                $scope.IsEditDisabled = false;
                                $(".status #First-child").addClass("Completed");
                                $(".status #Middle-child-1").addClass("RolledBack");
                                DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #First-child,.status #Middle-child-1");
                            }
                            else if (Tickets.Tickets[0].FinalTicketStatus == Constants.TicketStatus['ProductionChangesScheduled']) {
                                $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                                $(".status #Middle-child-3").addClass("Current");
                                DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");

                            }

                            $scope.TypedApplicationName = Tickets.Applications[0].ApplicationName;
                            $scope.AppName = Tickets.Applications;
                            $scope.GroupName = Tickets.Applications[0].BPU;
                            $scope.SelectedApplications = Tickets.Applications;
                            $scope.Application = Tickets.Applications[0];
                            $scope.ReasonForChange = Tickets.ReasonForChanges;
                            $scope.ChangeReason = $scope.ReasonForChange[0].ReasonForChangeId;
                            $scope.DocModes = Tickets.DocModes;
                            $scope.DocModesModel = $scope.DocModes[0];

                            docmodeid = Tickets.DocModes;
                            $scope.ChangeType = Tickets.ChangeTypes
                            $scope.Changetype = $scope.ChangeType[0];
                            if ($scope.Changetype.ChangeTypeId == Constants.ChangeType['Delete']) {
                                $scope.DocModesModel = null;
                                $scope.ReasonForChange = null;
                                $scope.ChangeReason = null;
                            }
                            if (Tickets.Tickets[0].X_UAMetaTage == true) {
                                $scope.IsVisible = "true";
                            }
                            else if (Tickets.Tickets[0].X_UAMetaTage == false) {
                                $scope.IsVisible = "false";
                            }
                            if (Tickets.Tickets[0].X_UAHonor == true) {
                                $scope.HonorDomain = true;
                            }
                            else if (Tickets.Tickets[0].X_UAHonor == false) {
                                $scope.HonorDomain = false;
                            }
                            if (Tickets.Tickets[0].MultipleX_UA == true) {
                                $scope.IsMultipleTags = "true";
                            }
                            else if (Tickets.Tickets[0].MultipleX_UA == false) {
                                $scope.IsMultipleTags = "false";
                            }
                            $scope.DomainOpenInEdge = Tickets.Tickets[0].DomainOpenInEdge;
                            $scope.XUADetails = Tickets.Tickets[0].X_UAMetaTageDetails;
                            $scope.RequestedBy = Tickets.Tickets[0].RequestedBy.LogOnId;
                            $scope.ChangeDescription = Tickets.Tickets[0].Description;
                            $scope.BusinessImpact = Tickets.Tickets[0].BusinessImpact;
                            $scope.AppURL = Tickets.Tickets[0].AppSiteUrl;

                            if (Tickets.Tickets[0].SubDomainUrl != "" && Tickets.Tickets[0].SubDomainUrl != null) {
                                $scope.isPathIncluded = true;
                                var subdomainDocmode = [];
                                subdomainDocmode.push(Tickets.Tickets[0].SubDomainDocMode);
                                $scope.SubDomainDocModes = subdomainDocmode;
                                $scope.DocModeNameSubURL = $scope.SubDomainDocModes[0];
                                $scope.saveSubdomainDocmode = subdomainDocmode;
                                $scope.siteUrlWithPath = Tickets.Tickets[0].SubDomainUrl;
                                if (Tickets.Tickets[0].SubDomainX_UAHonor == true) {
                                    $scope.HonorSubDomain = true;
                                }
                                else if (Tickets.Tickets[0].SubDomainX_UAHonor == false) {
                                    $scope.HonorSubDomain = false;
                                }
                                if (Tickets.Tickets[0].DomainOpenInEdge == true) {
                                    $scope.IsVisible = "";
                                    //$scope.DisableXUATag = true;
                                    $scope.DomainOpenInEdge = true;
                                }
                                if (Tickets.Tickets[0].SubDomainOpenInEdge == true) {

                                    $scope.SubDomainOpenInEdge = true;
                                }
                            }
                            else {
                                $scope.isPathIncluded = false;
                            }
                        }).error(function (error) {
                            $scope.status = Constants.ErrorTicketRetrieval + error.message;
                        });
                    }
                }
                else {

                    PopulateDropdown();
                }
            }

        };


        //Disable Top Ticket Progress Bar
        function DisableTicketProgressBar(preventParamater, UnbindParameter) {
            $(UnbindParameter).unbind('click').click()
            $(preventParamater).click(function (event) {
                event.preventDefault();
            });
        }


        //Populate Dropdown values according to the loggedin user
        function PopulateDropdown() {
            //Getting data from service
            $scope.IsNewRequest = false;
            $scope.IsOldRequest = true;
            if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                var getData = CRService.GetNewRequestFieldsData($rootScope.User, true);
            }
            else {
                var getData = CRService.GetNewRequestFieldsData($rootScope.User, false);
            }
            $(".status #First-child").addClass("Current");
            DisableTicketProgressBar(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child", "");

            getData.success(function (result) {

                var filterresult = result.Applications.filter(function (item) {
                    return item.BPU !== "";
                });

                //Populating Dropdowns
                $scope.AppName = filterresult;
                $scope.ChangeType = result.ChangeTypes;
                $scope.DocModes = result.DocModes;
                $scope.SubDomainDocModes = result.DocModes;
                $scope.ReasonForChange = result.ReasonForChanges;
                $scope.RequestedBy = $rootScope.User.LogOnId;
                $scope.NewCRDisabled = false;

            })
            .error(function () {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleWentWrong,
                    MethodCase: "OOPS",
                    Type: "error"

                }
                $scope.MESSAGE = Constants.ErrorDataRetrieval;
            });


        }



        //==================================================================
        //  MODAL CONFIRM AND CANCEL CASES
        //=============================================================

        $scope.Confirm = function (cases, object) {
            switch (cases) {
                case "VALIDATION FAILED":
                    isToBeChecked = true;
                    ContinueAfterValidation($scope.AppURL, IsEdit);
                    break;
                case "OPEN REQUEST":
                    isToBeAdded = false;
                    $scope.Reset();
                    $scope.NewCRDisabled = false;
                    $scope.IsSubmitted = false;
                    break;
                case "DOMAIN PRESENT":
                    //continue
                    //Addticket();
                    if (IsEdit) {
                        //$scope.Changetype.ChangeTypeId = null;
                    }
                    else {
                        $scope.Changetype = "";
                    }

                    $scope.NewCRDisabled = false;
                    $scope.IsSubmitted = false;
                    break;
                case "EDIT DOMAIN":
                    Addticket(IsEdit);
                    break;
                case "DELETE DOMAIN":
                    Addticket(IsEdit);
                    break;
                case "NO URL TO EDIT":
                    //Addticket(IsEdit);
                    $scope.Changetype = "";

                    $scope.NewCRDisabled = false;
                    $scope.IsSubmitted = false;
                    break;
                case "NO URL TO DELETE":
                    $scope.Changetype = "";
                    $scope.DisableOnDelete();
                    $scope.NewCRDisabled = false;
                    $scope.IsSubmitted = false;
                    break;
                case "OOPS":
                    $scope.NewCRDisabled = false;
                    $scope.IsSubmitted = false;
                    break;
                case "NAVIGATE":
                    $rootScope.IsNavigated = true;
                    break;
                case "ERROR":
                    $scope.NewCRDisabled = false;
                    break;
                case "PROCEED":
                    //Adding the value of Ticket in a common service , so that is can be used in other
                    //controllers
                    $('#PopUpModal').removeClass("modal-backdrop fade in");
                    ProceedNextPage(object);
                    break;
                case "NULL":
                    break;
                case "ROUTE CHANGE":
                    $scope.NewCRDisabled = false;
                    $location.path("/AllRequests");
                    break;
                case "APP ADDED":
                    ClearNewApplicationModal();
                    break;
            }
        }

        function ProceedNextPage(object) {
            SharedProperties.setProperty(object);
            $scope.NewCRDisabled = false;
            //Status bar add classes
            $(".status #First-child").addClass("Completed");
            $(".status #Middle-child-1").addClass("Current");
            var getdata = LoginService.GetTicketCount($rootScope.User.UserId);
            getdata.success(function (result) {
                $rootScope.TicketCounts = result;
            });
            $location.path("/VerifySandbox");
        }

        $scope.CancelValidation = function (cases) {
            switch (cases) {
                case "VALIDATION FAILED":
                    $scope.AppURL = "http://";
                    CheckPath($scope.AppURL);
                    isToBeChecked = false;
                    $scope.DocModesModel = "";
                    $scope.NewCRDisabled = false;
                    $scope.IsSubmitted = false;
                    break;
                case "EDIT DOMAIN":
                    $scope.IsSubmitted = false;
                    break;
                case "DELETE DOMAIN":
                    $scope.IsSubmitted = false;
                    $scope.NewCRDisabled = false;
                    break;
                case "NO URL TO EDIT":
                    $scope.IsSubmitted = false;
                    $scope.Changetype = "";
                    $scope.NewCRDisabled = false;
                    break;
                case "NAVIGATE":
                    event.preventDefault();
                    $rootScope.IsNavigated = true;
                    break;
            }
        }


        //=================================================================================================================
        //                                  ADD REQEST METHODS
        //=================================================================================================================
        var IsEdit = null;
        $scope.SubmitTicket = function (findURL, ToEdit) {
            IsEdit = ToEdit;
            if ($scope.Application != undefined) {
                if ($scope.form.$valid) {
                    $scope.IsSubmitted = true;
                    PingURL(findURL, IsEdit)
                }
                else {
                    if ($scope.AppURL == "http://" || $scope.AppURL == "https://") {
                        growl.error(Constants.ErrorURLProtocol, { title: Constants.InvalidFields });
                    }
                    else
                        $scope.submitted = true;
                    growl.error(Constants.ErrorEmptyFilds, { title: Constants.TitleEmptyFields });
                }
            }
            else {
                $scope.submitted = true;
                growl.error(Constants.ErrorInvalidApplication, { title: Constants.TitleIncorrectApplication });
            }
        }

        //Edits the ticket which are rolledback
        $scope.EditTicket = function () {
            $scope.IsEdit = true;
            $scope.IsAddAppDisabled = true;
            if ($scope.IsEdit) {
                var getData = CRService.GetNewRequestFieldsData($rootScope.User, false);
                getData.success(function (result) {
                    if ($scope.Changetype.ChangeTypeId == Constants.ChangeType['Delete']) {
                        $scope.DisableDocMode = true;
                        $scope.DisableSubDocMode = true;
                        $scope.DisableXUATag = true;
                        $scope.DisableReasonfrChng = true;
                        $scope.DisableSubDocModeXUAHonor = true;
                        $scope.DomainOpenInEdge = false;
                        $scope.SubDomainOpenInEdge = false;
                        $scope.HonorSubDomain = false;
                        $scope.HonorDomain = false;
                        $scope.IsVisible = "";
                    }

                    $scope.DocModes = result.DocModes;
                    for (var i = 0; i < $scope.DocModes.length; i++) {
                        if ($scope.DocModes[i].DocModeId == docmodeid[0].DocModeId) {
                            $scope.DocModesModel = $scope.DocModes[i];
                        }
                    }

                    $scope.SubDomainDocModes = result.DocModes;
                    for (var i = 0; i < $scope.SubDomainDocModes.length; i++) {
                        if ($scope.saveSubdomainDocmode != null) {
                            if ($scope.SubDomainDocModes[i].DocModeId == $scope.saveSubdomainDocmode[0].DocModeId) {
                                $scope.DocModeNameSubURL = $scope.SubDomainDocModes[i];
                            }
                        }
                    }
                    $scope.ReasonForChange = result.ReasonForChanges;
                })
                    .error(function () {
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleWentWrong,
                            MethodCase: "OOPS"
                        }
                        $scope.MESSAGE = Constants.ErrorDataRetrieval;
                    });
            }
            $scope.IsEditDisabled = true;
            $scope.NewCRDisabled = false;
            $scope.IsSubmitted = false;
            $scope.IsGroupNameDisabled = true;
            $scope.IsApplicationNameDisabled = true;
            $scope.IsSearchButtonDisabled = true;
        }

        //Ping URL and validate URL
        function PingURL(findURL, IsEdit) {
            $scope.NewCRDisabled = true;
            $scope.valid = true;
            isToBeChecked = false;
            if (findURL !== undefined) {
                CRService.apingURL(findURL).success(function (result) {
                    if (result == true || result == 'True') {
                        isToBeChecked = true;
                        ContinueAfterValidation(findURL, IsEdit);
                    }
                    else {
                        $scope.HideCancelModal = false;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleValidationFailed,
                            MethodCase: "VALIDATION FAILED",
                            Type: "warning"
                        }
                        $scope.MESSAGE = Constants.ErrorCouldntReachURL;

                    }
                })
                 .error(function () {
                     $scope.HideCancelModal = true;
                     $('#PopUpModal').modal('toggle');
                     $scope.ALERTCONTENT = {
                         Title: Constants.PopupTitleServerUnavailable,
                         MethodCase: "OOPS",
                         Type: "error"
                     }
                     $scope.MESSAGE = Constants.ErrorUnavailableServer;

                 });

            }
            else {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleEnterProperURL,
                    MethodCase: "NULL",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorURLProtocol;

            }

        }

        //Continue after validating URL
        function ContinueAfterValidation(findURL, IsEdit) {
            isToBeAdded = false;
            if (isToBeChecked) {
                CRService.checkURL(findURL).success(function (result) {
                    if (result == 'True' || result == 'False') {
                        CRService.URLTicketExists(findURL).success(function (exist) {
                            if (exist == true || exist == 'True' || exist != 0) {

                                $scope.HideCancelModal = true;
                                $('#PopUpModal').modal('toggle');
                                $scope.ALERTCONTENT = {
                                    Title: Constants.PopupTitleOpenRequestFound,
                                    MethodCase: "OPEN REQUEST",
                                    Type: "info"
                                }
                                $scope.MESSAGE = Constants.OpenRequestMessage + exist + Constants.SelectExistingRequestMessage;
                            }
                            else {
                                isToBeAdded = true;
                                AddNewRequest(isToBeAdded, IsEdit, result);
                            }

                        }).error(function () {
                            $scope.HideCancelModal = true;
                            $('#PopUpModal').modal('toggle');
                            $scope.ALERTCONTENT = {
                                Title: Constants.PopupTitleWentWrong,
                                MethodCase: "ROUTE CHANGE",
                                Type: "error"
                            }
                            $scope.MESSAGE = Constants.ErrorContactEMIEChamp;

                        });
                    }
                }).error(function () {
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleWentWrong,
                        MethodCase: "OOPS",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.ErrorContactEMIEChamp;
                });
                //$scope.EnableSave = false;
            }
        }

        //Continue After URL Existence Check
        function AddNewRequest(isToBeAdded, IsEdit, result) {
            if (isToBeAdded) {
                //If URL is already present and user selects "ADD in EMIE" as a change type
                if ((result == true || result == 'True') && $scope.Changetype.ChangeTypeId == 1) {

                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleDomainAlreadyPresent,
                        MethodCase: "DOMAIN PRESENT",
                        Type: "info"
                    }
                    $scope.MESSAGE = "Specified domain " + $scope.AppURL + " is already available in EMIE list, Select correct change type";

                }
                    //If URL is already present and user selects "EDIT in EMIE" as a change type
                else if ((result == true || result == 'True') && $scope.Changetype.ChangeTypeId == 3) {
                    $scope.HideCancelModal = false;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleDomainEdited,
                        MethodCase: "EDIT DOMAIN",
                        Type: "info"
                    }
                    $scope.MESSAGE = Constants.DomainUpdationMessage;


                }
                    //If URL is already present and user selects "Delete from EMIE" as a change type
                else if ((result == true || result == 'True') && $scope.Changetype.ChangeTypeId == 2) {
                    $scope.HideCancelModal = false;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleDomainDeleted,
                        MethodCase: "DELETE DOMAIN",
                        Type: "info"
                    }
                    $scope.MESSAGE = Constants.DeleteDomainMessage;

                }
                    //If URL is not present in XML and user selects "EDIT in EMIE" as a change type
                else if ((result == false || result == 'False') && $scope.Changetype.ChangeTypeId == 3) {
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleDomainNotExist,
                        MethodCase: "NO URL TO EDIT",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.DomainNotPresentMessage;

                }
                    //If URL is not present in XML and user selects "Delete from EMIE" as a change type
                else if ((result == false || result == 'False') && $scope.Changetype.ChangeTypeId == 2) {

                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleDomainNotExist,
                        MethodCase: "NO URL TO DELETE",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.DomainNotPresentMessage;
                }
                    //If URL is not present in XML and user selects "ADD in EMIE" as a change type
                else {
                    Addticket(IsEdit);
                }
            }
        }

        //Click on submit and this function will take care of the rest like validation and passing to service.
        function Addticket(IsEdit) {
            //If the field is empty this portion will change it to null
            if ($scope.ChangeDescription == undefined)
                $scope.ChangeDescription = null;
            if ($scope.BusinessImpact == undefined)
                $scope.BusinessImpact = null;
            if ($scope.IsVisible == 'false' || $scope.IsVisible == undefined || $scope.IsVisible == "") {
                $scope.HonorDomain = null;
                $scope.XUADetails = null;
                $scope.IsMultipleTags = null;
            }
            if ($scope.HonorDomain == undefined)
                $scope.HonorDomain = null;
            if ($scope.HonorSubDomain == undefined)
                $scope.HonorSubDomain = false;
            if ($scope.DomainOpenInEdge == undefined)
                $scope.DomainOpenInEdge = false;
            if ($scope.SubDomainOpenInEdge == undefined)
                $scope.SubDomainOpenInEdge = null;
            if ($scope.DocModesModel == null) {
                var docMode = {
                    DocModeID: null,
                    DocModeName: "",
                    IsActive: false
                }
                $scope.DocModesModel = docMode;
            }
            if ($scope.siteUrlWithPath == undefined || $scope.siteUrlWithPath == null || $scope.siteUrlWithPath == "") {
                $scope.siteUrlWithPath = null,
                $scope.DocModeNameSubURL = null,
                $scope.HonorSubDomain = null
            }
            if ($scope.DocModeNameSubURL == null || $scope.DocModeNameSubURL == "") {
                var docMode = {
                    DocModeID: null,
                    DocModeName: "",
                    IsActive: false
                }
                $scope.DocModeNameSubURL = docMode;
            }


            $scope.submitted = true;
            if ($scope.form.$valid) {
                $scope.IsSubmitted = true;
                var Ticket = {
                    TicketId: 0000,
                    Application: {
                        AppId: $scope.Application.AppId,
                        BPUId: $scope.Application.BPUId,
                        ApplicationName: $scope.Application.ApplicationName,
                        BPU: $scope.Application.BPU
                    },
                    RequestedBy: $rootScope.User,

                    Description: $scope.ChangeDescription,
                    ChangeType: $scope.Changetype,
                    ReasonForChange: {
                        ReasonForChangeId: $scope.ChangeReason
                    },
                    BusinessImpact: $scope.BusinessImpact,
                    DocMode: $scope.DocModesModel,
                    X_UAMetaTage: $scope.IsVisible,
                    X_UAHonor: $scope.HonorDomain,
                    X_UAMetaTageDetails: $scope.XUADetails,
                    MultipleX_UA: $scope.IsMultipleTags,

                    AppSiteUrl: $scope.AppURL,
                    DomainOpenInEdge: $scope.DomainOpenInEdge,
                    FinalTicketStatus: Constants.TicketStatus['Initiated'],
                    SandboxFailureComments: '',
                    ProductionSuccessComments: '',
                    ProductionFailureComments: '',
                    SubDomainUrl: $scope.siteUrlWithPath,
                    SubDomainDocMode: $scope.DocModeNameSubURL,
                    SubDomainOpenInEdge: $scope.SubDomainOpenInEdge,
                    SubDomainX_UAHonor: $scope.HonorSubDomain
                };
                if (!IsEdit) {

                    CRService.AddRequest(Ticket, Constants.Operation['Insert']).success(function (SubmittedTicket) {
                        Ticket.TicketId = SubmittedTicket.TicketId;
                        $sessionStorage.TicketIdToShow = Ticket;
                        performTask(Ticket, " submitted");
                    }).error(function (error) {
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleWentWrong,
                            MethodCase: "NULL",
                            Type: "error"

                        }
                        $scope.MESSAGE = Constants.ErrorSubmittingRequest;
                    });
                }
                else {
                    Ticket.TicketId = Tickets.Tickets[0].TicketId;
                    CRService.AddRequest(Ticket, Constants.Operation['Update']).success(function (EditedTicket) {
                        Ticket.TicketId = EditedTicket.TicketId;
                        $sessionStorage.TicketIdToShow = Ticket;
                        performTask(Ticket, " edited");
                    }).error(function (error) {
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleWentWrong,
                            MethodCase: "NULL"
                        }
                        $scope.MESSAGE = Constants.ErrorEditingRequest;
                    });

                }
            }
            else {
                growl.error(Constants.ErrorEmptyFilds, { title: Constants.TitleEmptyFields });
            }

        }

        //After ticket is successfully submitted, show this message
        function performTask(Ticket, Action) {
            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleSuccess,
                MethodCase: "PROCEED",
                Object: Ticket,
                Type: "success"
            }
            $scope.MESSAGE = "You've successfully " + Action + " the request #" + Ticket.TicketId + ". You will receive an email shortly with further details. Please follow the <strong>Steps to validate</strong> section to proceed to the next step.";
        }


        //Gets the application for the selected group name from the dropdown
        $scope.AppListOfSelectedBPU = null;
        $scope.PopulateApplicationName = function () {

            var ApplicationList = [];
            $($scope.AppName).each(function (index, item) {
                if (item.BPU == $scope.GroupName)
                    ApplicationList.push(item);
                var a = null;
            })

            $scope.SelectedApplications = ApplicationList;
            $scope.DisabledApplicationName = false;
            $scope.TypedApplicationName = null;
            $scope.AppListOfSelectedBPU = null;
            $scope.AppListOfSelectedBPUToShow = null;

            if ($scope.GroupName != undefined) {
                CRService.GetAppListOfSelectedBPU($scope.GroupName).success(function (data) {
                    $scope.AppListOfSelectedBPU = data;
                    $scope.AppListOfSelectedBPU.map(function (repo) {
                        repo.value = repo.ApplicationName.toLowerCase();
                    });
                    $scope.AppListOfSelectedBPUToShow = $scope.AppListOfSelectedBPU;
                }).error(function (error) {
                    ErrorMethod();
                });
            }

        }




        //=========================================================================================================================
        //                              RESET AND DISABLE RELATED METHODS
        //=========================================================================================================================

        //Reset the page to the original form
        $scope.Reset = function () {
            $scope.form.$setPristine();

            $scope.GroupName = null;
            $scope.DocModesModel = "";
            $scope.ChangeReason = null;
            $scope.TypedApplicationName = null;
            $scope.ChangeDescription = undefined;
            $scope.Changetype = null;
            $scope.DisableDocMode = false;
            $scope.DisableSubDocMode = false;
            $scope.DisableXUATag = false;
            $scope.DisableReasonfrChng = false;
            $scope.DisabledApplicationName = true;
            $scope.BusinessImpact = '';
            $scope.IsVisible = "";
            $scope.HonorDomain = undefined;
            $scope.HonorSubDomain = undefined;
            $scope.SubDomainUrl = null;
            $scope.XUADetails = "";
            $scope.IsMultipleTags = null;
            $scope.AppURL = "http://";
            $scope.isPathIncluded = false;
            $scope.DocModeNameSubURL = null;
            $scope.siteUrlWithPath = null;
        }

        //Disable DocMode dropdown when "HONOR X-UA" checkBox is selected
        $scope.DisableDocmodeList = function () {

            if ($scope.HonorDomain == true) {
                $scope.DisableDocMode = true;
                for (var i = 0; i < $scope.DocModes.length; i++) {
                    if ($scope.DocModes[i].DocModeName == "Default") {
                        $scope.DocModesModel = $scope.DocModes[i];
                    }
                }
                $scope.DomainOpenInEdge = undefined;
            }
            else if ($scope.HonorDomain == false) {
                $scope.DisableDocMode = false;
                $scope.DocModesModel = "";

            }
        }

        //Disable Subdomain DocMode dropdown when "HONOR X-UA" FOR SUBDOMAIN checkBox is selected
        $scope.DisableSubDomainDocmodeList = function () {

            if ($scope.HonorSubDomain == true) {
                $scope.DisableSubDocMode = true;
                for (var i = 0; i < $scope.DocModes.length; i++) {
                    if ($scope.DocModes[i].DocModeName == "Default") {
                        $scope.DocModeNameSubURL = $scope.DocModes[i];
                    }
                }
                $scope.SubDomainOpenInEdge = undefined;
            }
            else if ($scope.HonorSubDomain == false) {
                $scope.DisableSubDocMode = false;
                $scope.DocModeNameSubURL = "";
            }
        }

        //Disable XUADetails when "OPEN IN EDGE" checkbox is selected - FOR DOMAIN
        $scope.DisableXUADetails = function () {
            if ($scope.DomainOpenInEdge == true) {
                $scope.IsVisible = "false";
                $scope.ChangeRequired();
                $scope.DisableXUATag = true;
            }
            else {
                $scope.DisableXUATag = false;
                $scope.IsVisible = "";
            }
        }

        //Disable "HONOR X-UA" checkbox when "OPEN IN EDGE" checkbox is selected - FOR SUBDOMAIN
        $scope.DisableSubDomainXUAHonor = function () {
            if ($scope.SubDomainOpenInEdge == true) {
                $scope.DisableSubDocModeXUAHonor = true;
            }
            else
                $scope.DisableSubDocModeXUAHonor = false;
        }

        //Show XUA Details according to selected option in "IS APPLICATION PAGES USES AN X-UA TAG?" dropdown
        $scope.ChangeRequired = function () {
            if ($scope.IsVisible == "false") {
                $scope.HonorDomain = undefined;
                $scope.XUADetails = "";
                $scope.IsMultipleTags = null;
                $scope.DisableDocMode = false;
            }
        }

        //Change route to All Request page
        $scope.Cancel = function () {
            SharedProperties.setProperty(Constants.FilterByTicketStatus.InProgress);
            $location.path("/AllRequests");
        }

        //Disbale some inputs on selecting "Delete From EMIE" options
        $scope.DisableOnDelete = function () {
            if ($scope.Changetype.ChangeTypeId == Constants.ChangeType['Delete']) {
                $scope.DisableDocMode = true;
                $scope.DisableSubDocMode = true;
                $scope.DisableXUATag = true;
                $scope.DisableReasonfrChng = true;
                $scope.DisableSubDocModeXUAHonor = true;
                $scope.DomainOpenInEdge = false;
                $scope.SubDomainOpenInEdge = false;
                $scope.HonorSubDomain = false;
                $scope.HonorDomain = false;

                $scope.DocModesModel = null;
                $scope.ChangeReason = null;
                $scope.DocModeNameSubURL = null;

                $scope.IsVisible = "";
                $scope.disableEdge = ["EDGE"];

                angular.forEach($scope.DocModes, function (value, key) {
                    if (value.DocModeName == "EDGE") {
                        value.toggleDocmodeDisable = false;
                    }
                    else
                        value.toggleDocmodeDisable = true;
                })

            }
            else {

                if ($scope.DocModesModel == null || ($scope.DocModesModel.DocModeName != "Default" && $scope.HonorDomain != true)) {
                    $scope.DisableDocMode = false;

                    $scope.DisableXUATag = false;

                    $scope.DisableReasonfrChng = false;

                }
                if ($scope.DocModeNameSubURL == null || ($scope.DocModeNameSubURL.DocModeName != "Default" && $scope.HonorSubDomain != true)) {
                    $scope.DisableSubDocMode = false;
                    $scope.DisableSubDocModeXUAHonor = false;
                }

                angular.forEach($scope.DocModes, function (value, key) {
                    if (value.DocModeName == "EDGE") {
                        value.toggleDocmodeDisable = true;
                    }
                    else
                        value.toggleDocmodeDisable = false;
                })

            }
            CheckPath($scope.AppURL);
        }

        //This is called whenever we need to check if subdomain path is included in URL
        $scope.CheckPathIncluded = function (siteUrl) {
            CheckPath(siteUrl);

        }


        //=========================================================================================================================
        //                          URL VALIDATION METHODS
        //              THESE METHODS WILL VALIDATE AND CHECK URL IF SUBDOMAIN IS PRESENT AND ACCORDINGLY  
        //                      SHOWS AND HIDES SUBDOMAIN INFORMATION FIELDS
        //=========================================================================================================================
        function CheckPath(url) {
            var urlWithoutHttp = trimUrl(url);
            siteUrlwithoutPath = getSiteUrlwithoutPath(urlWithoutHttp);
            siteUrlWithPath = getSiteUrlWithPath(urlWithoutHttp, url);
            $scope.isPathIncluded = PathIncluded(urlWithoutHttp);
            if (!$scope.isPathIncluded) {
                $scope.DomainOpenInEdge = false;
                $scope.SubDomainOpenInEdge = false;
                $scope.DocModeNameSubURL = "";

                if ($scope.IsVisible != "true")
                    $scope.HonorDomain = false;
                else if ($scope.IsVisible == "true")
                    $scope.HonorDomain = true;
                $scope.HonorSubDomain = false;
                $scope.DisableSubDocModeXUAHonor = false;

                if ($scope.Changetype == undefined)
                    $scope.Changetype = null
                if ($scope.Changetype == null || $scope.Changetype.ChangeTypeId != Constants.ChangeType['Delete']) {
                    $scope.DisableDocMode = false;
                    $scope.DisableSubDocMode = false;
                    $scope.DisableXUATag = false;
                }

            }
            else {

                if ($scope.Changetype != undefined && $scope.Changetype.ChangeTypeId == Constants.ChangeType['Delete']) {
                    $scope.DisableSubDocModeXUAHonor = true;
                }
            }
            $scope.siteUrlwithoutPath = siteUrlwithoutPath;
            $scope.siteUrlWithPath = siteUrlWithPath;
        }

        function trimUrl(url) {
            url = url.trim().replace(/^https?\:\/\//i, "");
            var indexOfParameter = url.indexOf("?");
            if (indexOfParameter != -1)
                url = url.substring(0, url.indexOf('?'));
            if (url.charAt(url.length - 1) == "/") {
                url = url.substring(0, url.length - 1);
            }
            return url;
        }

        function getSiteUrlwithoutPath(urlWithoutHttp) {
            var indexOfPath = urlWithoutHttp.indexOf("/");
            var url = urlWithoutHttp;
            if (indexOfPath != -1)
                url = url.substring(0, url.indexOf("/"));
            return url;
        };

        function getSiteUrlWithPath(urlWithoutHttp, siteUrl) {
            var indexOfPath = urlWithoutHttp.indexOf("/");
            var url = urlWithoutHttp;
            if (indexOfPath != -1)
                url = url.substring(url.indexOf("/"), siteUrl.length);
            else
                url = null;
            return url;
        };

        function PathIncluded(urlWithoutHttp) {
            var indexOfPath = urlWithoutHttp.indexOf("/");
            if (indexOfPath != -1 && (indexOfPath + 2) <= urlWithoutHttp.length) {
                return true;
            }
            else return false;
        };


        //=========================================================================================================================
        //                              ROUTE CHANGE RELATED METHODS (COMMENT NEEDED FOR FUTURE REFERENCE)
        //=========================================================================================================================
        //This code will remind you on leaving the page.
        //$scope.$on("$locationChangeStart", function (event, next, current) {
        //    //$modal.destroy();
        //    var currentPage = current.$$route.originalPath;
        //    var nextPage = next.$$route.originalPath;

        //    if (current.$$route.originalPath == "/NewCR") {
        //        if ($scope.form.$dirty) {
        //            var nextPath = next.$$route.originalPath;
        //            if (nextPath != "/VerifySandbox") {
        //                if ((nextPath == "/AllRequests" || nextPath == "/MyRequests")
        //                    && $rootScope.IsNavigated == true) {
        //                    $rootScope.IsNavigated = false; event.preventDefault();
        //                }
        //                else {
        //                    if ($rootScope.IsNavigated == null || $rootScope.IsNavigated == undefined || $rootScope.IsNavigated == false ||
        //                        nextPath == "/User" || nextPath == "/SiteLists" || nextPath == "/Configuration" || nextPath == "/Charts") {

        //                        var modalOptions = {
        //                            closeButtonText: 'Cancel',
        //                            actionButtonText: 'OK',
        //                            headerText: 'Unsaved Changes',
        //                            bodyText: 'You have unsaved changes. Leave the page?'
        //                        };

        //                        modalService.showModal({}, modalOptions).then(function (result) {
        //                            if (result === 'OK') {
        //                                //onRouteChangeOff(); //Stop listening for location changes
        //                                $location.path(nextPage); //Go to page they're interested in
        //                            }

        //                        });

        //                        //prevent navigation by default since we'll handle it
        //                        //once the user selects a dialog option
        //                        event.preventDefault();
        //                        $rootScope.IsNavigated = true;


        //                        //$('#PopUpModal').modal('toggle');
        //                        //$scope.ALERTCONTENT = {
        //                        //    Title: "ARE YOU SURE!!",
        //                        //    MethodCase: "NAVIGATE",
        //                        //    Type: "info"

        //                        //}
        //                        //$scope.MESSAGE = "Are you sure you want to navigate away from this page? All your unsaved changes will be lost.";

        //                        //$('#PopUpModal').modal('show');

        //                        //IsNavigated = confirm("Are you sure you want to navigate away from this page? All your unsaved changes will be lost.");
        //                        //if (!IsNavigated) {
        //                        //    event.preventDefault();
        //                        //}
        //                        //
        //                    }
        //                }
        //            }

        //        }
        //    }
        //});

        //function routeChange(event, newUrl, oldUrl) {

        //    if ($scope.form.$dirty) {
        //        var nextPath = $location.path();
        //        if (nextPath != "/VerifySandbox") {
        //            if ((nextPath == "/AllRequests" || nextPath == "/MyRequests")
        //                && $rootScope.IsNavigated == true) {
        //                $rootScope.IsNavigated = false; event.preventDefault();
        //            }
        //            else {
        //                if ($rootScope.IsNavigated == null || $rootScope.IsNavigated == undefined || $rootScope.IsNavigated == false ||
        //                    nextPath == "/User" || nextPath == "/SiteLists" || nextPath == "/Configuration" || nextPath == "/Charts") {

        //                    event.preventDefault();

        //                    var modalOptions = {
        //                        closeButtonText: 'Cancel',
        //                        actionButtonText: 'OK',
        //                        headerText: 'Unsaved Changes',
        //                        bodyText: 'You have unsaved changes. Leave the page?'
        //                    };

        //                    modalService.showModal({}, modalOptions).then(function (result) {
        //                        if (result === 'OK') {
        //                            onRouteChangeOff(); //Stop listening for location changes
        //                            $location.path(nextPath); //Go to page they're interested in
        //                        }

        //                    });

        //                    $rootScope.IsNavigated = true;

        //                    //event.preventDefault();
        //                    //return;
        //                }
        //            }
        //        }
        //        event.preventDefault();
        //        return;
        //    }

        //}



        //=========================================================================================================================
        //                              ROUTE CHANGE RELATED METHODS
        //=========================================================================================================================

        function routeChange(event, newUrl, oldUrl) {

            if (oldUrl.$$route.originalPath != "/NewCR") return;
            //Navigate to newUrl if the form isn't dirty
            if (!$scope.form || !$scope.form.$dirty) return;

            if (newUrl.$$route.originalPath == "/VerifySandbox") return;

            var nextPath = newUrl.$$route.originalPath;

            if ((nextPath == "/AllRequests" || nextPath == "/MyRequests") && $rootScope.IsNavigated == true) {
                $rootScope.IsNavigated = false; event.preventDefault();
            }
            else {
                if ($rootScope.IsNavigated == null || $rootScope.IsNavigated == undefined || $rootScope.IsNavigated == false ||
                    nextPath == "/User" || nextPath == "/SiteLists" || nextPath == "/Configuration" || nextPath == "/Charts" || nextPath == "/ProductionSites") {

                    var modalOptions = {
                        closeButtonText: 'Cancel',
                        actionButtonText: 'OK',
                        headerText: Constants.PopupTitleAreYouSure,
                        bodyText: Constants.NavigatePageMessage
                    };

                    modalService.showModal({}, modalOptions).then(function (result) {
                        if (result === 'OK') {
                            onRouteChangeOff(); //Stop listening for location changes
                            $location.path(newUrl.$$route.originalPath); //Go to page they're interested in
                        }
                    });

                    $rootScope.IsNavigated = true;
                    //prevent navigation by default since we'll handle it
                    //once the user selects a dialog option
                    event.preventDefault();
                    return;
                }
            }
        }

        //=========================================================================================================================
        //                              SEARCH APPLIACTION RELATED METHODS
        //=========================================================================================================================

        var TempAppListOfSelectedBPUToShow = null;
        $scope.GetApplicationOfAutocompleteText = function (TypedAppName) {

            if (TypedAppName == undefined || TypedAppName == "") {
                $scope.AppListOfSelectedBPUToShowInModel = [];
                $scope.Application = undefined;
                $scope.AppListOfSelectedBPUToShow = [];
                $scope.AppListOfSelectedBPU = [];
                if ($scope.GroupName != undefined) {
                    $scope.AppListOfSelectedBPUToShow = TempAppListOfSelectedBPUToShow;
                }
                //uncomment it to load all application on clear of serach box from model
                // $scope.LoadedApplicationList = $scope.AppListOfSelectedBPU;
            }
            if (TypedAppName && TypedAppName.length > 1) {
                //if GroupName is already selected select application from selected group name
                if ($scope.GroupName != undefined) {
                    CRService.GetAppListOfSelectedBPU($scope.GroupName).success(function (data) {
                        $scope.AppListOfSelectedBPU = data;
                        $scope.AppListOfSelectedBPU.map(function (repo) {
                            repo.value = repo.ApplicationName.toLowerCase();
                        });
                        TempAppListOfSelectedBPUToShow = $scope.AppListOfSelectedBPU;
                    }).error(function (error) {
                        ErrorMethod();

                    });
                    $scope.AppListOfSelectedBPUToShow = $scope.AppListOfSelectedBPU.filter(createFilterFor(TypedAppName));
                    $scope.AppListOfSelectedBPUToShowInModel = $scope.AppListOfSelectedBPU.filter(createFilterFor(TypedAppName));
                    if ($scope.AppListOfSelectedBPUToShow.length == 0) {
                        $scope.Application = undefined;
                    }
                }
                else//select typed application from all groups
                {
                    if ($scope.AppListOfSelectedBPU == null || $scope.AppListOfSelectedBPU == "") {
                        var IsEMIEChamp = false;
                        if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion'])
                            IsEMIEChamp = true;

                        CRService.GetAppListOfAllBPU($rootScope.User, IsEMIEChamp, TypedAppName).success(function (data) {
                            $scope.AppListOfSelectedBPU = data;
                            $scope.AppListOfSelectedBPU.map(function (repo) {
                                repo.value = repo.ApplicationName.toLowerCase();
                            });

                            $scope.AppListOfSelectedBPUToShow = $scope.AppListOfSelectedBPU.filter(createFilterFor(TypedAppName));
                            $scope.AppListOfSelectedBPUToShowInModel = $scope.AppListOfSelectedBPU.filter(createFilterFor(TypedAppName));

                        }).error(function (error) {
                            ErrorMethod();
                        });
                    }
                    else {
                        $scope.AppListOfSelectedBPUToShow = $scope.AppListOfSelectedBPU.filter(createFilterFor(TypedAppName));
                        $scope.AppListOfSelectedBPUToShowInModel = $scope.AppListOfSelectedBPU.filter(createFilterFor(TypedAppName));
                    }
                }
            }
        };

        //When there is Error while processing this method can be called to show the result on popup
        function ErrorMethod() {
            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleWentWrong,
                MethodCase: "ERROR",
                Type: "error"
            }
            $scope.MESSAGE = Constants.ErrorProeccessingRequest;
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

        //
        $scope.searchedApplicationFromDDL = function (app) {
            $scope.TypedApplicationName = app.ApplicationName;
            $scope.Application = app;
            $scope.GroupName = app.BPU;
            CRService.GetAppListOfSelectedBPU($scope.GroupName).success(function (data) {
                $scope.AppListOfSelectedBPU = data;
                $scope.AppListOfSelectedBPU.map(function (repo) {
                    repo.value = repo.ApplicationName.toLowerCase();
                });
            }).error(function (error) {
                ErrorMethod();
            });
        };

        $scope.ModalsearchedApplicationFromDDL = function (app) {
            $scope.ModalTypedApplicationName = app.ApplicationName;
            var array = [];
            array.push(app);
            $scope.LoadedApplicationList = array;

        };

        $scope.LoadAllApplicationsToSearch = function () {
            $scope.ModalTypedApplicationName = null;
            $scope.AppListOfSelectedBPUToShow = null;
            $scope.GroupName = null;
            $scope.TypedApplicationName = null;
            $scope.AppListOfSelectedBPUToShowInModel = [];
            $scope.disableSelectBtn = true;

            var IsEMIEChamp = false;
            if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion'])
                IsEMIEChamp = true;

            CRService.GetAppListOfAllBPU($rootScope.User, IsEMIEChamp, "").success(function (data) {
                $scope.LoadedApplicationList = data;
                $scope.AppListOfSelectedBPU = data;
                $scope.AppListOfSelectedBPU.map(function (repo) {
                    repo.value = repo.ApplicationName.toLowerCase();
                });
            }).error(function (error) {
                ErrorMethod();
            });
        };

        $scope.selectedSerachedApplication = null;

        //get application on checkbox selection from model
        $scope.GetSelectedApplication = function (application) {
            $scope.selectedSerachedApplication = application;
        };

        //bind selected application from model to form
        $scope.BindApplicationNameAndBPU = function () {
            if ($scope.selectedSerachedApplication == undefined || $scope.selectedSerachedApplication == null) {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleAlert,
                    MethodCase: "NULL"
                }
                $scope.MESSAGE = Constants.SelectApplication;
            }
            else {
                $scope.TypedApplicationName = $scope.selectedSerachedApplication.ApplicationName;
                $scope.Application = $scope.selectedSerachedApplication;
                $scope.GroupName = $scope.selectedSerachedApplication.BPU;
            }
        };


        $scope.updateSelection = function (position, entities, LoadedApplicationList, isAppChecked) {
            if (entities.checked == true)
                $scope.disableSelectBtn = false;
            else
                $scope.disableSelectBtn = true;

            angular.forEach(LoadedApplicationList, function (subscription, index) {
                if (entities.AppId != subscription.AppId)
                    subscription.checked = false;
            });
        }

        $scope.IsAscending = false;
        $scope.sortByAppName = function (applist) {
            var PropertyToSort = Constants.SortByApplicationNameOnCRPage;
            requests = CommonFunctionsFactory.sortData($scope, applist, PropertyToSort, $scope.IsAscending);
            if ($scope.IsAscending == true)
                $scope.IsAscending = false;
            else
                $scope.IsAscending = true;
        };

        //-------------------------------------New Application Model---------------------------------------------//

        $scope.ProjectCategoryList = [];
        $scope.AppTypeList = [];
        $scope.ApplicationStateList = [];

        //Populate Add Application dropdown fields
        $scope.PopulateNewApplicationFormFields = function () {
            
            CRService.GetAllBPUOfUser($rootScope.User).success(function (data) {
                $scope.NewAllBPUList = data;
            }).error(function (error) {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleWentWrong,
                    MethodCase: "NULL",
                    Type: "error"

                }
                $scope.MESSAGE = Constants.ErrorProeccessingRequest;
            });

        }

        //Add new application in the database
        $scope.IsActiveApp = true;
        $scope.CreateNewApplication = function () {
            if ($scope.NewApplicationName != null && $scope.NewGroupName != null) {
                var Application =
                {
                    ApplicationName: $scope.NewApplicationName,
                    BPUId: $scope.NewGroupName.BPUId,
                    ApplicationState:{
                        ApplicationStateId:$scope.IsActiveApp,
                    },    
                    User: $rootScope.User
                }
                CRService.AddNewApplication(Application).success(function (data) {
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');

                    if (data == 0) {
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleInfo,
                            MethodCase: "NULL",
                            Type: "Info"
                        }
                        $scope.MESSAGE = Constants.DuplicateApplicationName;
                    }
                    else {
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleSuccess,
                            MethodCase: "APP ADDED",
                            Type: "success"
                        }
                        $scope.MESSAGE = data;
                        $('#NewApplicationModal').modal('hide');
                    }


                }).error(function (error) {
                    ErrorMethod();
                });
            }
            else {
                growl.error(Constants.EnterAllFields, { title: Constants.TitleEmptyFields });

                $('#NewApplicationModal').modal('show');
            }
        }

        //Clear methods
        $scope.ClearFiledsOnClose = function () {
            ClearNewApplicationModal();
        }

        function ClearNewApplicationModal() {
            $scope.NewApplicationName = null;
            $scope.NewGroupName = null;
        }

    }
})
