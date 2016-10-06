using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMIEWebPortal.Models
{
    /// <summary>
    /// Model class that will hold one key value pair of configutaion item from list of such config items.
    /// </summary>
    public class ConfigurationData
    {
        /// <summary>
        /// Configuration item key value e.g. SandboxEnvironment
        /// </summary>
        public string key { get; set; }

        /// <summary>
        /// Value of that configuration item e.g. XMl path for SandboxEnvironment key
        /// </summary>
        public object value { get; set; }
    }
}
