EMIEModule.controller("MyApprovalController", function ($scope, LoginService,CommonFunctionsFactory, approvalService, SharedProperties, Constants, $rootScope, $sessionStorage, $location, growl) {

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {


        //check config settings are set or not ,else redirect to config page
        if($sessionStorage.User.UserRole.RoleId == Constants.RoleId['EMIEChampion'])
        GetConfigurationAtStart();

        $scope.NoPendingRequets = Constants.NoTicketPending;
        $scope.RetrievalProgress = Constants.TicketRetrievalProgress;
        //Hide MOdal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        $scope.isMyrequestsDisabled = true;
        //Declaring the ticket list globally
        $scope.SelectedList = [];
        //Property to disable/enable approe & reject button 
        $scope.User = null;
        $scope.IsControlDisabled = true;
        $scope.DisplayWaitMessage = true;
        $scope.ShowApproveButton = false;
        $scope.ShowRejectButton = false;
        $scope.HideTitle = true;
        $scope.Title = Constants.Approvals.My;
        var decreasingOrder = false;


        //This function will fetch the list of tickets which are pending for approval
        GetPendingApprovalsByTickets();
        $scope.IsCheckboxClicked = false;
        //this function will add the tickets to the list which will be sent for for approval
        $scope.CheckedTicketid = function (ticket) {
            $scope.checkedTicketId = null;
            var index = $scope.SelectedList.indexOf(ticket);

            if (index !== -1) {
                $scope.checkedTicketId = ticket;
                $scope.SelectedList.splice(index, 1);
            }
            else {
                $scope.IsCheckboxClicked = true;
                $scope.checkedTicketId = ticket;
                $scope.SelectedList.push(ticket);
            }
            if ($scope.SelectedList.length != 0) {
                $scope.IsDisabled = true;
                $scope.IsControlDisabled = false;
            }
            else {
                $scope.IsDisabled = false;
                $scope.IsControlDisabled = true;
            }

        }
        //select the all approvers of the same ticket
        $scope.IsDoubleApprover = function (checkedTicketId) {
            if ($scope.IsCheckboxClicked == true) {
                if ($scope.SelectedList.indexOf(checkedTicketId) > -1)
                    return true;
                else
                    return false;
            }
        }
        //This function will get the pending approvals for the loggedIn users
        function GetPendingApprovalsByTickets() {
            var IsAllRequest = $sessionStorage.IsAllRequest == true ? true : false;
            if (IsAllRequest) {
                $scope.Title = Constants.Approvals.All;
            }
            approvalService.GetPendingApproverList($rootScope.User, IsAllRequest).success(function (approvedTickets) {
                $scope.Tickets = approvedTickets;

                $scope.OriginalAllRequests = $scope.Tickets;

                $scope.User = $rootScope.User.UserId;
                if ($scope.Tickets.length == 0) {
                    $scope.NoPendinglist = true
                    $scope.ShowApproveButton = false;
                    $scope.ShowRejectButton = false;
                    $scope.DisplayWaitMessage = false;
                    $scope.HideTitle = true;
                }
                else {
                    $scope.HideTitle = false;
                    $scope.ApprovalStateEnum = Constants.ApprovalState;
                    $scope.DisplayWaitMessage = false;
                    $scope.ShowApproveButton = true;
                    $scope.ShowRejectButton = true;
                    //Sorting the data - True= will sort by ticket id
                    var PropertyToSort = Constants.SortByTicketID;
                    var isCompareValueInt = true;
                    //Sorting the data - True= will sort by ticket id
                    SortData($scope.Tickets, PropertyToSort, isCompareValueInt);
                }
                $scope.isMyrequestsDisabled = false;
            }).error(function (error) {
                $scope.isMyrequestsDisabled = false;
                $scope.status = Constants.ErrorPendingApprovalRetrieval + error.message;
            });
        }

        //sorting on Application Name click
        $scope.SortByName = function (Tickets) {
            //Sorting the data -false = will sort by application name
            var PropertyToSort = Constants.SortByApplicationName;
            var isCompareValueInt = false;
            SortData(Tickets, PropertyToSort, isCompareValueInt);
        }

        //common function to sort data
        //Tickets-data to be sorted,PropertyToSort-object property to sort,isCompareValueInt-true if the compare data is in integer value
        function SortData(Tickets, PropertyToSort, isCompareValueInt) {
            Tickets = CommonFunctionsFactory.sortData($scope, Tickets, PropertyToSort, decreasingOrder, isCompareValueInt);
            if (decreasingOrder == true)
                decreasingOrder = false;
            else
                decreasingOrder = true;
        }

        //sorting on Id Column click
        $scope.SortById = function (Tickets) {
            var PropertyToSort = Constants.SortByTicketID;
            var isCompareValueInt = true;
            //Sorting the data - True= will sort by ticket id
            SortData(Tickets, PropertyToSort, isCompareValueInt);
        }

        var toggle = true;
        //Expand-Collapse all panels
        $scope.ToggleAllPanels = function () {
            if (($('.approvalPendingPanels').hasClass("collapse")) && toggle == true) {
                $('.approvalPendingPanels').removeClass("collapse");
                $('.approvalPendingPanels').addClass("in");
                $('.approvalPendingPanels').css("height", "auto");
                toggle = false;
            }

            else {
                $('.approvalPendingPanels').addClass("collapse");
                $('.approvalPendingPanels').removeClass("in");
                $('.approvalPendingPanels').css("height", "0px;");
                toggle = true;
            }

        }

        //This function will update the ticket list that will be displayed
        $scope.UpdateTicketPPendingList = function (ModifiedTickets) {
            var NumberOfTicketsUpdated = ModifiedTickets.length;
            for (var i = NumberOfTicketsUpdated - 1; i >= 0; i--) {
                var NumberOfTickets = $scope.Tickets.length;
                for (var j = NumberOfTickets - 1; j >= 0; j--) {
                    if ($scope.Tickets[j].TicketId == ModifiedTickets[i]) {
                        $scope.Tickets.splice(j, 1);
                    }
                }
            }
            if ($scope.Tickets.length == 0) {
                $scope.NoPendinglist = true;
                $scope.HideTitle = true;
                $scope.ShowApproveButton = false;
                $scope.ShowRejectButton = false;
            }
        };


        //This function will send the list of tickets for approval/Rejection
        $scope.SetForUpdation = function (event) {

            if ($scope.SelectedList.length != 0) {
                if (event.target.id == "Approve") {
                    IsApproved = true;

                } else {
                    IsApproved = false;

                }
                approvalService.PerformRequest($scope.SelectedList, $rootScope.User.UserId, IsApproved, $scope.rejectionComments).success(function (ModifiedTickets) {
                    $scope.UpdateTicketPPendingList(ModifiedTickets);
                    var getdata = LoginService.GetTicketCount($rootScope.User.UserId);
                    getdata.success(function (result) {
                        $rootScope.TicketCounts = result;

                    });
                    if (event.target.id == "Approve") {
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleSuccess,
                            MethodCase: "APPROVAL",
                            Object: event,
                            Type: "success"
                        }
                        $scope.MESSAGE = 'Request #' + $scope.SelectedList.join(', #') + Constants.TicketApproved;
                    } else {
                        $scope.HideCancelModal = true;
                        $('#PopUpModal').modal('toggle');
                        $scope.ALERTCONTENT = {
                            Title: Constants.PopupTitleSuccess,
                            MethodCase: "APPROVAL",
                            Object: event,
                            Type: "success"
                        }
                        $scope.MESSAGE = 'Request #' + $scope.SelectedList.join(', #') + Constants.TicketRejected;
                    }
                }).error(function (error) {
                    $scope.isMyrequestsDisabled = false;
                    $scope.status = Constants.ErrorTicketRetrieval + error.message;
                });
            }
            else {
                growl.warning(Constants.ErrorTicketSelection, { title: Constants.TitleWarning })
                $scope.isMyrequestsDisabled = false;
            }
        };

        //This function will stored the ticket data into shared property
        $scope.GetTicketId = function (ticket) {
            ticket.value = "NonEditableModeOn";
            SharedProperties.setProperty(ticket);
        }

        //Search functionality
        $scope.GetSearchedTicketFromAutoComplete = function (SearchTicketFromTextBox) {

            $scope.Tickets.map(function (repo) {
                repo.value = repo.TicketId + ' ' + repo.Application.toLowerCase();
            });
            if (SearchTicketFromTextBox == undefined || SearchTicketFromTextBox == "") {
                $scope.TicketListToShow = $scope.OriginalAllRequests;
                $scope.Tickets = $scope.OriginalAllRequests;
            }
            if (SearchTicketFromTextBox.length > 0) {
                var requestToFilter = $scope.OriginalAllRequests;
                $scope.TicketListToShow = requestToFilter.filter(createFilterFor(SearchTicketFromTextBox));
                $scope.Tickets = requestToFilter.filter(createFilterFor(SearchTicketFromTextBox));
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
        $scope.BindEsrchedTicketToGrid = function (tckt) {
            $scope.SearchTicketFromTextBox = tckt.Application;
            $scope.Tickets = [];
            $scope.Tickets.push(tckt);
        };

        //On CLick on Confirm on Modal
        $scope.Confirm = function (cases, object) {
            switch (cases) {
                case "APPROVAL":
                    $scope.SelectedList = [];
                    $scope.IsDisabled = false;
                    $scope.IsControlDisabled = true;
                    object = null;
                    $scope.isMyrequestsDisabled = false;
                    break;
                case "NAVIGATE":
                    $location.path("/Configuration");
                    break;
            }
        }

        //populate configuration settings after login
        function GetConfigurationAtStart() {
            LoginService.GetConfigurationAtStart().success(function (result) {
                if (result) {
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleInfo,
                        MethodCase: "NAVIGATE",
                        Type: "Info"
                    }
                    $scope.MESSAGE = Constants.SetConfigData;
                }
            });
        }
    }
});
