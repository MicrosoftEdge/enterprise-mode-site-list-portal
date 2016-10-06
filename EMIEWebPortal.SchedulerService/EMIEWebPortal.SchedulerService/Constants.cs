using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMIESchedulerWindowsService
{
    public static class Constants
    {
        //This region contains all the public constants
        #region Public Constants

        /// <summary>
        /// This is the constant for log file of the service
        /// </summary>              
        public const string FileName = "\\Logs\\EMIESchedulerLog.txt";

        /// <summary>
        /// This is the constant for time interval between multiple runs of scheduler
        /// </summary>
        public const string SchedulerWaitTimeInMinutes = "SchedulerWaitTimeInMinutes";

        #endregion Public Constants

    }
}
