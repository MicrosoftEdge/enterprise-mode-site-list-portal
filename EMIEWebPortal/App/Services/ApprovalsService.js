EMIEModule.service("approvalService", function ($http) {
    /// <summary>
    /// method to get all approvers of given ticket
    /// </summary>
    /// <param name="ticketId">ticket id of which approvers need to be fetched</param>
    /// <returns>list of approvers</returns>
    this.getApproversOfTicket = function (ticketId) {

        var approverdata = $http({
            cache: false,
            method: "post",
            url: "Approval/GetApproversOfTicket",
            params: {
                ticketId: JSON.stringify(ticketId)
            }
        });
        return approverdata;
    };


    //this method will fetch the pending approval list from MVC Controller
    this.GetPendingApproverList = function (UserData, IsAllRequest) {
        var parameters = {
            userObj: UserData,
            IsAllRequest: IsAllRequest
        };
        return $http({
            method: "post",
            url: "Approval/GetPendingApproverList",
            data: JSON.stringify(parameters),
            dataType: "json"
        });
    };


    //this method will send the tickets list which needs to be approved to MVC Controller
    this.PerformRequest = function (SelectedList, LoggedInUserdId, IsSendForApproval, rejectionComments) {
        return $http({
            cache: false,
            method: "post",
            url: "Approval/PerformRequest",
            params: {
                ticketIds: SelectedList,
                isApproved: IsSendForApproval,
                loggedInUserid: LoggedInUserdId,
                rejectionComments: rejectionComments
            }
        });
    };

    //this method will send the tickets list which needs to be approved to MVC Controller
    this.SendReminder = function (SelectedApproversList, TicketData) {
        var parameters = {
            listOfApprovers: SelectedApproversList,
            ticket: TicketData
        };
        var response = $http({
            method: "post",
            url: "Approval/SendReminder",
            data: JSON.stringify(parameters),
            dataType: "json"
        });

        return response;
    };

})
