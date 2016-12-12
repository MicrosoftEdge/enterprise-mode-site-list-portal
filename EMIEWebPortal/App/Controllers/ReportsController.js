EMIEModule.controller("ReportsController", function ($scope, ReportsService,CommonFunctionsFactory, SharedProperties, LoginService, Constants, $rootScope, $sessionStorage, $location, TicketStatusConstants, ColorConstants, ChangeTypeConstants, ReasonForChangeConstants, growl) {

    //check user with role on redirection pages ,if user is unauthorized redirect to logout else continue
    //true-if this page is  accessible for emie champ role and group head
    if (LoginService.getUserWithRoleAtRedirectionForEMIEChamp(true)) {

        $scope.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.IsFilterbuttonDisabled = true;
        $scope.SelectAll = true;
        $scope.BpuIdsForGroupHead = [];
        $scope.DisplayChart = true;
        $scope.isEMIEChampion = false;
        //populateDatePicker();
        var DatePickerOption = Constants.DateTodayAndBefore;
        CommonFunctionsFactory.DatePicker($scope, DatePickerOption);
        $scope.DisplayNoDataMessage = false;
        GetALLBPU();
        $scope.SelectedBPUList = [];

        //HIDE MODAL
        $('#PopUpModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        //  ----------------------------------------------------Function will be called for first time initialisation---------------------------------
        function Initialise() {
            var start = new Date();
            var BPUIds;
            start.setMonth(start.getMonth() - 6);
            var End = new Date();
            BPUIds = null;
            if ($scope.isEMIEChampion) {
                BPUIds = null;
            } else {
                BPUIds = $scope.BpuIdsForGroupHead;
            }
            if ($scope.BpuIdsForGroupHead.length > 0 || $rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion']) {
                GetTicketStatusCount(start, End, BPUIds);
                GetBPUWiseTicketCount(start, End, BPUIds);
                GetListOfApplication(start, End, BPUIds);
                GetChangeForReasonCount(start, End, BPUIds);
                GetChangeTypeCount(start, End, BPUIds);
            }
            else {
                $scope.DisplayNoDataMessage = true;
                $scope.DisplayChart = false;
                $scope.DisplayNoDataMessageForSignedOffApplication = true;
                $scope.DisplayChartForApplication = false;
            }

        }
        //  ----------------------------------------------------Get List of BPUs  --------------------------------------------------------------------
        function GetALLBPU() {
            if ($rootScope.User.UserRole.RoleId == Constants.RoleId['EMIEChampion'])
                $scope.isEMIEChampion = true;
            var getdata = ReportsService.GetAllBPU($rootScope.User, $scope.isEMIEChampion);
            getdata.success(function (BPUDetails) {
                $scope.BPU = BPUDetails;
                angular.forEach($scope.BPU, function (BPU) {
                    $scope.BpuIdsForGroupHead.push(BPU.BPUId);
                    $scope.SelectedBPUList.push(BPU.BPUId);

                });
                Initialise();
            });
        }
        //  ----------------------------------------------------Function will be called when filter button is clicked   -------------------------------
        $scope.Filter = function () {
            var start = $scope.datePickFrom;
            var End = $scope.datePickTo;
            var IsAllValidationCleared = false;
            if (start != undefined || End != undefined) {
                if (End < start) {
                    growl.error(Constants.EndDateError, { title: Constants.InvalidFields });
                }
                else if (start > new Date() || End > new Date()) {
                    growl.error(Constants.TodaysDateError, { title: Constants.InvalidFields });
                }
                else {
                    IsAllValidationCleared = true;
                }
            } else if ($scope.SelectedBPUList.length == 0 && IsAllValidationCleared) {
                $scope.SelectedBPUList = null;
                IsAllValidationCleared = true;
            } else if ($scope.SelectedBPUList.length >= 0 && !IsAllValidationCleared) {
                IsAllValidationCleared = true;
                start = new Date();
                start.setMonth(start.getMonth() - 6);
                End = new Date();
            }
            if (!$scope.isEMIEChampion && $scope.SelectedBPUList.length == 0)
                $scope.SelectedBPUList = $scope.BpuIdsForGroupHead;
            if ($scope.SelectAll && $scope.isEMIEChampion) {
                $scope.SelectedBPUList = null;
            }
            else if ($scope.BPU.length == $scope.SelectedBPUList.length && !$scope.isEMIEChampion) {
                $scope.SelectedBPUList = $scope.BpuIdsForGroupHead;
            }

            if (IsAllValidationCleared) {

                GetTicketStatusCount(start, End, $scope.SelectedBPUList);
                GetBPUWiseTicketCount(start, End, $scope.SelectedBPUList);
                GetListOfApplication(start, End, $scope.SelectedBPUList);
                GetChangeForReasonCount(start, End, $scope.SelectedBPUList);
                GetChangeTypeCount(start, End, $scope.SelectedBPUList)
            }
        }
        //  ---------------------------------------Function will Clear the Filter and will refresh the charts-------------------------------------------
        $scope.Clear = function () {
            $scope.datePickFrom = null;
            $scope.SelectAll = true;
            $scope.datePickTo = null;
            GetALLBPU();
            Initialise();
            $scope.SelectedBPUList = [];
            $scope.IsFilterbuttonDisabled = true;
        }
        //-------------------------------------------Function will work change on date selected --------------------------------------------------------
        $scope.FilterSelected = function () {
            if ($scope.datePickFrom != undefined && $scope.datePickTo != undefined) {
                $scope.IsFilterbuttonDisabled = false;
            }
            else {
                $scope.IsFilterbuttonDisabled = true;
            }
        }
        //  ----------------------------------------------------Function will get the list of checked BPUs  -------------------------------
        $scope.CheckedBPUid = function (BPUId) {
            var index = $scope.SelectedBPUList.indexOf(BPUId);
            if (index !== -1) {
                $scope.SelectedBPUList.splice(index, 1);
            }
            else {
                $scope.SelectedBPUList.push(BPUId);
            }
            if ($scope.SelectedBPUList.length > 0 || $scope.BPU.length == $scope.SelectedBPUList.length) {
                $scope.IsFilterbuttonDisabled = false;
            } else { $scope.IsFilterbuttonDisabled = true; }
            if ($scope.BPU.length == $scope.SelectedBPUList.length)
                $scope.SelectAll = true;
            else
                $scope.SelectAll = false;

        }
        //  ----------------------------------------------------Function will get the list of all checked BPUs  -------------------------------
        $scope.CheckedAllBPUid = function (BPU) {

            if ($scope.SelectAll) {
                $scope.SelectedBPUList = [];
                angular.forEach(BPU, function (BPU) {
                    $scope.SelectedBPUList.push(BPU.BPUId);
                });
            }
            else {
                $scope.SelectedBPUList = [];
            }
            if ($scope.SelectedBPUList.length > 0 || $scope.BPU.length == $scope.SelectedBPUList.length) {
                $scope.IsFilterbuttonDisabled = false;
            } else { $scope.IsFilterbuttonDisabled = true; }
            if ($scope.BPU.length == $scope.SelectedBPUList.length)
                $scope.SelectAll = true;
        }
        //  ----------------------------------------------------function will get all Ticket Count   --------------------------------------------------
        function GetTicketStatusCount(start, End, BPUIds) {

            var getdata = ReportsService.GetTicketStatusCount(start, End, BPUIds);
            getdata.success(function (TicketCount) {
                var pieData = [];
                var colour;

                if (TicketCount.length == 0) {
                    $scope.DisplayNoDataMessage = true;
                    $scope.DisplayChart = false;
                }
                else {
                    $scope.DisplayChart = true;
                    $scope.DisplayNoDataMessage = false;
                    for (var i = 0; i < TicketCount.length; i++) {

                        //Switch case for assigning colours to different ticket status
                        switch (TicketCount[i].TicketStatus) {
                            case TicketStatusConstants.Initiated:
                                colour = ColorConstants.Initiated
                                break;
                            case TicketStatusConstants.Approved:
                                colour = ColorConstants.Approved
                                break;
                            case TicketStatusConstants.ProductionReady:
                                colour = ColorConstants.ProductionReady
                                break;
                            case TicketStatusConstants.ProductionChangesScheduled:
                                colour = ColorConstants.ProductionChangesScheduled
                                break;
                            case TicketStatusConstants.PartiallyApproved:
                                colour = ColorConstants.PartiallyApproved
                                break;
                            case TicketStatusConstants.Rejected:
                                colour = ColorConstants.BarRejected
                                break;
                            case TicketStatusConstants.SignedOff:
                                colour = ColorConstants.SignedOff;
                                break;
                            case TicketStatusConstants.RolledBack:
                                colour = ColorConstants.RolledBack;
                                break;
                            case TicketStatusConstants.VerificationFailedTestMachine:
                                colour = ColorConstants.VerificationFailedTestMachine;
                                break;
                            case TicketStatusConstants.Closed:
                                colour = ColorConstants.BarClosed;
                                break;
                            case TicketStatusConstants.ApprovalPending:
                                colour = ColorConstants.ApprovalPending;
                        }
                        //Below code will push the data into tha array
                        pieData.push({
                            title: TicketCount[i].TicketStatus + "  " + TicketCount[i].Count,
                            value: TicketCount[i].Count,
                            color: colour
                        });
                    }

                    //this function will set configurations setting for chart
                    var newopts = {
                        inGraphDataShow: true,
                        responsive: false,
                        legend: true,
                        legendBlockSize: 14,
                        showSingleLegend: true,
                        legendBorders: false,
                        legendFontSize: 14,
                        legendFontFamily: "'Segoe UI'",
                        legendFontColor: "black",
                        inGraphDataRadiusPosition: 2,
                        //inGraphDataTmpl: "<%=v1+'  '+v2%>",
                        inGraphDataTmpl: "<%=v2%>",
                        inGraphDataFontColor: "White",
                        inGraphDataFontSize: 14,
                        inGraphDataFontStyle: "normal",
                        graphTitle: "All requests by status",
                        graphTitleFontFamily: "'Segoe UI'",
                        graphTitleFontSize: 24,
                        graphTitleFontStyle: "lighter",
                        graphTitleFontColor: "Black"
                    }
                    var pieCtx = document.getElementById('pieChart').getContext('2d');
                    new Chart(pieCtx).Doughnut(pieData, newopts);
                }


            });

        }
        //  ----------------------------------------------------BPU Chart For showing BPU wise Ticket  ------------------------------------------------
        function GetBPUWiseTicketCount(start, End, BPUIds) {
            var getdata1 = ReportsService.GetBPUWiseTicketCount(start, End, BPUIds);
            getdata1.success(function (countBpu) {

                var labels = [];
                var colour = [];
                var datasets = [];
                if (countBpu.BPUs.length == 0) {
                    $scope.DisplayNoDataMessage = true;
                    $scope.DisplayChart = false;
                }
                else {
                    $scope.DisplayNoDataMessage = false;
                    $scope.DisplayChart = true;
                    for (var i = 0; i < countBpu.BPUs.length; i++) {
                        labels.push(countBpu.BPUs[i]);
                    }
                    //labels: ["2014", "2013", "2012", "2011", "2010"],

                    //Colours will be set based on different ticketstaus
                    for (var i = 0; i < countBpu.chartData.length; i++) {
                        Data = [];
                        switch (countBpu.chartData[i].Status) {
                            case TicketStatusConstants.Initiated:
                                colour = ColorConstants.Initiated
                                break;
                            case TicketStatusConstants.Approved:
                                colour = ColorConstants.Approved
                                break;
                            case TicketStatusConstants.ProductionReady:
                                colour = ColorConstants.ProductionReady
                                break;
                            case TicketStatusConstants.ProductionChangesScheduled:
                                colour = ColorConstants.ProductionChangesScheduled
                                break;
                            case TicketStatusConstants.PartiallyApproved:
                                colour = ColorConstants.PartiallyApproved
                                break;
                            case TicketStatusConstants.Rejected:
                                colour = ColorConstants.BarRejected
                                break;
                            case TicketStatusConstants.SignedOff:
                                colour = ColorConstants.SignedOff;
                                break;
                            case TicketStatusConstants.RolledBack:
                                colour = ColorConstants.RolledBack;
                                break;
                            case TicketStatusConstants.VerificationFailedTestMachine:
                                colour = ColorConstants.VerificationFailedTestMachine;
                                break;
                            case TicketStatusConstants.Closed:
                                colour = ColorConstants.BarClosed;
                                break;
                            case TicketStatusConstants.ApprovalPending:
                                colour = ColorConstants.ApprovalPending;
                        }
                        for (var j = 0; j < countBpu.chartData[i].StatusCount.length; j++) {
                            Data.push(countBpu.chartData[i].StatusCount[j]);
                        }

                        //Adding data according to particular Stack bar Chart
                        if (Data.length != 0)
                            datasets.push({
                                fillColor: colour,
                                pointColor: "rgba(220,220,220,1)",
                                data: Data,
                                title: countBpu.chartData[i].Status,

                            });
                    }

                    var barChartData = {
                        labels: labels,
                        datasets: datasets,

                    }
                    //Configuration For Bar chart
                    var newoptcon = {
                        inGraphDataShow: true,
                        inGraphDataFontStyle: "normal",
                        legend: true,
                        legendBlockSize: 14,
                        showSingleLegend: true,
                        legendBorders: false,
                        legendFontColor: "black",
                        legendFontSize: 14,
                        legendFontFamily: "'Segoe UI'",
                        animationStartWithDataset: 1,
                        animationStartWithData: 1,
                        inGraphDataTmpl: "<%=v3%>",
                        responsive: true,
                        barValueSpacing: 2,
                        inGraphDataFontColor: "White",
                        inGraphDataFontSize: 14,
                        inGraphDataAlign: "center",
                        inGraphDataXPosition: 2,
                        inGraphDataYPosition: 3,
                        barValueSpacing: 5,
                        fullWidthGraph: true,
                        scaleFontColor: "black",
                        scaleFontSize: 14,
                        yAxisMinimumInterval: 5,
                        graphTitle: "Request status by group",
                        graphTitleFontFamily: "'Segoe UI'",
                        graphTitleFontSize: 24,
                        graphTitleFontStyle: "lighter",
                        graphTitleFontColor: "Black",
                        barValueSpacing: 2
                    }
                    var ctx = document.getElementById("canvas").getContext("2d");
                    var barChart = new Chart(ctx).StackedBar(barChartData, newoptcon);
                }
            });

        }
        //  ----------------------------------------------------Get List of Application  --------------------------------------------------------------
        function GetListOfApplication(start, End, BPUIds) {
            var getdata = ReportsService.GetListOfApplication(start, End, BPUIds);
            getdata.success(function (tickets) {
                if (tickets.length == 0) {
                    $scope.DisplayNoDataMessageForSignedOffApplication = true;
                    $scope.DisplayChartForApplication = false;
                }
                else {
                    $scope.DisplayNoDataMessageForSignedOffApplication = false;
                    $scope.DisplayChartForApplication = true;
                    for (var i = 0; i < tickets.length; i++) {
                        tickets[i].AppSiteLink = tickets[i].AppSiteLink.replace("http://", "");
                        tickets[i].AppSiteLink = tickets[i].AppSiteLink.replace("https://", "");
                    }
                    $scope.tickets = tickets;

                }
            });
        }
        //  ----------------------------------------------------Reason For change ---------------------------------------------------------------------
        function GetChangeForReasonCount(start, End, BPUIds) {
            var getdata1 = ReportsService.GetChangeForReasonCount(start, End, BPUIds);
            getdata1.success(function (ReasonCount) {
                var labels = [];
                var colour = [];
                var fillColor = [];
                var datasets = [];
                var data = []
                if (ReasonCount.length == 0) {
                    $scope.DisplayNoDataMessage = true;
                    $scope.DisplayChart = false;
                }
                else {
                    $scope.DisplayNoDataMessage = false;
                    $scope.DisplayChart = true;
                    for (var i = 0; i < ReasonCount.length; i++) {
                        switch (ReasonCount[i].ReasonForChange) {
                            case ReasonForChangeConstants.SilverLightIssue:
                                colour = ColorConstants.Initiated
                                break;
                            case ReasonForChangeConstants.DeprecatedAPI:
                                colour = ColorConstants.Approved
                                break;
                            case ReasonForChangeConstants.Others:
                                colour = ColorConstants.ProductionReady
                                break;
                            case ReasonForChangeConstants.AuthenticationSSO:
                                colour = ColorConstants.ProductionChangesScheduled
                                break;
                            case ReasonForChangeConstants.BrokenFunctionality:
                                colour = ColorConstants.Initiated
                                break;
                            case ReasonForChangeConstants.CrashesHangs:
                                colour = ColorConstants.Approved
                                break;
                            case ReasonForChangeConstants.ContentMissing:
                                colour = ColorConstants.ProductionReady;
                                break;
                            case ReasonForChangeConstants.BrowserFeatureMissing:
                                colour = ColorConstants.ProductionChangesScheduled;
                                break;
                            case ReasonForChangeConstants.DocModeDependency:
                                colour = ColorConstants.Initiated;
                                break;
                            case ReasonForChangeConstants.ModalDialog:
                                colour = ColorConstants.Approved;
                                break;
                            case ReasonForChangeConstants.Notifications:
                                colour = ColorConstants.ApprovalPending;
                                break;
                            case ReasonForChangeConstants.Plugins:
                                colour = ColorConstants.ProductionReady;
                                break;
                            case ReasonForChangeConstants.UAStringDependency:
                                colour = ColorConstants.Initiated;
                                break;
                            case ReasonForChangeConstants.UsabilityAndUserExperience:
                                colour = ColorConstants.ProductionChangesScheduled;
                                break;
                        }

                        labels.push(ReasonCount[i].ReasonForChange);
                        data.push(
                            ReasonCount[i].Count
                            );
                        fillColor.push
                            (
                            colour
                            );

                        //Adding data according to particular Stack bar Chart
                    }

                    datasets.push({
                        fillColor: ColorConstants.PartiallyApproved,
                        strokeColor: "Black",
                        // pointColor: "rgba(220,220,220,1)",
                        pointColor: "black",
                        data: data,
                    });

                    var ChartData = {
                        labels: labels,
                        datasets: datasets,

                    }
                    //this function will set configurations setting for chart
                    var newopts = {
                        inGraphDataShow: true,
                        inGraphDataFontSize: 14,
                        inGraphDataFontColor: "black",
                        roundNumber: -2,
                        graphMin: 0,
                        yAxisMinimumInterval: 2,
                        barValueSpacing: 2,
                        graphMax: 25,
                        responsive: true,
                        scaleFontColor: "black",
                        scaleFontSize: 15,
                        graphTitle: "Reasons for change",
                        graphTitleFontFamily: "'Segoe UI'",
                        graphTitleFontSize: 24,
                        graphTitleFontStyle: "lighter",
                        graphTitleFontColor: "Black"
                    }
                    var pieCtx = document.getElementById('ReasonForChangeChart').getContext('2d');
                    new Chart(pieCtx).Line(ChartData, newopts);
                }
            });
        }
        //  ----------------------------------------------------Get Count For ChangeType --------------------------------------------------------------
        function GetChangeTypeCount(start, End, BPUIds) {
            var getdata1 = ReportsService.GetChangeTypeCount(start, End, BPUIds);
            getdata1.success(function (changeType) {

                var colour = [];
                var data = [];
                if (changeType.length == 0) {
                    $scope.DisplayNoDataMessage = true;
                    $scope.DisplayChart = false;
                }
                else {
                    $scope.DisplayNoDataMessage = false;
                    $scope.DisplayChart = true;
                    for (var i = 0; i < changeType.length; i++) {

                        //Switch case for assigning colours to different ticket status
                        switch (changeType[i].ChangeType) {
                            case ChangeTypeConstants.AddtoEMIE:
                                colour = ColorConstants.InProgress;
                                break;
                            case ChangeTypeConstants.DeletefromEMIE:
                                colour = ColorConstants.Rejected;
                                break;
                            case ChangeTypeConstants.UpdatetoEMIE:
                                colour = ColorConstants.SignedOff;
                                break;
                        }

                        data.push({
                            title: changeType[i].ChangeType + " " + changeType[i].Count,
                            value: changeType[i].Count,
                            color: colour,
                        });
                    }
                    //this function will set configurations setting for chart
                    var newopts = {
                        inGraphDataShow: true,
                        responsive: false,
                        legend: true,
                        showSingleLegend: true,
                        legendBlockSize: 14,
                        legendBorders: false,
                        legendFontSize: 14,
                        legendFontFamily: "'Segoe UI'",
                        legendFontColor: "black",
                        inGraphDataRadiusPosition: 2,
                        inGraphDataAlign: "center",
                        inGraphDataTmpl: "<%=v2%>",
                        inGraphDataFontColor: "White",
                        inGraphDataFontSize: 14,
                        inGraphDataFontStyle: "normal",
                        graphTitle: "All requests by change type",
                        graphTitleFontFamily: "'Segoe UI'",
                        graphTitleFontSize: 24,
                        graphTitleFontStyle: "lighter",
                        graphTitleFontColor: "Black"
                    }
                    var pieCtx = document.getElementById('ChangeTypeChangeChart').getContext('2d');
                    new Chart(pieCtx).Doughnut(data, newopts);
                }
            });
        }
    }
});