EMIEModule.controller('ProdChangesController', function ($scope, $route,CommonFunctionsFactory, ProdChangesService,LoginService, ConfigurationService, $filter, Constants, SharedProperties, $sessionStorage, $rootScope, $location, $filter, ConfigConstants, growl) {

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {

        //Status bar add and remove classes
        $(".status li").removeClass("Status-Selected");
        $(".status #Middle-child-3").addClass("Status-Selected");

        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();


        // SSO - If User data is available in localstorage then assign this to rootscope    
        $scope.IsFreezeDateDisplayed = false;
        $scope.SaveProdDisabled = true;
        $scope.RadNowChecked = true;
        $scope.IsRadButtonNowClicked = true;
        $scope.prodDatePickerTextBoxhidden = true;
        $scope.IsSceduleProductionChange = false;
        $scope.IsSceduleProductionChangeClicked = false;
        $scope.IsOldRequest = true;
        var NowProdDate = true;

        if ($sessionStorage.User != null)
            $rootScope.User = $sessionStorage.User;
        getConfigurationFreezeDate();
        Initialize();

        $scope.DisableProdPage = false;


        function SetProductionDatetime(ticket) {
            if (ticket != null) {
                if (ticket.ScheduleDateTimeStart != null && ticket.ScheduleDateTimeEnd != null) {
                    var Startdate = new Date(ticket.ScheduleDateTimeStart);
                    var Enddate = new Date(ticket.ScheduleDateTimeEnd);
                    $scope.datePick = $filter('date')(Startdate, 'MM/dd/yyyy');
                    $scope.timePickStart = Startdate;
                    $scope.timePickEnd = Enddate;
                }
                else {
                    $scope.DisableProdDate = true;
                    var date = new Date();
                    $scope.timePickStart = date;
                    $scope.timePickEnd = date;

                    return $scope.datePick = date;
                }
            }
            else {
                $scope.DisableProdDate = true;
                var date = new Date();
                $scope.timePickStart = date;
                $scope.timePickEnd = date;

                return $scope.datePick = date;
            }

        };


        //This function will get the configures start and end date and then will display it.
        function getConfigurationFreezeDate() {
            ConfigurationService.GetConfigSettings().success(function (Configuration) {
                var EndDate;
                //If config settings not found then return
                if (Configuration != undefined && Configuration != null && Configuration != -1) {

                    var StartDate = new Date($filter('getByKey')(Configuration.ConfigSettings, ConfigConstants.FreezeProductionChangeStartDate).value);
                    $scope.StartDate = $filter('date')(StartDate, 'MM/dd/yyyy');
                    EndDate = new Date($filter('getByKey')(Configuration.ConfigSettings, ConfigConstants.FreezeProductionChangeEndDate).value);
                    $scope.EndDate = $filter('date')(EndDate, 'MM/dd/yyyy');
                }
                var TodaysDate = new Date();
                if (TodaysDate < EndDate) {
                    $scope.IsFreezeDateDisplayed = true;
                }
            }).error(function (error) {
                $scope.status = Constants.ErrorProdcutionFreezeDateRetrieval + error.message;
            });
        }

        function Initialize() {
            // Get the ticket from the shared service
            $scope.Ticket = SharedProperties.getProperty();
            if ($scope.Ticket == "")
                if ($sessionStorage.TicketIdToShow != "") {
                    $scope.Ticket = $sessionStorage.TicketIdToShow;
                }
            // Getting dProdcution data from service
            if ($scope.Ticket != null && $scope.Ticket != "") {
                var approvals = null;
                ProdChangesService.GetTicketData($scope.Ticket.TicketId).success(function (TicketsData) {
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

                    Ticketapprovals = TicketsData;

                    if (Ticketapprovals.FinalTicketStatus < Constants.TicketStatus['ApprovalPending']) {
                        $(".status #First-child").addClass("Completed");
                        $(".status #Middle-child-1").addClass("Current");
                        DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #Middle-child-1,.status #First-child");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ApprovalPending'] && Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['PartiallyApproved']) {
                        $scope.IsCompletePaneDisabled = true;
                        $(".status #First-child,.status #Middle-child-1").addClass("Completed");
                        $(".status #Middle-child-2").addClass("Current");
                        DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['Approved']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        $(".status #Middle-child-3").addClass("Current");
                        DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                        $scope.IsCompletePaneDisabled = false;
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ProductionReady']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3").addClass("Completed");
                        $(".status #Last-child").addClass("Current");
                        DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['Rejected']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        DisableTicketProgressBar(".status #Middle-child-3,.status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['SignedOff']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child").addClass("Completed");
                        DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['RolledBack']) {
                        $(".status #First-child").addClass("Completed");
                        $(".status #Middle-child-1").addClass("RolledBack");
                        DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #First-child,.status #Middle-child-1");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ProductionChangesScheduled']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        $(".status #Middle-child-3").addClass("Current");
                        DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                    }
                    if ($scope.Ticket.value == "NonEditableModeOn" || $route.current.$$route.originalPath == "/ProductionChangePage") {

                        $scope.IsOldRequest = false;
                        $scope.TicketId = $scope.Ticket.TicketId;
                        if (Ticketapprovals.FinalTicketStatus >= Constants.TicketStatus['ProductionReady'] && Ticketapprovals.FinalTicketStatus < Constants.TicketStatus['RolledBack'] || Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ProductionChangesScheduled']) {
                            ProdChangesService.GetProdDateTime($scope.Ticket.TicketId).success(function (TicketsData) {
                                $scope.DisableProdPage = true;
                                $scope.prodDatePicker = true;
                                $scope.prodDatePickerTextBoxhidden = false;
                                var Startdate = getUTCTime(parseInt(TicketsData.ScheduleDateTimeStart.substr(6)));
                                var Enddate = getUTCTime(parseInt(TicketsData.ScheduleDateTimeEnd.substr(6)));
                                $scope.timePickStart = convertUTCDateToLocalDate(Startdate, TicketsData.DateTimeOffset);
                                $scope.timePickEnd = convertUTCDateToLocalDate(Enddate, TicketsData.DateTimeOffset);
                                $scope.datePick = $filter('date')($scope.timePickStart, 'MM/dd/yyyy');
                                $scope.RequestChangeDate = $filter('date')($scope.timePickStart, 'MM/dd/yyyy');
                                $scope.SaveProdDisabled = true;
                                if (Startdate.getTime() == Enddate.getTime() && Startdate.getDate() == Enddate.getDate()) {

                                    //Now check box case
                                    $scope.RadNowChecked = true;
                                    $scope.IsRadButtonNowClicked = true;
                                    $scope.RadLaterChecked = false;
                                    $scope.IsSceduleProductionChange = false;
                                    $scope.IsSceduleProductionChangeClicked = false;
                                }
                                else {
                                    //Scheduled check box case
                                    $scope.RadNowChecked = false;
                                    $scope.RadLaterChecked = true;
                                    $scope.IsRadButtonNowClicked = false;
                                    if (!$scope.Ticket.FinalTicketStatus == Constants.TicketStatus['ProductionReady'])
                                        $scope.IsSceduleProductionChange = true;
                                    $scope.IsSceduleProductionChangeClicked = true;
                                }

                            }).error(function (error) {
                                $scope.status = Constants.UanbleToLoadTicketData+":" + error.message;
                            });
                        }
                        else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['Approved']) {
                            populateDatePicker();
                            $scope.SaveProdDisabled = false;
                        }
                        else {
                            $scope.DisableProdPage = true;
                            $scope.SaveProdDisabled = true;
                            populateDatePicker();
                        }

                    }
                    else {
                        populateDatePicker();
                    }
                }).error(function (error) {
                    ;
                    $scope.status = Constants.UanbleToLoadTicketData +":"+ error.message;
                });
            }
            else {
                populateDatePicker();
            }
        }

        function DisableTicketProgressBar(preventParamater, UnbindParameter) {
            $(UnbindParameter).unbind('click').click()
            $(preventParamater).click(function (event) {
                event.preventDefault();
            });

        }


        //// Handle the click of Success radio button, and display/hide the controls
        $scope.RadNowClicked = function (event) {
            if ($scope.NowProdDate == event.target.value)
                NowProdDate = true;
            $(".uib-decrement").css("display:none !important");
            $(".uib-increment").css("display:none");
            $scope.IsRadButtonNowClicked = true;
            $scope.prodDatePickerTextBoxhidden = true;
            $scope.IsSceduleProductionChangeClicked = false;
            $scope.IsSceduleProductionChange = false;
            $scope.RadNowChecked = true;
            $scope.RadLaterChecked = false;
            $scope.DisableProdDate = true;
            var date = new Date();
            $scope.timePickStart = date;
            $scope.timePickEnd = date;
            return $scope.datePick = date;
        }

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        //// Handle the click of failure radio button, and display/hide the controls
        $scope.RadLaterClicked = function (event) {
            if ($scope.LaterProdDate == event.target.value)
                NowProdDate = false;
            $scope.RadNowChecked = false;
            $scope.IsRadButtonNowClicked = false;
            $scope.prodDatePickerTextBoxhidden = true;
            $scope.IsSceduleProductionChangeClicked = true;
            $scope.RadLaterChecked = true;
            $scope.DisableProdDate = false;
            $scope.datePick = tomorrow;
        }


       
        function populateDatePicker() {
            //DateTime controller related function - Start
            $scope.SaveProdDisabled = false;
            $scope.prodDatePickerTextBoxhidden = true;

            var DatePickerOption = Constants.DateAfterToday;
            CommonFunctionsFactory.DatePicker($scope, DatePickerOption);

            $scope.timePickStart = new Date();
            $scope.timePickEnd = new Date();
            $scope.displayTime = 'n/a';

            $scope.hstep = 1;
            $scope.mstep = 15;

            $scope.options = {
                hstep: [1, 2, 3],
                mstep: [1, 5, 10, 15, 25, 30]
            };


            $scope.ismeridian = true;
            $scope.toggleMode = function () {
                $scope.ismeridian = !$scope.ismeridian;
            };
            //DateTime controller related function - End
            //Set production date time if already set previously else get today's date and time
            SetProductionDatetime($scope.Ticket);
        }



        //Set production date time to today's date time when selected NOW option on UI
        $scope.ProdDateNotNow = function () {
            $scope.DisableProdDate = false;
        }


        //Save production date time for ticket to database
        $scope.SaveProdDatetime = function () {
            $scope.DisableProdPage = true;
            //Get day, month and year of date picker so that selected date can be set in time picker also
            var dd = new Date($scope.datePick).getDate();
            var mm = new Date($scope.datePick).getMonth();
            var yy = new Date($scope.datePick).getFullYear();

            $(".status #First-child").addClass("Completed");
            $(".status #Middle-child-1").addClass("Completed");
            $(".status #Middle-child-2").addClass("Completed");


            //Production changes start datetime 
            var Startdate = $scope.timePickStart;
            Startdate.setYear(yy);
            Startdate.setMonth(mm, dd);

            //Production changes end datetime 
            var EndDate = $scope.timePickEnd;
            EndDate.setYear(yy);
            EndDate.setMonth(mm, dd);

            var IsValidated = true;
            if ($scope.datePick < new Date() && $scope.IsRadButtonNowClicked == false) {
                IsValidated = false;
                $scope.DisableProdPage = false;
                growl.error('Date must be greater than todays date', {
                    title: Constants.InvalidFields
                });
            }
                //Start Date and End Date Validations
            else if (Startdate == EndDate && $scope.IsRadButtonNowClicked == false) {
                IsValidated = false;

                growl.error(Constants.SelectDifferentStartEndTime, { title: Constants.TitleInvalidFields });
                $scope.DisableProdPage = false;
            }
            else {
                if (new Date(Startdate) > new Date(EndDate) && $scope.IsRadButtonNowClicked == false) {
                    IsValidated = false;
                    growl.error(Constants.StartTimeMustBeLessThanEndTime, { title: Constants.TitleInvalidFields });
                    $scope.DisableProdPage = false;
                }
                else {
                    var diff = (new Date(EndDate)).valueOf() - (new Date(Startdate)).valueOf();
                    var diffMins = diff / 1000 / 60; // Convert milliseconds to minutes
                    if (diffMins < 15 && $scope.IsRadButtonNowClicked == false) {
                        IsValidated = false;
                        growl.error(Constants.DifferenceBetweenStartTimeEndTime, { title: Constants.TitleInvalidFields });
                        $scope.DisableProdPage = false;
                    }
                }
            }
            if (IsValidated) {
                //Validate that selected production change date does not fall into freeze production changes date which is specified in config settings (Databas)
                ConfigurationService.GetConfigSettings().success(function (Configuration) {
                    //If config settings not found then return
                    if (Configuration != undefined && Configuration != null && Configuration != -1) {

                        var StartDateOnly = $filter('date')(Startdate, 'MM/dd/yyyy');
                        var EndDateOnly = $filter('date')(EndDate, 'MM/dd/yyyy');

                        var FreezeStartdate = new Date($filter('getByKey')(Configuration.ConfigSettings, ConfigConstants.FreezeProductionChangeStartDate).value);
                        FreezeStartdate = $filter('date')(FreezeStartdate, 'MM/dd/yyyy');
                        var FreezeEnddate = new Date($filter('getByKey')(Configuration.ConfigSettings, ConfigConstants.FreezeProductionChangeEndDate).value);
                        FreezeEnddate = $filter('date')(FreezeEnddate, 'MM/dd/yyyy');


                        //Check if valid production change date is entered 
                        if ((FreezeStartdate <= StartDateOnly && StartDateOnly <= FreezeEnddate) || (FreezeStartdate <= EndDateOnly && EndDateOnly <= FreezeEnddate)) {
                            IsValidated = false;
                            $scope.DisableProdPage = false;

                            $scope.HideCancelModal = true;
                            $('#PopUpModal').modal('toggle');
                            $scope.ALERTCONTENT = {
                                Title: Constants.PopupTitleError,
                                MethodCase: "CONTINUE",
                                Object: {
                                    Validate: IsValidated,
                                    Startdate: Startdate,
                                    EndDate: EndDate
                                },
                                Type: "error"
                            }
                            $scope.MESSAGE = Constants.ProductionChangesCouldNotBeDone;

                        }
                        else {
                            var Object = {
                                IsValidated: IsValidated,
                                Startdate: Startdate,
                                EndDate: EndDate
                            }
                            AfterValidation(Object);
                        }
                    }

                }).error(function (error) {
                    $scope.status = Constants.ErrorProdcutionFreezeDateRetrieval + error.message;
                });
            }
        };

        //Method to call after validation
        function AfterValidation(Object) {
            //If valid change date then save production change date for ticket
            if (Object.IsValidated) {

                $scope.Ticket.ScheduleDateTimeStart = Object.Startdate;
                $scope.Ticket.ScheduleDateTimeEnd = Object.EndDate;



                if (NowProdDate) {
                    $scope.Ticket.FinalTicketStatus = Constants.TicketStatus['ProductionReady'];
                }
                else {
                    $scope.Ticket.FinalTicketStatus = Constants.TicketStatus['ProductionChangesScheduled'];
                }

                var getData = ProdChangesService.SaveProdDateTime($scope.Ticket).success(function (result) {
                    if (result == 'True') {
                        $scope.DisableProdPage = false;
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleSuccess,
                            MethodCase: "PROCEED",
                            Object: NowProdDate,
                            Type: "success"
                        }
                        if (Object.Startdate == Object.EndDate)
                            $scope.MESSAGE = "Change for request #" + $scope.Ticket.TicketId + " is deployed successfully on production site.";
                        else
                            $scope.MESSAGE = "Change for request #"+ $scope.Ticket.TicketId +" is scheduled to deploy on.";
                    }

                }).error(function (error) {
                    $scope.DisableProdPage = false;
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "DISABLE",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.ErrorSettingScheduleForProduction;


                });
            }
        }

        //this is to convert the timezone from UTC to local timezone
        //if server is in another timezone the utc time saved in db is considered as server time and is automatically converted into local time by entity framework
        //the above case is not desirable bcz we need the utc time saved in db the automatic conversion perform by entity framework is undesirable
        //so we need to get the server timezoneoffset and accordingly perform the steps to convert the time back to utc which will be finally converted into the local timezone
        function convertUTCDateToLocalDate(date, offset) {
            var newDate = new Date(date); var localoffset = date.getTimezoneOffset();
            //matching server and local offsets if equal then the 'date' is already in utc so directly it can be converted into local timezone
            if (offset == (-localoffset)) {
                newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                return newDate;
            }
                //if not matching then find the difference b/w local and server offset and deduct it from the date to get actual utc time and then convert
                //it back to the local time
            else {
                newDate.setMinutes(date.getMinutes() - (-offset - localoffset));
                var finaldate = new Date(convertUTCDateToLocalDate(newDate, -date.getTimezoneOffset()));
                return finaldate;
            }
        }

        //converting date string to proper utc string
        function getUTCTime(milliseconds) {
            var baseDate = new Date("1970-01-01");
            var date = new Date(baseDate.getTime() + milliseconds);
            return date;
        }


        //After SAving production
        function ContinueAfterProdSave(NowProdDate) {
            $scope.DisableProdPage = false;
            if (NowProdDate) {

                $(".status #Middle-child-3").removeClass("Current");
                $(".status #Middle-child-3").addClass("Completed");
                $(".status #Last-child").addClass("Current");
                $location.path("/VerifyProduction");
            }
            else {
                $(".status #Middle-child-3").addClass("Current");
                DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                $scope.IsSceduleProductionChange = true;
            }
        }


        //On Click on Confirm on MODAL
        $scope.Confirm = function (cases, object) {
            switch (cases) {
                case "NULL":
                    break;
                case "DISABLE":
                    $scope.DisableProdPage = false;
                    break;
                case "CONTINUE":
                    AfterValidation(object);
                    break;
                case "PROCEED":
                    $('#PopUpModal').modal('toggle');
                    ContinueAfterProdSave(object);
                    $scope.DisableProdPage = true;
                    break;
            }
        }
    }
});
