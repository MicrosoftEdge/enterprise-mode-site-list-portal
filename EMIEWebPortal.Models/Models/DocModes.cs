
using System;
namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is a DocMode class, and will hold the values for DocMode
    /// </summary>
    public class DocModes
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties

        //Get-Set DocModeId value
        public Nullable<int> DocModeId { get; set; }

        //Get-Set DocModeName value
        public string DocModeName { get; set; }

        //Get-Set IsActive value
        public Nullable<bool> IsActive { get; set; }

        #endregion
    }
}
