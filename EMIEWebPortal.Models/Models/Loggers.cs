namespace EMIEWebPortal.Models
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;

    public class Loggers
    {
        // Get-Set UserID value
        public int? UserID { get; set; }

        // Get-Set LoggedOn value
        public DateTime LoggedOn { get; set; }

        // Get-Set ActionMethod value
        // This will store the name of the method
        public string ActionMethod { get; set; }

        // Get-Set Description value
        // Description to be stored with every logged result
        public string Description { get; set; }

        // Get-Set Operation value
        // Type of method for ex-Add,Delete,Update
        public string Operation { get; set; }

        // Get-Set ProductCategory value
        // ProductCategory is the type of application it used for for ex - EMIE
        public string ProductCategory { get; set; }
    }
}