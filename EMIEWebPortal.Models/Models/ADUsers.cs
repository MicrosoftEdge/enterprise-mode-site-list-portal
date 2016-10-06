using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EMIEWebPortal.Models
{
    /// <summary>
    /// class for Activedirectory users
    /// </summary>
    public class ADUsers
    {
        public string Email { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public bool IsMapped { get; set; }
    }
}