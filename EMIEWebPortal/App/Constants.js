//These are the constants used as enum
EMIEModule.constant('Constants', {

    //---------------Constants For Alert Messages Per Page----------------------
    //File upload strings to be used in Verify Sandbox and Production controller
    ErrorFileType: " - file type is not allowed.",
    ErrorFileSize: " - size of file should be less than 1 MB.",
    FilesSelected: " file(s) selected, click 'UPLOAD' to upload.",
    FileNotUploaded: "Unable to add files:",
    FilesUploaded: "File(s) have been uploaded:",
    ErrorFileUpload: "Oops...Something went wrong while uploading file(s) to server!",
    ErrorFileAlreadySelected: " - file already selected.",
    ErrorFileAlreadyUploaded: " - file already uploaded.",
    ErrorFileUnableToSelect: "Unable to select file(s):",
    ErrorFileEmpty: " - file is empty.",
    ErrorFileUnableToDelete: " Unable to delete files ",
    FileDeleted: 'Successfully Deleted!',

    //---User Management Controller Alert Messages
    Errordata: "Error occurred while retrieving data.",
    ErrorRoleData: "Error occurred while retrieving role data.",
    ErrorGroupData: "Error occurred while retrieving group name data.",
    SelectUserToDeactivate: "Select user to deactivate.",
    SelectUserToActivate: "Select user to activate.",
    ErrorDeleteUser: "Error occurred while deleting user.",
    ErrorCreateUser: "Error occurred while creating user.",
    SearchUser: "Please search the user.",
    EnterAllFields: "Please enter all the required fields.",
    ErrorUpdateUser: "Error occurred while updating user.",
    ErrorSearchADUser: "Error occurred while retrieving the data from active directory.",
    SelectGroup: "Please select group.",
    ExportUserFileName: "EnterpriseModeUsersList.xlsx",
    RegisterUserPageHeader: "Register User",
    CreateNewUserPageHeader: "Create New User",

    //---SiteListController Alert Messages
    ErrorSiteInformation: "Error while retrieving sites information",
    XMlDownloadFileName: "Websites.xml",
    DownloadedTextFileName: "Websites.emie",
    RemoveAllWebSiteMessages:"This operation will remove all the websites from the list and is irreversible. Do you want to continue?",
    InvalidFileFormat: "The file format is invalid.",
    DeleteAllDomainMessage: "Deleting the domain will delete all the domain entries, including all paths under it. Do you want to continue?",
    DeleteWebsiteEntry: "This will delete website entry from the list. Do you want to continue?",
    BulkUploadError: "Error in bulk upload",
    ProcessWaitMessage: "This might take a little while to complete the operation, are you sure you want to continue?",
    ErrorBulkImport: "Error while bulk importing sites to the production list.",
    SuccessBulkImport: "All sites successfully bulk imported to the production list.",
    ItemsPerPageSiteListTool:25,

    //---VerifySandbox/VerifyProduction Alert Messages
    UnableToLoadCustomerData: "Unable to load customer data",
    SelectAllApprovers: "Please select all approvers.",
    UnableToSendData: "Unable to send data ",
    UnableToRollback: "Unable to roll back data:",
    UnableToDownloadFile: "Unable to download files",
    UanbleToLoadTicketData: "Unable to load ticket data:",
    SupportTeamSentMessage: "An email has been successfully sent to Support Team.",
    ErrorInSendingIssue: "Error in sending message.",
    SignedOffSuccess: " signed off successfully.",
    SignedOffFail: " could not sign Off. Please contact EMIE Champ.",
    RollbackSuccess: " rolled back Successfully.",
    RollbackFailed: " could not roll back. Please contact EMIE Champ.",
    
    //My Request Messages
    ErrorPendingApprovalRetrieval: "Error in getting pending approvals of given tickets: ",
    ErrorTicketRetrieval: "Error in getting tickets Data. ",
    ErrorTicketSelection: 'No request selected. Please select at least one request.',
    TicketRejected: ' rejected.',
    TicketApproved: ' approved.',
    NoTicketPending: "You are up-to-date. There are no pending requests for your approval.",
    TicketRetrievalProgress: "Getting ready... Please wait...",
    DataNotAvailable: "There are no requests to display.",


    //reportController
    EndDateError: "End date should be greater than start date",
    TodaysDateError: "Date must be less than or equal to today's date",

    //AllRequestController
    ErrorDataRetrieval: "Oops...Something went wrong while retrieving details, try again later!",
    ErrorApprovalsRetrieval: "Something went wrong while retrieving approvals details for your request...try again. if issue persists please contact EMIE Champs",
    ReminderSent: "Reminder has been sent to the Approver.",
    ErrorReminderSent: "Oops...Something went wrong while sending reminder, try again later.",

    //MyApprovalCOntroller
    SetConfigData: "You need to set the environment details before you start. We are now navigating you to Settings page, please provide environment details to proceed further.",

    //NewCR
    ErrorURLProtocol: "Please enter the URL starting with http:// or https://",
    ErrorEmptyFilds: "Please enter all required fields before you submit the request..",
    ErrorInvalidApplication: "Please enter valid Application before you submit the request..",
    ErrorCouldntReachURL: "The site URL is not reachable, either domain does not exists or could not connect to it now. Do you still want to continue?",
    ErrorUnavailableServer: "The server you are trying to reach is unavailable!",
    OpenRequestMessage: "There are open requests #",
    SelectExistingRequestMessage: " for same domain, please close any existing requests before you proceed.",
    ErrorContactEMIEChamp: "Something went wrong. Please try after sometime, if issue persists please contact EMIE Champ.",
    DomainUpdationMessage: "Specified domain information will be updated in XML. Are you sure you want to proceed?",
    DeleteDomainMessage: "Specified domain will be removed from Enterprise Mode List. Are you sure you want to proceed?",
    DomainNotPresentMessage: "Specified domain does not exist in Enterprise Mode List. Select correct Change Type.",
    ErrorSubmittingRequest: "Error occurred while submitting  the request. Please try again later.",
    ErrorEditingRequest: "Error occurred while Editing the request. Please try again later.",
    NavigatePageMessage: "Are you sure you want to navigate away from this page? All your unsaved changes will be lost.",
    ErrorProeccessingRequest: "Error occurred while processing. Please try again later.",
    DuplicateApplicationName: "Given application name is already present.",
    SelectApplication: "Select Application",

    //ConfigurationController
    EnterSandboxXMLLocation: "Enter correct pre-production environment XML location.",
    EnterAttachmentLocation: "Enter correct attachment location.",
    EnterConfigurationFolderLocation: "Enter correct configuration folder location.",
    EnterCorrectURL: "Enter correct site URL.",
    EnterProductionXMLLocation: "Enter correct production environment XML location.",
    ErrorValidSandboxXMLName: "Enter valid XML file name in pre-production environment.",
    ErrorValidProductionXMLName: "Enter valid XML file name in production environment.",
    UnableToAccessConfigSettingPath: "Cannot access configuration settings path. Please enter correct path and credentials.",
    ErrorSettingConfigData: "Error occurred while setting configuration data.",
    UnableToAccessAttachmentPath: "Cannot access attachment location Path. Please enter correct path and credentials.",
    UnableToAccessProductionXMLPath: "Cannot access production XML path. Please enter correct path and credentials.",
    UnableToAccessSandboxXMLPath: "Cannot access pre-production XML path. Please enter correct path and credentials.",
    ConfigSettingsSaved: "Configuration settings saved successfully.",
    ErrorGettingConfigData: "Error occurred while getting configuration data.",
    NewGroupAdded: "New group has been successfully added.",
    DuplicateGroupName: "Group name is already present.",
    EnterValidGroupHead: "Please enter a valid group head detail.",
    GroupDetailsEdited: "Group details have been successfully edited.",
    ErrorGettingRoleName: "Error in editing the role name.",
    ErrorInvalidEmail:"Please enter correct email.",

    //ProdChangesController
    ErrorProdcutionFreezeDateRetrieval: "Error in getting production freeze date data.",
    SelectDifferentStartEndTime: "Please select different start time and end time.",
    StartTimeMustBeLessThanEndTime: "Start time cannot be greater than end time.",
    DifferenceBetweenStartTimeEndTime: "Difference between Start time and End time cannot be less than 15 minutes.",
    ProductionChangesCouldNotBeDone: "Production changes could not be done at selected time ! Please set it sometime later.",
    ErrorSettingScheduleForProduction: "Error occurred while setting the schedule for production.",

    //ManageSiteController
    AddURLToSiteLIst:"We could not reach to the specified URL. Either it does not exists or could not connect to it right now. Do you want to add it to the site list anyway?",
    ErrorUnableToPingURL: "Error occurred in URL ping",
    SelectDocModeForSubDomainURL: "Please select a document mode for the subdomain URL",
    SelectDocModeForWebsite: "Please select a document mode for the website",
    EnterURLInCorrectFormat: "Please enter URL in correct format, e.g. http://igcareer.microsoft.com",
    ErrorInGettingDocModes: "Error in getting the docmodes",

    //LogInController
    ErrorLogInFailed: "We can’t sign you into the Enterprise Mode Self-service portal because you don’t have an assigned role or because your account has been deactivated. Please register or contact Site Administrator for access.",
    ErrorUnAuthorisedUser: "You are not authorize to access the site. Please contact site administrator for assistance.",

    //EMIEUserManagementController
    InvalidUsernamePassword: "Given username or password is invalid.",
    OldPasswordDidntMatch: "Old password did not match.",
    OldAndNewPasswordShouldNotBeSame: "Old password and new password should not be same.",
    PasswordChangeSuccess: "Password saved successfully.",
    PasswordChangeFailure: "Unable to change password. Please try again later.",

    //title messages
    TitleInvalidFields: "Invalid Fields!",
    TitleEmptyFields: "Empty Fields!",
    TitleIncorrectApplication:"Incorrect Application!",
    TitleInvalidUser: "Invalid User!",
    TitleError: "Error",
    TitleWarning: "Warning",
    TitlePasswordMismatch: "Password mismatch!",
    TitleDuplicatePassword:"Duplicate Password!",


    //PopUpTitles
    PopupTitleSuccess: "Success",
    PopupTitleWentWrong: "Something went wrong",
    PopupTitleWarning: "Warning",
    PopupTitleError: "Error",
    PopupTitleInfo: "Info",
    PopupTitleAlert: "Alert",
    PopupTitleReminderSent: "Reminder sent",
    PopupTitleValidationFailed: "Validation failed",
    PopupTitleServerUnavailable: "Server unavailable",
    PopupTitleEnterProperURL: "Enter proper URL",
    PopupTitleOpenRequestFound: "Open request found",
    PopupTitleDomainAlreadyPresent: "Domain already present",
    PopupTitleDomainEdited: "Domain will be edited",
    PopupTitleDomainDeleted: "Domain will be deleted",
    PopupTitleDomainNotExist: "Domain does not exist",
    PopupTitleAlreadyExist: "Already exists",
    PopupTitleLoginError: "Login error",
    PopupTitleAreYouSure: "Are you sure?",


    //Sorting ColumnNamesConstants
    SortByFullURL: 'FullURL',
    SortByDomainDocMode: 'DomainDocMode',
    SortByNotesAboutURL: 'NotesAboutURL',
    SortByOpenIn:'OpenIn',
    SortByUserName: 'User.UserName',
    SortByRoleName: 'User.UserRole.RoleName',
    SortByTicketID: 'TicketId',
    SortByApplicationName: 'Application',
    SortByApplicationNameOnAllRequestPage: 'Application.ApplicationName',
    SortByApplicationNameOnCRPage:'ApplicationName',

    //Datepicker options
    DateAfterToday: "AfterToday",
    DateTodayAndBefore: "TodayAndBefore",

    Operation: {

        //If ticket is inserted
        Insert: 1,

        //If ticket is updated
        Update: 2,

        //If ticket is deleted
        Delete: 3
    },
    TicketStatus: {
        Initiated: 1,

        //Ticket verified on test machine or not
        VerifiedOnTestMachine: 2,

        //Ticket Approval is pending at some approver
        ApprovalPending: 3,

        //Ticket Approval is pending at some approver
        PartiallyApproved: 4,

        //Approved by all Approvers
        Approved: 5,

        //Rejectd by any of approvers
        Rejected: 6,

        //Ticket is scheduled for production changes
        ProductionReady: 7,

        //Ticket is signed off/Closed
        SignedOff: 8,

        //Ticket is RollBack
        RolledBack: 9,

        //If verification on the test machine fails
        VerificationFailedTestMachine: 10,

        //Ticket is closed
        Closed: 11,

        //Ticket is been scheduled for particular date 
        ProductionChangesScheduled: 12

    },
    TicketStatusText: {
        1: "Initiated",
        2: "Verified on test machine",
        3: "Approval pending",
        4: "Partially approved",
        5: "Approved",
        6: "Rejected",
        7: "Production ready",
        8: "Signed off",
        9: "Rolled back",
        10: "Verification failed on test machine",
        11: "Closed",
        12: "Production changes scheduled"
    },
    StatusPageMapping: {
        1: "SandboxPage",
        2: "ApproversPage",
        3: "ApproversPage",
        4: "ApproversPage",
        5: "ProductionChangePage",
        7: "SignOffPage",
        8: "SignOffPage",
        9: "SandboxPage",
        10: "Request",
        11: "SignOffPage",
        12: "ProductionChangePage"
    },
    ApprovalState: {
        //Ticket Intitiated
        Initiated: 1,

        //Ticket verified on test machine or not
        VerifiedOnTestMachine: 2,

        //Ticket Approval is pending at some approver
        Pending: 3,

        //Ticket is approved by all approvers
        Approved: 4,

        //Ticket is rejected by any of the approvers
        Rejected: 5,


        VerificationFailedTestMachine: 7


    },

    //This data is used for the displaying the headers and filtering out the data on tab selection(in layout) in the AllRequests page
    FilterByTicketStatus: {
        //This filter options selects all the requests logged by logged user
        AllRequests: "All Requests",

        //this filter option selects the requests which are in progress(ticket status=2,3,4,5,,7,10)
        InProgress: "In Progress",

        //this filter option selects the requests which are rejected(ticket status=6)
        Rejected: "Rejected",

        //this filter option selects the requests which are closed(ticket status=11)
        Closed: "Closed",

        //this filter option selects the requests which are Rollback
        Rollback: "Rolled Back",

        //this filter option selects the requests which are pending for approval
        Pending: "Pending"
    },

    ChangeType: {
        //URL Insertion
        Add: 1,

        //URL Deletion
        Delete: 2,

        //URL Updation
        Update: 3

    },

    RoleId: {
        // Requester
        Requester: 1,

        // AppManager
        AppManager: 2,

        // BPULead
        BPULead: 3,

        //EMIEChampion
        EMIEChampion: 4

    },

    /// <summary>
    /// This Enum will handle the actions that we perform while verification sandbox and verification 
    /// </summary>
    VerifyActions: {
        //ProductionSuccess
        ProductionSuccess: 1,

        //ProductionFailure
        ProductionFailure: 2,

        //ProductionRollback
        ProductionRollback: 3,

        //SandBoxFailure
        SandBoxFailure: 4,

        //SandboxRollBack
        SandboxRollBack: 5

    },

    /// <summary>
    /// This Enum will handle the dropdown options for user management page
    /// </summary>
    UserManagementDDLOptions: {
        //AllUsers
        1: "All Users",

        //Active Users
        2: "Active Users",

        //InActive Users
        3: "Inactive Users",

        //Register Users
        4: "Register Users"
    },

    /// <summary>
    /// This Enum maps the doc modes to their IDs
    /// </summary>
    CompatModeIDs: {
        Default: 1,
        IE7Enterprise: 2,
        IE8Enterprise: 3,
        IE5: 4,
        IE7: 5,
        IE8: 6,
        IE9: 7,
        IE10: 8,
        IE11: 9
    },

    /// <summary>
    /// This Enum maps the browser to its ID
    /// </summary>
    OpenIn: {
        None: 0,
        IE11: 1,
        MSEdge: 2
    }

});

