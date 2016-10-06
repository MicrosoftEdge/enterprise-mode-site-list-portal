EMIEModule.service("ProdChangesService", function ($http) {
        
    this.GetProdDateTime = function (ticketID) {
        return $http({
            cache: false,
            method: "post",           
            url: "Ticket/GetProductionDeployDate",
            params: {
                ticketId: JSON.stringify(ticketID)
            }         
        })
    }
    this.SaveProdDateTime = function (ticket) {
       
        return $http({
            cache: false,
            method: "post",
            url: "Ticket/UpdateProductionDeployDate",           
            data: JSON.stringify(ticket),            
            dataType: "json"  
        })
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
})