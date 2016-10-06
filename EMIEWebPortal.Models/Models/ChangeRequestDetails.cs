using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EMIEWebPortal.Models
{
    /// <summary>
    /// Saves the lists of various details used to show on New Details page
    /// </summary>
    public class ChangeRequestDetails
    {
        //Gets and sets list of Applications 
        public List<Applications> Applications { get; set; }

        //Gets and sets list of various changetypes 
        public List<ChangeTypes> ChangeTypes { get; set; }

        //Gets and sets list of reason for change 
        public List<ReasonForChanges> ReasonForChanges { get; set; }

        //Gets and sets list of DocModes 
        public List<DocModes> DocModes { get; set; }

        //Gets and sets list of Tickets 
        public List<Tickets> Tickets { get; set; }
    }
}