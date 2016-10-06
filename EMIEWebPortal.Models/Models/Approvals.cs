
using EMIEWebPortal.Common;
using System.Collections.Generic;
namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is a Approval class, and will hold the values for Approval
    /// </summary>
    public class Approvals
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties
        //Get-set Approver  value
        public Users Approver { get; set; }

        //Get-set Approver Comments value
        public  string ApproverComments { get; set; }

        //Get-set Number of Reminders value
        public int? NoOfReminders { get; set; }

        //Get-set State value
        public ApprovalState ApprovalState { get; set; }

        //Get-set Is Active value
        public bool IsActive { get; set; }

        #endregion
    }
}
