EMIEModule.service("VerifyProdutionService", function ($http) {
   

    this.SignOff = function (Ticket, Actions) {
        var parameters = {
            ticket: Ticket,
            actions: Actions
        };
        var response = $http({
            method: "post",
            url: "Ticket/AddComments",
            data: JSON.stringify(parameters),
            datatype: "json"
        });

        return response;
    }


    this.ProdRollBack = function (Ticket, Actions) {
        var parameters = {
            ticket: Ticket,
            actions: Actions
        };
        var response = $http({
            method: "post",
            url: "Ticket/AddComments",
            data: JSON.stringify(parameters),
            datatype: "json"
        });

        return response;
    }


    this.ProductionFailure = function (Ticket, Actions) {
        var parameters = {
            ticket: Ticket,
            actions: Actions
        };
        var response = $http({
            method: "post",
            url: "Ticket/AddComments",
            data: JSON.stringify(parameters),
            datatype: "json"
        });

        return response;
    }

    //Get the ticket data from MVC controller
    this.GetTicketData = function (TicketId) {

        return $http({
            cache: false,
            method: "post",
            url: "Ticket/GetTicketsData",
            params: {
                ticketId: TicketId
            }
        });
    }

    //delete the all uploaded file of given ticket on radio change
    this.DeleteUploadedFilesFromDirectoryOnRollBack = function (TicketId) {

        return $http({
            cache: false,
            method: "post",
            url: "Ticket/DeleteUploadedFilesFromDirectoryOnRollback",
            params: {
                ticketId: TicketId,
                isVerifyPage:false
            }
        });
    }
    //to send mail to contact support team
    this.ContactSupport = function (Ticket,SupportEmail) {
        var parameters = {
            ticket: Ticket,
            contactSupportEmail: SupportEmail
        };
        var response = $http({
            method: "post",
            url: "Ticket/ContactSupportTeam",
            data: JSON.stringify(parameters),
            datatype: "json"
        });

        return response;
    }
});