EMIEModule.service("CRService", function ($timeout, $http, $rootScope) {

    //Get All fields data from MVC controller
    this.GetNewRequestFieldsData = function (user, IsEMIEChampion) {
        var parameters = {
            user: user,
            IsEMIEChampion: IsEMIEChampion
        }
        return $http({
            cache: false,
            method: "post",
            url: "Application/GetAllCRDetails",
            data: JSON.stringify(parameters),
            dataType: "json"

        });
    }

  
    //Submitting the ticket to MVC controller
    this.AddRequest = function (ticket, action) {
        var parameters = {
            ticket: ticket,
            action: action
        };
        var response = $http({
            cache: false,
            method: "post",
            url: "Ticket/ChangeRequest",
            data: JSON.stringify(parameters),            
            dataType: "json"            
        });

        return response;
    }


    //method to ping url and check if its reachable
    this.apingURL = function (Url) {
        var response = $http({
            cache: false,
            method: "get",
            url: "XMLHelper/PingURL",
            params:
                { URL: Url }
        })

        return response;
    }


    //http method to check if url already exists
    this.checkURL = function (findUrl) {
        var response = $http({
            cache: false,
            method: "get",
            url: "XMLHelper/CheckUrl",
            params:
                { findString: findUrl }
        })
    
        return response;
    }


    //method to  get the previous ticket unclosed ticket ids if any
    this.URLTicketExists = function (findUrl) {
        var response = $http({
            cache: false,
            method: "get",
            url: "XMLHelper/PreviousTicket",
            params:
                { findUrl: findUrl }
        })

        return response;
    }


    //method to add url to xml
    this.AddURL = function (ticket) {
        var response = $http({
            cache: false,
            method: "get",
            url: "XMLHelper/AddInXML",
            params:
                { ticket : ticket}
        })
        return response
    }

    //Get the ticket data from MVC controller
    this.GetTicketData = function (TicketId) {

        return $http({
            cache: false,
            cache: false,
            method: "post",
            url: "Ticket/GetAllDataOfSubmittedTicket",
            params: {
                ticketId: TicketId
            }
        })
    }

    //Get all applications of selected bpu
    this.GetAppListOfAllBPU = function (user, isEMIEChampion, TypedAppName) {

        var parameters = {
            user: user,
            isEMIEChampion: isEMIEChampion,
            TypedAppName: TypedAppName
        }
        return $http({
            cache: false,
            method: "post",
            url: "Application/GetAppListOfAllBPU",
            data: JSON.stringify(parameters),
            dataType: "json"
        });
    }
    //Get all applications of selected bpu
    this.GetAppListOfSelectedBPU = function (BPU) {

        var parameters = {
            BPU: BPU
        }
        return $http({
            cache: false,
            method: "post",
            url: "Application/GetAppListOfSelectedBPU",
            data: JSON.stringify(parameters),
            dataType: "json"
        });
    }
    //Insert new application
    this.AddNewApplication = function (Application) {

        var parameters = {
            Application: Application
        }
        return $http({
            cache: false,
            method: "post",
            url: "Application/AddNewApplication",
            data: JSON.stringify(parameters),
            dataType: "json"
        });
    }

    //GetALL BPU data By User  
    this.GetAllBPUOfUser = function (User) {

        var parameters = {
            User: User
        }
        return $http({
            cache: false,
            method: "post",
            url: "Application/GetAllBPUOfUser",
            data: JSON.stringify(parameters),
            dataType: "json"
        });
    }
    
}).service("SharedProperties", function () {
        var property = "";
        return {
            getProperty: function () {
                return property;
            },
            setProperty: function (value) {
                property = value;
            }
        };


    })