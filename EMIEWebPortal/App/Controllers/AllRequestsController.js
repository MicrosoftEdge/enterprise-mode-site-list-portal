EMIEModule.controller("AllRequestsController", function ($scope, AllRequestsService,CommonFunctionsFactory, SharedProperties, Constants, LoginService, $rootScope, $route, $sessionStorage, $location) {

    
    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {

        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        $scope.StatusText = Constants.TicketStatusText;
        $scope.PageMapping = Constants.StatusPageMapping;
        $scope.NoDataAvailable = Constants.DataNotAvailable;
        $scope.RetrievalProgress = Constants.TicketRetrievalProgress;
        $scope.DisplayWaitMessage = true;
        $scope.DisplayValueHeader = null;
        $scope.isAllrequestsDisabled = true;
        var RequestsToDisplay = []; var RequestsToShow = null;
        var decreasingOrder = false;
        //This function will fetch the list of All requests raised by the requester    
        GetAllRequests($rootScope.User.LogOnId);
        //For poplating the drop down since currently we are not using it so commented
        // PopulateDDLWithReqType();

        /// <summary>
        /// method call the service to fetch All requests raised by the requester
        /// </summary>
        /// <param name="logOnId">logOnId of which All requests  need to be fetched</param>
        /// On success returns list of All requests raised by the requester
        function GetAllRequests(logOnID) {
            var property = $sessionStorage.SelectedTabValue;
            //varriable getdata stores the data received from the service request
            //varriable mydata is for filtering the data as per logged in user when IsAllRequest varriable is false,otherwise it will contain allrequests
            //IsAllRequest varriable notifies whether to display all the request or to display request for logged in user only
            var getdata = null; var mydata = []; var IsAllRequest = $sessionStorage.IsAllRequest;
            if ($sessionStorage.IsAllRequest == true || $sessionStorage.IsAllRequest == "true") {
                //this is used for EMIE champion
                getdata = AllRequestsService.GetAllRequests(logOnID, true);
            }
            else {
                getdata = AllRequestsService.GetAllRequests(logOnID, false);
            }
            getdata.success(function (data) {
                mydata = data;

                //Sorting the data -true is passed, as initailly it will sort by ticketid
                var isCompareValueInt = true;
                var PropertyToSort = Constants.SortByTicketID;
                SortData(mydata, PropertyToSort, isCompareValueInt);

                RequestsToShow = mydata;

                if ($sessionStorage.SelectedTabValue != "") {
                    var value = $sessionStorage.SelectedTabValue;
                    $scope.value = value;
                    if ($scope.value != 'All Requests')
                        $scope.DisplayValueHeader = 'Requests - ' + value;
                    else
                        $scope.DisplayValueHeader = value;
                    //Setting the drop down value the  and displaying the data accordingly
                    changeonselectionvalue(value);
                }
                else {
                    changeonselectionvalue($sessionStorage.LastSelectedValue);
                    $scope.value = $sessionStorage.LastSelectedValue;
                    if ($scope.value != 'All Requests')
                        $scope.DisplayValueHeader = 'Requests - ' + $scope.value;
                    else
                        $scope.DisplayValueHeader = $scope.value;
                }
                $scope.ticketStatusEnum = Constants.TicketStatus;
                $scope.isAllrequestsDisabled = false;

            }).error(function (error) {
                $scope.isAllrequestsDisabled = false;
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


        //Populate drop down with status name
        $scope.model = {};
        //For poplating the drop down since currently we are not using it so commented
        //function PopulateDDLWithReqType () {
        //    var DDLOptions = null;
        //    DDLOptions= Constants.FilterByTicketStatus;
        //    var DicLength = Object.keys(DDLOptions).length;
        //    if ($sessionStorage.User.UserRole.RoleId == 4)
        //        $scope.ticketStatus= DDLOptions;
        //    else {
        //        for (var i = 0; i < DicLength; i++) {
        //            if (DDLOptions[i] == "All REQUESTS" || DDLOptions[i] == "PENDING")
        //            {
        //                delete DDLOptions[i];
        //            }

        //        }
        //        $scope.ticketStatus = DDLOptions;

        //    }
        //};


        //sorting on Application Name click
        $scope.SortByName = function (requests) {
            var PropertyToSort = Constants.SortByApplicationNameOnAllRequestPage;
            var isCompareValueInt = false;
            SortData(requests, PropertyToSort, isCompareValueInt);
        }

        //common function to sort data
        //requests-data to be sorted,PropertyToSort-object property to sort,isCompareValueInt-true if the compare data is in integer value
        function SortData(requests, PropertyToSort, isCompareValueInt)
        {
            requests = CommonFunctionsFactory.sortData($scope, requests, PropertyToSort, decreasingOrder, isCompareValueInt);
            if (decreasingOrder == true)
                decreasingOrder = false;
            else
                decreasingOrder = true;

            $scope.allrequests = requests;
            $scope.OriginalAllRequests = $scope.allrequests;
        }
        //sorting on Id Column click
        $scope.SortById = function (requests) {
            var isCompareValueInt = true;
            var PropertyToSort = Constants.SortByTicketID;
            SortData(requests, PropertyToSort, isCompareValueInt);
        }

        //this part of the code is commneted bcz the dropdown is removed for now might needed in future
        //Filter the requests with Dropdown selection
        ////$scope.selectedValue = function (value) {
        ////    //ChangeOnSelection(value);
        ////    changeonselectionvalue(value);
        ////}

        //Whenever user will click on any ticketid,then this function will be called

        $scope.GetTicketId = function (request) {
            request.value = "NonEditableModeOn";
            SharedProperties.setProperty(request);
            $rootScope.isNonEdit = true;
            $sessionStorage.TicketIdToShow = request;
        }


        //Whenever user will click on any ticketid,then this function will be called

        $scope.GetTicketIdForInternalClick = function (request) {
            request.value = "NonEditableModeOn";
            SharedProperties.setProperty(request);
            $rootScope.isNonEdit = true;
            $sessionStorage.TicketIdToShow = request;
        }


        //This function will filter out the required requests to be displayed on the ui bases on the tab selected 
        function changeonselectionvalue(value) {
            var filter = []; var requests;
            //if we click on the tabs in right side of the page the 'value' tells which tab is clicked and query is selected accordingly

            if (Constants.FilterByTicketStatus.Rejected == value || Constants.FilterByTicketStatus.Closed == value || Constants.FilterByTicketStatus.Rollback == value) {
                //since closed tickets are actually signed off tickets and ticketstatusid for this is 8
                if (Constants.FilterByTicketStatus.Closed == value)
                    filter.push(8);
                    //ticketstatusid for the rejected tickets is 6
                else if (Constants.FilterByTicketStatus.Rejected == value)
                    filter.push(6);
                    //ticketstatusid for the rolledback tickets is 9
                else if (Constants.FilterByTicketStatus.Rollback == value)
                    filter.push(9);
                //querying to select the required ticketstatusid tickets
                requests = alasql('select * from ? where FinalTicketStatus=? ', [RequestsToShow, filter[0]]);
            }
            else if (Constants.FilterByTicketStatus.InProgress == value) {
                //In progress ticket conatains the ticketstatusid of 1,2,3,4,5,7,10,12
                filter = [1, 2, 3, 4, 5, 7, 10, 12];
                requests = alasql('select * from ? where FinalTicketStatus in (?,?,?,?,?,?,?,?)', [RequestsToShow, filter[0], filter[1], filter[2], filter[3], filter[4], filter[5], filter[6], filter[7]]);
            }
            else
                requests = RequestsToShow;
            $sessionStorage.LastSelectedValue = value;
            //Insert the filtered and sorted values in the all request varriable to be sent to UI
            $scope.allrequests = requests;
            $scope.OriginalAllRequests = $scope.allrequests;

            $scope.DisplayWaitMessage = false;

            if ($scope.allrequests.length > 0) {
                $scope.DisplayNoDataMessage = false;
            } else {
                $scope.DisplayNoDataMessage = true;
            }
        }

        //searching for the ticket id entered in the text box
        $scope.GetSearchedTicketFromAutoComplete = function (SearchTicketFromTextBox) {

            $scope.allrequests.map(function (repo) {
                repo.value = repo.TicketId + ' ' + repo.Application.ApplicationName.toLowerCase();
            });
            if (SearchTicketFromTextBox == undefined || SearchTicketFromTextBox == "") {
                $scope.TicketListToShow = $scope.OriginalAllRequests;
                $scope.allrequests = $scope.OriginalAllRequests;
            }
            if (SearchTicketFromTextBox.length > 0) {
                var requestToFilter = $scope.OriginalAllRequests;
                $scope.TicketListToShow = requestToFilter.filter(createFilterFor(SearchTicketFromTextBox));
                $scope.allrequests = requestToFilter.filter(createFilterFor(SearchTicketFromTextBox));
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
            $scope.SearchTicketFromTextBox = tckt.Application.ApplicationName;
            $scope.allrequests = [];
            $scope.allrequests.push(tckt);
        };
    }
});

