EMIEModule.factory('CommonFunctionsSanboxProductionFactory', function (EMIETicketService, Constants)//factory for all common functions used in VerifySandbox/VerifyProduction controller
{
    var factory = {};

    //method to get all uploaded attachment of given ticket
    //IsSandboxVerifyPage- if true get attachment of verify sandbox else get attachment of verify production
    factory.GetAllUploadedFilesOfTicket = function (IsSandboxVerifyPage, ticketId, $scope) {
        var getData = EMIETicketService.GetAllUploadedFiles(ticketId, IsSandboxVerifyPage);
        getData.then(function (msg) {
            var imgData = {
                array: msg.data,
                ticketId: ticketId
            }

            $scope.UploadedFiles = imgData;
            $scope.DownloadPathOfUploadedFiles = $scope.UploadedFiles.array[0];
            if ($scope.DownloadPathOfUploadedFiles) {
                $scope.DownloadPathOfUploadedFiles = $scope.DownloadPathOfUploadedFiles.replace('~', '');
            }
            if ($scope.UploadedFiles.array) {
                $scope.UploadedFiles.array.shift();
            }
            if (msg.data != "") {
                $scope.IsDownloadedDivHidded = false;
            }
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

    //Upload attachments to the location
    //IsVerifySandbox-if true,upload it to verifysandbox location
    factory.UploadFilesToFolder = function ($scope, IsVerifySandbox) {
        //fill the dataform with file details      
        $scope.IsSelectedFileDeleteDisable = true;
        $scope.isVerifyPageDisabled = true;
        $scope.DisableUploadButton = true;
        var data = new FormData();
        var SuccesscheckedValue = false;

        if ($scope.Successchecked == "Checked" || $scope.Successchecked == undefined || $scope.Successchecked == "true") {
            SuccesscheckedValue = true;
        }
        for (var i in $scope.files) {
            data.append("uploadedFile", $scope.files[i]);
            data.append("TIcketID", $scope.Ticket.TicketId);
            data.append("IsVerifySandbox", IsVerifySandbox);
            data.append("IsSuccessful", SuccesscheckedValue);
        }

        //Call the service function with required variables.
        EMIETicketService.UploadFiles(data).success(function (uploaded) {
            $scope.isVerifyPageDisabled = false;
            var array = uploaded.split(';');
            // just pick the file name, and remove the other messages from the string
            array.splice([array.length - 1], 1);
            var obj = {
                array: array,
                ticketId: $scope.Ticket.TicketId
            }

            $scope.UploadedFiles = obj;
            $scope.DownloadPathOfUploadedFiles = $scope.UploadedFiles.array[0];
            $scope.UploadedFiles.array.shift();
            $scope.IsDownloadedDivHidded = false;

            var filenames = '';
            var counting = 0;
            for (var i = 0; i < $scope.files.length; i++) {
                if ($scope.files[i].size == 0) {
                    filenames += (counting + 1) + ". " + $scope.files[i].name + '<br>';
                    counting = counting + 1;
                    var SpliceIndex = $scope.files.indexOf($scope.files[i])
                    $scope.files.splice(SpliceIndex, 1);
                }
            }
            var uploadedNames = '';
            for (var i = 0; i < $scope.UploadedFiles.array.length; i++) {
                uploadedNames += (i + 1) + ". " + $scope.UploadedFiles.array[i] + '<br>';
            }
            if (filenames != '' || filenames != "")
                var nullMessage = Constants.FileNotUploaded + filenames + "<br>" + Constants.ErrorFileEmpty;
            else
                var nullMessage = '';

            //setting the value of the file control to null , so that the text is cleared
            document.getElementById('file').value = null;

            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleSuccess,
                MethodCase: "NULL",
                Type: "success"
            }
            $scope.MESSAGE = Constants.FilesUploaded + "<br>" + uploadedNames + nullMessage;

            //Hide selected files div and nullified selected files array and message
            $scope.filesSelected.length = 0;
            $scope.SelectedFilesMessage = "";
            $scope.IsSelectedFIlesDivHidden = true;
        }).error(function (error) {
            $scope.isVerifyPageDisabled = false;
            //setting the value of the file control to null , so that the text is cleared
            document.getElementById('file').value = null;
            $scope.DisableUploadButton = false;

            $scope.HideCancelModal = true;
            $('#PopUpModal').modal('toggle');
            $scope.ALERTCONTENT = {
                Title: Constants.PopupTitleWentWrong,
                MethodCase: "OOPS",
                Type: "error"
            }
            //Error may be due to configuration file 
            $scope.MESSAGE = Constants.ErrorFileUpload;
        });
    }

    ////Delete selected attachment from UI of file array
    ////SelectedFile-File to be deleted
    factory.DeleteAttachmentFromFileArray = function ($scope, SelectedFile) {

        var IndexSelectedFile = $scope.filesSelected.indexOf(SelectedFile)
        //Selected-files array
        $scope.filesSelected.splice(IndexSelectedFile, 1);
        var IndexSelectedFromAllFiles = $scope.files.indexOf(SelectedFile)
        //All-files array
        $scope.files.splice(IndexSelectedFromAllFiles, 1);

        //Update selected files count after removing files
        $scope.SelectedFilesMessage = $scope.filesSelected.length + Constants.FilesSelected;

        //Disable Upload button and hide div
        if ($scope.filesSelected.length > 0) {
            $scope.DisableUploadButton = false;
            IsSelectedFIlesDivHidden = true;
        }
        else {
            $scope.DisableUploadButton = true;
            document.getElementById('file').value = null;
        }

    }

    ///Delete uploaded attachment from server location
    factory.DeleteAttachmentFromServerLocation = function ($scope, SingleFile, growl) {

        EMIETicketService.Delete($scope.DownloadPathOfUploadedFiles, SingleFile).success(function (deleted) {
            // Upon success full deletion from the server, refresh the view list. 
            var SpliceIndex = $scope.UploadedFiles.array.indexOf(SingleFile)
            $scope.UploadedFiles.array.splice(SpliceIndex, 1);

            growl.success(deleted, { title: Constants.FileDeleted });

            $scope.files.splice(SpliceIndex, 1);

            if ($scope.files.length == 0)
                $scope.DisableUploadButton = true;
        }).error(function (error) {
            growl.error(Constants.ErrorFileUnableToDelete + error.message, { title: Constants.TitleError });
        });
    }

    //Download selected attachment from location to local path
    factory.DownloadAttachmentToLocal = function ($scope, DownloadPathOfUploadedFiles, SingleFile, growl, FileSaver) {

        var downloadedPath = DownloadPathOfUploadedFiles + "\\" + SingleFile;
        EMIETicketService.DownLoadAttachment(downloadedPath).success(function (data) {
            if (data[0] == "true") {
                data = data[1].replace(/\n/g, "\r\n");
                var xmldata = new Blob([data], { type: 'plain/text' });
                FileSaver.saveAs(xmldata, SingleFile);
            }
            else//this is for image files
            {
                var base_image = new Image();
                base_image.src = 'data:image/png;base64,' + data[1];
                var canvas = document.getElementById('imgCanvas');
                context = canvas.getContext('2d');
                canvas.width = base_image.width;
                canvas.height = base_image.height;

                // Draw image within
                context.drawImage(base_image, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(function (blob) {
                    FileSaver.saveAs(blob, SingleFile);
                }, "image/png");
            }
        }).error(function (error) {
            growl.error(Constants.UnableToDownloadFile + "" + error.message, { title: Constants.TitleError });

        });
    }

    //Get all details of attached file o
    factory.GetAttachedFileDetails = function ($scope, event) {
        $scope.DisableUploadButton = false;
        $scope.IsSelectedFileDeleteDisable = false;
        var unuploadedFileNames = Constants.ErrorFileUnableToSelect;
        var uploadedFileNames = '';
        var IsunuploadedFilesPresent = false;
        $scope.$apply(function () {
            var Duplicatefilenames = '';
            var i = 1;

            // store the file objects in an array
            for (var index = 0; index < event.files.length; index++) {

                //check for selected files type
                var filemane = event.files[index].name;
                var extn = filemane.split(".").pop();
                extn = extn.toLowerCase();
                if (extn == "txt" || extn == "png" || extn == "jpg" || extn == "jpeg") {

                    //If file size is zero append error message
                    if (event.files[index].size == 0) {
                        unuploadedFileNames = unuploadedFileNames + "<br>" + event.files[index].name + "<b style='font-weight:600'>" + Constants.ErrorFileEmpty + "</b>";
                        IsunuploadedFilesPresent = true;
                    }
                        //If file size is less than 1 MB and not zero
                    else if (event.files[index].size < 1000000) {
                        var fileToBeAdded = true;
                        if ($scope.files.length > 0)
                        {                           

                            angular.forEach($scope.filesSelected, function (value, key) {
                                if (value.name == event.files[index].name) {
                                    fileToBeAdded = false;
                                    unuploadedFileNames = unuploadedFileNames + "<br>" + event.files[index].name + "<b style='font-weight:600'>" + Constants.ErrorFileAlreadySelected + "</b>";
                                }
                            });

                            if (typeof $scope.UploadedFiles !== 'undefined' && $scope.UploadedFiles !== null) {
                                angular.forEach($scope.UploadedFiles.array, function (value, key) {
                                    if (value == event.files[index].name) {
                                        fileToBeAdded = false;
                                        unuploadedFileNames = unuploadedFileNames + "<br>" + event.files[index].name + "<b style='font-weight:600'>" + Constants.ErrorFileAlreadyUploaded + "</b>";
                                    }
                                });
                            }

                            if (fileToBeAdded == false) {

                                Duplicatefilenames += event.files[index].name + '\n';
                                IsunuploadedFilesPresent = true;
                            }
                        }
                        else
                            fileToBeAdded = true;

                        if (fileToBeAdded) {

                            $scope.files.push(event.files[index]);
                            $scope.filesSelected.push(event.files[index]);
                            uploadedFileNames = uploadedFileNames + ',' + event.files[index].name;
                            if (index == 0)
                                $scope.selectedFiles = event.files[index].name + " , ";
                            else
                                $scope.selectedFiles = $scope.selectedFiles + " , " + event.files[index].name;
                        }
                    }
                    else {
                        unuploadedFileNames = unuploadedFileNames + "<br>" + event.files[index].name + "<b style='font-weight:600'>" + Constants.ErrorFileSize + "</b>";
                        IsunuploadedFilesPresent = true;
                    }
                }


                else {
                    unuploadedFileNames = unuploadedFileNames + "<br>" + event.files[index].name + "<b style='font-weight:600'>" + Constants.ErrorFileType + "</b>";
                    IsunuploadedFilesPresent = true;
                }
            }


            if (unuploadedFileNames != null && IsunuploadedFilesPresent) {
                $scope.HideCancelModal = true;
                $('#PopUpModal').modal('toggle');
                $scope.ALERTCONTENT = {
                    Title: Constants.PopupTitleWarning,
                    MethodCase: "NULL",
                    Type: "warning"
                }
                $scope.MESSAGE = unuploadedFileNames;
                IsOverSizeFile = true;
                if (uploadedFileNames == '') {
                    document.getElementById('file').value = null;
                }

            }
            $scope.SelectedFilesMessage = $scope.filesSelected.length + Constants.FilesSelected;
            if ($scope.filesSelected.length > 0) {
                $scope.IsSelectedFIlesDivHidden = false;
            }
            else {
                $scope.IsSelectedFIlesDivHidden = true;
            }
            if ($scope.filesSelected.length > 0) {
                $scope.DisableUploadButton = false;
                IsSelectedFIlesDivHidden = true;
            }
            else {
                $scope.DisableUploadButton = true;
            }

        });

        //Reset each time file browse 
        document.getElementById('file').value = null;
    }
    return factory;
});