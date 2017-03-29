EMIEModule.service("ReportsService", function ($http) {
    //This Function will fetch the total count of ticket based on final Cr Status 
    this.GetTicketStatusCount = function (startDate, endDate, BPUIds) {
        return $http({
            cache: false,
            method: "post",
            url: "ReportsHelper/GetTicketStatusCount",
            params: {
                startDate: startDate,
                endDate: endDate,
                BPUIds: BPUIds,
            },
            ignoreLoadingBar: true
        })
    }

    //This Function will fetch the total count of ticket based on BPU
    this.GetBPUWiseTicketCount = function (startDate, endDate, BPUIds) {
        return $http({
            cache: false,
            method: "post",
            url: "ReportsHelper/GetBPUWiseTicketCount",
            params: {
                startDate: startDate,
                endDate: endDate,
                BPUIds: BPUIds,
            },
            ignoreLoadingBar: true
        })
    }

    //This Function will fetch list of application that are signedoff
    this.GetListOfApplication = function (startDate, endDate, BPUIds) {
        return $http({
            cache: false,
            method: "post",
            url: "ReportsHelper/GetListOfApplication",
            params: {
                startDate: startDate,
                endDate: endDate,
                BPUIds: BPUIds,
            },
            ignoreLoadingBar: true
        })
    }

    //This Function will fetch the total count of Reason for change
    this.GetChangeForReasonCount = function (startDate, endDate, BPUIds) {
        return $http({
            cache: false,
            method: "post",
            url: "ReportsHelper/GetChangeForReasonCount",
            params: {
                startDate: startDate,
                endDate: endDate,
                BPUIds: BPUIds,
            },
            ignoreLoadingBar: true
        })
    }

    //This Function will fetch the total count of Change Type
    this.GetChangeTypeCount = function (startDate, endDate, BPUIds) {
        return $http({
            cache: false,
            method: "post",
            url: "ReportsHelper/GetChangeTypeCount",
            params: {
                startDate: startDate,
                endDate: endDate,
                BPUIds: BPUIds,
            },
            ignoreLoadingBar: true
        })
    }

    //This Function will fetch all the BPUs
    this.GetAllBPU = function (user, isEMIEChampion) {
        var parameters = {
            user: user,
            isEMIEChampion: isEMIEChampion,
        }
        return $http({
            cache: false,
            method: "post",
            url: "ReportsHelper/GetAllBPU",
            data: JSON.stringify(parameters),
            dataType: "json",
            ignoreLoadingBar: true
        })
    }

})

