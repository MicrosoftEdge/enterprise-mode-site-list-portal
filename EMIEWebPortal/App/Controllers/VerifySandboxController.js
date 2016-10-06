EMIEModule.controller("VerifySandboxController", function ($scope, $route, CommonFunctionsSanboxProductionFactory, $http, LoginService, EMIETicketService, FileSaver, approvalService, Constants, $location, SharedProperties, $sessionStorage, $rootScope, growl) {


    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {

        //Status bar add and remove classes
        $(".status li").removeClass("Staus-Selected");
        $(".status #Middle-child-1").addClass("Staus-Selected");


        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        $scope.IsAllApproversSectionHidden = true;
        $scope.ScheduleProdIsDisabled = true;
        // SSO - If User data is available in localstorage then assign this to rootscope    
        if ($sessionStorage.User != null)
            $rootScope.User = $sessionStorage.User;
        //Initializing the values.
        $scope.isVerifyPageDisabled = true;
        $scope.RadSuccessChecked = true;
        GetApprovers();
        $scope.IsFailureDivHidden = true;
        $scope.IsOldRequest = true;
        $scope.IsClosedDisable = false;
        $scope.IsSendFailureDisabled = false;

        $scope.submissionSuccess = "";
        $scope.IsDownloadedDivHidded = true;
        //Redirect to Production change page when button is clicked.
        $scope.ScheduleProdChanges = function () {
            $location.path("/ProductionChanges");
        }

        $scope.isDisableAfterComments = false;

        // Declare an array that will hold the data of the selected approvers and comments
        $scope.SelectedApprovers = [];
        $scope.ApproverComments = [];
        $scope.ListofEmieApprovals = [];

        //This function gets all the appovers and distinct them as per their roles
        function GetApprovers() {
            $scope.Ticket = SharedProperties.getProperty();
            if ($scope.Ticket == "")
                if ($sessionStorage.TicketIdToShow != "") {
                    $scope.Ticket = $sessionStorage.TicketIdToShow;
                }
            EMIETicketService.GetTicketData($scope.Ticket.TicketId).success(function (TicketsData) {
                $scope.RadSuccessChecked = true;
                $scope.RadFailedChecked = false;
                $scope.IsSuccessDivHidden = false;
                $scope.IsFailureDivHidden = true;
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

                // Get the ticket id from the shared location
                if (TicketsData.FinalTicketStatus < Constants.TicketStatus['ApprovalPending']) {
                    $(".status #First-child").addClass("Completed");
                    $(".status #Middle-child-1").addClass("Current");
                    DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #Middle-child-1,.status #First-child");
                }
                else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['ApprovalPending'] || TicketsData.FinalTicketStatus == Constants.TicketStatus['PartiallyApproved']) {
                    $(".status #First-child,.status #Middle-child-1").addClass("Completed");
                    $(".status #Middle-child-2").addClass("Current");
                    DisableTicketProgressBar(".status #Last-child,.status #Middle-child-3", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                }
                else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['Approved']) {
                    $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                    $(".status #Middle-child-3").addClass("Current");
                    DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                }
                else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['Rejected']) {
                    $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                    DisableTicketProgressBar(".status #Last-child,.status #Middle-child-3", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                }
                else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['ProductionReady']) {
                    $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3").addClass("Completed");
                    $(".status #Last-child").addClass("Current");
                    DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                }
                else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['SignedOff']) {
                    $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child").addClass("Completed");
                    DisableTicketProgressBar("", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child");
                }
                else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['RolledBack']) {
                    $(".status #First-child").addClass("Completed");
                    $(".status #Middle-child-1").addClass("RolledBack");
                    DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #First-child,.status #Middle-child-1");
                }
                else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['ProductionChangesScheduled']) {
                    $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                    $(".status #Middle-child-3").addClass("Current");
                    DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                }
                
                if ($scope.Ticket!="")
                {
                    $scope.TicketId = $scope.Ticket.TicketId;
                    $scope.IsOldRequest = false;
                }
                if ($scope.Ticket.value == "NonEditableModeOn" || $route.current.$$route.originalPath == "/SandboxPage") {                    
                    $scope.isVerifyPageDisabled = true;
                    if (TicketsData.FinalTicketStatus >= Constants.TicketStatus['ApprovalPending'] && TicketsData.FinalTicketStatus <= Constants.TicketStatus['SignedOff']) {
                        $scope.RadSuccessChecked = true;
                        $scope.RadFailedChecked = false;
                        $scope.IsClosedDisable = true;
                        $scope.IsSuccessDivHidden = false;
                        $scope.IsFailureDivHidden = true;
                        GetAllUploadedFiles($scope.Ticket.TicketId);
                        GetApprovalsByTicketID($scope.Ticket.TicketId);
                    }
                    else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['ProductionChangesScheduled']) {
                        $scope.RadSuccessChecked = true;
                        $scope.RadFailedChecked = false;
                        $scope.IsClosedDisable = true;
                        $scope.IsSuccessDivHidden = false;
                        $scope.IsFailureDivHidden = true;
                        GetAllUploadedFiles($scope.Ticket.TicketId);
                        GetApprovalsByTicketID($scope.Ticket.TicketId);
                    }

                    else if (TicketsData.FinalTicketStatus >= Constants.TicketStatus['RolledBack'] && TicketsData.FinalTicketStatus <= Constants.TicketStatus['VerificationFailedTestMachine']) {
                        $scope.IsAllApproversSectionHidden = true;
                        $scope.RadSuccessChecked = false;
                        $scope.RadFailedChecked = true;
                        $scope.IsClosedDisable = true;
                        $scope.IsSuccessDivHidden = true;
                        $scope.IsFailureDivHidden = false;
                        GetAllUploadedFiles($scope.Ticket.TicketId);
                        GetSandboxFailureComments($scope.Ticket.TicketId);
                    }
                    else if (TicketsData.FinalTicketStatus < Constants.TicketStatus['ApprovalPending']) {
                        $scope.isVerifyPageDisabled = false;
                        $scope.IsAllApproversSectionHidden = true;
                        PopulateApproverDropdown($scope.Ticket.TicketId);
                        $scope.IsClosedDisable = false;
                        $scope.RadFailedChecked = false;
                        $scope.IsFailureDivHidden = true;
                        $scope.RadSuccessChecked = true;
                        $scope.IsSuccessDivHidden = false;

                        //Clean up upload folder and files if page is not disabled
                        EMIETicketService.DeleteUploadedFilesFromDirectoryOnRollBack($scope.Ticket.TicketId).success(function () {
                           
                        }).error(function (error) {
                            $scope.isVerifyPageDisabled = false;
                        });
                    }
                }
                else {

                    PopulateApproverDropdown($scope.Ticket.TicketId);

                }
            });

        };

        function DisableTicketProgressBar(preventParamater, UnbindParameter) {
            $(UnbindParameter).unbind('click').click()
            $(preventParamater).click(function (event) {
                event.preventDefault();
            });

        }

        //Call the service method to get the aprovers
        function PopulateApproverDropdown(ticket) {
            EMIETicketService.getapprovers(ticket).success(function (AllApprovals) {
                $scope.approvals = AllApprovals;
                $scope.ListofEmieApprovals = angular.copy(AllApprovals[0]);
                $scope.approvals[0].Value = [];
                var Approval = {
                    UserName: "EMIE CHAMPION GROUP"
                };
                $scope.approvals[0].Value.push(Approval);
                $scope.SelectedValue = $scope.approvals[0].Value[0];
                $scope.isVerifyPageDisabled = false;
            })
            .error(function (error) {
                $scope.isVerifyPageDisabled = false;
                $scope.status = Constants.UanbleToLoadTicketData + " " + error.message;
            });
        }

        //mthod will fetch all the uploaded file present if any for the given ticketid
        function GetAllUploadedFiles(ticketId) {
            var IsSandboxVerifyPage = true;

            //call the upload file method from factory
            CommonFunctionsSanboxProductionFactory.GetAllUploadedFilesOfTicket(IsSandboxVerifyPage, ticketId, $scope);
        };


        //mthod will fetch the failre comments present if any for the given ticketid
        function GetSandboxFailureComments(ticketId) {
            var getData = EMIETicketService.GetSandboxFailureComments(ticketId);
            getData.then(function (msg) {
                $scope.FailedComments = msg.data;
            }, function () {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.Errordata;
            });
        };
        $scope.SendForApprovalButtonShow = true;


        /// <summary>
        /// method call the service to fetch all approvers of given ticket
        /// </summary>
        /// <param name="ticketId">ticket id of which approvers need to be fetched</param>
        /// <returns>list of all approvers of given ticket</returns>
        function GetApprovalsByTicketID(ticketID) {
            var approvalsDict = [];
            var getData = approvalService.getApproversOfTicket(ticketID);

            $scope.IsSuccessDivReadOnly = true;
            $scope.IsAllApproversSectionHidden = false;
            $scope.SendForApprovalButtonShow = false;

            getData.then(function (msg) {

                $scope.ApproverDDL = true;
                $scope.ApproverCommentsShow = true;
                //this section will remove the emie champions record which has not approved the ticket
                var ApprovalList;
                var EMIEChampionComments;
                var flag = false;
                ApprovalList = angular.copy(msg.data);
                for (var i = msg.data.length - 1; i >= 0 ; i--) {

                    if (msg.data[i].Approver.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {

                        EMIEChampionComments = msg.data[i].ApproverComments;
                        if (msg.data[i].ApprovalState == Constants.ApprovalState['Pending']) {
                            ApprovalList.splice(i, 1);
                        }
                    }
                }
                for (var i = 0; i < ApprovalList.length ; i++) {

                    if (ApprovalList[i].Approver.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                        flag = true;
                    }
                }

                //Harcoded value to display EMIE Champ Group
                if (!flag) {
                    var Approval = [];
                    var Approvals = {
                        ApprovalState: Constants.ApprovalState['Pending'],
                        Approver: {
                            UserName: "EMIE CHAMPION GROUP",
                            UserRole: {
                                RoleName: "EMIE CHAMPIONS"
                            }
                        },
                        ApproverComments: EMIEChampionComments,
                        IsActive: true,
                        NoOfReminders: 0
                    };
                    Approval.push(Approvals);
                    approvalsDict.push({
                        Key: "EMIE CHAMPION",
                        Value: Approval
                    });
                }
                for (var i = 0; i < ApprovalList.length; i++) {
                    var selectApproverValues = [];
                    selectApproverValues.push(ApprovalList[i]);
                    if (ApprovalList[i].Approver.UserRole.RoleId != Constants.RoleId['EMIEChampion']) {
                        approvalsDict.push({
                            Key: ApprovalList[i].Approver.UserRole.RoleName,
                            Value: selectApproverValues
                        });
                    }
                    else if (ApprovalList[i].Approver.UserRole.RoleId == Constants.RoleId['EMIEChampion'] && ApprovalList[i].ApprovalState > Constants.ApprovalState['Pending'] && ApprovalList[i].ApprovalState <= Constants.ApprovalState['Rejected']) {
                        approvalsDict.push({
                            Key: ApprovalList[i].Approver.UserRole.RoleName,
                            Value: selectApproverValues
                        });
                    }
                }
                $scope.approvals = approvalsDict;
            }, function () {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.Errordata;
            });
        };




        //Get the selcted Approvers value in an array "SelectedApprovers"
        $scope.changeevt = function (SelectedValue, Index) {

            if (SelectedValue == undefined && $scope.SelectedApprovers.length > 0) {
                $scope.SelectedApprovers.splice(Index, 1);
            }


            else {
                $scope.approvers = { Name: SelectedValue.UserId, Role: SelectedValue.UserRole.RoleId };

                // If the user first selects an approver for a role, and then chenges it for the same role,
                // We need to remove the previous role and select the new one instead. butif the list is empty, 
                // we can simply add the values.
                if ($scope.SelectedApprovers.length > 0) {
                    var result = $scope.SelectedApprovers.filter(function (item) {
                        return item.Role === SelectedValue.UserRole.RoleId;
                    });

                    if (!result.length > 0) {
                        $scope.SelectedApprovers.splice(Index, 0, $scope.approvers);
                    }
                    else {
                        var index = $scope.SelectedApprovers.indexOf(result[0]);
                        $scope.SelectedApprovers.splice(index, 1, $scope.approvers);
                    }
                }
                else {
                    $scope.SelectedApprovers.splice(Index, 0, $scope.approvers);
                }

            }
        };

        $scope.CommentsForApproval = [];
        //Get the approver comments of all the approvers in an array "ApproverComments"
        $scope.textchanged = function (textArea, index) {

            $scope.ApproverComments.push(textArea);

            $scope.CommentsForApproval[index] = textArea;

        };


        // Handle the click of Success radio button, and display/hide the controls
        $scope.RadSuccessClicked = function (event) {
            if ($scope.Successchecked == event.target.value)
             
                $scope.Failedchecked = false
            $scope.IsSuccessDivHidden = false;
            $scope.IsFailureDivHidden = true;
            $scope.RadFailedChecked = false;
            document.getElementById('file').value = null;
            $scope.isDisableAfterComments = false;
            //delete already uploaded and selected files
            $scope.filesSelected.length = 0;
            $scope.SelectedFilesMessage = "";
            $scope.DisableUploadButton = true;

            if ($scope.files.length > 0) {
                $scope.UploadedFiles = null;
                $scope.files = [];
                $scope.IsDownloadedDivHidded = true;
                EMIETicketService.DeleteUploadedFilesFromDirectoryOnRollBack($scope.Ticket.TicketId).success(function () {
                    var x = 1;

                }).error(function (error) {
                    $scope.isVerifyPageDisabled = false;
                });

            }
        }


        // Handle the click of failure radio button, and display/hide the controls
        $scope.RadFailedClicked = function (event) {
            if ($scope.Failedchecked == event.target.value)
               
                $scope.Successchecked = false
            $scope.IsFailureDivHidden = false;
            $scope.IsSuccessDivHidden = true;
            $scope.RadSuccessChecked = false;
            $scope.FailedComments = null;
            $scope.IsSendFailureDisabled = false;
            $scope.isDisableAfterComments = false;
            document.getElementById('file').value = null;
            //delete already uploaded and selected files
            $scope.filesSelected.length = 0;
            $scope.SelectedFilesMessage = "";
            $scope.DisableUploadButton = true;

            if ($scope.files.length > 0) {
                $scope.IsDownloadedDivHidded = true;
                $scope.UploadedFiles = null;
                $scope.files = [];
                EMIETicketService.DeleteUploadedFilesFromDirectoryOnRollBack($scope.Ticket.TicketId).success(function () {
                    var x = 1;

                }).error(function (error) {
                    $scope.isVerifyPageDisabled = false;
                });
            }
        }


        // Handles the sending of approval functionality of ticket. 
        $scope.SendForApproval = function (SelectedValue, textArea, count) {
            var event = document.getElementById("Application Manager");
            if (event != null) {
                var AppMngr = event.options[event.selectedIndex].text;
            }
            else {
                AppMngr = 'Select';
            }
            event = document.getElementById("Group Head");
            if (event != null) {
                var GroupHead = event.options[event.selectedIndex].text;
            }
            else {
                GroupHead = 'Select';
            }


            if ((AppMngr != 'Select Name' && GroupHead != 'Select Name')) {

                $scope.isVerifyPageDisabled = true;
                Approvers = $scope.SelectedApprovers;
                $scope.submitted = true;

                //Since the comments boxes are generated using ng-Repeat, getting the comments from them generates 
                // Some extra values like duplicate / null values. getting rid of those here. 
                //var Comments = $scope.CommentsForApproval.filter(function (item, i, arrayOfComments) { return arrayOfComments.indexOf(item) === i; });

                var Comments = $scope.CommentsForApproval;
                var output = [];

                $.each($scope.CommentsForApproval, function (key, element) {
                    if (element == undefined)
                        output.push(null);
                    else
                        output.push(element[key]);
                });

                // Getting the values out of the objects, so that we can send the string array to service function

                //for (var key in Comments) {
                //    // must create a temp object to set the key using a variable
                //    var tempObj = {};
                //    //$.each(Comments[key], function (key, element) {
                //    //    return element;
                //    //});

                //    //$.each(Comments[key], function (key, element) {
                //    //    output.push(element);
                //    // });
                //    output.push(Comments[key].valueOf()[key]);
                //}
                var TicketApprovals = [];
                var FinalComments = [];
                for (var i = 0; i < $scope.ListofEmieApprovals.Value.length; i++) {
                    TicketApprovals.push({
                        Name: $scope.ListofEmieApprovals.Value[i].UserId,
                        Role: $scope.ListofEmieApprovals.Value[i].UserRole.RoleId
                    });
                    if (Comments.length > 0) {
                        FinalComments.push(output[0])
                    }
                }
                FinalComments.splice(-1, 1)
                TicketApprovals = TicketApprovals.concat(Approvers);
                FinalComments = FinalComments.concat(output);

                //Call the service function with required variables.
                EMIETicketService.SendForApproval($scope.Ticket, TicketApprovals, FinalComments).success(function (approved) {
                    $scope.status = "Request sent for approval !!!";
                    $scope.IsSuccessDivReadOnly = true;
                    $scope.isVerifyPageDisabled = false;

                    //Status bar add classes
                    $(".status #Middle-child-1").removeClass("Current");
                    $(".status #Middle-child-1").addClass("Completed");
                    $(".status #Middle-child-2").addClass("Current");
                    //$(".status #Middle-child-3").addClass("Current");
                    RefreshCount();
                    //Once submitted successfully, we can move to Approvers page
                    $location.path("/Approvers");

                    //$scope.IsSuccessDivHidden = false;
                    //GetApprovalsByTicketID($scope.Ticket.TicketId);

                }).error(function (error) {
                    $scope.isVerifyPageDisabled = false;
                    $scope.status = Constants.UnableToLoadCustomerData + " " + error.message;
                });
            }
            else {
                $scope.isVerifyPageDisabled = false;

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleError,
                    MethodCase: "NULL",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.SelectAllApprovers;

            }
        }


        //Implement the Send Failure Details 
        $scope.SendFailureDetails = function (FailedComments) {
            $scope.Ticket.SandboxFailureComments = FailedComments;
            //Call the service function with required variables.
            EMIETicketService.SendFailureDetails($scope.Ticket, Constants.VerifyActions['SandBoxFailure']).success(function (failuredetails) {
                // $scope.IsSuccessDivReadOnly = true;
                $scope.IsSendFailureDisabled = true;
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "NULL",
                    Type: "success"
                }
                $scope.MESSAGE = failuredetails;

                $scope.isDisableAfterComments = true;

            }).error(function (error) {
                $scope.isVerifyPageDisabled = true;
                $scope.status = Constants.UnableToSendData + " " + error.message;

            });
        }

        //Implement Rollback
        $scope.Rollback = function (FailedComments) {
            $scope.Ticket.SandboxFailureComments = FailedComments;
            $scope.isVerifyPageDisabled = true;
            //Call the service function with required variables.
            EMIETicketService.SandboxRollBack($scope.Ticket, Constants.VerifyActions['SandboxRollBack']).success(function (rollback) {
                $scope.IsSuccessDivReadOnly = true;
                $scope.IsClosedDisable = true;
                $scope.isVerifyPageDisabled = true;
                RefreshCount();

                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleSuccess,
                    MethodCase: "REDIRECT",
                    Type: "success"
                }
                $scope.MESSAGE = "Request #" + $scope.Ticket.TicketId + Constants.RollbackSuccess;

                //Once submitted successfully, we can move to Approvers page
            }).error(function (error) {
                $scope.isVerifyPageDisabled = true;
                $scope.status = Constants.UnableToRollback + " " + error.message;
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
            CommonFunctionsSanboxProductionFactory.GetAttachedFileDetails($scope,event)

        };



        // Upload the Image files to the server
        $scope.uploadFiles = function () {
            var IsVerifySandbox = true;

            //call the common method from factory to upload attachments
            CommonFunctionsSanboxProductionFactory.UploadFilesToFolder($scope, IsVerifySandbox)
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
                case "REDIRECT":
                    $location.path("/Request");
                    break;
            }
        }

        //////-------------------------------Download Attachmnt---------------------------------------
        $scope.DownloadSelectedAttchment = function (DownloadPathOfUploadedFiles, SingleFile) {
            //call the common method from factory to download uploaded attachment from server location to local system
            CommonFunctionsSanboxProductionFactory.DownloadAttachmentToLocal($scope, DownloadPathOfUploadedFiles, SingleFile, growl, FileSaver)
        }
    }
});


