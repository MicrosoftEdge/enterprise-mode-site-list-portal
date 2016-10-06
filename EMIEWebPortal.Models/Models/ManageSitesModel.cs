using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is a manageSites model which will hold the data of a particular URL like url substring and its docmode,domain and domain docmode
    /// </summary>
    public class ManageSitesModel
    {
        #region Public Properties
        //this property gets/sets the full url of the wesite including the domain and subdomain
        public string FullURL { get; set; }

        //this property gets/sets the domain url of the website
        public string DomainURL { get; set; }

        //this property gets/sets the docmode for the domain url
        public string DomainDocMode { get; set; }

        //this property gets/sets the subdomain url of the website
        public string URLSubstring { get; set; }

        //this property gets/sets the docmode of the subdomain url
        public string SubDocMode { get; set; }

        //this property gets/sets the Sitenotes about the url
        public string NotesAboutURL { get; set; }

        //this property gets/sets the openinie value for the domain
        public string OpenIn { get; set; }

        //this property gets/sets the openinie value for the subdoamin url
        public string OpenInForSubdomain { get; set; }

        //this property gets/sets the person name who has modified the wesite at last
        public string LastModifiedBy { get; set; }

        //this property gets/sets the validate url value 
        public bool ValidateURL { get; set; }

        //this property gets/sets whether to exclude or include the url
        public bool DomainExclude { get; set; }

        //this property gets/sets whether to transit to IE or not
        public bool DomainDoNotTransition { get; set; }

        //this property gets/sets whether to exclude for the path url
        public bool PathExclude { get; set; }

        //this property gets/sets whether to transit to IE for path or not
        public bool PathDoNotTransition { get; set; }

        //this property gets/sets the parent of the path url
        public string ParentId { get; set; }

        //this property gets/sets emie version
        public string EmieVersion { get; set; }
        #endregion
    }
}