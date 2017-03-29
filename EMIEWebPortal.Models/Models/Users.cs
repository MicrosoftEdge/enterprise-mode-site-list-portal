namespace EMIEWebPortal.Models
{
    using System;

    public class Users
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties

        // Gets and sets UserID value
        public int? UserId { get; set; }

        // Gets and sets LoginId value
        public string LogOnId { get; set; }

        // Gets and sets UserName value
        public string UserName { get; set; }

        // Gets and sets Email value
        public string Email { get; set; }

        // Gets and sets Password value
        public string Password { get; set; }

        // Gets and sets UserRole value
        public Roles UserRole { get; set; }

        // Gets and sets IsActive value
        public bool? IsActive { get; set; }

        // Gets and sets CreatedById value
        public int? CreatedById { get; set; }

        // Gets and sets CreatedDate value
        public DateTime? CreatedDate { get; set; }

        // Gets and sets ModifiedById value
        public int? ModifiedById { get; set; }

        // Gets and sets ModifiedDate value
        public DateTime? ModifiedDate { get; set; }

        // Gets and sets BPU Name value
        public int BPUId { get; set; }

        // Gets and sets UserBPU value
        public BPUs UserBPU { get; set; }

        // Gets and sets CreatedByUser value
        public Users CreatedByUser { get; set; }

        // Gets and sets ModifiedByUser value
        public Users ModifiedByUser { get; set; }

        #endregion
    }
}