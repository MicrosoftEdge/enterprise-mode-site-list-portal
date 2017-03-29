namespace EMIEWebPortal.Models
{
    /// <summary>
    /// Class for Active Directory users
    /// </summary>
    public class ADUsers
    {
        public string Email { get; set; }

        public string UserName { get; set; }

        public string DisplayName { get; set; }

        public bool IsMapped { get; set; }
    }
}