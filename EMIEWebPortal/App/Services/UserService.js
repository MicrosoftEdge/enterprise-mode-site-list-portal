EMIEModule.service("userService", function ($http) {

    /// <summary>
    /// method to get all Users 
    /// </summary>
    /// <returns>list of users</returns>
    this.getAllUsers = function () {

        var allUserList = $http({
            cache: false,
            method: "post",
            url: "User/GetAllUsers"
        });
        return allUserList;
    };

    /// <summary>
    /// method to get all Roles 
    /// </summary>
    /// <returns>list of roles</returns>
    this.getAllRoles = function () {

        var RoleList = $http({
            cache: false,
            method: "post",
            url: "User/GetAllRoles"
        });
        return RoleList;
    };

    /// <summary>
    /// method to get all BPU 
    /// </summary>
    /// <returns>list of BPU</returns>
    this.getAllBPU = function () {

        var BPUList = $http({
            cache: false,
            method: "post",
            url: "User/GetAllBPU"
        });
        return BPUList;
    };

    /// <summary>
    /// method to performUserOperation Insert/Update/Delete
    /// </summary>
    /// <returns>list of BPU</returns>
    this.AddUser = function (UserRole, action, OldUserRole, activation) {
        var parameters = {
            user: UserRole,
            action: action,
            oldUser: OldUserRole,
            activation:activation
        };
        var response = $http({
            method: "post",
            url: "User/AddUser",
            data: JSON.stringify(parameters),
            dataType: "json"
        });

        return response;
    };

    /// <summary>
    /// method to get all active directory Users 
    /// </summary>
    /// <returns>list of users</returns>
    this.getAllADUsers = function (serachUserName) {
        var userdata = $http({
            cache: false,
            method: "post",
            url: "User/GetADUserFromAllDomain",
            params: {
                userName: JSON.stringify(serachUserName)
            },
            dataType: "json"
        });
        return userdata;
    };

    /// <summary>
    /// method to get all Users 
    /// </summary>
    /// <returns>list of users</returns>
    this.getAllEMIEChampRegisterUsers = function () {

        var allUserList = $http({
            cache: false,
            method: "post",
            url: "User/GetAllEMIEChampRegisterUsers"
        });
        return allUserList;
    };

    /// <summary>
    /// method to validate emie admin
    /// </summary>
    /// <returns>true-validated,false-unauthorised</returns>
    this.validateEMIEAdmin = function (EMIEUserName,EMIEPassword) {
        var isValidated = $http({
            cache: false,
            method: "post",
            url: "User/ValidateEMIEAdmin",
            params: {
                emieUserName: EMIEUserName,
                emiePassword: EMIEPassword
            },
            dataType: "json"
        });
        return isValidated;
    }

    /// <summary>
    /// method to change emie admin password
    /// </summary>
    /// <returns>true-successfull,false-failed</returns>
    this.changeEMIEAdminCredentials = function (newpassword) {
        var isSaved = $http({
            cache: false,
            method: "post",
            url: "User/ChangeEMIEAdminCredentials",
            params: {
                newpassword: newpassword
            },
            dataType: "json"
        });
        return isSaved;
    }
})
