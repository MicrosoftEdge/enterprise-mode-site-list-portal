EMIEModule.service("EMIETicketService", function ($http) {
    this.getapprovers = function (TicketID) {
        var approvers = [];
        approvers = $http({
            cache: false,
            method: "post",
            url: "Ticket/VerifySandbox",
            params: {
                ticketId: TicketID
            }
        })
        console.log(approvers);

        return approvers;
    }

    this.SendForApproval = function (Ticket, Approvers, Comments) {
        var parameters = {
            ticket: Ticket,
            approvers: Approvers,
            comments: Comments
        };
        var response = $http({
            method: "post",
            url: "Ticket/AddApprovalData",
            data: JSON.stringify(parameters),
            datatype: "json"
        });

        return response;
    }

    this.SendFailureDetails = function (Ticket, Actions) {
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

    this.SandboxRollBack = function (Ticket, Actions) {
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

    this.UploadFiles = function (formdata) {

        var response = $http({
            method: 'POST',
            url: "Ticket/FileUpload",
            data: formdata,
            headers: {
                'Content-Type': undefined
            }
        });
        return response;
    }


    this.DownloadFile = function (SingleFile, TicketId) {

        var response = $http({
            method: 'GET',
            cache: false,
            url: "Ticket/DownloadFile",
            params: {
                FileName: SingleFile,
                ticketId: TicketId
            },
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
        return response;
    }

    this.Delete = function (filePath, SingleFile) {

        var response = $http({
            method: 'GET',
            cache: false,
            url: "Ticket/DeleteFile",
            params: {
                filePath: filePath,
                FileName: SingleFile
            }
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

    //Get the all uploaded file of given ticket data from MVC controller
    this.GetAllUploadedFiles = function (TicketId, IsSandboxVerifyPage) {

        return $http({
            cache: false,
            method: "post",
            url: "Ticket/GetAllUploadedFiles",
            params: {
                ticketId: TicketId,
                isSandboxVerifyPage: IsSandboxVerifyPage
            }
        });
    }

    //Get the all uploaded file of given ticket data from MVC controller
    this.GetSandboxFailureComments = function (TicketId) {

        return $http({
            cache: false,
            method: "post",
            url: "Ticket/GetSandboxFailureComments",
            params: {
                TicketID: TicketId
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
                isVerifyPage: true
            }
        });
    }

    //to download attachments from location
    this.DownLoadAttachment = function (downloadedPath) {
        return $http({
            cache: false,
            method: "post",
            url: "Ticket/DownLoadAttachment",
            params: {
                downloadedPath: downloadedPath
            }
        });
    }
})
