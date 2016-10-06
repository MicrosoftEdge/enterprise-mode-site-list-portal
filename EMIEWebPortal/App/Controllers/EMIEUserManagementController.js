EMIEModule.controller("EMIEUserManagementController", function ($scope, userService, Constants, CommonFunctionsFactory, $location, $localStorage, $route, $rootScope, $timeout, $q, $log, $sessionStorage, growl) {
    if ($sessionStorage.User != null) {
        $sessionStorage.User = null;
        $rootScope.User = null;

        //hide  top pannel as it is redirecting to standalone application
        $("#EMIEUserPanel").addClass('hidden');
        $("#EMIEusermenu").addClass('hidden');
        $(".EMIEuserpaneltoggler").addClass('hidden');
        $("#sidebar-wrapper").addClass('hidden');
        //hide left pane toggler  as it is redirecting to standalone application
        $(".toggler").css("display", "none");
    }

    $scope.isUserPageDisabled = false;
    $scope.EMIEUserManagementPageShow = false;
    $scope.ShowNewPasswordDiv = false;
    $scope.ShowChangeButton = false;

    $('#myModal').modal('show');

    //function to validate emie admin by username and password
    $scope.CheckEMIEValidUser = function (userName, password) {
        userService.validateEMIEAdmin(userName, password).success(function (data) {
            var isValidated = data;
            if (!isValidated) {
                growl.error(Constants.InvalidUsernamePassword, { title: Constants.TitleInvalidUser });
            }
            else {
                $('#myModal').modal('toggle');
                $scope.EMIEUserManagementPageShow = true;
                GetAllRegisteredEMIEChampUsers();
                $scope.EMIEUserNameCred = userName;
            }

        }).error(function (error) {

            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleError,
                MethodCase: "DISABLE",
                Type: "error"
            }
            $scope.MESSAGE = Constants.Errordata;
        });

    }
    //function to reset values on change password link
    $scope.ChangeEMIEPasswordLink = function () {
        $scope.ShowNewPasswordDiv = true;
        $scope.ShowChangeButton = true;
        $scope.newEMIEUserPasswordCred = null;
        $scope.oldEMIEUserPasswordCred = null;
    }

    //function to change emie passowrd
    $scope.ChangeEMIEAdminPassword = function (username, oldpassword, newpassword) {
        if (oldpassword != $scope.EMIEUserPasswordCred)
            growl.error(Constants.OldPasswordDidntMatch, { title: Constants.TitlePasswordMismatch });
        else if (oldpassword == newpassword)
            growl.error(Constants.OldAndNewPasswordShouldNotBeSame, { title: Constants.TitleDuplicatePassword });

        else {
            userService.changeEMIEAdminCredentials(newpassword).success(function (data) {
                if (data == 1) {
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleInfo,
                        MethodCase: "NULL",
                        Type: "Info"
                    }
                    $scope.MESSAGE = Constants.PasswordChangeSuccess;

                    $('#myModal').modal('toggle');
                    $scope.EMIEUserPasswordCred = newpassword;
                }
                else {

                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "DISABLE",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.PasswordChangeFailure;

                }
            }).error(function (error) {

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "DISABLE",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.Errordata;
            });
        }
    }

    //get list of register users for activation
    function GetAllRegisteredEMIEChampUsers() {
        userService.getAllEMIEChampRegisterUsers().success(function (data) {
            $scope.EMEIRegisterUserList = data;
            $scope.OriginalEMIEAllUsers = $scope.EMEIRegisterUserList;
            $scope.isUserPageDisabled = false;

        }).error(function (error) {

            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleError,
                MethodCase: "DISABLE",
                Type: "error"
            }
            $scope.MESSAGE = Constants.Errordata;
        });
    }

    //get selected users on checkbox click
    $scope.SelectedUserArray = [];
    $scope.getSelectedUser = function (user) {
        //On edit Page model to show selected user on disabled textbox
        $scope.selectedUser = user;

        //for multiple users
        var index = $scope.SelectedUserArray.indexOf(user);

        if (index == -1) {
            $scope.SelectedUserArray.push(user);
        }
        else
            $scope.SelectedUserArray.splice(index, 1);
    };

    //activate selected users
    $scope.ActivateUser = function () {
        if ($scope.SelectedUserArray.length == 0) {
            growl.error(Constants.SelectUserToActivate, { title: Constants.TitleError });
        }
        else {
            ActivateOrDeactivateUsers(true);
        }
        $scope.SelectedUserArray = [];
    };

    //method to activate or deactivate multiple users
    function ActivateOrDeactivateUsers(IsActivation) {
        var result = null;
        for (var i = 0; i < $scope.SelectedUserArray.length; i++) {
            var userToDeactivate = $scope.SelectedUserArray[i];

            result = userService.AddUser(userToDeactivate, Constants.Operation['Delete'], null, IsActivation);
            var index = $scope.EMEIRegisterUserList.indexOf(userToDeactivate);
            if (index != -1) {
                $scope.EMEIRegisterUserList.splice(index, 1);
            }
        }
        result.then(function (msg) {
            //alert(msg.data);

            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleInfo,
                MethodCase: "NULL",
                Type: "Info"
            }
            $scope.MESSAGE = msg.data;
            GetAllRegisteredEMIEChampUsers();
            $scope.SearchUserFromTextBox = null;
        }
        , function () {
            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleError,
                MethodCase: "NULL",
                Type: "error"
            }
            $scope.MESSAGE = Constants.ErrorDeleteUser;
            $scope.SearchUserFromTextBox = null;
        });
        $scope.OriginalEMIEAllUsers = $scope.EMEIRegisterUserList;
    }

    //function to sort list by username
    $scope.sortByName = function (userlist) {
        var PropertyToSort = Constants.SortByUserName;
        SortUserData(userlist, PropertyToSort);
    };

    //function to sort list by user role name
    $scope.sortByRoleName = function (userlist) {
        var PropertyToSort = Constants.SortByRoleName;
        SortUserData(userlist, PropertyToSort);
    };

    //common function to sort data
    //dataToSort-data to be sorted,PropertyToSort-object property to sort
    function SortUserData(dataToSort, PropertyToSort) {
        var sortedData = CommonFunctionsFactory.sortData($scope, dataToSort, PropertyToSort, $scope.IsAscending);
        if ($scope.IsAscending == true)
            $scope.IsAscending = false;
        else
            $scope.IsAscending = true;

        $scope.OriginalEMIEAllUsers = $scope.EMEIRegisterUserList;
    }

    /// <summary>
    ///this method performes the search functionality and also restores the data according to the dropdowns selected
    /// </summary>
    //Search functionality
    $scope.GetSearchedUserFromAutoComplete = function (SearchUserFromTextBox) {
        $scope.EMEIRegisterUserList.map(function (repo) {
            repo.value = repo.User.UserName.toLowerCase() + ' ' + repo.User.UserRole.RoleName.toLowerCase();
        });

        if (SearchUserFromTextBox == undefined || SearchUserFromTextBox == "") {
            $scope.UserListToShow = $scope.OriginalEMIEAllUsers;
            $scope.EMEIRegisterUserList = $scope.OriginalEMIEAllUsers;
        }
        if (SearchUserFromTextBox.length > 1) {
            var requestToFilter = $scope.OriginalEMIEAllUsers;
            $scope.UserListToShow = requestToFilter.filter(createFilterFor(SearchUserFromTextBox));
            $scope.EMEIRegisterUserList = $scope.EMEIRegisterUserList.filter(createFilterFor(SearchUserFromTextBox));
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

});