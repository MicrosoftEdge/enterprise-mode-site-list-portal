namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is a UserLoginRole class, and will hold the information about user and role of user
    /// </summary>
    public class UserLogOnRole
    {
        /// <summary>
        /// This region will contain all the public properties
        /// </summary>
        #region Public Properties

        // Get-Set Valid User value
        public bool ValidUser { get; set; }

        // Get-Set User Role value
        public string UserRole { get; set; } 

        #endregion
    }
}