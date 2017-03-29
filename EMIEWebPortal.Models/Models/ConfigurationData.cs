namespace EMIEWebPortal.Models
{
    /// <summary>
    /// Model class that will hold one key value pair of configuration items from list of such config items.
    /// </summary>
    public class ConfigurationData
    {
        /// <summary>
        /// Configuration item key value e.g. SandboxEnvironment
        /// </summary>
        public string key { get; set; }

        /// <summary>
        /// Value of that configuration item e.g. XML path for SandboxEnvironment key
        /// </summary>
        public object value { get; set; }
    }
}
