EMIEModule.controller("ApprovalController", function ($scope, approvalService, EMIETicketService, Constants,LoginService, SharedProperties, $route, $location, $sessionStorage, $rootScope) {

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    if (LoginService.getUserWithRoleAtRedirectionForUser()) {

        //Status bar add and remove classes
        $(".status li").removeClass("Status-Selected");
        $(".status #Middle-child-2").addClass("Status-Selected");


        //Hide Modal
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        //Declaring the ticket list globally
        $scope.SelectedList = [];
        $scope.isreminderbuttondisabled = true;
        $scope.IsOldRequest = true;
        $scope.Ticket = SharedProperties.getProperty();
        if ($scope.Ticket == "")
            if ($sessionStorage.TicketIdToShow != "") {
                $scope.Ticket = $sessionStorage.TicketIdToShow;
            }
        $scope.ListofEmieChamps = [];
        var ListOfEMIEChampApprovers = [];
        IsEMIEChampListChecked = false;
        //unckeck the reminder check box on page reload 
        $scope.reminderCheckBox = false;
        //This function will fetch the list of tickets which are pending for approval    
        GetApprovalsByTicketID($scope.Ticket.TicketId);

        /// <summary>
        /// method call the service to fetch all approvers of given ticket
        /// </summary>
        /// <param name="ticketId">ticket id of which approvers need to be fetched</param>
        /// <returns>list of all approvers of given ticket</returns>
        function GetApprovalsByTicketID(ticketID) {
            var getData = approvalService.getApproversOfTicket(ticketID);
            getData.then(function (msg) {
                EMIETicketService.GetTicketData($scope.Ticket.TicketId).success(function (TicketsData) {
                    var ApprovalList;
                    var ApprovalFinalList = [];
                    var EMIEChampionComment;
                    var flag = false;
                    ApprovalList = angular.copy(msg.data);
                    for (var i = msg.data.length - 1; i >= 0 ; i--) {

                        if (msg.data[i].Approver.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                            EMIEChampionComment = msg.data[i].ApproverComments;
                            if (msg.data[i].ApprovalState == Constants.ApprovalState['Pending']) {
                                ApprovalList.splice(i, 1);
                                $scope.ListofEmieChamps.push(msg.data[i].Approver.UserId);
                                ListOfEMIEChampApprovers.push(msg.data[i]);
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
                        var Approvals = {
                            ApprovalState: Constants.ApprovalState['Pending'],
                            Approver: {
                                Email: "Administrator group",
                                UserRole: {
                                    RoleName: "Administrators"
                                }
                            },
                            ApproverComments: EMIEChampionComment,
                            IsActive: true,
                            NoOfReminders: 0
                        };
                        ApprovalFinalList.push(Approvals);
                    }

                    ApprovalFinalList = ApprovalFinalList.concat(ApprovalList)
                    $scope.approvals = ApprovalFinalList;
                    $scope.ApprovalStateEnum = Constants.ApprovalState;
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

                    if ($scope.Ticket != "") {
                        $scope.TicketId = $scope.Ticket.TicketId;
                        $scope.IsOldRequest = false;
                    }

                    if (TicketsData.FinalTicketStatus < Constants.TicketStatus['ApprovalPending']) {
                        $(".status #First-child").addClass("Completed");
                        $(".status #Middle-child-1").addClass("Current");
                        DisableTicketProgressBar(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child", ".status #Middle-child-1,.status #First-child");
                    }
                    else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['ApprovalPending'] || TicketsData.FinalTicketStatus == Constants.TicketStatus['PartiallyApproved']) {
                        $scope.IsCompletePaneDisabled = false;
                        $(".status #First-child,.status #Middle-child-1").addClass("Completed");
                        $(".status #Middle-child-2").addClass("Current");
                        DisableTicketProgressBar(".status #Last-child,.status #Middle-child-3", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                    }
                    else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['Approved']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        $(".status #Middle-child-3").addClass("Current");
                        $scope.IsCompletePaneDisabled = true;
                        DisableTicketProgressBar(".status #Last-child", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3");
                    }
                    else if (TicketsData.FinalTicketStatus == Constants.TicketStatus['Rejected']) {
                        $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2").addClass("Completed");
                        DisableTicketProgressBar(".status #Last-child,.status #Middle-child-3", ".status #First-child,.status #Middle-child-1,.status #Middle-child-2");
                        $scope.isreminderbuttondisabled = true;
                        $scope.IsCompletePaneDisabled = true;
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
                    else {
                        $scope.IsCompletePaneDisabled = true;
                    }
                }, function () {
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleWentWrong,
                        MethodCase: "OOPS",
                        Type: "error"
                    }
                    $scope.MESSAGE = Constants.ErrorApprovalsRetrieval;
                });
            });
            // }
        };

        function DisableTicketProgressBar(preventParamater, UnbindParameter) {
            $(UnbindParameter).unbind('click').click()
            $(preventParamater).click(function (event) {
                event.preventDefault();
            });

        }

        //Redirect to Production change page when button is clicked.
        $scope.ScheduleProdChanges = function () {

            //Status bar add classes
            $(".status #Middle-child-2").removeClass("Current")
            $(".status #Middle-child-2").addClass("Completed");
            $(".status #Middle-child-3").addClass("Current");

            $location.path("/ProductionChanges");
        }

        //Function will display message for the unimplemented modules
        $scope.SendReminderToAll = function (reminderCheckBox) {
            // alert('This Feature is yet to be implemented.'); 
            if (IsEMIEChampListChecked) {
                var index = $scope.SelectedList.indexOf(undefined);
                $scope.SelectedList.splice(index, 1);
                ApproversListToSendReminder.splice(index, 1);
                $scope.SelectedList = $scope.SelectedList.concat($scope.ListofEmieChamps);
                ApproversListToSendReminder = ApproversListToSendReminder.concat(ListOfEMIEChampApprovers);
            }
            approvalService.SendReminder(ApproversListToSendReminder, $scope.Ticket)
                .success(function () {
                    //reload controller on sending the reminder so that everything is fresh on page(uncheck checkbox and disable the reminder button) and user can send reminder again
                    $scope.HideCancelModal = true;
                    $('#PopUpModal').modal('toggle');
                    $scope.ALERTCONTENT = {
                        Title: Constants.PopupTitleReminderSent,
                        MethodCase: "RELOAD",
                        Type: "info"
                    }
                    $scope.MESSAGE = Constants.ReminderSent;
                })
            .error(function () {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleWentWrong,
                    MethodCase: "RELOAD",
                    Type: "error"
                }
                $scope.MESSAGE = Constants.ErrorReminderSent;

            });

        }

        var ApproversListToSendReminder = [];
        //this function will add the tickets to the list which will be sent for for approval
        $scope.CheckedApproverId = function (approverId, approver) {
            var index = $scope.SelectedList.indexOf(approverId);
            if (approverId == undefined) {
                if (index !== -1) {
                    IsEMIEChampListChecked = false;
                }
                else {
                    IsEMIEChampListChecked = true;
                }
            }
            if (index !== -1) {
                $scope.SelectedList.splice(index, 1);
                ApproversListToSendReminder.splice(index, 1);
            }
            else {
                $scope.SelectedList.push(approverId);
                ApproversListToSendReminder.push(approver);
            }
            if ($scope.SelectedList.length != 0)
                $scope.isreminderbuttondisabled = false;
            else
                $scope.isreminderbuttondisabled = true;

        }


        //On Confirm Click of Modal
        $scope.Confirm = function (cases, object) {
            switch (cases) {
                case "RELOAD":
                    $route.reload();
                    break;
            }
        }
    }
});
