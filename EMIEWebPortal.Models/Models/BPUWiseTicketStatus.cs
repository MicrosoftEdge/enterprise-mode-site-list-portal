using System.Collections.Generic;
namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is an BPUWiseTicketStatus model class, and will hold the values for BPUWiseTicketStatus data
    /// </summary>
    public class BPUWiseTicketStatus
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        /// 
        #region Public Properties
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        ///       

        //Gets and sets ticke Status property
        public string Status { get; set; }

        //Gets and sets BPU Name property
        public List<string> BPUname { get; set; }

        //Gets and sets Count ticket status wise  name property
        public List<int> StatusCount { get; set; }
        #endregion
    }

    /// <summary>
    /// This is an TopLevelData model class, and will hold the values for TopLevelData data
    /// </summary>
    public class ChartTopLevelData
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        /// 
        #region Public Properties      

       

        //Gets and sets list of BPUs property
        public List<string> BPUs { get; set; }

        //Gets and sets object of BPUWiseTicketStatus class
        public List<BPUWiseTicketStatus> chartData { get; set; }

       
        #endregion
    }

}