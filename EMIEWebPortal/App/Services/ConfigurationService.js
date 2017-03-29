EMIEModule.service("ConfigurationService", function ($http) {
    //Add configuration settings data to DB in key-value format
    this.AddConfigurationSetting = function (keyValueData, CreatedBy) {
        var parameters = {
            keyValueData: keyValueData,
            CreatedBy: CreatedBy
        };
        return $http({
            cache: false,
            method: "post",
            url: "Configuration/AddConfigurationSetting",
            data: JSON.stringify(parameters),
            dataType: "json"
        })
    }
    ///This method will get valid logged in user otherwise will return NULL
    this.GetConfigSettings = function () {
        return $http({
            cache: false,
            method: "post",
            url: "Configuration/GetConfigSettings"
        })
    }

    //Check the UNC path access
    this.CheckUNCAccess = function (keyValueData) {
        var parameters = {
            keyValueData: keyValueData
        };
        return $http({
            cache: false,
            method: "post",
            url: "Configuration/CheckUNCAccess",
            data: JSON.stringify(parameters),
            dataType: "json"
        })
    }

    //THIS method will add the new group in the database
    this.AddNewGroup = function (userRole, action) {
        var parameters = {
            userRole: userRole,
            action: action,
        }
        return $http({
            cache: false,
            method: "post",
            url: "Configuration/AddNewGroup",
            data: JSON.stringify(parameters),
            dataType: "json"
        })

    }

    //This method call the editrolename function which will update the name in the database
    this.EditRoleName = function (newName, oldName, IsMandatory) {
        var parameter = {
            newName: newName,
            oldName: oldName,
            IsMandatory: IsMandatory
        }

        return $http({
            cache: false,
            method: "post",
            url: "Configuration/EditRoleName",
            data: JSON.stringify(parameter),
            dataType: "json"
        })
    }

    //this service method gets all the roles from the database to be populated in the list
    this.GetRoles = function () {
        return $http({
            cache: false,
            method: "post",
            url: "Configuration/GetRoles",
        })
    }

    //this code is commented for now but might of some use in future
    //this method will update the mandatory roles
    //this.updateMandatoryRoles = function (role) {
    //    return $http({
    //        cache: false,
    //        method: "post",
    //        url: "Configuration/updateMandatoryRoles",
    //        data: role,
    //        dataType: "json"
    //    })
    //}


    //method to edit the group details
    this.EditGroup = function (userRole) {
        return $http({
            cache: false,
            method: "post",
            url: "Configuration/EditGroup",
            data: userRole,
            dataType: "json"
        })

    }


    //method to get the group head name and email
    this.GetGroupHead = function (GroupDetail) {
        return $http({
            cache: false,
            method: "post",
            url: "Configuration/GetGroupHead",
            data: GroupDetail,
            dataType: "json"
        })
    }

    /// <summary>
    /// method to get all BPU 
    /// </summary>
    /// <returns>list of BPU</returns>
    this.getAllGroupList = function () {

        var BPUList = $http({
            cache: false,
            method: "post",
            url: "Configuration/GetAllGroupList"
        });
        return BPUList;
    };
})