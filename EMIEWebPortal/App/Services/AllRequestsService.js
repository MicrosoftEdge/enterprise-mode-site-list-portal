EMIEModule.service("AllRequestsService", function ($http) {
    ///This method will call MVC controller "TicketController"'s function GetTicketDataForAllRequest
    //which will return all the tickets related to the LogIn id given as input parameter here
    this.GetAllRequests = function (logOnId, isEmieChampion) {
        return $http({
            cache: false,
            method: "post",
            url: "Ticket/GetTicketDataForAllRequest",
            params: {
                logOnId: logOnId,
                isEmieChampion: isEmieChampion
            }
        })
    }  
})