
using EMIEWebPortal.Models;
using System.Collections.Generic;
using System.Net.Mail;

namespace EMIEWebPortal.Controllers
{
    /// <summary>
    /// This static class will contain all common functions to be used at all places in applications
    /// </summary>
    public static class CommonFunctions
    {
        /// <summary>
        /// Method to send mails after any user action on ticket
        /// </summary>
        /// <param name="ticket">ticket object on which user has taken some action</param>
        /// <param name="mailType">Mail type to be send</param>
        public static void SendMail(Tickets ticket, MailMessageType mailType, List<Attachment> attachments = null,
            Users user = null, Users userBeforeEdit = null, Applications application = null, Configuration configurationSettings = null, List<Users> usersToSendMail = null)
        {
            //Mail object which will hold Mail type and ticket object
            Mail mail = new Mail();

            //Assign mailtype and ticket object
            mail.MailType = mailType;
            mail.ticket = ticket;
            mail.attachments = attachments;

            mail.user = user;
            mail.userBeforeEdit = userBeforeEdit;
            mail.application = application;
            mail.configurationSettings = configurationSettings;
            mail.otherUsersToReceiveMail = usersToSendMail;

            //get login url from configuration settings
            string LoginUrl = GetValueLFromConfigSettings(ConfigConstants.SiteDomainName);
            mail.LoginURL = LoginUrl;
            mail.UserNameOfEmailAccount = GetValueLFromConfigSettings(ConfigConstants.EmailUserName);
            mail.UserPasswordOfEmailAccount = GetValueLFromConfigSettings(ConfigConstants.EmailPassword);
            //Call send mail from mail controller
            using (MailController mailController = new MailController())
            {
                mailController.SendMail(mail);
            }
        }

        /// <summary>
        /// get values from config setting files by key
        /// </summary>
        /// <param name="Key"></param>
        /// <returns></returns>
        private static string GetValueLFromConfigSettings(string Key)
        {
            ConfigurationController config = new ConfigurationController();
            Configuration configdata = null;
            if (LoginController.config == null)
            {
                configdata = config.GetConfiguration();
            }
            else
            {
                configdata = LoginController.config;
            }
            if (configdata != null)
            {
                var configkey= configdata.ConfigSettings.Find(x => x.key.Equals(Key));
                if (configkey != null)
                {
                    string loginURL = configdata.ConfigSettings.Find(x => x.key.Equals(Key)).value.ToString();
                    return loginURL;
                }
                else
                    return null;
            }
            else
                return null;
        }     
    }
}