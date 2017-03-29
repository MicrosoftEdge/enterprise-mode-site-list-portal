//These are the constants used as enum
EMIEModule.constant('Constants', {

    //---------------Constants For Alert Messages Per Page----------------------
    //File upload strings to be used in Verify Sandbox and Production controller
    ErrorFileType: " - file type isn't supported.",
    ErrorFileSize: " - file size must be less than 1 MB.",
    FilesSelected: " file(s) selected, click 'Upload' to upload.",
    FileNotUploaded: "Unable to add files:",
    FilesUploaded: "Success! Your file(s) have been uploaded:",
    ErrorFileUpload: "Oops... something went wrong while uploading file(s).",
    ErrorFileAlreadySelected: " - file already selected.",
    ErrorFileAlreadyUploaded: " - file already uploaded.",
    ErrorFileUnableToSelect: "Unable to select file(s):",
    ErrorFileEmpty: " - file is empty.",
    ErrorFileUnableToDelete: " Unable to delete files: ",
    FileDeleted: 'Success! Your file has been deleted.',

    //---User Management Controller Alert Messages
    Errordata: "An error occurred while getting your data.",
    ErrorRoleData: "An error occurred while getting your Role data.",
    ErrorGroupData: "An error occurred while getting your Group name data.",
    SelectUserToDeactivate: "Select an employee to deactivate.",
    SelectUserToActivate: "Select an employee to activate.",
    ErrorDeleteUser: "An eror occurred while deleting the employee.",
    ErrorCreateUser: "An error occurred while creating the employee.",
    SearchUser: "Search for the employee.",
    EnterAllFields: "Complete all the required fields.",
    ErrorUpdateUser: "An error occurred while updating the employee.",
    ErrorSearchADUser: "An error occurred while getting your Active Directory data.",
    SelectGroup: "Select a Group.",
    ExportUserFileName: "EnterpriseModeUsersList.xlsx",
    RegisterUserPageHeader: "Register an employee",
    CreateNewUserPageHeader: "Add a new employee",

    //---SiteListController Alert Messages
    ErrorSiteInformation: "An error while getting your site information.",
    XMlDownloadFileName: "Websites.xml",
    DownloadedTextFileName: "Websites.emie",
    RemoveAllWebSiteMessages: "Clicking OK permanently removes all websites from your list. Continue?",
    InvalidFileFormat: "The file format isn't supported.",
    DeleteAllDomainMessage: "Clicking OK removes the domain and all domain entries, including any sub-paths. Continue?",
    DeleteWebsiteEntry: "Clicking OK removes this website from the list. Continue?",
    BulkUploadError: "An error occurred during the bulk upload process.",
    ProcessWaitMessage: "This process might take a long time to finish. Continue?",
    ErrorBulkImport: "An error occurred while bulk importing your sites to the production list.",
    SuccessBulkImport: "Success! Your websites successfully have been bulk imported to the production list.",
    ItemsPerPageSiteListTool: 25,

    //---VerifySandbox/VerifyProduction Alert Messages
    UnableToLoadCustomerData: "Unable to load your customer data",
    SelectAllApprovers: "Select all Approvers.",
    UnableToSendData: "Unable to send your data: ",
    UnableToRollback: "Unable to rollback data: ",
    UnableToDownloadFile: "Unable to download your files: ",
    UanbleToLoadTicketData: "Unable to load your ticket data:",
    SupportTeamSentMessage: "Success! An email has been sent to the support team.",
    ErrorInSendingIssue: "An error while sending your message.",
    SignedOffSuccess: " successfully signed off.",
    SignedOffFail: " wasn't able to be signed off. Please contact your site administrator.",
    RollbackSuccess: " has been successfully rolled back.",
    RollbackFailed: " could not be rolled back. Please contact the site administrator.",

    //My Request Messages
    ErrorPendingApprovalRetrieval: "An error occured while getting the pending approvals for these tickets: ",
    ErrorTicketRetrieval: "An error while getting your ticket data: ",
    ErrorTicketSelection: 'Select at least one request.',
    TicketRejected: ' has been Rejected.',
    TicketApproved: ' has been Approved.',
    NoTicketPending: "No requests are awaiting your approval.",
    TicketRetrievalProgress: "Loading...",
    DataNotAvailable: "There are no requests.",


    //reportController
    EndDateError: "The End date must be later than the Start date.",
    TodaysDateError: "The Date must be today's date or earlier.",

    //AllRequestController
    ErrorDataRetrieval: "Oops... something went wrong while getting your details. Please try again later.",
    ErrorApprovalsRetrieval: "Oops... something went wrong while getting the Approval details for your request. Please try again. If the issue persists, please contact your site administrator.",
    ReminderSent: "A reminder has been sent to the Approver.",
    ErrorReminderSent: "Oops... something went wrong while sending the reminder. Please try again later.",

    //MyApprovalCOntroller
    SetConfigData: "Before continuing, specify your organization's environment settings. We're taking you to the Settings page now.",

    //NewCR
    ErrorURLProtocol: "This URL must start with http:// or https://.",
    ErrorEmptyFilds: "All required fields must be completed before submitting the request.",
    ErrorInvalidApplication: "A valid app name must be included before submitting the request.",
    ErrorCouldntReachURL: "The site URL can't be reached. Continue?",
    ErrorUnavailableServer: "The server you're trying to reach isn't available.",
    OpenRequestMessage: "There are open requests for the same domain. You must close any existing requests before continuing.",
    ErrorContactEMIEChamp: "Oops... something went wrong. Please try again later. If this issue persists, please contact your site administrator.",
    DomainUpdationMessage: "Clicking OK updates the specified domain information for your Enterprise Mode Site List. Continue?",
    DeleteDomainMessage: "Clicking OK removes the specified domain from your Enterprise Mode Site List. Continue?",
    DomainNotPresentMessage: "This domain type doesn't exist in your Enterprise Mode Site List. You must select a supported type.",
    ErrorSubmittingRequest: "An error occurred while submitting your request. Please try again later.",
    ErrorEditingRequest: "An error occured while editing your request. Please try again later.",
    NavigatePageMessage: "Clicking OK navigates you away from this page and your unsaved changes will be lost. Continue?",
    ErrorProeccessingRequest: "A processing error occurred. Please try again later.",
    DuplicateApplicationName: "That app name already exists.",
    SelectApplication: "Select the app name.",

    //ConfigurationController
    EnterSandboxXMLLocation: "Specify a valid Pre-production environment location.",
    EnterAttachmentLocation: "Specify a valid Attachments location.",
    EnterConfigurationFolderLocation: "Please enter a valid settings location.",
    EnterCorrectURL: "Specify a valid site URL.",
    EnterProductionXMLLocation: "Specify a valid Production environment location.",
    ErrorValidSandboxXMLName: "Specify a valid file name for your Pre-production environment.",
    ErrorValidProductionXMLName: "Specify a valid file name for your Production environment.",
    UnableToAccessConfigSettingPath: "Unable to access your Settings location. You must specify a valid file path and credentials.",
    ErrorSettingConfigData: "An error occurred while setting your configuration data.",
    UnableToAccessAttachmentPath: "Unable to access your Attachments location. You must specify a valid file path and credentials.",
    UnableToAccessProductionXMLPath: "Unable to access your Production environment location. You must specify a valid file path and credentials.",
    UnableToAccessSandboxXMLPath: "Unable to access your Pre-production environment location. You must specify a valid file path and credentials.",
    ConfigSettingsSaved: "Success! Your settings have been saved.",
    ErrorGettingConfigData: "An error occurred while getting your Settings data.",
    NewGroupAdded: "Success! A new group has been added.",
    DuplicateGroupName: "A group with this name already exists.",
    EnterValidGroupHead: "Specify a valid Group Head name.",
    GroupDetailsEdited: "Success! Your Group details were edited.",
    ErrorGettingRoleName: "An error occured while editing the Role name.",
    ErrorInvalidEmail: "Specify a valid email address.",

    //ProdChangesController
    ErrorProdcutionFreezeDateRetrieval: "An error while getting your Production Freeze date.",
    SelectDifferentStartEndTime: "Your Start time and End time must be different.",
    StartTimeMustBeLessThanEndTime: "Your Start time can't be later than your End time.",
    DifferenceBetweenStartTimeEndTime: "The difference between your Start time and End time must be at least 15 minutes.",
    ProductionChangesCouldNotBeDone: "Unable to make your Production changes at the selected time. Please try resetting to a later time.",
    ErrorSettingScheduleForProduction: "An error occurred while setting the Production schedule.",

    //ManageSiteController
    AddURLToSiteLIst: "The specified URL can't be reached. Continue to add it to your site list?",
    ErrorUnableToPingURL: "An error occurred while trying to reach the URL.",
    SelectDocModeForSubDomainURL: "Select a document mode for the subdomain URL.",
    SelectDocModeForWebsite: "Select a document mode for the website.",
    EnterURLInCorrectFormat: "Specify a valid URL. For example, http://sub.domain.com.",
    ErrorInGettingDocModes: "An error occured while getting the docmodes.",

    //LogInController
    ErrorLogInFailed: "We couldn't sign you in because your account isn't currently active. Please register or contact your site administrator.",
    ErrorUnAuthorisedUser: "You aren't authorized to access this site. Please contact your site administrator for help.",

    //EMIEUserManagementController
    InvalidUsernamePassword: "Your username or password is incorrect.",
    OldPasswordDidntMatch: "The old password you've included is incorrect.",
    OldAndNewPasswordShouldNotBeSame: "Your new password must not be the same as your old password.",
    PasswordChangeSuccess: "Success! Your password has been saved.",
    PasswordChangeFailure: "Unable to change your password. Please try again later.",

    //title messages
    TitleInvalidFields: "Incorrect fields",
    TitleEmptyFields: "Empty fields",
    TitleIncorrectApplication: "Incorrect app name",
    TitleInvalidUser: "Incorrect employee",
    TitleError: "Error",
    TitleWarning: "Warning",
    TitlePasswordMismatch: "Passwords don't match",
    TitleDuplicatePassword: "Duplicate password",


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
    PopupTitleEnterProperURL: "Include valid URL",
    PopupTitleOpenRequestFound: "Open request found",
    PopupTitleDomainAlreadyPresent: "Duplicate domain",
    PopupTitleDomainEdited: "Edit domain",
    PopupTitleDomainDeleted: "Delete domain",
    PopupTitleDomainNotExist: "No domain exists",
    PopupTitleAlreadyExist: "Duplicate group",
    PopupTitleLoginError: "Sign in error",
    PopupTitleAreYouSure: "Continue?",


    //Sorting ColumnNamesConstants
    SortByFullURL: 'FullURL',
    SortByDomainDocMode: 'DomainDocMode',
    SortByNotesAboutURL: 'NotesAboutURL',
    SortByOpenIn: 'OpenIn',
    SortByUserName: 'User.UserName',
    SortByRoleName: 'User.UserRole.RoleName',
    SortByTicketID: 'TicketId',
    SortByApplicationName: 'Application',
    SortByApplicationNameOnAllRequestPage: 'Application.ApplicationName',
    SortByApplicationNameOnCRPage: 'ApplicationName',

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
    // Strings for the approval pages
    Approvals: {
        All: "All approvals",
        My: "My approvals"
    },
    // Strings for the navbar
    Requests: {
        All: "All requests",
        My: "My requests"
    },
    //This data is used for the displaying the headers and filtering out the data on tab selection(in layout) in the AllRequests page
    FilterByTicketStatus: {
        //This filter options selects all the requests logged by logged user
        AllRequests: "All requests",

        //this filter option selects the requests which are in progress(ticket status=2,3,4,5,,7,10)
        InProgress: "In progress",

        //this filter option selects the requests which are rejected(ticket status=6)
        Rejected: "Rejected",

        //this filter option selects the requests which are closed(ticket status=11)
        Closed: "Closed",

        //this filter option selects the requests which are Rollback
        Rollback: "Rolled back",

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
        1: "All employees",

        //Active Users
        2: "Active employees",

        //InActive Users
        3: "Inactive employees",

        //Registered Users
        4: "Registered employees"
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

