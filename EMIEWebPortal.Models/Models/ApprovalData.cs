namespace EMIEWebPortal.Models
{
    using System.Collections.Generic;

    public class ApprovalData
    {
        public string Key { get; set; }

        public List<Users> Value { get; set; }

        public ApprovalData()
        {
        }
    }
}