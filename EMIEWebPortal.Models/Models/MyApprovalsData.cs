namespace EMIEWebPortal.Models
{
    using System.Collections.Generic;

    /// <summary>
    /// This is an MyApprovalData model class, and will hold the values for displaying approval pending against the approvers
    /// </summary>
    public class MyApprovalData
    {
        #region Private Properties
        private List<Approvals> _approver;  // the _approver field
        private string _application;  // the _approver field
        private string _requestedBy;  // the _state field
        private int _ticketId;  // the _ticketId field
        private int _FinalTicketStatus; // the _FinalTicketStatus field
        #endregion

        #region  Public Properties

        // Get-set ApplicationName  value
        public string Application
        {
            get
            {
                return _application;
            }

            set
            {
                _application = value;
            }
        }

        // Get-set Approver  value      
        public List<Approvals> Approvers    // the Approver property
        {
            get
            {
                return _approver;
            }

            set
            {
                _approver = value;
            }
        }

        // Get-set requested  value     
        public string RequestedBy    // the Requestedby property
        {
            get
            {
                return _requestedBy;
            }

            set
            {
                _requestedBy = value;
            }
        }

        // Get-set Ticket  value      
        public int TicketId    // the TicketId property
        {
            get
            {
                return _ticketId;
            }

            set
            {
                _ticketId = value;
            }
        }

        // Gets and sets FinalTicketStatus value
        public int FinalTicketStatus
        {
            get
            {
                return _FinalTicketStatus;
            }

            set
            {
                _FinalTicketStatus = value;
            }
        }
       
        #endregion
    }
}