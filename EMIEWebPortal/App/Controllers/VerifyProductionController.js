EMIEModule.controller("VerifyProductionController", function ($scope, $route, LoginService, FileSaver, CommonFunctionsSanboxProductionFactory, VerifyProdutionService, $location, SharedProperties, $rootScope, Constants, EMIETicketService, $sessionStorage, growl) {
    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {

        //Initializing the values.
        $scope.isVerifyPageDisabled = true;

        $(".status li").removeClass("Status-Selected");
        $(".status #Last-child").addClass("Status-Selected");


        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();


        $scope.IsDownloadedDivHidded = true;
        $scope.IsOldRequest = true;
        $scope.IsClosedDisable = false;
        $scope.IsSendFailureDisabled = false;
        CheckUserRole();
        PopulateProductionDetails();
        $scope.IsFailureDivisionButtonHidden = true;
        $scope.IsSuccessDivisionButtonHidden = false;
        $scope.IsFailureDivDescHidden = true;

        $scope.IsDisableAfterSentCommnets = false;

        //CheckUserRole For Enabling/Disbling the Signoff button
        function CheckUserRole() {
            //If he is Admin Only then they can see the RollBack Option
            if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                $scope.IsRollBackButtonHidden = false;
            }
        }

        //Function will populate the dtaa for existing ticket
        function PopulateProductionDetails() {

            $scope.Ticket = SharedProperties.getProperty();
            if ($scope.Ticket == "")
                if ($sessionStorage.TicketIdToShow != "") {
                    $scope.Ticket = $sessionStorage.TicketIdToShow;
                }
            // Getting dProdcution data from service
            if ($scope.Ticket != null && $scope.Ticket != "") {
                var approvals = null;
                VerifyProdutionService.GetTicketData($scope.Ticket.TicketId).success(function (TicketsData) {
                    $(".status #First-child").removeClass("Completed");
                    $(".status #Middle-child-1").removeClass("Completed");
                    $(".status #Middle-child-2").removeClass("Completed");
                    $(".status #Middle-child-3").removeClass("Completed");
                    $(".status #Last-child").removeClass("Completed");
                    $(".status #Middle-child-1").removeClass("RolledBack");
                    $(".status #First-child").removeClass("Current");
                    $(".status #Middle-child-1").removeClass("Current");
                    $(".status #Middle-child-2").removeClass("Current");
                    $(".status #Middle-child-3").removeClass("Current");
                    $(".status #Last-child").removeClass("Current");

                    var Ticketapprovals = TicketsData;
                    if (Ticketapprovals.FinalTicketStatus < Constants.TicketStatus['ApprovalPending']) {
                        $(".status #First-child").addClass("Completed");
                        $(".status #Middle-child-1").addClass("Current");
                        DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #Middle-child-1,.status #First-child");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ApprovalPending'] || Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['PartiallyApproved']) {
                        $scope.IsCompletePaneDisabled = false;
                        $(".status #First-child,.status #Middle-child-1").addClass("Completed");
                        $(".status #Middle-child-2").addClass("Current");
                        DisableTicketProgressBar(".status #Last-child,.status #Middle-child-3", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['Approved']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        $(".status #Middle-child-3").addClass("Current");
                        DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                        $scope.IsCompletePaneDisabled = true;
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ProductionReady']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3").addClass("Completed");
                        $(".status #Last-child").addClass("Current");
                        DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['Rejected']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        DisableTicketProgressBar(".status #Middle-child-3,.status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['SignedOff']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child").addClass("Completed");
                        DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['RolledBack']) {
                        $(".status #First-child").addClass("Completed");
                        $(".status #Middle-child-1").addClass("RolledBack");
                        DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #First-child,.status #Middle-child-1");
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ProductionChangesScheduled']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        $(".status #Middle-child-3").addClass("Current");
                        DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                    }

                    if ($scope.Ticket.value == "NonEditableModeOn" || $route.current.$$route.originalPath == "/SignOffPage") {

                        $scope.IsOldRequest = false;
                        $scope.TicketId = $scope.Ticket.TicketId;
                        if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['SignedOff']) {
                            $scope.isVerifyPageDisabled = true;
                            $scope.RadSuccessChecked = true;
                            $scope.RadFailedChecked = false;
                            $scope.IsSuccessDivHidden = false;
                            $scope.isProdSupportHidden = false;
                            $scope.IsRollBackButtonHidden = true;
                            $scope.IsFailureDivisionButtonHidden = true;
                            $scope.IsSuccessDivisionButtonHidden = false;
                            $scope.IsFailureDivDescHidden = true;
                            $scope.IsClosedDisable = true;
                            //Rightnow upload functionality is not working ,once it is up we cane uncomment the below line
                            GetAllUploadedFiles($scope.Ticket.TicketId);
                            $scope.Comments = Ticketapprovals.ProductionSuccessComments;

                        } else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['RolledBack']) {
                            $scope.isVerifyPageDisabled = true;
                            $scope.RadSuccessChecked = false;
                            $scope.RadFailedChecked = true;
                            $scope.IsClosedDisable = true;
                            $scope.isProdSupportHidden = true;
                            $scope.IsSuccessDivHidden = true;
                            $scope.IsFailureDivisionButtonHidden = false;
                            $scope.IsSuccessDivisionButtonHidden = true;
                            $scope.IsFailureDivDescHidden = false;
                            $scope.Comments = Ticketapprovals.ProductionFailureComments;
                            //Rightnow upload functionality is not working ,once it is up we cane uncomment the below line also rollback is not working
                            GetAllUploadedFiles($scope.Ticket.TicketId);
                            CheckUserRole();
                        }
                        else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ProductionReady']) {
                            $scope.isVerifyPageDisabled = false;
                            $scope.RadSuccessChecked = true;
                            $scope.RadFailedChecked = false;
                            $scope.isProdSupportHidden = false;
                            $scope.IsSuccessDivHidden = false;
                            $scope.IsRollBackButtonHidden = true;
                            $scope.IsFailureDivDescHidden = true;
                            $scope.IsFailureDivisionButtonHidden = true;
                            $scope.IsSuccessDivisionButtonHidden = false;

                            //Clean up upload folder and files if page is not disabled
                            VerifyProdutionService.DeleteUploadedFilesFromDirectoryOnRollBack($scope.Ticket.TicketId).success(function () {
                            }).error(function (error) {
                                $scope.isVerifyPageDisabled = false;
                            });
                        }
                        else {
                            $scope.isVerifyPageDisabled = true;
                        }
                    }
                    else if (Ticketapprovals.FinalTicketStatus == Constants.TicketStatus['ProductionReady'] && $route.current.$$route.originalPath == "/VerifyProduction") {
                        $scope.isVerifyPageDisabled = false;
                        $scope.RadSuccessChecked = true;
                        $scope.RadFailedChecked = false;
                        $scope.isProdSupportHidden = false;
                        $scope.IsSuccessDivHidden = false;
                        $scope.IsRollBackButtonHidden = true;
                        $scope.IsFailureDivisionButtonHidden = true;
                        $scope.IsFailureDivDescHidden = true;
                        $scope.IsSuccessDivisionButtonHidden = false;


                    }
                });
            }
        }


        function DisableTicketProgressBar(preventParamater, UnbindParameter) {
            $(UnbindParameter).unbind('click').click()
            $(preventParamater).click(function (event) {
                event.preventDefault();
            });

        }

        //mthod will fetch all the uploaded file present if any for the given ticketid
        function GetAllUploadedFiles(ticketId) {
            var IsSandboxVerifyPage = false;
            //call the upload file method from factory
            CommonFunctionsSanboxProductionFactory.GetAllUploadedFilesOfTicket(IsSandboxVerifyPage, ticketId, $scope);
        };



        // Handle the click of Success radio button, and display/hide the controls
        $scope.RadSuccessClicked = function (event) {
            if ($scope.Successchecked == event.target.value)
                $scope.Failedchecked = false
            $scope.IsSuccessDivHidden = false;
            $scope.isProdSupportHidden = false;
            $scope.IsRollBackButtonHidden = true;
            $scope.IsFailureDivisionButtonHidden = true;
            $scope.IsSuccessDivisionButtonHidden = false;
            $scope.IsFailureDivDescHidden = true;
            document.getElementById('file').value = null;
            $scope.IsSendFailureDisabled = false;
            $scope.Comments = null;
            $scope.IsDisableAfterSentCommnets = false;
            $scope.ProdContactEmail = null;

            //delete already uploaded and selected files
            $scope.filesSelected.length = 0;
            $scope.SelectedFilesMessage = "";
            $scope.DisableUploadButton = true;
            if ($scope.files.length > 0) {
                $scope.UploadedFiles = null;
                $scope.files = [];
                $scope.IsDownloadedDivHidded = true;
                VerifyProdutionService.DeleteUploadedFilesFromDirectoryOnRollBack($scope.Ticket.TicketId).success(function () {
                }).error(function (error) {
                    $scope.isVerifyPageDisabled = false;
                });

            }

        }


        // Handle the click of failure radio button, and display/hide the controls
        $scope.RadFailedClicked = function (event) {
            if ($scope.Failedchecked == event.target.value)
                $scope.Successchecked = false
            $scope.isProdSupportHidden = true;
            $scope.IsSuccessDivHidden = true;
            $scope.IsRollBackButtonHidden = false;
            $scope.IsFailureDivisionButtonHidden = false;
            $scope.IsSuccessDivisionButtonHidden = true;
            $scope.IsFailureDivDescHidden = false;
            document.getElementById('file').value = null;
            CheckUserRole();
            $scope.ProdContactEmail = null;
            $scope.IsSendFailureDisabled = false;
            $scope.Comments = null;
            $scope.IsDisableAfterSentCommnets = false;

            //delete already uploaded and selected files
            $scope.filesSelected.length = 0;
            $scope.SelectedFilesMessage = "";
            $scope.DisableUploadButton = true;

            if ($scope.files.length > 0) {
                $scope.IsDownloadedDivHidded = true;
                $scope.UploadedFiles = null;
                $scope.files = [];
                VerifyProdutionService.DeleteUploadedFilesFromDirectoryOnRollBack($scope.Ticket.TicketId).success(function () {
                }).error(function (error) {
                    $scope.isVerifyPageDisabled = false;
                });
            }
        }


        // Handles the SignOff functionality
        $scope.SignOff = function () {

            $scope.isVerifyPageDisabled = true;
            var SubmittedComments = $scope.Comments;
            $(".status #Last-child").removeClass("Current");
            $(".status #Last-child").addClass("Completed");
            // Get the ticket id from the shared location
            $scope.Ticket = SharedProperties.getProperty();
            $scope.Ticket.ProductionSuccessComments = SubmittedComments;

            //Call the service function with required variables.
            VerifyProdutionService.SignOff($scope.Ticket, Constants.VerifyActions['ProductionSuccess']).success(function (signedoff) {
                $scope.isVerifyPageDisabled = true;
                RefreshCount();
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "SIGNEDOFF",
                    Type: "success"
                }
                $scope.MESSAGE = "Request #" + $scope.Ticket.TicketId + Constants.SignedOffSuccess;


            }).error(function (error) {
                $scope.isVerifyPageDisabled = false;
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "SIGNEDOFF",
                    Type: "success"
                }
                $scope.MESSAGE = "Request #" + $scope.Ticket.TicketId + Constants.SignedOffFail;

            });
        }

        $scope.RollBackProduction = function (Comments) {

            $scope.isVerifyPageDisabled = true;
            $(".status #Last-child").removeClass("Current");
            $(".status #Last-child").addClass("Completed");
            // Get the ticket id from the shared location
            //$scope.Ticket = SharedProperties.getProperty();
            $scope.Ticket.ProductionFailureComments = Comments;

            //Call the service function with required variables.
            VerifyProdutionService.ProdRollBack($scope.Ticket, Constants.VerifyActions['ProductionRollback']).success(function (RollBack) {
                $scope.isVerifyPageDisabled = true;
                $scope.IsClosedDisable = true;
                RefreshCount();

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "REDIRECT",
                    Type: "success"
                }
                $scope.MESSAGE = "Request #" + $scope.Ticket.TicketId + Constants.RollbackSuccess;

            }).error(function (error) {
                $scope.isVerifyPageDisabled = false;

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "SIGNEDOFF",
                    Type: "success"
                }
                $scope.MESSAGE = "Request #" + $scope.Ticket.TicketId + Constants.RollbackFailed;

            });
        }

        $scope.SendFailureDetails = function (Comments) {

            $(".status #Last-child").removeClass("Current");
            $(".status #Last-child").addClass("Completed");
            // Get the ticket id from the shared location
            $scope.Ticket = SharedProperties.getProperty();
            $scope.Ticket.ProductionFailureComments = Comments;

            //Call the service function with required variables.
            VerifyProdutionService.ProductionFailure($scope.Ticket, Constants.VerifyActions['ProductionFailure']).success(function (RollBack) {
                $scope.IsSendFailureDisabled = true;

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "NULL",
                    Type: "success"
                }
                $scope.MESSAGE = RollBack;
                $scope.IsDisableAfterSentCommnets = true;
            }).error(function (error) {
                $scope.isVerifyPageDisabled = false;

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "NULL",
                    Type: "success"
                }
                $scope.MESSAGE = RollBack;
            });
        }

        $scope.files = [];
        $scope.filesSelected = [];
        $scope.SelectedFilesMessage;
        $scope.IsSelectedFIlesDivHidden = true;
        $scope.DisableUploadButton = true;
        // Get the details of the files to be uploaded
        $scope.getFileDetails = function (event) {
            //call common function from factory to get attached file details
            CommonFunctionsSanboxProductionFactory.GetAttachedFileDetails($scope, event)
        };


        // Upload the files to the server
        $scope.uploadFiles = function () {
            var IsVerifySandbox = false;

            //call the common method from factory to upload attachments
            CommonFunctionsSanboxProductionFactory.UploadFilesToFolder($scope, IsVerifySandbox)
        }


        // Download the files from server location
        $scope.DownloadFile = function (SingleFile) {

            EMIETicketService.DownloadFile(SingleFile).success(function (downloaded) {
                $scope.toJSON = angular.toJson(downloaded);
                // Use Blob Objects to save the data downloaded from server.
                var blob = new Blob([$scope.toJSON], { type: 'application/octet-stream' });
                navigator.msSaveBlob(blob, SingleFile);
            }).error(function (error) {
                growl.error(Constants.ErrorFileUnableToDelete + error.message, { title: Constants.TitleError });
            });
        }


        //Delete selected files and remove from selected-files array and all-files array
        $scope.DeleteSelectedFile = function (SelectedFile) {

            //call the common method from factory to delete selected attachment
            CommonFunctionsSanboxProductionFactory.DeleteAttachmentFromFileArray($scope, SelectedFile)
        }


        // Delete the files from server location
        $scope.Delete = function (SingleFile) {
            //call the common method from factory to delete uploaded attachment from server location
            CommonFunctionsSanboxProductionFactory.DeleteAttachmentFromServerLocation($scope, SingleFile, growl)
        }

        //This function will refresh the count of the left panel
        function RefreshCount() {

            var getdata = LoginService.GetTicketCount($rootScope.User.UserId);
            getdata.success(function (result) {
                $rootScope.TicketCounts = result;

            });
        }


        //On click on confirm on MODAL
        $scope.Confirm = function (cases, object) {
            switch (cases) {
                case "NULL":
                    break;
                case "SIGNEDOFF":
                    $scope.IsClosedDisable = true;
                    break;
                case "REDIRECT":
                    $location.path("/SandboxPage");
                    break;
            }
        }

        ////---------------------Contact Support Team
        $scope.ContactSupportTeam = function (email, comments) {
            $scope.Ticket.ProductionSuccessComments = comments;
            VerifyProdutionService.ContactSupport($scope.Ticket, email).success(function (Support) {
                // $scope.isVerifyPageDisabled = true;  
                //alert("Issue has been send to Support Team!")

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "NULL",
                    Type: "success"
                }
                $scope.MESSAGE = Constants.SupportTeamSentMessage;

                $scope.ProdContactEmail = null;
                $scope.Comments = null
            }).error(function (error) {
                $scope.isVerifyPageDisabled = false;
                //alert("Error in sending Issue ")
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorInSendingIssue;
            });
        }
        //////-------------------------------Download Attachmnt---------------------------------------
        $scope.DownloadSelectedAttchment = function (DownloadPathOfUploadedFiles, SingleFile) {
            //call the common method from factory to download uploaded attachment from server location to local system
            CommonFunctionsSanboxProductionFactory.DownloadAttachmentToLocal($scope, DownloadPathOfUploadedFiles, SingleFile, growl, FileSaver)
        }
    }
});

