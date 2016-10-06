
using System;
namespace EMIEWebPortal.Models
{
    public class UserMapping
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties

        //Get-Set  Id value
        public int Id { get; set; }

        //Get-Set User Id value
        public int UserId { get; set; }
        
       //Get-Set User Role Id value
        public int RoleId { get; set; }

        //Get-Set Mapping Details value
        public string MappingDetails { get; set; }

        //Get-Set IsActive value
        public bool? IsActive { get; set; }

        //Get-Set User property value
        public Users User { get; set; }

        //Gets and Sets IsRegistered value of register users
        public bool? IsRegistered { get; set; }

        //Gets and sets ModifiedDate value
        public DateTime? ModifiedDate { get; set; }

        #endregion
    }
}