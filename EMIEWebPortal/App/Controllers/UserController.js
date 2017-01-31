EMIEModule.controller("UserController", function ($scope, userService, Constants,CommonFunctionsFactory, $location,LoginService, $localStorage, $route, $rootScope, CRService, $timeout, $q, $log, $sessionStorage, growl) {

    ///---------------------------
    ////This can be used in future for using session storage on new tab
    //if (window.addEventListener) {
    //    if ($sessionStorage.User == null) {
    //        $sessionStorage.User = $localStorage.User
    //    }
    //} 
    //if (sessionStorage.length) {
    //    $localStorage.User = null;
    //    $localStorage.User = $sessionStorage.User;
    //};
    ///---------------------------

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue 
    //false-if this page is not accessible other than emie champ role
    if (LoginService.getUserWithRoleAtRedirectionForEMIEChamp(false)) {

        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();


        $scope.isUserPageDisabled = false;

        $scope.UserList = [];
        $scope.ADUsers = [];

        $scope.ActivatedUserList = [];
        $scope.DeactivatedUserList = [];
        $scope.RegisteredUserList = [];

        $scope.BtnActivateUser = true;
        $scope.BtnDeactivateUser = true;

        $scope.IsActiveCreateUserPageHidden = false;
        $scope.IsregisterUser = null;
        $scope.IsActive = true;
        $scope.UserCheckBoxShow = true;
        $scope.SaveBtnDisable = true;

        $scope.DDLDisableOnALLGroup = false;

        GetCreateUserPageName();
        GetAllRoles();
        GetAllBPU();


        function PopulateDDLOnUserMngmntPage() {
            $scope.UserMngmntDDL = Constants.UserManagementDDLOptions;
        }

        function GetCreateUserPageName() {
            if ($route.current.$$route.originalPath == '/Register') {
                $scope.PageNameRedirected = Constants.RegisterUserPageHeader;
                $scope.IsActiveCreateUserPageHidden = true;
                $scope.IsregisterUser = false;
                $scope.IsActive = false;
                $scope.loginlinkshow = true;
            }
            else if ($route.current.$$route.originalPath == '/User') {
                PopulateDDLOnUserMngmntPage();
                GetAllUsersFromDB();
            }
            else {
                $scope.PageNameRedirected = Constants.CreateNewUserPageHeader;
                $scope.IsActiveCreateUserPageHidden = false;
                $scope.IsActive = true;
                $scope.loginlinkshow = false;
            }
        }

        // the selection change in the first dropdown this will call the filterUser function
        $scope.selectedValueOfDDL = function (value) {
            filterUser(value);
            $scope.SearchUserFromTextBox = "";
            previousUsers = null;
        };

        //this function will filter the value according the value selected in the first dropdown
        function filterUser(value) {
            switch (value) {
                case Constants.UserManagementDDLOptions[1]:
                    GetAllUsersFromDB();
                    break;
                case Constants.UserManagementDDLOptions[2]:
                    GetActivatedUserList();
                    break;
                case Constants.UserManagementDDLOptions[3]:
                    GetDeactivatedUserList();
                    break;
                case Constants.UserManagementDDLOptions[4]:
                    GetRegisterdUserList();
                    break;
            }
            //Keeping record of the filtered data from the first dropdown to use it in second dropdown(BPUs dropdown)
            $scope.Users = $scope.UserList;
            filterByBPU($scope.Users);
        };

        //method to select user from dropdown 
        $scope.searchedUserFromDDL = function (user) {
            $scope.NewUserName = user.DisplayName;
            $scope.NewUserEmail = user.Email;
            $scope.SaveBtnDisable = false;
        }

        /// <summary>
        /// method call the service to fetch all users
        /// </summary>
        /// <returns>list of all Users</returns>
        function GetAllUsersFromDB() {
            $scope.BtnActivateUser = true;
            $scope.BtnDeactivateUser = true;
            $scope.value = Constants.UserManagementDDLOptions[1];
            $scope.UserCheckBoxShow = false;

            userService.getAllUsers().success(function (data) {
                $scope.UserList = data;
                $scope.OriginalAllUsers = $scope.UserList;
                $scope.ActivatedUserList = [];
                $scope.DeactivatedUserList = [];
                $scope.RegisteredUserList = [];
                $scope.UserList.filter(filterByIsActive);
                $scope.UserList.filter(filterByIsRegisterd);
                $scope.isUserPageDisabled = false;
                //to filter data according to second dropdown(BPUs dropdown)
                //this will filter the data according to the both dropdown selection and keep'em into sync
                $scope.Users = $scope.UserList;
                filterByBPU($scope.UserList);
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

        };

        /// <summary>
        /// method call the service to fetch all Roles
        /// </summary>
        /// <returns>list of all Roles</returns>
        function GetAllRoles() {
            userService.getAllRoles().success(function (data) {
                $scope.roleList = data;
            }).error(function (error) {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorRoleData;
            });
        };

        /// <summary>
        /// method call the service to fetch all BPUs
        /// </summary>
        /// <returns>list of all BPUs</returns>
        function GetAllBPU() {
            userService.getAllBPU().success(function (data) {
                $scope.bpuList = data;

                //to disable "All" option from DDL
                angular.forEach($scope.bpuList, function (value, key) {
                    if (value.BPUId == 0) {
                        value.AllBPUDiabled = true;
                    }
                    else
                        value.AllBPUDiabled = false;
                })
            }).error(function (error) {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorGroupData;

            });
        };

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

        //to deactivate selected user
        $scope.DeactivateUser = function () {
            if ($scope.SelectedUserArray.length == 0) {
                growl.error(Constants.SelectUserToDeactivate, { title: Constants.TitleError });
            }
            else {
                ActivateOrDeactivateUsers(false);
            }
            $scope.SelectedUserArray = [];
        };

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
                userToDeactivate.User.ModifiedById = $rootScope.User.UserId;
                result = userService.AddUser(userToDeactivate, Constants.Operation['Delete'], null, IsActivation);
                var index = $scope.UserList.indexOf(userToDeactivate);
                if (index != -1) {
                    $scope.UserList.splice(index, 1);
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
                GetAllUsersFromDB();
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
            $scope.OriginalAllUsers = $scope.UserList;
        }

        //to add new User
        $scope.AddUser = function () {

            var loggedinUserId = null;

            if ($scope.Comments == undefined)
                $scope.Comments = null;

            if ($scope.IsActive == undefined)
                $scope.IsActive = false;

            if ($scope.IsregisterUser == undefined)
                $scope.IsregisterUser = null;

            //if ($rootScope.User == undefined)
            //    loggedinUserId = null;
            //else
            //    loggedinUserId = $rootScope.User.UserId;

            if ($sessionStorage.User == undefined)
                loggedinUserId = null;
            else
                loggedinUserId = $sessionStorage.User.UserId;

            if ($scope.form.$valid) {
                var UserRole = {
                    User: {
                        UserName: $scope.NewUserName,
                        BPUId: $scope.selectedBPU.BPUId,
                        UserBPU: $scope.selectedBPU,
                        UserRole: $scope.NewUserRole,
                        Email: $scope.NewUserEmail,
                        LogOnId: $scope.NewUserEmail,
                        CreatedById: loggedinUserId,
                    },
                    RoleId: $scope.NewUserRole.RoleId,
                    IsActive: $scope.IsActive,
                    MappingDetails: $scope.Comments,
                    IsRegistered: $scope.IsregisterUser
                }
                var result = userService.AddUser(UserRole, Constants.Operation['Insert']);
                result.then(function (msg) {


                    $scope.HideCancelModal = true;

                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleSuccess,
                        MethodCase: "NAVIGATE",
                        Type: "success"
                    }
                    $scope.MESSAGE = msg.data;

                }, function () {

                    ClearFiledsOfCreatePage();

                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "NULL",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.ErrorCreateUser;

                });
            }
            else {
                if ($scope.NewUserName == undefined) {
                    growl.warning(Constants.SearchUser, { title: Constants.TitleWarning });
                }
                else
                    growl.error(Constants.EnterAllFields, { title: Constants.TitleError });
            }
        };

        //get selected user for edit
        $scope.EditUser = function (user) {
            $scope.selectedUser = user;
            var indexes = $.map($scope.roleList, function (role, index) {
                if (role.RoleName == user.User.UserRole.RoleName) {
                    return index;
                }
            });
            //bind selected user role to the DDL of model
            var index = indexes[0];
            $scope.User.UserGetRole = $scope.roleList[index];

            indexes = $.map($scope.bpuList, function (bpu, index) {
                if (bpu.BPU1 == user.User.UserBPU.BPU1) {
                    return index;
                }
            });
            //bind selected user bpu to the DDL of model
            index = indexes[0];
            $scope.User.UserBPU = $scope.bpuList[index];
            if ($scope.User.UserBPU.BPUId == 0) {
                $scope.User.UserBPU.AllBPUDiabled = false;
                $scope.DDLDisableOnALLGroup = true;
            }
            else
                $scope.DDLDisableOnALLGroup = false;

            $scope.User.Comments = user.MappingDetails;
            $scope.User.IsActive = user.IsActive;

        };

        //edit user
        $scope.EditSelectedUser = function (UserCommentsAndIsActive) {
            $scope.OldUser = $scope.selectedUser;
            if (UserCommentsAndIsActive != undefined) {
                $scope.UserComments = UserCommentsAndIsActive.Comments;
                $scope.UserIsActive = UserCommentsAndIsActive.IsActive;
            }
            if ($scope.UserComments == undefined)
                $scope.UserComments = null;

            if ($scope.User.UserGetRole == undefined)
                $scope.User.UserGetRole = $scope.selectedUser.User.UserRole;

            if ($scope.User.UserBPU == undefined) {
                // alert("Select Group");
                growl.error(Constants.SelectGroup);
                $('#myModal').modal('show');
            }
            else {
                //  $scope.User.UserBPU = $scope.selectedUser.User.UserBPU;

                if ($scope.UserIsActive == undefined)
                    $scope.UserIsActive = false;

                var EditUserRoleWithBPU = {
                    User: {
                        UserId: $scope.OldUser.User.UserId,
                        UserName: $scope.OldUser.User.UserName,
                        UserRole: $scope.User.UserGetRole,
                        UserBPU: $scope.User.UserBPU,
                        CreatedById: $scope.User.UserId,
                        Email: $scope.selectedUser.User.Email,
                        ModifiedById: $rootScope.User.UserId
                    },
                    IsActive: $scope.UserIsActive,
                    MappingDetails: $scope.UserComments
                }
                var result = userService.AddUser(EditUserRoleWithBPU, Constants.Operation['Update'], $scope.OldUser);
                result.then(function (msg) {
                    //alert(msg.data);
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleSuccess,
                        MethodCase: "DISABLE",
                        Type: "info"
                    }
                    $scope.MESSAGE = msg.data;
                    GetAllUsersFromDB();
                    $scope.selectedRole = null;
                    $scope.selectedBPU = null;
                    $scope.IsActive = true;
                    $('#myModal').modal('hide');
                    $scope.SearchUserFromTextBox = null;
                }, function () {
                    $('#myModal').modal('hide');

                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "NULL",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.ErrorUpdateUser;


                });
            }

        };

        //This code will remind you on leaving the page.
        //$scope.$on("$routeChangeStart", function (event, next, current) {
        //    if (!confirm("Are you sure you want to navigate away from this page")) {
        //        event.preventDefault();
        //    }
        //});

        $scope.CreateUserPage = function () {
            $location.path("/CreateNewUser");
        };

        $scope.Isactivechecked = function (IsActive) {
            $scope.IsActive = IsActive;
        };

        //clear fields
        $scope.CancelFields = function () {
            $scope.selectedRole = null;
            $scope.selectedBPU = null;
            $scope.selectedUser = null;
        }

        //get active user list
        function GetActivatedUserList() {
            $scope.SearchUserFromTextBox = null;
            $scope.UserListToShow = [];
            $scope.UserCheckBoxShow = true;
            $scope.BtnActivateUser = true;
            $scope.BtnDeactivateUser = false;
            $scope.UserList = $scope.ActivatedUserList;
            $scope.OriginalAllUsers = $scope.UserList;
        };

        //get deactivated user list
        function GetDeactivatedUserList() {
            $scope.SearchUserFromTextBox = null;
            $scope.UserListToShow = [];
            $scope.UserCheckBoxShow = true;
            $scope.BtnDeactivateUser = true;
            $scope.BtnActivateUser = false;
            $scope.UserList = $scope.DeactivatedUserList;
            $scope.OriginalAllUsers = $scope.UserList;
        };

        function GetRegisterdUserList() {
            $scope.SearchUserFromTextBox = null;
            $scope.UserListToShow = [];
            $scope.UserCheckBoxShow = true;
            $scope.BtnDeactivateUser = true;
            $scope.BtnActivateUser = false;
            $scope.UserList = $scope.RegisteredUserList;
            $scope.OriginalAllUsers = $scope.UserList;
        };

        //filter all users list with active and deactive
        function filterByIsActive(obj) {
            if (obj.IsActive == true) {
                $scope.ActivatedUserList.push(obj);
                return true;
            }
            else if (obj.IsActive == false && obj.IsRegistered != false) {
                $scope.DeactivatedUserList.push(obj);
                return false;
            }

        }

        function filterByIsRegisterd(obj) {
            if (obj.IsRegistered == false) {
                $scope.RegisteredUserList.push(obj);
                return true;
            }
        }


        $scope.IsAscending = false;

        $scope.sortByName = function (userlist) {
            var PropertyToSort = Constants.SortByUserName;
            SortUserData($scope.UserList, PropertyToSort);
        };

        $scope.sortByRoleName = function (userlist) {
            var PropertyToSort = Constants.SortByRoleName;
            SortUserData($scope.UserList, PropertyToSort);
        };

        //common function to sort data
        //dataToSort-data to be sorted,PropertyToSort-object property to sort
        function SortUserData(dataToSort, PropertyToSort)
            {
            var sortedData = CommonFunctionsFactory.sortData($scope, dataToSort, PropertyToSort, $scope.IsAscending);
                if ($scope.IsAscending == true)
                    $scope.IsAscending = false;
                else
                    $scope.IsAscending = true;

                $scope.OriginalAllUsers = $scope.UserList;
            }

            function ClearFiledsOfCreatePage() {
                document.getElementById("CreateUserForm").reset();
                $scope.form.$setPristine();
                $scope.NewUserName = null;
                $scope.selectedBPU = null;
                $scope.NewUserEmail = null;
                $scope.NewUserRole = null;
                $scope.Comments = null;
                $scope.IsActive = null;
                $scope.SaveBtnDisable = true;
                $scope.searcheduserlist = [];
            };
            $scope.ClearAllFiledsOfCreatePage = function () {
                ClearFiledsOfCreatePage();
            };
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
                else if (serachUserName.length > 2) {
                    if ($scope.TempListToBind.length > 0) {
                        $scope.IsSearching = true;
                        $scope.searcheduserlist = $scope.TempListToBind.filter(createFilterForADUsers(serachUserName));
                        if ($scope.searcheduserlist.length >= 0)
                            $scope.IsSearching = false;
                    }
                    else if ($scope.IsSearching && $scope.searcheduserlist.length <= 0) {
                        //do nothing till search is going on for first 3 letters,this is to avoid repeatative search
                        $scope.IsSearching = true;
                    }
                    else {
                        $scope.IsSearching = true;
                        $scope.NewUserName = null;
                        $scope.NewUserName = null;
                        $scope.searcheduserlist = [];
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
                            $scope.HideCancelModal = true;
                            $('#PopUpModal').modal('toggle');
                            $scope.ALERTCONTENT = {
                                Title: Constants.PopupTitleError,
                                MethodCase: "DISABLE",
                                Type: "error"
                            }
                            $scope.MESSAGE = Constants.ErrorSearchADUser;

                        });
                    }
                }
            };


            var previousUsers; var previousvalue;

            /// <summary>
            ///this method performes the search functionality and also restores the data according to the dropdowns selected
            /// </summary>
            //Search functionality
            $scope.GetSearchedUserFromAutoComplete = function (SearchUserFromTextBox) {

                $scope.UserList = previousUsers == undefined ? $scope.UserList : previousUsers;
                $scope.UserList.map(function (repo) {
                    repo.value = repo.User.UserName.toLowerCase() + ' ' + repo.User.UserRole.RoleName.toLowerCase();
                });
                $scope.OriginalAllUsers.map(function (repo) {
                    repo.value = repo.User.UserName.toLowerCase() + ' ' + repo.User.UserRole.RoleName.toLowerCase();
                });
                if (SearchUserFromTextBox == undefined || SearchUserFromTextBox == "") {
                    $scope.UserListToShow = $scope.OriginalAllUsers;
                    //if the search text is cleared then it will restore the data according to the dropdown selected
                    filterUser($scope.value); previousUsers = undefined;
                }
                else previousUsers = $scope.UserList;
                if (SearchUserFromTextBox.length > 1) {
                    var requestToFilter = $scope.OriginalAllUsers;
                    $scope.UserListToShow = requestToFilter.filter(createFilterFor(SearchUserFromTextBox));
                    $scope.UserList = $scope.UserList.filter(createFilterFor(SearchUserFromTextBox));
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
            $scope.BindSearchedUserToGrid = function (user) {
                $scope.SearchUserFromTextBox = user.User.UserName;
                $scope.UserList = [];
                $scope.UserList.push(user);
            };

            $scope.BindBPUForSelectedRole = function (User) {
                var bpuresult = $scope.bpuList.filter(function (bpuobj) {
                    return bpuobj.BPUId == 0;
                });
                if (User.RoleId == 4) {

                    bpuresult[0].AllBPUDiabled = false;
                    $scope.DDLDisableOnALLGroup = true;

                    if ($scope.User != undefined)
                        $scope.User.UserBPU = bpuresult[0];

                    $scope.selectedBPU = bpuresult[0];

                }
                else {
                    bpuresult[0].AllBPUDiabled = true;
                    $scope.DDLDisableOnALLGroup = false;
                    $scope.ShowSelectOption = "--Select--";
                }
            };

            //==================================================================================================================================================================
            //                                                                    Export To Excel
            //==================================================================================================================================================================

            //Populating DropDown With BPUs Name
            var getData = userService.getAllBPU();
            getData.success(function (result) {
                for (var i = result.length - 1; i >= 0; i--) {
                    if (result[i].BPU1 === 'All') {
                        result.splice(i, 1);
                    }
                }
                $scope.ExportBPU = result;
            });

            //On the selection of the dropdown values this will call the filterByBPU function
            $scope.filterByBPU = function () {
                filterByBPU($scope.Users)
            };


            //this filter is for  filtering the result BPU wise it will filter the data according to the value selected
            function filterByBPU(Users) {
                if ($scope.GroupName != null || $scope.GroupName != undefined) {
                    var temp = [];
                    angular.forEach(Users, function (obj, index) {
                        if (obj.User.UserBPU.BPU1 == $scope.GroupName)
                            temp.push(obj);
                    })
                    $scope.UserList = temp;
                }
                else
                    $scope.UserList = $scope.Users;
            }
            //This function will insert the data in the required form in the object
            function ExportHelper(data, obj) {
                data.USERNAME = obj.User.UserName;
                data.USERALIAS = obj.User.Email;
                data.USERROLE = obj.User.UserRole.RoleName;
                data.GROUPNAME = obj.User.UserBPU.BPU1;
                $scope.exportData.push(data);
            }
            //Export To Excel
            $scope.ExportToExcel = function (GroupName) {
                $scope.exportData = []; var row = []; var column = [];

                //preparing data in required format 
                angular.forEach($scope.UserList, function (obj, index) {
                    //Defining the data object to get the data to queried using the alasql function
                    var data = { USERNAME: null, USERALIAS: null, USERROLE: null, GROUPNAME: null };
                    //check if the Group name is undefined which is in case of "All Bpus" then call the ExportHelper function
                    (GroupName != undefined) ? (obj.User.UserBPU.BPU1 == GroupName ? ExportHelper(data, obj) : data) : ExportHelper(data, obj);
                });

                //Styling the data to be exported as making the header bold and etc.
                var mystyle = {
                    headers: true,
                    column: { style: { Font: { Bold: "1", Color: "#008270" } } },
                };
                //querying the required data and downloading the excel file using the alasql.js liberary function
                alasql.promise('SELECT * INTO XLSX(?,?) FROM ?', [Constants.ExportUserFileName, mystyle, $scope.exportData]).
                then(function (data) { return true; }).catch(function (err) {
                    //alert('Error: ' + err);
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleError,
                        MethodCase: "DISABLE",
                        Type: "error"
                    }
                    $scope.MESSAGE = err;

                });
            }


            //On Click on confirm on MODAL
            $scope.Confirm = function (cases, object) {
                switch (cases) {
                    case "NULL":
                        break;
                    case "DISABLE":
                        $scope.isUserPageDisabled = false;
                        break;
                    case "NAVIGATE":// ClearFiledsOfCreatePage();
                        $location.path("/User");
                        break;
                }
            }


            //Method will bew called when user clicks on cancel button after the user creation request is completed 
            $scope.CancelValidation = function (cases) {
                switch (cases) {
                    case "NAVIGATE": $location.path("/User");
                        break;

                }
            }
        }
    });


