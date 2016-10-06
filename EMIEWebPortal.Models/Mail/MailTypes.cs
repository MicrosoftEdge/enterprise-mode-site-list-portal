using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;

namespace EMIEWebPortal.Models
{
    /// <summary>
    /// Enumeration for different Mail type that could besent during Ticket Life Cycle
    /// </summary>
    public enum MailMessageType
    {

        //No mail type
        [Description("Generic mail")]
        None,

        //Request Initiate
        [Description("EMIE Change Request Raised !!")]
        RequesterRaisedRequest,

        //Request Sent for Approval
        [Description("EMIE Change Request Sent for Approval !!")]
        RequestSentForApproval,

        //Request Approved
        [Description("EMIE Change Request Approved !!")]
        RequestApproved,

        //Request Rejected
        [Description("EMIE Change Request Rejected !!")]
        RequestRejected,

        //Request Delegated
        [Description("EMIE Change Request Delegated !!")]
        RequestDelegated,

        //Request Sceduled for production
        [Description("EMIE Change Request Scheduled for Production !!")]
        RequestScheduledForProduction,

        //Request Failed On Test Machine
        [Description("EMIE Change Request Failed On Test Machine !!")]
        RequestFailedOnTestMachine,

        //Requets Rollback Sandbox Machine
        [Description("EMIE Change Request rollback on sandbox machine !!")]
        RequestRollbackOnSandBox,

        //Requets Rollback Production
        [Description("EMIE Change Request rollback on production!!")]
        RequestRollbackOnProduction,

        //Request SignOff
        [Description("EMIE Change Request Signed Off !!")]
        SignOff,

        //Prod Changes Freeze Schedule edited
        [Description("EMIE Production Change Freeze Schedule edited !!")]
        ProductionChangesFreezeScheduleEdited,        

        //Request Failed On Prod Machine
        [Description("EMIE Change Request Failed On Production Machine !!")]
        RequestFailedOnProdMachine,

        //Prod Changes done by Scheduler service
        [Description("EMIE Production Changes done through scheduler service !!")]
        ProductionChangesDoneThroughScheduler,  

        //User Edited
        [Description("EMIE User Edited !!")]
        UserEdited,

        //User Activated
        [Description("EMIE User Activated !!")]
        UserActivated,

        //User Deleted
        [Description("EMIE User Deactivated !!")]
        UserDeactivated,

        //User Added
         [Description("New EMIE User added in system !!")]
        UserAdded,

        //Registration ask by user
        [Description("User requested for Registration on EMIE SSP !!")]
        RegistrationRequested,

        //user registered
        [Description("User registered on EMIE SSP !!")]
        UserRegistered,

        //Reminder for Approval 
        [Description("Reminder !! Approval of request is pending at your end !!")]
        SendReminder,

        //Application Added
        [Description("EMIE Application Added !!")]
        ApplicationAdded,

        //Configuration Settings edited
        [Description("EMIE configuration settings are edited !!")]
        ConfigurationSettingsEdited,

        //Contact Support Team
        [Description("Contact Support Team !!")]
        ContactSupportTeam
         
    }
}
