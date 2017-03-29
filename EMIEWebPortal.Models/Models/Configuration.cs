namespace EMIEWebPortal.Models
{
    using System;
    using System.Collections.Generic;

    public class Configuration
    {
        #region Public Properties

        // Gets and sets UserID value
        public int Id { get; set; }

        // Gets and sets LoginId value
        public List<ConfigurationData> ConfigSettings;

        // Gets and sets CreatedById value
        public Users CreatedBy { get; set; }

        // Gets and sets CreatedDate value
        public DateTime? CreatedDate { get; set; }

        // Gets and sets ModifiedById value
        public int? ModifiedById { get; set; }

        // Gets and sets ModifiedDate value
        public DateTime? ModifiedDate { get; set; }

        #endregion
    }   
}