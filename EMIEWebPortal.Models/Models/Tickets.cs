using EMIEWebPortal.Common;
using System;
using System.Collections.Generic;


namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is an Ticket model class, and will hold the values for Ticket data
    /// </summary>
    public class Tickets
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties

        //Gets and sets TicketId value
        public int TicketId { get; set; }

        //Gets and sets application value for ticket
        public Applications Application { get; set; }

        //Gets and sets RequestedBy value
        public Users RequestedBy { get; set; }

        //Gets and sets Comments for RequestedBy 
        public string Description { get; set; }

        //Gets and sets ChangeType value
        public ChangeTypes ChangeType { get; set; }


        //Gets and sets ReasonForChange value
        public ReasonForChanges ReasonForChange { get; set; }

        //Gets and sets comments for ReasonForChange
        public string ReasonForChangeComments { get; set; }

        //Gets and sets BusinessImpact value
        public string BusinessImpact { get; set; }

        //Gets and sets DocMode value
        public DocModes DocMode { get; set; }

        #region change type

        //Gets and sets X_UAMetaTage value
        public bool? X_UAMetaTage { get; set; }

        //Gets and sets X_UAMetaTageDetails value
        public string X_UAMetaTageDetails { get; set; }

        //Gets and sets X_UAHonor value
        public bool? X_UAHonor { get; set; }

        //Gets and sets MultipleX_UA value
        public bool? MultipleX_UA { get; set; }

        //Gets and sets ExternalFacingSite value
        public bool? ExternalFacingSite { get; set; }

        //Gets and sets FQDN value
        public string FQDN { get; set; }

        #endregion change type

        //Gets and sets AppSiteUrl value
        public string AppSiteUrl { get; set; }

        //Gets and sets Open In value
        public bool? DomainOpenInEdge { get; set; }
       
        //Gets and sets FinalTicketStatus value
        public TicketStatus FinalTicketStatus { get; set; }

        //Gets and sets list of Approvals for ticket
        public List<Approvals> Approvals { get; set; }

        //Gets and sets Scheduled DateTime Start for production changes for ticket
        public DateTime? ScheduleDateTimeStart { get; set; }

        //Gets and sets Scheduled DateTime End for production changes for ticket
        public DateTime? ScheduleDateTimeEnd { get; set; }

        /// <summary>
        /// Gets and sets the SandBoxFailureComments
        /// </summary>
        public string SandboxFailureComments { get; set; }

        /// <summary>
        /// Gets and sets the ProductionSuccessComments
        /// </summary>
        public string ProductionSuccessComments { get; set; }

        /// <summary>
        /// Gets and sets the ProductionFailureComments
        /// </summary>
        public string ProductionFailureComments { get; set; }

        /// <summary>
        /// Gets and Sets the Ticket creation datetime
        /// </summary>
        public string TicketCreationDateTime { get; set; }


        //Gets and sets AppSiteUrl value
        public string SubDomainUrl { get; set; }

        //Gets and sets Open In value
        public bool? SubDomainOpenInEdge { get; set; }

        public DocModes SubDomainDocMode { get; set; }

        //Gets and sets X_UAHonor value
        public bool? SubDomainX_UAHonor { get; set; }

        /// <summary>
        /// Gets and Sets the ContactSupport Email 
        /// </summary>
        public string ContactSupportEmail { get; set; }

        /// <summary>
        /// gets and sets the datetimeoffset value of  the timezone on which the code is running
        /// </summary>
        public int DateTimeOffset { get; set; }

        /// <summary>
        /// gets and sets the rejected comment
        /// </summary>
        public string RejectedReason { get; set; }
        #endregion
    }
}


