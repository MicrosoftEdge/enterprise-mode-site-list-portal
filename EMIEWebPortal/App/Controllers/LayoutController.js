EMIEModule.controller("LayoutController", function ($scope, $interval, LoginService, SharedProperties, Constants, $location, $route, $rootScope, $sessionStorage) {

    var User = null; $rootScope.TicketCounts = null;
    InitialiseLayout();
    $rootScope.User = null;

    //Hide Modal
    $('#PopUpModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    //This is to show the AllRequest button on the side bar layout if user is an emiechampion hidden otherwise
    $("#headingTwo").addClass("hidden");
    //this funtion will initialise the layout page when open in multiple tabs.
    function InitialiseLayout() {
        if ($sessionStorage.User != null) {

            $('[data-toggle="tooltip"]').tooltip();

            $("#wrapper").removeClass("toggled");

            $scope.isLoginHomeDisabled = false;
            User = $sessionStorage.User;
            $rootScope.User = $sessionStorage.User;
            $(".EMIEusermenu").removeClass("hidden");
            if (User.UserRole.RoleId == Constants.RoleId['Requester']) {
                $(".req-all").addClass("hidden");
                $(".pending").addClass("hidden");

            }
            else if (User.UserRole.RoleId != Constants.RoleId['EMIEChampion']) {
                $(".pending").removeClass("hidden");
                $(".req-all").addClass("hidden");
            }
            else {
                $(".pending").removeClass("hidden");
                $(".req-all").removeClass("hidden");
            }
            //getting the ticket count for layout page
            $sessionStorage.IsAllRequest = false;
            GetTicketCount();

            if (User.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                $("#headingTwo").removeClass("hidden");
                $(".EMIEsetting").removeClass("hidden");
                $(".EMIEstats").removeClass("hidden");
                $(".EMIEusrconfig").removeClass("hidden");
                $(".EMIEentapp").removeClass("hidden");
                $(".req-all").removeClass("hidden");
            }
            else if ($rootScope.User.UserRole.RoleId == Constants.RoleId['BPULead']) {
                $(".EMIEstats").removeClass("hidden");
            }
        }
    }
    //This function will be called to get the counts
    //Varribale IsAllRequest will notify whether to get all counts or logged in user request's count true for all counts and vice versa
    function GetTicketCount() {
        if ($sessionStorage.User == undefined || $sessionStorage.User == null || $rootScope.User == undefined || $rootScope.User == null) {
            LoginService.GetValidLoggedInUser().success(function (user) {
                $sessionStorage.User = user;
                $rootScope.User = user;
            });
        }

        IsAllRequest();
        var getdata = LoginService.GetTicketCount($sessionStorage.User.UserId);
        getdata.success(function (result) {
            $rootScope.TicketCounts = result;
            IsAllRequest();
            if ($sessionStorage.IsAllRequest) {
                $scope.MyRequestToShow = $rootScope.TicketCounts[1].MyRequest;
                $scope.CountText = Constants.Requests.All;
            }
            else {
                $scope.MyRequestToShow = $rootScope.TicketCounts[0].MyRequest;
                $scope.CountText = Constants.Requests.My;
            }
        });
    }

    //Setting the IsAllRequest varriable according to the logged in user role
    function IsAllRequest() {
        if ($sessionStorage.User.UserRole.RoleId == Constants.RoleId['EMIEChampion'])
            $("#headingTwo").removeClass("hidden");
        else
            $("#headingTwo").addClass("hidden");
    }

    //Getting counts on the click of the sidebar buttons 
    //this is the all counts it will display all the requests submitted by the active users
    $scope.GetAllCount = function () {

        //For All request
        if ($('#collapseTwo').hasClass('in')) {

            $('#AllRequest').removeClass();
            $('#AllRequest').addClass('glyphicon glyphicon-chevron-down');
        }
        else {
            $('#AllRequest').removeClass();
            $('#AllRequest').addClass('glyphicon glyphicon-chevron-up');
            $('#MyRequest').removeClass();
            $('#MyRequest').addClass('glyphicon glyphicon-chevron-down');

        }

        $sessionStorage.IsAllRequest = true;
        dropdownvalue = Constants.FilterByTicketStatus.InProgress;
        $sessionStorage.SelectedTabValue = dropdownvalue;
        $scope.MyRequestToShow = $rootScope.TicketCounts[1].MyRequest;
        $scope.CountText = Constants.Requests.All;

    }


    //This is for the MyRequest toggle button on clicking that button this function will be called and the counts related to logged in user requests will be displayed
    $scope.GetCount = function () {

        //For my request
        if ($('#collapseOne').hasClass('in')) {

            $('#MyRequest').removeClass();
            $('#MyRequest').addClass('glyphicon glyphicon-chevron-down');
        }
        else {
            $('#MyRequest').removeClass();
            $('#MyRequest').addClass('glyphicon glyphicon-chevron-up');
            $('#AllRequest').removeClass();
            $('#AllRequest').addClass('glyphicon glyphicon-chevron-down');
        }

        $sessionStorage.IsAllRequest = false;
        dropdownvalue = Constants.FilterByTicketStatus.InProgress;
        $sessionStorage.SelectedTabValue = dropdownvalue;
        $scope.MyRequestToShow = $rootScope.TicketCounts[0].MyRequest;
        $scope.CountText = Constants.Requests.My;

    }


    //===========================================================================================================================================================================
    //                                                       This method can be used for refreshing count automatically
    //===========================================================================================================================================================================

    $rootScope.countPromise = $interval(function () {
        $sessionStorage.IsAllRequest = $sessionStorage.IsAllRequest == undefined ? false : $sessionStorage.IsAllRequest;
        if ($sessionStorage.User != null && $rootScope.IsAllCountCalled == false) {
            GetTicketCount($sessionStorage.IsAllRequest);
        }
    }.bind(this), 30000);

    //On clicking the toggle bar ticket status links all requests page will be launched with selected value as clicked status link
    var dropdownvalue = null; $scope.IsAllRequest = false;
    //On the InProgress link click this function will set the dropdown "In Progress" and updates the requests accordingly
    $scope.InProgress = function (IsAllRequest) {
        $sessionStorage.IsAllRequest = IsAllRequest == "true" ? true : false;
        $sessionStorage.Allrequest = null;
        dropdownvalue = Constants.FilterByTicketStatus.InProgress;
        SharedProperties.setProperty(dropdownvalue);
        $sessionStorage.IsAllRequest = IsAllRequest;
        $location.path("/AllRequests");
        $route.reload();
        $sessionStorage.SelectedTabValue = dropdownvalue;
    }

    //On the Closed link click this function will set the dropdown "Closed" and updates the requests accordingly
    $scope.Closed = function (IsAllRequest) {
        $sessionStorage.IsAllRequest = IsAllRequest == "true" ? true : false;
        $sessionStorage.Allrequest = null;
        dropdownvalue = Constants.FilterByTicketStatus.Closed;
        SharedProperties.setProperty(dropdownvalue);
        $location.path("/AllRequests");
        $route.reload();
        $sessionStorage.SelectedTabValue = dropdownvalue;
    }

    //On the Rejected link click this function will set the dropdown "Rejected" and updates the requests accordingly
    $scope.Rejected = function (IsAllRequest) {
        $sessionStorage.IsAllRequest = IsAllRequest == "true" ? true : false;
        $sessionStorage.Allrequest = null;
        dropdownvalue = Constants.FilterByTicketStatus.Rejected;
        SharedProperties.setProperty(dropdownvalue);
        $location.path("/AllRequests");
        $route.reload();
        $sessionStorage.SelectedTabValue = dropdownvalue;
    }

    //On the Rollback link click this function will set the dropdown "Rollback" and updates the requests accordingly
    $scope.Rollback = function (IsAllRequest) {
        $sessionStorage.IsAllRequest = IsAllRequest == "true" ? true : false;
        $sessionStorage.Allrequest = null;
        dropdownvalue = Constants.FilterByTicketStatus.Rollback;
        SharedProperties.setProperty(dropdownvalue);
        $location.path("/AllRequests");
        $route.reload();
        $sessionStorage.SelectedTabValue = dropdownvalue;
    }

    //On the Pending link click this function will show the all request which need approval by logged in user
    $scope.Pending = function (IsAllRequest) {
        $sessionStorage.IsAllRequest = IsAllRequest == "true" ? true : false;
        dropdownvalue = Constants.FilterByTicketStatus.InProgress;
        $sessionStorage.Allrequest = null;
        $location.path("/MyRequests");
        $route.reload();
        $sessionStorage.SelectedTabValue = dropdownvalue;
    }
    //On the All request link click this function will set the dropdown "All request" and updates the requests accordingly
    $scope.AllRequestsForEMIEChampion = function (IsAllRequest) {
        $sessionStorage.IsAllRequest = IsAllRequest == "true" ? true : false;
        dropdownvalue = Constants.FilterByTicketStatus.AllRequests;
        dropdownvalue.value = "AllRequestClick";
        $sessionStorage.Allrequest = Constants.Requests.All;
        SharedProperties.setProperty(dropdownvalue);
        $location.path("/AllRequests");
        $route.reload();
        $sessionStorage.SelectedTabValue = dropdownvalue;
    }

    /// <summary>
    /// This function will display the production sites xmls
    /// </summary>
    $scope.ShowProductionSites = function () {
        $location.path("/ProductionSites");
    }

})