
namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is an applications model class, and will hold the values for application data
    /// </summary>
    public class Applications
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

        //Gets and sets ApplicationName property
        public string ApplicationName { get; set; }

        //Gets and sets AppId property
        public int AppId { get; set; }

        //Gets and sets BPU name property
        public string BPU { get; set; }

        //Gets and sets BPUId property
        public int BPUId { get; set; }

        //Gets and sets user property
        public Users User { get; set; }

        //Gets and sets ProjectCategoryProperty
        public ProjectCategory ProjectCategory { get; set; }

        //Gets and sets ApplicationState Property
        public ApplicationState ApplicationState { get; set; }

        #endregion
    }
    public class ProjectCategory
    {
        //get and sets Project CategoryId
        public int ProjectCategoryId { get; set; }

        //gets and sets ProjectCategoryName
        public string CategoryName { get; set; }
    }
    public class ApplicationState
    {
        //Gets and sets ApplicationStateId property
        public int ApplicationStateId { get; set; }

        //Gets and sets ApplicationState1 property
        public string ApplicationState1 { get; set; }
    }
}