using MailerLib;
using System;
using System.IO;
using System.Reflection;
using System.Web.Mvc;

namespace EMIEWebPortal.Controllers
{
   /// <summary>
    /// Mail controller will handle all mail related changes in system
    /// </summary>
    public class MailController : Controller
    {
        /// <summary>
        /// This region will contain all the public methods
        /// </summary>
        /// 
        #region Public Methods

        #region Send Mail
        /// <summary>
        /// This service function create new change request
        /// </summary>
        /// <returns>Ticket data class</returns>    
       
        public void SendMail(dynamic mail)
        {
            try
            {
                string templatesPath = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/");
                if (templatesPath == null)
                {                   
                    string path = AppDomain.CurrentDomain.BaseDirectory;
                    templatesPath = path.Substring(0, path.Length - 11) + "\\App_Data\\";                   
                }                 
                Mailer mailer = new Mailer();               
                mailer.SendMails(mail, templatesPath);
            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion Send Mail

        #endregion Public Methods      
    }
    
}

