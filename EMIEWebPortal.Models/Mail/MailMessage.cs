using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EMIEWebPortal.Models
{
    /// <summary>
    /// This is Mail class which will club all mailing related data to be sent to Mailer library
    /// </summary>
    public class Mail
    {       
        /// <summary>
        /// Enum for different mail types
        /// </summary>
        public MailMessageType MailType;

        /// <summary>
        /// Ticket object for which mail is to be sent
        /// </summary>
        public Tickets ticket;

        /// <summary>
        /// User object for which mail is to be sent
        /// </summary>
        public Users user;

        /// <summary>
        /// Old User object in case of Edit user for which mail is to be sent
        /// </summary>
        public Users userBeforeEdit;

        /// <summary>
        /// Application object for which mail is to be sent
        /// </summary>
        public Applications application;
      
        /// <summary>
        /// Attachements to mail
        /// </summary>
        public List<System.Net.Mail.Attachment> attachments;

        /// <summary>
        /// Confirguration object for which mail is to be sent
        /// </summary>
        public Configuration configurationSettings;

        /// <summary>
        /// Other Users To which mail is to be send
        /// </summary>
        public List<Users> otherUsersToReceiveMail;

        /// <summary>
        /// Login URL to login hyperlink
        /// </summary>
        public string LoginURL;

        /// <summary>
        /// UserName of mail account
        /// </summary>
        public string UserNameOfEmailAccount;

        /// <summary>
        /// Password of email account
        /// </summary>
        public string UserPasswordOfEmailAccount;


    }
}
