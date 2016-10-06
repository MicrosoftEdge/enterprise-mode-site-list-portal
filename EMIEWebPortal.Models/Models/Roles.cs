using System;
namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is an Role model class, and will hold the values for Role data
    /// </summary>
    public class Roles
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties


        //Gets and sets ID value
        public int Id { get; set; }

        //Gets and sets RoleID value
        public int RoleId { get; set; }

        //Gets and sets RoleName value
        public string RoleName { get; set; }

        //Gets and sets Role Priority
        public int? RolePriority { get; set; }

        //Gets and sets IsActive value
        public bool IsActive { get; set; }

        //Gets and sets CreatedById value
        public int? CreatedById { get; set; }

        //Gets and sets CreatedDate value
        public DateTime? CreatedDate { get; set; }

        //Gets and sets ModifiedById value
        public int? ModifiedById { get; set; }

        //Gets and sets ModifiedDate value
        public DateTime? ModifiedDate { get; set; }

        //Gets and sets MandatoryApproval value
        public bool? MandatoryApproval { get; set; }

        //Gets and sets RoleDetails value
        public string RoleDetails { get; set; }


        #endregion
    }
}
