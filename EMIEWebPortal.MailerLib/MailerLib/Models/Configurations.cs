namespace MailerLib
{
    using System.Configuration;

    /// <summary>
    /// Configuration class for providing different config parameter for mails and  mail server
    /// </summary>
    public class Configurations
    {
        /// <summary>
        /// Parameterized constructor to assign templatepath
        /// </summary>
        /// <param name="templatesPath">mail template path</param>
        public Configurations(string templatesPath)
        {
            //Assign to property
            TemplatePath = templatesPath;
        }

        /// <summary>
        /// Keys - values to be set in web.config file
        /// </summary>
        private struct Keys
        {
            public static string Interval = "interval";
            public static string Host = "host";
            public static string Port = "port";
            public static string Username = "username";
            public static string Password = "password";
            public static string IsSsl = "isSsl";
            public static string FromEmail = "from";
            public static string HtmlMail = "HtmlMail";

            public static string TemplatesFolder = "TemplatesFolder";
            public static string RequesterRaisedRequest = "RequesterRaisedRequest";
            public static string RequestSentForApproval = "RequestApproval";
            public static string RequestApproved = "RequestApproval";
            public static string RequestRejected = "RequestRejected";
            public static string RequestDelegated = "RequestApproval";
            public static string RequestRollbackOnSandBox = "RequestRollbackOnSandBox";
            public static string RequestRollbackOnProduction = "RequestRollbackOnSandBox";
            public static string SignOff = "RequestApproval";
            public static string SendReminder = "RequestApproval";
            public static string ContactSupportTeam = "RequestRollbackOnSandBox";

            public static string RequestScheduledForProduction = "RequestScheduledForProduction";
            public static string ProductionChangesDoneThroughScheduler = "RequestScheduledForProduction";

            public static string RequestFailedOnTestMachine = "RequestRollbackOnSandBox";
            public static string RequestFailedOnProdMachine = "RequestRejected";

            public static string UserEdited = "UserManagement";
            public static string UserActivated = "UserManagement";
            public static string UserDeactivated = "UserManagement";
            public static string UserAdded = "UserManagement";
            public static string UserRegistrationRequested = "UserManagement";
            public static string UserRegistered = "UserManagement";

            public static string ConfigurationSettingsEdited = "ConfigurationSettings";
            public static string ProductionChangesFreezeScheduleEdited = "ProductionChangesFreezeScheduleEdited";
            public static string ApplicationAdded = "ApplicationAdded";
        }

        /// <summary>
        /// Get-Set Template path property of web site (App_Data folder of Web site)
        /// </summary>
        private string _TemplatePath = null;

        public string TemplatePath
        {
            get
            {
                return _TemplatePath;
            }

            set
            {
                _TemplatePath = value;
            }
        }

        /// <summary>
        /// Get-Set RequesterRaisedRequest mail template property 
        /// </summary>
        private string _RequesterRaisedRequest = null;

        public string RequesterRaisedRequest
        {
            get
            {
                if (_RequesterRaisedRequest == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequesterRaisedRequest);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequesterRaisedRequest = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequesterRaisedRequest;
            }
        }

        /// <summary>
        /// Get-Set RequestSentForApproval mail template property 
        /// </summary>
        private string _RequestSentForApproval = null;

        public string RequestSentForApproval
        {
            get
            {
                if (_RequestSentForApproval == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestSentForApproval);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestSentForApproval = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestSentForApproval;
            }
        }

        /// <summary>
        /// Get-Set RequestApproved mail template property 
        /// </summary>
        private string _RequestApproved = null;

        public string RequestApproved
        {
            get
            {
                if (_RequestApproved == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestApproved);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestApproved = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestApproved;
            }
        }

        /// <summary>
        /// Get-Set RequestScheduledForProduction mail template property 
        /// </summary>
        private string _RequestScheduledForProduction = null;

        public string RequestScheduledForProduction
        {
            get
            {
                if (_RequestScheduledForProduction == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestScheduledForProduction);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestScheduledForProduction = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestScheduledForProduction;
            }
        }

        /// <summary>
        /// Get-Set ProductionChangesDoneThroughScheduler mail template property 
        /// </summary>
        private string _ProductionChangesDoneThroughScheduler = null;

        public string ProductionChangesDoneThroughScheduler
        {
            get
            {
                if (_ProductionChangesDoneThroughScheduler == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.ProductionChangesDoneThroughScheduler);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _ProductionChangesDoneThroughScheduler = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _ProductionChangesDoneThroughScheduler;
            }
        }

        /// <summary>
        /// Get-Set RequestSentForApproval mail template property 
        /// </summary>
        private string _SendReminder = null;

        public string SendReminder
        {
            get
            {
                if (_SendReminder == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.SendReminder);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _SendReminder = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _SendReminder;
            }
        }

        private string _RequestRejected = null;

        public string RequestRejected
        {
            get
            {
                if (_RequestRejected == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestRejected);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestRejected = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestRejected;
            }
        }

        private string _RequestDelegated = null;

        public string RequestDelegated
        {
            get
            {
                if (_RequestDelegated == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestDelegated);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestDelegated = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestDelegated;
            }
        }

        private string _RequestFailedOnTestMachine = null;

        public string RequestFailedOnTestMachine
        {
            get
            {
                if (_RequestFailedOnTestMachine == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestFailedOnTestMachine);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestFailedOnTestMachine = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestFailedOnTestMachine;
            }
        }

        private string _RequestFailedOnProdMachine = null;

        public string RequestFailedOnProdMachine
        {
            get
            {
                if (_RequestFailedOnProdMachine == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestFailedOnProdMachine);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestFailedOnProdMachine = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestFailedOnProdMachine;
            }
        }
        
        private string _RequestRollbackOnSandBox = null;

        public string RequestRollbackOnSandBox
        {
            get
            {
                if (_RequestRollbackOnSandBox == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestRollbackOnSandBox);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestRollbackOnSandBox = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestRollbackOnSandBox;
            }
        }

        private string _RequestRollbackOnProduction = null;

        public string RequestRollbackOnProduction
        {
            get
            {
                if (_RequestRollbackOnProduction == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.RequestRollbackOnProduction);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _RequestRollbackOnProduction = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _RequestRollbackOnProduction;
            }
        }

        private string _SignOff = null;

        public string SignOff
        {
            get
            {
                if (_SignOff == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.SignOff);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _SignOff = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _SignOff;
            }
        }

        private string _UserEdited = null;

        public string UserEdited
        {
            get
            {
                if (_UserEdited == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.UserEdited);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _UserEdited = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _UserEdited;
            }
        }

        private string _UserActivated = null;

        public string UserActivated
        {
            get
            {
                if (_UserActivated == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.UserActivated);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _UserActivated = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _UserActivated;
            }
        }

        private string _UserDeactivated = null;

        public string UserDeactivated
        {
            get
            {
                if (_UserDeactivated == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.UserDeactivated);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _UserDeactivated = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _UserDeactivated;
            }
        }

        private string _UserAdded = null;

        public string UserAdded
        {
            get
            {
                if (_UserAdded == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.UserAdded);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _UserAdded = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _UserAdded;
            }
        }

        private string _UserRegistrationRequested = null;

        public string UserRegistrationRequested
        {
            get
            {
                if (_UserRegistrationRequested == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.UserRegistrationRequested);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _UserRegistrationRequested = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _UserRegistrationRequested;
            }
        }

        private string _UserRegistered = null;

        public string UserRegistered
        {
            get
            {
                if (_UserRegistered == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.UserRegistered);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _UserRegistered = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _UserRegistered;
            }
        }

        private string _ProductionChangesFreezeScheduleEdited = null;

        public string ProductionChangesFreezeScheduleEdited
        {
            get
            {
                if (_ProductionChangesFreezeScheduleEdited == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.ProductionChangesFreezeScheduleEdited);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _ProductionChangesFreezeScheduleEdited = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _ProductionChangesFreezeScheduleEdited;
            }
        }

        private string _ApplicationAdded = null;

        public string ApplicationAdded
        {
            get
            {
                if (_ApplicationAdded == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.ApplicationAdded);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _ApplicationAdded = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _ApplicationAdded;
            }
        }

        private string _ConfigurationSettingsEdited = null;

        public string ConfigurationSettingsEdited
        {
            get
            {
                if (_ConfigurationSettingsEdited == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.ConfigurationSettingsEdited);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _ConfigurationSettingsEdited = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _ConfigurationSettingsEdited;
            }
        }

        /// <summary>
        /// Get-Set TemplatesFolder property of mail templates in App_data folder of web site
        /// </summary>
        private string _TemplatesFolder = null;

        public string TemplatesFolder
        {
            get
            {
                if (_TemplatesFolder == null)
                {
                    _TemplatesFolder = Configurations.GetSetting(Configurations.Keys.TemplatesFolder);

                    if (!_TemplatesFolder.EndsWith("\\"))
                    {
                        _TemplatesFolder += "\\";
                    }
                }

                return _TemplatesFolder;
            }
        }

        /// <summary>
        /// Get-Set Interval property of SMTP mail server
        /// </summary>
        private double? _interval = null;

        public double Interval
        {
            get
            {
                if (!_interval.HasValue)
                {
                    string strInterval = GetSetting(Keys.Interval);
                    double dInterval;
                    double.TryParse(strInterval, out dInterval);

                    _interval = dInterval;
                }

                return _interval.Value;
            }
        }

        /// <summary>
        /// Get-Set Host address property of SMTP mail server
        /// </summary>
        private string _host = null;

        public string Host
        {
            get
            {
                if (_host == null)
                {
                    _host = GetSetting(Keys.Host);
                }

                return _host;
            }
        }

        /// <summary>
        /// Get-Set port property of SMTP mail server
        /// </summary>
        private int? _port = null;

        public int Port
        {
            get
            {
                if (!_port.HasValue)
                {
                    string strPort = GetSetting(Keys.Port);

                    int iPort;
                    int.TryParse(strPort, out iPort);
                    _port = iPort;
                }

                return _port.Value;
            }
        }

        /// <summary>
        /// Get-Set UserName property of mail 'from' address
        /// </summary>
        private string _username = null;

        public string Username
        {
            get
            {
                if (_username == null)
                {
                    _username = GetSetting(Keys.Username);
                }

                return _username;
            }
        }

        /// <summary>
        /// Get-Set Password property of mail 'from' address
        /// </summary>
        private string _password = null;

        public string Password
        {
            get
            {
                if (_password == null)
                {
                    _password = GetSetting(Keys.Password);
                }

                return _password;
            }
        }

        /// <summary>
        /// Get-Set SSL property of smtp server
        /// </summary>
        private bool? _isSsl = null;

        public bool Ssl
        {
            get
            {
                if (!_isSsl.HasValue)
                {
                    string strSsl = GetSetting(Keys.IsSsl);

                    bool bSsl;
                    bool.TryParse(strSsl, out bSsl);
                    _isSsl = bSsl;
                }

                return _isSsl.Value;
            }
        }

        private string _fromEmail = null;

        public string FromEmail
        {
            get
            {
                if (_fromEmail == null)
                {
                    _fromEmail = GetSetting(Keys.FromEmail);
                }

                return _fromEmail;
            }
        }

        private bool? _HtmlMail = null;

        public bool HtmlMail
        {
            get
            {
                if (!_HtmlMail.HasValue)
                {
                    string strHtmlMail = GetSetting(Configurations.Keys.HtmlMail);
                    _HtmlMail = bool.Parse(strHtmlMail);
                }

                return _HtmlMail.Value;
            }
        }

        /// <summary>
        /// Get-Set Contact Support  mail template property 
        /// </summary>
        private string _ContactSupportTeam = null;

        public string ContactSupportTeam
        {
            get
            {
                if (_ContactSupportTeam == null)
                {
                    string _templateFileName = Configurations.GetSetting(Configurations.Keys.ContactSupportTeam);
                    string _templateFileAbsolutePath = TemplatePath + TemplatesFolder + _templateFileName;
                    _ContactSupportTeam = System.IO.File.ReadAllText(_templateFileAbsolutePath);
                }

                return _ContactSupportTeam;
            }
        }

        /// <summary>
        /// Get setting from config file
        /// </summary>
        /// <param name="key">key for which value is to be get</param>
        /// <returns>value of key in config file</returns>
        private static string GetSetting(string key)
        {
            return ConfigurationManager.AppSettings[key];
        }
    }
}
