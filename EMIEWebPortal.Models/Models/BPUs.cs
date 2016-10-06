using System;

namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is an BPU model class, and will hold the values for BPU data
    /// </summary>
    public class BPUs
    {
        //Gets and sets ID Value
        public int Id { get; set; }

        //Gets and sets BPUId Value
        public int BPUId { get; set; }

        //Gets and sets BPU1 Value 
        public string BPU1 { get; set; }

        //Gets and sets BPUFullName Value
        public string BPUFullName { get; set; }

        //Gets and sets OwningOrganization Value
        public string OwningOrganization { get; set; }

        //Gets and sets BPUTestLeadId Value
        public Nullable<int> BPUTestLeadId { get; set; }

        //Gets and sets RedmondLeadId Value
        public Nullable<int> RedmondLeadId { get; set; }

        //Gets and sets EspooLeadId Value
        public Nullable<int> EspooLeadId { get; set; }

        //Gets and sets EngineeringTeamMembers Value
        public string EngineeringTeamMembers { get; set; }

        //Gets and sets CreatedById Value
        public Nullable<int> CreatedById { get; set; }

        //Gets and sets CreatedDate Value
        public Nullable<System.DateTime> CreatedDate { get; set; }

        //Gets and sets ModifiedById Value
        public Nullable<int> ModifiedById { get; set; }

        //Gets and sets ModifiedDate Value
        public Nullable<System.DateTime> ModifiedDate { get; set; }

        //Gets and sets IsActive Value
        public Nullable<bool> IsActive { get; set; }

    }
}