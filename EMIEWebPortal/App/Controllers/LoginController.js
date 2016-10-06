
EMIEModule.controller('LoginController', function ($scope, $rootScope, LoginService, SharedProperties, $window, Constants, $location, $route, $sessionStorage, $timeout)
{
    $("#EMIEUserPanel").addClass('hidden');
    $("#EMIEusermenu").addClass('hidden');
    $(".EMIEuserpaneltoggler").addClass('hidden');

    //Clearing out the previous stored values
    $rootScope.TicketCounts = null;
    $rootScope.MyRequestToShow = null;
    $rootScope.CountText = null;

    //HIDE MODAL
    $('#PopUpModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    $rootScope.User = null;
    $rootScope.IsAllCountCalled = false;
    $scope.Login = function () {
        $scope.isLoginHomeDisabled = true;
        LoginService.GetValidLoggedInUser().success(function (user) {
           
            if (user.UserName != null) {
                $("#sidebar-wrapper").removeClass('hidden');
                var getdata = LoginService.GetTicketCount(user.UserId, false);
                $rootScope.IsAllCountCalled = true;
                getdata.success(function (result) {
                    $rootScope.TicketCounts = result;
                    $rootScope.IsAllCountCalled = false;
                    $rootScope.MyRequestToShow = $rootScope.TicketCounts[0].MyRequest;
                    $rootScope.CountText = "MY REQUESTS";
                    if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion'])
                        $("#headingTwo").removeClass("hidden");
                });
                SharedProperties.setProperty(null);
                $scope.IsLogedIn = true;
                $(".EMIEuserpaneltoggler").removeClass("hidden");
                $("#EMIEusermenu").removeClass("hidden");
                $rootScope.Message = "Successful Login done. Welcome " + user.UserName;
                $rootScope.User = user;
                $sessionStorage.User =user;
                //Enable/Disable Layout Page
                if ($rootScope.User.UserRole.RoleId == Constants.RoleId['Requester']) {
                    $location.path("/SignInSuccessForRequestor");
                    $(".req-all").addClass("hidden");
                    $(".pending").addClass("hidden");
                    $("#headingTwo").addClass("hidden");
                }
                else if ($rootScope.User.UserRole.RoleId != Constants.RoleId['EMIEChampion']) {
                    $(".pending").removeClass("hidden");
                    $(".req-all").addClass("hidden");
                    $location.path("/SignInSuccess");
                }
                else
                {
                    $(".pending").removeClass("hidden");
                    $location.path("/SignInSuccess");
                    $(".req-all").removeClass("hidden");
                    $("#headingTwo").removeClass("hidden");
                }             

                if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {

                    $(".EMIEsetting").removeClass("hidden");
                    $(".EMIEstats").removeClass("hidden");
                    $(".EMIEusrconfig").removeClass("hidden");
                    $(".EMIEentapp").removeClass("hidden");
                    $("#EMIEUserPanel").removeClass();
                    $("#EMIEUserPanel").toggleClass('col-lg-11');
                    $("#EMIEUserPanel").toggleClass("text-right");
                     $("#EMIEusermenu").removeClass();                    
                }
                else if($rootScope.User.UserRole.RoleId == Constants.RoleId['BPULead'])
                {
                    $(".EMIEstats").removeClass("hidden");
                    $("#EMIEUserPanel").removeClass();
                    $("#EMIEusermenu").removeClass();
                    $("#EMIEUserPanel").toggleClass('col-lg-11');
                    $("#EMIEUserPanel").toggleClass("text-right");
                    $("#EMIEUserPanel").addClass("EMIEGroupHead");
                }
                else{                  
                    $("#EMIEUserPanel").removeClass();
                    $("#EMIEusermenu").removeClass();
                    $("#EMIEUserPanel").toggleClass('col-lg-11');
                    $("#EMIEUserPanel").toggleClass("text-right");
                    $("#EMIEUserPanel").addClass("EMIEnochampmenu");
                   
                }

                //For Status Bar
                $(".status").css("display", "block");
                $(".status #First-child").addClass("Staus-Selected");
                //For Toggeled Menu
                $(".toggler").addClass("toggled");
                $(".toggler").css("display", "block");
                $("#wrapper").removeClass("toggled");

                $scope.$storage = $sessionStorage.$default({
                    User: $rootScope.User
                });
            }
            else {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleLoginError,
                    MethodCase: "ENABLEPAGE",
                    Type:"error"
                }
               $scope.isLoginHomeDisabled = false;
               $scope.MESSAGE = Constants.ErrorLogInFailed;
            }
        })
        .error(function (error) {

            //To enable OK button on login error
            $scope.isLoginHomeDisabled = false;

            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleLoginError,
                MethodCase: "ENABLEPAGE",
                Type:"error"
            }
            $scope.MESSAGE = Constants.ErrorUnAuthorisedUser;
           
        });

    };

    $scope.Register = function () {
                $location.path("/Register");
    };
    
    //This function will redirects to the chart section
    $scope.ShowReport = function () {
        $location.path("/Chart");
    }


    //On CLick on Confirm on MODAL
    $scope.Confirm = function (cases, object) {
        switch (cases) {
            case "ENABLEPAGE":
                $scope.isLoginHomeDisabled = false;
                break;
        }
    }
});

