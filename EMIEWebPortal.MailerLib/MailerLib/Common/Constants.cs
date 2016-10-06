namespace MailerLib
{
    /// <summary>
    /// This class contains all the constant variables that will be used in the application.  
    /// </summary>
    public static class Constants
    {
        //This region contains all the public constants
        #region Public Constants

        /// <summary>
        /// This is the constant for showing message in Mail for ticket initiated but not sent for approval
        /// </summary>
        ///Currently commented -If used in future will uncomment it
        //public const string NoApproverSelected = "Yet not sent for approval";

        /// <summary>
        /// This is the constant for mail type
        /// </summary>
        public const string MailType = "MailType";

        /// <summary>
        /// This is the constant for date time format to be shown in Mail
        /// </summary>
        public const string DateTimeFormat = "{0:d/M/yyyy HH:mm:ss}";        


        /// <summary>
        /// This is the constant for approver row created at run time in Mail
        /// </summary>
        public const string ApproverRowHTML = "<tr style=\"height:35px;\"><td style=\"font-family:\'Segoe UI Symbol\';font-size:medium;color:#505050;padding-left:50px\">";

        /// <summary>
        /// This is the constant for approver row created at run time in Mail
        /// </summary>
        public const string ApproverRowHTML1 = "</td><td style=\"font-family:\'Segoe UI Symbol\';font-size:medium;color:#505050;\">";

        /// <summary>
        /// This is the constant for approver row created at run time in Mail
        /// </summary>
        public const string ApproverRowHTML2 = "</td></tr>";

        /// <summary>
        /// This is the constant for EMIE Champion Group string in Mail
        /// </summary>
        public const string EMIEChampGroup="EMIE Champion Group";

        #endregion Public Constants

    }
}