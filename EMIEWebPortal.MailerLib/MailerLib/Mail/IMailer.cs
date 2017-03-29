namespace MailerLib
{
    // Interface for mailer functionality
    public interface IMailer 
    {
        /// <summary>
        /// Send mails on different user actions taken in EMIE portal
        /// </summary>
        /// <param name="mail">Mail object will hold data to be sent in mail</param>
        /// <param name="templatePath">mail template path</param>
        void SendMails(dynamic mail, string templatePath);        
    }
}
