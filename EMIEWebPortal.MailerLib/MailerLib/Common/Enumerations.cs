
//this namespace will contain all the common entitys and functions which are common to all other files
namespace MailerLib
{

    //This is Enum used to declare all possible status of a ticket
    public enum ApprovalState
    {
        None = 0,

        //Ticket Intitiated
        Initiated = 1,

        //Ticket verified on test machine or not
        VerifiedOnTestMachine = 2,

        //Ticket Approval is pending at some approver
        Pending = 3,

        //Ticket is approved by all approvers
        Approved = 4,

        //Ticket is rejected by any of the approvers
        Rejected = 5,


        VerificationFailedTestMachine = 7
    }

    /// <summary>
    /// This is Final ticket status which is calculated based on state of each approver
    /// For e.g. If any of the approver has approved the ticket request then Final Ticket 
    /// Status would be 'Partially Approved', If any of Approver has rejected the request 
    /// then Final Ticket status would be Rejected
    /// </summary>
    public enum TicketStatus
    {
        None = 0,

        Initiated = 1,

        //Ticket verified on test machine or not
        VerifiedOnTestMachine = 2,

        //Ticket Approval is pending at all approvers
        ApprovalPending = 3,

        //Ticket Approval is pending at some approver
        PartiallyApproved = 4,

        //Approved by all Approvers
        Approved = 5,

        //Rejectd by any of approvers
        Rejected = 6,

        //Ticket is scheduled for production changes
        ProductionReady = 7,

        //Ticket is signed off/Closed
        SignedOff = 8,

        //Ticket is RollBack
        RolledBack = 9,

        //Verification failed tickets
        VerificationFailedTestMachine = 10,

        //Closed tickets
        Closed = 11,

        //Production Changes Scheduled for scheduler
        ProductionChangesScheduled =12

    }

    /// <summary>
    /// This is operation will be used to specify whether we want to delete/update/insert records 
    /// For e.g. if new request is raised then that request will get inserted and when user click on edit button, 
    /// hhe/she can modified the save data.  
    /// </summary>
    public enum Operation
    {
        None = 0,

        //Ticket Insertion
        Insert = 1,

        //Ticket Updation
        Update = 2,

        //Ticket Deletion
        Delete = 3,

        //XML Ticket Add
        AddInSandbox = 4,


        AddInProduction = 5,

        //SandBox Rollback
        SandboxRollback = 6,

        //Production Rollback
        ProductionRollback = 7
    }


    /// <summary>
    /// This is operation will be used to specify whether we want to delete/update/insert url in xml 
    /// For e.g. if new request is raised then that request will get inserted and when user selects update option, 
    /// he/she can modified the save url, delete will delete it.  
    /// </summary>
    public enum ChangeType
    {
        None = 0,

        //URL Insertion
        Add = 1,

        //URL Deletion
        Delete = 2,

        //URL Updation
        Update = 3,
    }

    /// <summary>
    /// This Enum will handle the actions that we perform while verification sandbox and verification 
    /// </summary>
    public enum VerifyActions
    {
        None = 0,

        //ProductionSuccess
        ProductionSuccess = 1,

        //ProductionFailure
        ProductionFailure = 2,

        //ProductionRollback
        ProductionRollback = 3,

        //SandBoxFailure
        SandboxFailure = 4,

        //SandboxRollBack
        SandboxRollback = 5

    }

    /// <summary>
    /// This is operation will be used to specify whether the compat modes or docmodes. These are used to 
    /// reference the docmode or compat mode selected on raising new request.
    /// </summary>
    public enum CompatModes
    {
        None = 0,

        Default = 1,

        IE7EnterpriseMode = 2,

        IE8EnterpriseMode = 3,

        IE5DocumentMode = 4,

        IE7DocumentMode = 5,

        IE8DocumentMode = 6,

        IE9DocumentMode = 7,

        IE10DocumentMode = 8,

        IE11DocumentMode = 9,


    }

    /// <summary>
    /// This is operation will be used to specify whether we want to open the application in IE/MSEdge 
    /// For e.g. if new request is raised with open in IE then that request will get inserted with IE11 as open in.  
    /// </summary>
    public enum OpenIn
    {
        None = 0,

        IE11 = 1,

        MSEdge = 2
    }

    /// <summary>
    /// This Enum holds role ids of EMIE SSP users
    /// </summary>
    public enum UserRole
    {
        None = 0,
        //Requester
        Requester = 1,

        //App Manager
        AppManager = 2,

        //Group Head
        GroupHead = 3,

        //EMIE Champion
        EMIEChampion = 4
    }
}
