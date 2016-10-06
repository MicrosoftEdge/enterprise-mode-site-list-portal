
namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is a TicketsCount class, and will hold the information about counts of various ticket state
    /// </summary>
    public class TicketsCount
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties

        //Get-Set Count of MyRequest Ticket
        public int MyRequest { get; set; }

        //Get-Set Count of PendinApproval Ticket
        public int PendingApproval { get; set; }

        //Get-Set Count of RequestClosed Ticket
        public int RequestClosed { get; set; }

        //Get-Set Count of RequestRejected Ticket
        public int RequestRejected { get; set; }

        //Get-Set Count of MyApproved Ticket
        public int MyApproved { get; set; }

        //Get-Set Count of ProductionReady Ticket
        public int ProductionReady { get; set; }

        //Get-Set Count of Completed Ticket
        public int SignedOff { get; set; }

        //get-set count of rollback tickets
        public int RequestRollback { get; set; }

        //Get-Set count of the initiated requests
        public int RequestInitiated { get; set; }

        //Get-Set count of the VerifiedOnTestMachine requests
        public int VerifiedOnTestMachine { get; set; }

        //Get-Set count of the VerificationFailedOnTestMachine requests
        public int VerificationFailedOnTestMachine { get; set; }

        //Get-Set count of the PartiallyApproved requests
        public int PartiallyApproved { get; set; }

        //Get-Set count of the AllRequets requests
        public int AllRequests { get; set; }

        #endregion
    }
}