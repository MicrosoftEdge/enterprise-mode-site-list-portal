using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EMIEWebPortal.Models
{
    public class ApprovalData
    {
        public string Key { get; set; }
        public List<Users> Value { get; set; }

        public ApprovalData()
        { }
    }
}