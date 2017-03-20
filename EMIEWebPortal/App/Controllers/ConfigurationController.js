
EMIEModule.controller('ConfigurationController', function ($scope, $rootScope, Constants, ConfigurationService, CommonFunctionsFactory, LoginService, SharedProperties, $window, Constants, $location, $route, $sessionStorage, $filter, ConfigConstants, userService, growl) {

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    //false-if this page is not accessible other than emie champ role
    if (LoginService.getUserWithRoleAtRedirectionForEMIEChamp(false)) {

        //Local config object to intermediate saving of settings
        var configuration = null;
        $scope.IsGroupHead = false;

        var DatePickerOption = Constants.DateAfterToday;
        CommonFunctionsFactory.DatePicker($scope, DatePickerOption);
        //Populate Configutaion Settings already stored in DB
        PopulateConfigSettings();


        //Populate GroupName
        GetAllBPU();

        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        ///^\\(\\[^\s\\]+)+(\\)?$/
        //$scope.regex = "\^\\(\\[^\s\\]+)+(\\)?$";
        //===========================================================================================================================================================================
        //                                                        CONFIGURATION SETTINGS
        //===========================================================================================================================================================================


        //Validate Sandbox credentials entered by user
        $scope.OkSandboxCredentials = function () {

            if ($scope.SBUserDomain == undefined || $scope.SBUserName == undefined || $scope.SBPassword == undefined) {
                growl.error(Constants.EnterAllFields, { title: Constants.InvalidFields });
            }
            else
                $('#SBModal').modal('toggle');

        };

        //If Credential model screen is cancelled then restore DB values of credentials
        $scope.CancelSandboxCredential = function () {
            if (configuration != null) {
                $scope.SBUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SandboxUserDomain).value;
                $scope.SBUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SandboxUserName).value;
                $scope.SBPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SandboxPassword).value;
            }
            else {
                $scope.SBUserDomain = null;
                $scope.SBUserName = null;
                $scope.SBPassword = null;
            }
        }

        //Validate Production credentials entered by user
        $scope.OkProductionCredentials = function () {

            if ($scope.PDUserDomain == undefined || $scope.PDUserName == undefined || $scope.PDPassword == undefined) {
                growl.error(Constants.EnterAllFields, { title: Constants.InvalidFields });
            }
            else
                $('#PDModal').modal('toggle');


        };

        //If Credential model screen is cancelled then restore DB values of credentials
        $scope.CancelProductionCredential = function () {
            if (configuration != null) {
                $scope.PDUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ProductionUserDomain).value;
                $scope.PDUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ProductionUserName).value;
                $scope.PDPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ProductionPassword).value;
            }
            else {
                $scope.PDUserDomain = null;
                $scope.PDUserName = null;
                $scope.PDPassword = null;
            }
        }


        //On click on OK of Attachment Credential
        $scope.OkAttachmentCredentials = function () {

            if ($scope.ALUserDomain == undefined || $scope.ALUserName == undefined || $scope.ALPassword == undefined) {
                growl.error(Constants.EnterAllFields, { title: Constants.InvalidFields });
            }
            else
                $('#ALModal').modal('toggle');

        };

        //If Credential model screen is cancelled then restore DB values of credentials
        $scope.CancelAttachmentCredentials = function () {
            if (configuration != null) {
                $scope.ALUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentUserDomain).value;
                $scope.ALUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentUserName).value;
                $scope.ALPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentPassword).value;
            }
            else {
                $scope.ALUserDomain = null;
                $scope.ALUserName = null;
                $scope.ALPassword = null;
            }
        }

        //Ok ON COnfiguration Credential
        $scope.OkConfigurationCredentials = function () {
            if ($scope.CSLUserDomain == undefined || $scope.CSLUserName == undefined || $scope.CSLPassword == undefined) {
                growl.error(Constants.EnterAllFields, { title: Constants.InvalidFields });
            }
            else
                $('#CSLModal').modal('toggle');

        };


        //If Credential model screen is cancelled then restore DB values of credentials
        $scope.CancelConfigurationCredentials = function () {
            if (configuration != null) {
                $scope.CSLUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ConfigurationSettingsUserDomain).value;
                $scope.CSLUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ConfigurationSettingsUserName).value;
                $scope.CSLPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ConfigurationSettingsPassword).value;
            }
            else {
                $scope.CSLUserDomain = null;
                $scope.CSLUserName = null;
                $scope.CSLPassword = null;
            }
        }
        //Ok ON EMAIL account Credential
        $scope.SubmitEmailCredentials = function () {
            if ($scope.EmailUserName == "" || $scope.EmailPassword == undefined) {
                growl.error(Constants.EnterAllFields, { title: Constants.InvalidFields });
            }
            if ($scope.EmailUserName == undefined) {
                growl.error(Constants.ErrorInvalidEmail, { title: Constants.InvalidFields });
            }
            else
                $('#EmailModal').modal('toggle');

        };

        //this function will set the date to to start date
        $scope.ChangeDateForEnd = function () {
            $scope.FreezeProductionChangeEndDate = $scope.FreezeProductionChangeStartDate;
        }



        //If Credential model screen is cancelled then restore DB values of credentials
        $scope.CancelEmailCredentials = function () {
            if (configuration != null) {
                $scope.EmailUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.EmailUserName).value;
                $scope.EmailPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.EmailPassword).value;
            }
            else {
                $scope.EmailUserName = null;
                $scope.EmailPassword = null;
            }
        }


        //Validate and Save Configuration Settings into DB
        $scope.Save = function () {
            $scope.isConfigPageDisabled = true;
            //Valiedation
            var loggedinUserId = null;

            if ($rootScope.User == undefined)
                loggedinUserId = null;
            else
                loggedinUserId = $rootScope.User.UserId;

            var IsValidated = true;
            var error = "";

            if ($scope.SandboxEnvironment == null) {
                IsValidated = false;
                error = error + "\n" + Constants.EnterSandboxXMLLocation;
            }

            if ($scope.AttachmentLocation == null) {
                IsValidated = false;
                error = error + "\n" + Constants.EnterAttachmentLocation;
            }

            if ($scope.ConfigurationLocation == null) {
                IsValidated = false;
                error = error + "\n" + Constants.EnterConfigurationFolderLocation;
            }

            if ($scope.SiteURL == null) {
                IsValidated = false;
                error = error + "\n" + Constants.EnterCorrectURL;
            }


            if ($scope.ProductionEnvironment == null) {
                IsValidated = false;
                error = error + "\n" + Constants.EnterProductionXMLLocation;
            }

            //check XMl filename entered in Sandbox environments settings
            if ($scope.SandboxEnvironment != null) {
                var array = [];
                array = $scope.SandboxEnvironment.split('\\');
                var filename = array[array.length - 1];

                filename = filename.toUpperCase();
                var IsFileXML = filename.split('.XML');

                if ((IsFileXML.length == 2 && IsFileXML[0] == "") || (IsFileXML.length != 2) || (IsFileXML.length == 2 && IsFileXML[1] != "")) {
                    IsValidated = false;
                    error = error + "\n" + Constants.ErrorValidSandboxXMLName;
                }
            }


            //check XMl filename entered in Production environments settings
            if ($scope.ProductionEnvironment != null) {
                var array = [];
                array = $scope.ProductionEnvironment.split('\\');
                var filename = array[array.length - 1];

                filename = filename.toUpperCase();
                var IsFileXML = filename.split('.XML');

                if ((IsFileXML.length == 2 && IsFileXML[0] == "") || (IsFileXML.length != 2) || (IsFileXML.length == 2 && IsFileXML[1] != "")) {
                    IsValidated = false;
                    error = error + "\n" + Constants.ErrorValidProductionXMLName;
                }
            }


            ////check XMl filename entered in Sandbox environments settings
            //if ($scope.AttachmentLocation != null) {
            //    var array = [];
            //    array = $scope.AttachmentLocation.split('\\');
            //    var filename = array[array.length - 1];

            //    filename = filename.toUpperCase();
            //    //var IsFileXML = filename.split('.XML');

            //    if ((IsFileXML.length == 2 && IsFileXML[0] == "") || (IsFileXML.length != 2) || (IsFileXML.length == 2 && IsFileXML[1] != "")) {
            //        IsValidated = false;
            //        error = error + "\nEnter valid XML file name in Sandbox Environment.";
            //    }
            //}

            //check ZIP filename entered in Production environments settings
            if ($scope.ConfigurationLocation != null) {
                var array = [];
                array = $scope.ConfigurationLocation.split('\\');
                var filename = array[array.length - 1];

                filename = filename.toUpperCase();
                //var IsFileZIP = filename.split('.ZIP');

                //if ((IsFileZIP.length == 2 && IsFileZIP[0] == "") || (IsFileZIP.length != 2) || (IsFileZIP.length == 2 && IsFileZIP[1] != "")) {
                //    IsValidated = false;
                //    error = error + "\nEnter Zip file name in Configuration Settings Location.";
                //}
            }

            $scope.StartDate = $filter('date')($scope.FreezeProductionChangeStartDate, 'MM/dd/yyyy');
            $scope.EndDate = $filter('date')($scope.FreezeProductionChangeEndDate, 'MM/dd/yyyy');


            if (($scope.StartDate != undefined || $scope.StartDate != null) || ($scope.EndDate != undefined || $scope.EndDate != null)) {
                //Date validations
                var matchDBStartDate = new Date($scope.StartDate);
                var matchDBEndDate = new Date($scope.EndDate)


                if ($scope.freezeProdStartDate != matchDBStartDate && $scope.freezeProdEndDate != matchDBEndDate) {
                    if ($scope.StartDate == null || $scope.StartDate == undefined)
                        error = error + "\nPlease Enter Proper Start Date.\n";
                    else if ($scope.EndDate == null || $scope.EndDate == undefined)
                        error = error + "\nPlease Enter Proper End Date.\n";
                    else if ($scope.FreezeProductionChangeStartDate > $scope.FreezeProductionChangeEndDate)
                        error = error + "\nStart date cannot be greater than end date.";
                    else if ($scope.FreezeProductionChangeStartDate <= new Date() || $scope.FreezeProductionChangeEndDate <= new Date())
                        error = error + "\nFreeze dates should be after today.";
                }
            }


            //If any error in data then show message
            if (error != "") {
                //IsValidated = false;
                $scope.isConfigPageDisabled = false;
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "FAILED",
                    Object: false,
                    Type: "error"
                }
                $scope.MESSAGE = error;
            }
            else {
                ContinueUNCValidation();

            }
        }

        $scope.sandboxUNCstatus = false;
        $scope.productionUNCstatus = false;
        $scope.attachmentUNCstatus = false;
        $scope.configUNCstatus = false;

        $scope.sandboxUNCstatusString = null;
        $scope.productionUNCstatusString = null;
        $scope.attachmentUNCstatusString = null;
        $scope.configUNCstatusString = null;

        function ContinueUNCValidation() {
            var UNCValidation = false
            // create an empty dictionary
            var keyValueData = [];

            //Store Configuration Settings into key-value format
            keyValueData.push({
                key: ConfigConstants.SandboxEnvironment, value: $scope.SandboxEnvironment
            });
            keyValueData.push({
                key: ConfigConstants.SandboxUserName, value: $scope.SBUserName
            });
            keyValueData.push({
                key: ConfigConstants.SandboxPassword, value: $scope.SBPassword
            });
            keyValueData.push({
                key: ConfigConstants.SandboxUserDomain, value: $scope.SBUserDomain
            });

            //Check UNC access for Sandbox XML UNC
            ConfigurationService.CheckUNCAccess(keyValueData).success(function (msg) {
                if (msg == "True") {
                    // create an empty dictionary
                    var keyValueData = [];

                    //Store Configuration Settings into key-value format
                    keyValueData.push({
                        key: ConfigConstants.ProductionEnvironment, value: $scope.ProductionEnvironment
                    });
                    keyValueData.push({
                        key: ConfigConstants.ProductionUserName, value: $scope.PDUserName
                    });
                    keyValueData.push({
                        key: ConfigConstants.ProductionPassword, value: $scope.PDPassword
                    });
                    keyValueData.push({
                        key: ConfigConstants.ProductionUserDomain, value: $scope.PDUserDomain
                    });

                    //Check UNC access for Production XML UNC
                    ConfigurationService.CheckUNCAccess(keyValueData).success(function (msg) {
                        if (msg == "True") { // create an empty dictionary
                            var keyValueData = [];

                            //Store Configuration Settings into key-value format
                            keyValueData.push({
                                key: ConfigConstants.UploadAttachmentsLocation, value: $scope.AttachmentLocation
                            });
                            keyValueData.push({
                                key: ConfigConstants.UploadAttachmentUserDomain, value: $scope.ALUserDomain
                            });
                            keyValueData.push({
                                key: ConfigConstants.UploadAttachmentUserName, value: $scope.ALUserName
                            });
                            keyValueData.push({
                                key: ConfigConstants.UploadAttachmentPassword, value: $scope.ALPassword
                            });

                            //Check UNC access for Attacment Location UNC
                            ConfigurationService.CheckUNCAccess(keyValueData).success(function (msg) {
                                if (msg == "True") {
                                    // create an empty dictionary
                                    var keyValueData = [];

                                    //Store Configuration Settings into key-value format
                                    keyValueData.push({
                                        key: ConfigConstants.ConfigurationSettingsLocation, value: $scope.ConfigurationLocation
                                    });
                                    keyValueData.push({
                                        key: ConfigConstants.ConfigurationSettingsUserDomain, value: $scope.CSLUserDomain
                                    });
                                    keyValueData.push({
                                        key: ConfigConstants.ConfigurationSettingsUserName, value: $scope.CSLUserName
                                    });
                                    keyValueData.push({
                                        key: ConfigConstants.ConfigurationSettingsPassword, value: $scope.CSLPassword
                                    });

                                    //Check UNC access for Config settings UNC
                                    ConfigurationService.CheckUNCAccess(keyValueData).success(function (msg) {
                                        if (msg == "True") {
                                            UNCValidation = true;
                                            if (UNCValidation) {
                                                //Since All validation is true, save configuration                                            
                                                $scope.isConfigPageDisabled = true;
                                                SaveConfigurationDetails(true);
                                            }
                                        }
                                        else {
                                            $scope.isConfigPageDisabled = false;
                                            $scope.HideCancelModal = true;
                                            $('#PopUpModal').modal('toggle');
                                            $scope.ALERTCONTENT = {
                                                Title: Constants.PopupTitleError,
                                                MethodCase: "FAILED",
                                                Type: "error"
                                            }
                                            $scope.MESSAGE = Constants.UnableToAccessConfigSettingPath;
                                        }
                                    }).error(function (msg) {
                                        $scope.configUNCstatusString = Constants.ErrorSettingConfigData;
                                    });
                                }
                                else {
                                    $scope.isConfigPageDisabled = false;
                                    $scope.HideCancelModal = true;
                                    $('#PopUpModal').modal('toggle');
                                    $scope.ALERTCONTENT = {
                                        Title: Constants.PopupTitleError,
                                        MethodCase: "FAILED",
                                        Type: "error"
                                    }
                                    $scope.MESSAGE = Constants.UnableToAccessAttachmentPath;
                                }
                            }).error(function (msg) {
                                $scope.attachmentUNCstatusString = Constants.ErrorSettingConfigData;
                            });
                        }
                        else {
                            $scope.isConfigPageDisabled = false;
                            $scope.HideCancelModal = true;
                            $('#PopUpModal').modal('toggle');
                            $scope.ALERTCONTENT = {
                                Title: Constants.PopupTitleError,
                                MethodCase: "FAILED",
                                Type: "error"
                            }
                            $scope.MESSAGE = Constants.UnableToAccessProductionXMLPath;
                        }
                    }).error(function (msg) {
                        $scope.productionUNCstatusString = Constants.ErrorSettingConfigData;
                    });
                }
                else {
                    $scope.isConfigPageDisabled = false;
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "FAILED",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.UnableToAccessSandboxXMLPath;
                }
            }).error(function (msg) {
                return Constants.ErrorSettingConfigData;
            });
        }



        //Save Configuration Settings
        function SaveConfigurationDetails(IsValidated) {
            $scope.submitted = true;


            //If validated 
            if ($scope.form.$valid && IsValidated) {

                // create an empty dictionary
                var keyValueData = [];

                //Store Configuration Settings into key-value format
                keyValueData.push({
                    key: ConfigConstants.SandboxEnvironment, value: $scope.SandboxEnvironment
                });
                keyValueData.push({
                    key: ConfigConstants.SandboxUserName, value: $scope.SBUserName
                });
                keyValueData.push({
                    key: ConfigConstants.SandboxPassword, value: $scope.SBPassword
                });
                keyValueData.push({
                    key: ConfigConstants.SandboxUserDomain, value: $scope.SBUserDomain
                });


                keyValueData.push({
                    key: ConfigConstants.ProductionEnvironment, value: $scope.ProductionEnvironment
                });
                keyValueData.push({
                    key: ConfigConstants.ProductionUserName, value: $scope.PDUserName
                });
                keyValueData.push({
                    key: ConfigConstants.ProductionPassword, value: $scope.PDPassword
                });
                keyValueData.push({
                    key: ConfigConstants.ProductionUserDomain, value: $scope.PDUserDomain
                });

                keyValueData.push({
                    key: ConfigConstants.FreezeProductionChangeStartDate, value: $scope.StartDate
                });
                keyValueData.push({
                    key: ConfigConstants.FreezeProductionChangeEndDate, value: $scope.EndDate
                });

                keyValueData.push({
                    key: ConfigConstants.UploadAttachmentsLocation, value: $scope.AttachmentLocation
                });
                keyValueData.push({
                    key: ConfigConstants.UploadAttachmentUserDomain, value: $scope.ALUserDomain
                });
                keyValueData.push({
                    key: ConfigConstants.UploadAttachmentUserName, value: $scope.ALUserName
                });
                keyValueData.push({
                    key: ConfigConstants.UploadAttachmentPassword, value: $scope.ALPassword
                });


                keyValueData.push({
                    key: ConfigConstants.ConfigurationSettingsLocation, value: $scope.ConfigurationLocation
                });
                keyValueData.push({
                    key: ConfigConstants.ConfigurationSettingsUserDomain, value: $scope.CSLUserDomain
                });
                keyValueData.push({
                    key: ConfigConstants.ConfigurationSettingsUserName, value: $scope.CSLUserName
                });
                keyValueData.push({
                    key: ConfigConstants.ConfigurationSettingsPassword, value: $scope.CSLPassword
                });


                keyValueData.push({
                    key: ConfigConstants.SiteDomainName, value: $scope.SiteURL
                });
                keyValueData.push({
                    key: ConfigConstants.EmailUserName, value: $scope.EmailUserName
                });
                keyValueData.push({
                    key: ConfigConstants.EmailPassword, value: $scope.EmailPassword
                });


                //Sending config settings as key-value pair to DB
                ConfigurationService.AddConfigurationSetting(keyValueData, $rootScope.User).success(function (msg) {
                    $scope.isConfigPageDisabled = false;
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleSuccess,
                        MethodCase: "SUCCESS",
                        Type: "success"
                    }
                    $scope.MESSAGE = Constants.ConfigSettingsSaved;

                }).error(function (msg) {
                    $scope.isConfigPageDisabled = false;
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "ERROR",
                        Type: "error"

                    };
                    $scope.MESSAGE = Constants.ErrorSettingConfigData;
                });
            }
            else {
                $scope.isConfigPageDisabled = false;
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "ERROR",
                    Type: "error"

                };
                $scope.MESSAGE = Constants.EnterAllFields;
            }
        }


        //This function is called whenever Group Details modal will be closed
        $("#myModal").on("hidden.bs.modal", function () {
            $scope.submitted = true;
        });


        //On CLick on Confirm on MODAL
        $scope.Confirm = function (cases, object) {
            switch (cases) {
                case "FAILED":
                    $scope.isConfigPageDisabled = false;
                    //Not Required Now, but needed for testing some scenario.
                    //SaveConfigurationDetails(object);
                    break;
                case "ERROR":
                    $scope.isConfigPageDisabled = false;
                    break;
                case "SUCCESS":
                    $scope.isConfigPageDisabled = false;
                    break;
                case "EDITED":
                    GetAllBPU();
                    $('#myModal').modal('hide');
                    break;

            }
        }


        //Populate Configuration settings already stored in DB
        function PopulateConfigSettings() {
            $scope.isConfigPageDisabled = true;
            //Get config settings
            ConfigurationService.GetConfigSettings().success(function (Configuration) {
                $scope.isConfigPageDisabled = false;
                //If config settings not found then return
                if (Configuration == undefined || Configuration == null || Configuration == -1) {
                    var pathname = window.location.pathname;
                    var host = window.location.href;
                    $scope.SiteURL = window.location.host;
                    return;
                }

                //Assign Configuration data to local config object so that it could be used when user clicks cancel on UI after modfing settings on UI
                configuration = Configuration;

                //Get configuration setting's values using keys
                $scope.SandboxEnvironment = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SandboxEnvironment).value;
                $scope.ProductionEnvironment = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ProductionEnvironment).value;
                $scope.SBUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SandboxUserDomain).value;
                $scope.SBUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SandboxUserName).value;
                $scope.SBPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SandboxPassword).value;
                $scope.PDUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ProductionUserDomain).value;
                $scope.PDUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ProductionUserName).value;
                $scope.PDPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ProductionPassword).value;

                $scope.AttachmentLocation = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentsLocation).value;
                //$scope.AttachmentLocation = (AttachmentLocation == null) ? "" : $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentsLocation).value;

                $scope.ALUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentUserDomain).value;
                $scope.ALUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentUserName).value;
                $scope.ALPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.UploadAttachmentPassword).value;

                $scope.ConfigurationLocation = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ConfigurationSettingsLocation).value;
                $scope.CSLUserDomain = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ConfigurationSettingsUserDomain).value;
                $scope.CSLUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ConfigurationSettingsUserName).value;
                $scope.CSLPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.ConfigurationSettingsPassword).value;

                $scope.SiteURL = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.SiteDomainName).value;

                $scope.EmailUserName = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.EmailUserName).value;
                $scope.EmailPassword = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.EmailPassword).value;

                //check if start date is null or not and populate if not null
                var checkStartDate = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.FreezeProductionChangeStartDate).value;
                var checkEndDate = $filter('getByKey')(configuration.ConfigSettings, ConfigConstants.FreezeProductionChangeEndDate).value;
                $scope.freezeProdStartDate = new Date(checkStartDate);
                $scope.freezeProdEndDate = new Date(checkEndDate);

                if ($scope.freezeProdStartDate < new Date() && $scope.freezeProdEndDate < new Date()) {
                    $scope.freezeProdStartDate = null;
                    $scope.freezeProdEndDate = null;
                    $scope.FreezeProductionChangeStartDate = null;
                    $scope.FreezeProductionChangeEndDate = null;
                }
                else {
                    if (checkStartDate != null)
                        var Startdate = new Date(checkStartDate);
                    $scope.FreezeProductionChangeStartDate = Startdate;

                    if (checkEndDate != null)
                        var Enddate = new Date(checkEndDate);
                    $scope.FreezeProductionChangeEndDate = Enddate;
                }


            }).error(function (error) {
                $scope.isConfigPageDisabled = false;
                $scope.status = Constants.ErrorGettingConfigData + error.message;
            });

        }



        //===========================================================================================================================================================================
        //                                                        GROUP NAME ADD AND EDIT
        //===========================================================================================================================================================================


        $scope.TempListToBind = [];
        var isServiceCalled = false;
        $scope.IsSearching = false;


        //method to search user from AD using alias or email
        $scope.GetUserEmailText = function (serachUserName) {

            var tempSearchUserId = $scope.NewUserEmail;
            $scope.SaveBtnDisable = true;

            if (serachUserName == undefined || serachUserName == null) {
                $scope.searcheduserlist = [];
                $scope.TempListToBind = [];
                $scope.IsSearching = false;
            }
            if (serachUserName && serachUserName.length > 2) {
                if ($scope.TempListToBind.length > 0) {
                    $scope.IsSearching = true;
                    $scope.searcheduserlist = $scope.TempListToBind.filter(createFilterForADUsers(serachUserName));
                    if ($scope.searcheduserlist.length >= 0)
                        $scope.IsSearching = false;
                }
                else if ($scope.IsSearching && $scope.searcheduserlist && $scope.searcheduserlist.length <= 0) {
                    //do nothing till search is going on for first 3 letters,this is to avoid repeatative search
                    $scope.IsSearching = true;
                }
                else {
                    $scope.IsSearching = true;
                    $scope.NewUserName = null;
                    $scope.NewUserName = null;
                    $scope.searcheduserlist = null;
                    userService.getAllADUsers(serachUserName).success(function (data) {
                        var result = data;
                        if (typeof result == 'string') {
                            //if (serachUserName==$scope.NewUserEmail)
                            //alert(result);
                            $scope.IsSearching = false;
                            $scope.searcheduserlist = [];
                        }
                        else {
                            $scope.ADUserList = result;
                            $scope.searcheduserlist = result;
                            $scope.TempListToBind = result;
                            $scope.TempListToBind.map(function (itemBInd) {
                                itemBInd.value = itemBInd.DisplayName.toLowerCase() + " " + itemBInd.Email.toLowerCase();
                            });

                            $scope.searcheduserlist = $scope.TempListToBind.filter(createFilterForADUsers($scope.NewUserEmail));

                            if ($scope.searcheduserlist.length >= 0)
                                $scope.IsSearching = false;
                        }

                        $(".glyphicon-search").dropdown('toggle');
                        $scope.isUserPageDisabled = false;
                    }).error(function (error) {
                        $scope.isConfigPageDisabled = false;
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleError,
                            MethodCase: "ERROR",
                            Type: "error"
                        }
                        $scope.MESSAGE = Constants.ErrorSearchADUser;
                    });
                }
            }
        };

        /**
        * Create filter function for a query string
        */
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(item) {
                return (item.value.indexOf(lowercaseQuery) != -1);
            };
        }
        /**
             * Create filter function for active directory users a query string
             */
        function createFilterForADUsers(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(item) {
                var index = item.value.indexOf(lowercaseQuery)
                if (index >= 0)
                    return true;
                // return (item.value.indexOf(lowercaseQuery) === 0);
            };
        }


        //method called on opening modal for ADD GROUP NAME
        $scope.OpenGroupDetail = function () {
            $scope.Editsubmitted = false;
            $scope.Addsubmitted = false;
            $scope.IsActive = true;
            $scope.submitted = false;
        }


        //method to select user from dropdown 
        $scope.searchedUserFromDDL = function (user) {
            $scope.NewUserName = user.DisplayName;
            $scope.NewUserEmail = user.Email;
            $scope.SaveBtnDisable = false;
        }



        //method call on Cancel button on ADD GROUP NAME
        $scope.CancelFields = function () {
            $scope.NewGroupName = null;
            $scope.NewUserEmail = null;
            $scope.NoResultText = null;
            $scope.NewUserName = null;

            $scope.GroupName = "";
            $scope.EditNewUserName = null;
            $scope.EditNewGroupName = null;
            $scope.EditNewUserEmail = null;
        }


        //empty object for storing tab related info
        $scope.tab = {
        };


        //Determines which tab is active
        $('.nav-tabs a').on('shown.bs.tab', function (event) {
            $scope.tab.activeTab = event.target.id;         // active tab
            $scope.tab.inActiveTab = event.relatedTarget.id;  // previous tab
        });

        //Save or Edit New Group Name
        $scope.SaveNewGroupName = function () {
            $scope.submitted = false;
            if ($scope.tab.activeTab == undefined || $scope.tab.activeTab == "AddGroup") {
                $scope.Addsubmitted = true;
                if ($scope.NewUserName != undefined || $scope.NewUserName != null) {
                    if ($scope.form.$valid) {
                        if ($rootScope.User == undefined)
                            loggedinUserId = null;
                        else
                            loggedinUserId = $rootScope.User.UserId;

                        var UserRole = {
                            User: {
                                UserName: $scope.NewUserName,
                                UserBPU: {
                                    BPU1: $scope.NewGroupName,
                                    IsActive: $scope.IsActive,
                                    CreatedById: loggedinUserId,
                                },
                                Email: $scope.NewUserEmail,
                                LogOnId: $scope.NewUserEmail,
                                CreatedById: loggedinUserId,
                            },
                            IsActive: false,
                            MappingDetails: $scope.Comments,
                            IsRegistered: null
                        }

                        ConfigurationService.AddNewGroup(UserRole, Constants.Operation['Insert']).success(function (result) {
                            $scope.NewGroupName = null;
                            $scope.NewUserEmail = null;
                            $scope.NewUserName = null;
                            $scope.IsActive = undefined;
                            if (result == true || result == "True") {
                                //$("#myModal").modal('toggle');
                                //growl.success('New group has been successfully added', {
                                //    title: 'Success!!'
                                //});
                                //alert("Group Edited");
                                $scope.isConfigPageDisabled = false;
                                $scope.HideCancelModal = true;
                                $('#PopUpModal').modal('toggle');
                                $scope.ALERTCONTENT = {
                                    Title: Constants.PopupTitleSuccess,
                                    MethodCase: "EDITED",
                                    Type: "success"
                                }
                                $scope.MESSAGE = Constants.NewGroupAdded;

                            }
                            else {
                                $scope.isConfigPageDisabled = false;
                                $scope.HideCancelModal = true;
                                $('#PopUpModal').modal('toggle');
                                $scope.ALERTCONTENT = {
                                    Title: Constants.PopupTitleAlreadyExist,
                                    MethodCase: "EXIST",
                                    Type: "warning"
                                }
                                $scope.MESSAGE = Constants.DuplicateGroupName;
                            }
                        });
                    }
                }
                else {
                    growl.error(Constants.EnterValidGroupHead, { title: Constants.TitleInvalidUser });
                }
            }
            else
                EditGroup();
        }


        //method for editing the group details
        function EditGroup() {
            $scope.Editsubmitted = true;
            if ($scope.form.$valid) {
                if ($rootScope.User == undefined)
                    loggedinUserId = null;
                else
                    loggedinUserId = $rootScope.User.UserId;

                if ($scope.EditNewGroupName == undefined)
                    $scope.EditNewGroupName = null;


                var UserRole = {
                    User: {
                        UserName: $scope.NewUserName,
                        BPUId: $scope.GroupID,
                        UserBPU: {
                            BPUId: $scope.GroupName.BPUId,
                            BPU1: $scope.EditNewGroupName,
                            IsActive: $scope.EditIsActive,
                            ModifiedById: loggedinUserId
                        },
                        Email: $scope.NewUserEmail,
                        LogOnId: $scope.NewUserEmail,
                        ModifiedById: loggedinUserId,
                    },
                    IsActive: false,
                    IsRegistered: null
                }

                ConfigurationService.EditGroup(UserRole).success(function (result) {
                    $scope.GroupName = "";
                    $scope.EditNewGroupName = "";
                    $scope.EditIsActive = false;
                    $scope.Editsubmitted = false;
                    if (result == true || result == "True") {
                        //$("#myModal").modal('toggle');
                        //growl.success('Group details have been successfully edited', {
                        //    title: 'Success!!'
                        //});
                        //alert("Group Edited");
                        $scope.isConfigPageDisabled = false;
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleSuccess,
                            MethodCase: "EDITED",
                            Type: "success"
                        }
                        $scope.MESSAGE = Constants.GroupDetailsEdited;

                    }
                    else {
                        $scope.isConfigPageDisabled = false;
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleAlreadyExist,
                            MethodCase: "EXIST",
                            Type: "warning"
                        }
                        $scope.MESSAGE = Constants.DuplicateGroupName;
                    }
                });
            }

        }

        //method call the service to fetch all BPUs
        function GetAllBPU() {
            ConfigurationService.getAllGroupList().success(function (data) {

                data.sort(function (a, b) {
                    return (a.BPU1.localeCompare(b.BPU1))
                });
                $scope.groupNameList = data;

                //to disable "All" option from DDL
                angular.forEach($scope.groupNameList, function (value, key) {
                    if (value.BPUId == 0) {
                        value.AllBPUDiabled = true;
                    }
                    else
                        value.AllBPUDiabled = false;
                })
            }).error(function (error) {
                $scope.isConfigPageDisabled = false;
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "ERROR",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorGroupData;
            });
        };

        GetRoles();
        //Getting the role from the database
        function GetRoles() {
            var RoleList = [];
            ConfigurationService.GetRoles().success(function (data) {
                var result = data;
                angular.forEach(result, function (value, key) {
                    var role = {
                        RoleId: "", RoleName: "", MandatoryApproval: ""
                    };
                    role.RoleId = value.RoleId,
                    role.RoleName = value.RoleName,
                    role.MandatoryApproval = value.MandatoryApproval
                    RoleList.push(role);
                })

            })
            $scope.RoleList = RoleList;
        }

        //Setting the older RoleName in the modal textbox which will be disabled
        $scope.SetRoleName = function (roleName, IsMandatory) {
            $scope.RoleName = roleName;
            $scope.IsMandatory = IsMandatory;
        }

        //Calling the service method to Edit the RoleName 
        $scope.EditRoleName = function (IsMandatory) {
            IsMandatory = IsMandatory == undefined ? false : IsMandatory;
            var getdata = ConfigurationService.EditRoleName($scope.NewRoleName, $scope.RoleName, IsMandatory);
            getdata.success(function () {
                $route.reload();
            }).error(function () {
                alert(Constants.ErrorGettingRoleName);
            })
        }

        //this code is commented for now but might be of use in future
        //Setting the mandatory Roles
        //$scope.updateMandatoryRoles = function (role) {
        //    ConfigurationService.updateMandatoryRoles(role);
        //}

        //method will get the group head info for particular group selected
        $scope.GetGroupHead = function () {

            if ($scope.GroupName != undefined) {
                ConfigurationService.GetGroupHead($scope.GroupName).success(function (data) {
                    if (data != "" && data.UserName) {
                        $scope.EditNewUserName = data.UserName;
                        $scope.EditNewUserEmail = data.EmailId;
                        $scope.EditIsActive = data.IsActive;
                        $scope.IsGroupHead = false;
                    }
                    else {
                        $scope.IsGroupHead = true;
                        $scope.EditIsActive = data.IsActive;
                    }
                })
            }
            else {
                $scope.EditIsActive = false;
            }
        }


    }
});

