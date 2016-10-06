using System;
namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is an ReasonForChange model class, and will hold the values for ReasonForChange data
    /// </summary>
    public class ReasonForChanges
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties

        //Gets and sets ReasonForChangeId value
        public Nullable<int> ReasonForChangeId { get; set; }

        //Gets and sets ReasonForChangeName value
        public string ReasonForChangeName { get; set; }

        //Gets and sets IsActive value
        public bool IsActive { get; set; }

        #endregion
    }

}
