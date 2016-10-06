EMIEModule.service("LoginService", function ($http, $location, $route, $sessionStorage, Constants, $rootScope) {
    ///This method will get valid logged in user otherwise will return NULL
    this.GetValidLoggedInUser = function () {
        return $http({
            cache: false,
            method: "post",
            url: "Login/GetValidLoggedInUser"
        })
    }

    this.GetTicketCount = function (userId) {
        return $http({
            cache: false,
            method: "post",
            url: "Ticket/GetAllCounts",
            params: { userId: userId },
            ignoreLoadingBar: true
        })
    }

    //method to get configurationsetting after login
    this.GetConfigurationAtStart = function () {
        return $http({
            cache: false,
            method: "post",
            url: "Login/GetConfigurationAtStart",
            ignoreLoadingBar: true
        })
    }

    //this method is used to check user role on redirection of pages ,if its emie champ
    this.getUserWithRoleAtRedirectionForEMIEChamp = function (IsGroupHead) {
        if ($sessionStorage.User != null && $sessionStorage.User != "" && $sessionStorage.User != undefined) {
            if (IsGroupHead) {
                if ($sessionStorage.User.UserRole.RoleId == Constants.RoleId['EMIEChampion'] || $sessionStorage.User.UserRole.RoleId == Constants.RoleId['BPULead']) {
                    $rootScope.User = $sessionStorage.User;
                    return true;
                }
                else {
                    $location.path("/Logout");
                    return false;
                }
            }
            else {
                if ($sessionStorage.User.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                    $rootScope.User = $sessionStorage.User;
                    return true;
                }
                else {
                    $location.path("/Logout");
                    return false;
                }
            }

        }
        else
            if ($rootScope.User != null && $rootScope.User != "" && $rootScope.User != undefined) {
                if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                    $sessionStorage.User = $rootScope.User;
                    return true;
                }
                else {
                    $location.path("/Logout");
                    return false;
                }
            }
            else
                if ($rootScope.User == null && $route.current.$$route.originalPath != '/Register') {
                    $location.path("/Logout");
                    return false;
                }
                else if ($route.current.$$route.originalPath == '/Register')
                    return true;
    };

    //this method is used to check user role on redirection of pages for requester
    this.getUserWithRoleAtRedirectionForUser = function () {
        if ($sessionStorage.User != null) {
            $rootScope.User = $sessionStorage.User;
            return true;
        }
        else
            if ($rootScope.User != null) {
                $sessionStorage.User = $rootScope.User;
                return true;
            }
            else
                if ($rootScope.User == null) {
                    $location.path("/Login");
                    return false;
                }
    };
})