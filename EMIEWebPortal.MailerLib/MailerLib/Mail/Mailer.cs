using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Linq;

namespace MailerLib
{
    /// <summary>
    /// This is Mailer class which takes care of all mails related to ticket management
    /// </summary>
    public class Mailer : IMailer
    {
        #region Private Variable

        /// Configuration object to fetch config settings        
        private Configurations config = null;

        #endregion Private Variable

        #region constructor
        /// <summary>
        /// constructor 
        /// </summary>     
        /// 
        public Mailer() { }
        #endregion constructor

        #region Send mail
        /// <summary>
        /// Method to get templates of mail depending on mail type and send mail
        /// </summary>
        /// <param name="mail">Mail object which will hold mail type and ticket details and attachments</param>
        /// <param name="templatePath">templates path in AppData folder of website</param>
        public void SendMails(dynamic mail, string templatePath)
        {
            try
            {
                #region intialize and get MailMessage

                // Initialize config object
                config = new Configurations(templatePath);

                //Get mail message objects
                MailMessage mailMessage = new MailMessage();
                string subject;

                //Get message body
                string message = GetMailBody(mail, out subject);

                //Assign subject, body etc
                mailMessage.Subject = subject;
                mailMessage.Body = message;
                mailMessage.IsBodyHtml = config.HtmlMail;

                #endregion intialize and get MailMessage

                #region Get mail 'To'

                //Get mail type
                MailMessageType mailType = (MailMessageType)mail.MailType;
                //Get 'To' for mails depending on mail type
                switch (mailType)
                {
                    //When changes request is initiated 
                    case MailMessageType.RequesterRaisedRequest:

                    //When change request is RollBack
                    case MailMessageType.RequestRollbackOnSandBox:

                    //When changes request is Failed On TestMachine
                    case MailMessageType.RequestFailedOnTestMachine:
                        mailMessage.To.Add(mail.ticket.RequestedBy.Email);
                        break;

                    //When change request is sent for approval
                    case MailMessageType.RequestSentForApproval:

                    //When change request is approved
                    case MailMessageType.RequestApproved:

                    //When change request is Rejected
                    case MailMessageType.RequestRejected:

                    //When change request is Delegated
                    case MailMessageType.RequestDelegated:

                    //When change request is RollBack
                    case MailMessageType.RequestRollbackOnProduction:

                    //When change request is SignOff
                    case MailMessageType.SignOff:

                    //Send Reminder for Approval
                    case MailMessageType.SendReminder:

                    //When change request is RollBack
                    case MailMessageType.RequestFailedOnProdMachine:

                    //When Production changes are scheduled
                    case MailMessageType.RequestScheduledForProduction:

                    //When Production changes done through scheduler
                    case MailMessageType.ProductionChangesDoneThroughScheduler:
                        mailMessage.To.Add(mail.ticket.RequestedBy.Email);
                        foreach (var approval in mail.ticket.Approvals)
                            mailMessage.To.Add(approval.Approver.Email);
                        break;

                    //Need this comment

                    //When Production Changes Freeze Schedule Edited
                    //case MailMessageType.ProductionChangesFreezeScheduleEdited:
                    ////When Application Added
                    //case MailMessageType.ApplicationAdded:

                    //When User registration is done
                    case MailMessageType.UserRegistered:

                    //When User requested for registration
                    case MailMessageType.RegistrationRequested:
                        if (mail.otherUsersToReceiveMail != null)
                        {
                            for (int index = 0; index < mail.otherUsersToReceiveMail.Count; index++)
                            {
                                string email = mail.otherUsersToReceiveMail[index].Email;
                                mailMessage.To.Add(email);
                            }
                        }
                        break;
                    //When User is Edited
                    case MailMessageType.UserEdited:

                    //When User is Activated
                    case MailMessageType.UserActivated:

                    //When User is Deleted
                    case MailMessageType.UserDeactivated:

                    //When User is Added
                    case MailMessageType.UserAdded:
                        mailMessage.To.Add(mail.user.Email);
                        mailMessage.To.Add(mail.user.CreatedByUser.Email);
                        if (mail.otherUsersToReceiveMail != null)
                        {
                            for (int index = 0; index < mail.otherUsersToReceiveMail.Count; index++)
                            {
                                string email = mail.otherUsersToReceiveMail[index].Email;
                                mailMessage.To.Add(email);
                            }
                        }
                        break;

                    //When Configuration Settings Edited
                    case MailMessageType.ConfigurationSettingsEdited:
                        if (mail.otherUsersToReceiveMail != null)
                        {
                            for (int index = 0; index < mail.otherUsersToReceiveMail.Count; index++)
                            {
                                string email = mail.otherUsersToReceiveMail[index].Email;
                                mailMessage.To.Add(email);
                                //Need this comment
                                //foreach (Users user in mail.otherUsersToReceiveMail)
                                //    mailMessage.To.Add(user.Email);
                            }
                        }
                        break;

                    //when contacted support team
                    case MailMessageType.ContactSupportTeam:
                        mailMessage.To.Add(mail.ticket.ContactSupportEmail);
                        mailMessage.To.Add(mail.ticket.RequestedBy.Email);
                        break;

                    //When none of above mail type is found then throw error
                    default:
                        throw new InvalidEnumArgumentException(Constants.MailType);
                }
                #endregion  Get mail 'To'

                //Need this comment
                //MailAddressCollection addressCollection=RemoveDuplicateAddresses(mailMessage.To);
                //mailMessage.To.Clear();
                //foreach (MailAddress address in addressCollection)
                //{
                //    mailMessage.To.Add(address);
                //}
                // addressCollection;

                #region Attachments

                List<Attachment> attachments = null;
                if (mail.attachments != null)
                {
                    //Get mail attachment list from mail object
                    attachments = (List<Attachment>)mail.attachments;

                    //If attachments exists
                    if (attachments != null && attachments.Count > 0)
                    {
                        //Attach attachment files to mail
                        foreach (Attachment att in attachments)
                            mailMessage.Attachments.Add(att);
                    }
                }
                #endregion Attachments

                #region Send mail
                try
                {
                    //Send mail
                    SendMail(mailMessage, mail);
                }
                #region Catch different types of exceptions
                catch (ObjectDisposedException ex)
                {
                    Log("Error: Object Disposed [" + ex.Message + Environment.NewLine + ex.StackTrace + "]");
                }
                catch (ArgumentNullException ex)
                {
                    Log("Error: Argument NULL [" + ex.Message + Environment.NewLine + ex.StackTrace + "]");
                }
                catch (InvalidOperationException ex)
                {
                    Log("Error: Invalid Operation [" + ex.Message + Environment.NewLine + ex.StackTrace + "]");
                }
                catch (SmtpFailedRecipientsException ex)
                {
                    Log("Error: Failed Receipents [" + ex.Message + Environment.NewLine + ex.StackTrace + "]");
                }
                catch (SmtpException ex)
                {
                    Log("Error: SMTP Problem [" + ex.Message + Environment.NewLine + ex.StackTrace + "]");
                }
                catch (Exception ex)
                {
                    Log("Unknown Error [" + ex.Message + Environment.NewLine + ex.StackTrace + "]");
                }
                #endregion
                #endregion send mail
            }
            catch (Exception ex)
            {
                Log("Unknown Error [" + ex.Message + Environment.NewLine + ex.StackTrace + "]");
            }
        }

        //This can be used in future
        //private MailAddressCollection RemoveDuplicateAddresses(MailAddressCollection mailAddressCollection)
        //{
        //    throw new NotImplementedException();
        //}

        /// <summary>
        /// Method to get mail template based on mail type tobe sent.
        /// Also it will fetch ticket details to be send with mail
        /// </summary>
        /// <param name="mail">Mail object- mail type and Ticket details</param>
        /// <param name="subject">get and send back mail subject from template</param>
        /// <returns>MAil body</returns>
        private string GetMailBody(dynamic mail, out string subject)
        {
            try
            {
                //Mail template
                string template = null;
                //ticket data to be assigned in template
                List<string> data = new List<string>();

                //Type of mail to be sent 
                MailMessageType mailType = (MailMessageType)mail.MailType;

                //take template based on mail type
                switch (mailType)
                {
                    //When Changes request is initiated
                    case MailMessageType.RequesterRaisedRequest:
                        template = GetDataIntoTemplate(config.RequesterRaisedRequest, mail, ref data);
                        break;
                    //When Changes request Failed On TestMachine
                    case MailMessageType.RequestFailedOnTestMachine:
                        data.Add("REQUEST VERIFICATION FAILED ON SANDBOX");
                        template = GetDataIntoTemplate(config.RequestFailedOnTestMachine, mail, ref data);
                        break;

                    //When Changes request Failed On Production
                    case MailMessageType.RequestFailedOnProdMachine:
                        data.Add("REQUEST VERIFICATION FAILED ON PRODUCTION");
                        template = GetDataIntoTemplate(config.RequestFailedOnProdMachine, mail, ref data);
                        break;

                    //When Changes request RollBack On TestMachine
                    case MailMessageType.RequestRollbackOnSandBox:
                        data.Add("REQUEST ROLLBACK ON SANDBOX");
                        template = GetDataIntoTemplate(config.RequestRollbackOnSandBox, mail, ref data);
                        break;

                    //When Changes request Rollback On Production
                    case MailMessageType.RequestRollbackOnProduction:
                        data.Add("REQUEST ROLLBACK ON PRODUCTION");
                        template = GetDataIntoTemplate(config.RequestRollbackOnProduction, mail, ref data);
                        break;

                    //When Changes request is sent for approval
                    case MailMessageType.RequestSentForApproval:
                        data.Add("#FF8C00");
                        data.Add("AWAITING APPROVAL");
                        template = GetDataIntoTemplate(config.RequestSentForApproval, mail, ref data);
                        break;
                    //When Changes request is approved by any approver
                    case MailMessageType.RequestApproved:
                        data.Add("#107C10");
                        data.Add("REQUEST APPROVED");
                        template = GetDataIntoTemplate(config.RequestApproved, mail, ref data);
                        break;
                    //When change request is Rejected
                    case MailMessageType.RequestRejected:
                        data.Add("REQUEST REJECTED");
                        template = GetDataIntoTemplate(config.RequestRejected, mail, ref data);
                        break;

                    //When change request is Delegated
                    case MailMessageType.RequestDelegated:
                        data.Add("REQUEST DELEGATED FOR TICKET");
                        template = GetDataIntoTemplate(config.RequestDelegated, mail, ref data);
                        break;

                    //When change request is SignOff
                    case MailMessageType.SignOff:
                        data.Add("#004B1C");
                        data.Add("REQUEST SIGNED-OFF");
                        template = GetDataIntoTemplate(config.SignOff, mail, ref data);
                        break;

                    //When Changes request is production changes are done through scheduler
                    case MailMessageType.ProductionChangesDoneThroughScheduler:

                        data.Add("PRODUCTION CHANGES DONE THROUGH SCHEDULER");
                        template = GetDataIntoTemplate(config.ProductionChangesDoneThroughScheduler, mail, ref data);
                        break;
                    //When Changes request is scheduled for production
                    case MailMessageType.RequestScheduledForProduction:
                        data.Add("REQUEST SCHEDULED FOR PRODUCTION CHANGES");
                        template = GetDataIntoTemplate(config.RequestScheduledForProduction, mail, ref data);
                        break;
                    //When User is Edited
                    case MailMessageType.UserEdited:
                        data.Add("USER INFORMATION EDITED SUCCESSFULLY");
                        // User requested for Registration on EMIE SSP
                        template = GetUserDataIntoTemplate(config.UserEdited, mail, ref data);

                        break;

                    //When user registration is done
                    case MailMessageType.UserRegistered:
                        data.Add("USER REGISTERATION");
                        template = GetUserDataIntoTemplate(config.UserRegistered, mail, ref data);

                        break;


                    //When user requested registration
                    case MailMessageType.RegistrationRequested:
                        data.Add("USER REGISTRATION");
                        template = GetUserDataIntoTemplate(config.UserRegistrationRequested, mail, ref data);

                        break;

                    //When User is Activated
                    case MailMessageType.UserActivated:
                        data.Add("USER ACTIVATION");
                        template = GetUserDataIntoTemplate(config.UserActivated, mail, ref data);

                        break;

                    //When User is Deleted
                    case MailMessageType.UserDeactivated:
                        data.Add("USER DEACTIVATION");
                        template = GetUserDataIntoTemplate(config.UserDeactivated, mail, ref data);

                        break;

                    //When New User Added
                    case MailMessageType.UserAdded:
                        data.Add("USER ACTIVATION");
                        template = GetUserDataIntoTemplate(config.UserAdded, mail, ref data);

                        break;

                    //When Reminder for changes request approval is sent to approvers
                    case MailMessageType.SendReminder:
                        data.Add("#FF8C00");
                        data.Add("AWAITING APPROVAL");
                        template = GetDataIntoTemplate(config.SendReminder, mail, ref data);
                        break;

                    //When Configuration Settings Edited is done
                    case MailMessageType.ConfigurationSettingsEdited:
                        template = GetConfigurationDataIntoTemplate(config.ConfigurationSettingsEdited, mail, ref data);

                        break;

                    case MailMessageType.ContactSupportTeam:
                        data.Add("Ticket Information");
                        template = GetDataIntoTemplate(config.ContactSupportTeam, mail, ref data);
                        break;
                    //If none of above mail type found  
                    default:
                        throw new InvalidEnumArgumentException(Constants.MailType);
                }

                //Get mail subject                
                subject = mailType.GetDescription();

                //Return mail body
                return template;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Method to get Configuration template data from config object
        /// </summary>
        /// <param name="configTemplate">configutaion mail template</param>
        /// <param name="mail"></param>
        /// <param name="data"></param>
        /// <param name="formatTemplate"></param>
        /// <returns></returns>
        private string GetConfigurationDataIntoTemplate(string configTemplate, dynamic mail, ref List<string> data, bool formatTemplate = true)
        {
            try
            {
                // List<string> data = new List<string>();
                //Get template
                string template = configTemplate;

                //Get approvers data
                GetConfigurationDataForMail(mail, ref data);

                //append siteURl at the end
                data.Add(mail.LoginURL);

                //Format template data
                if (data != null && formatTemplate == true)
                    template = string.Format(template, data.ToArray());

                return template;
            }
            catch { throw; }
        }

        /// <summary>
        /// Method to fetch Configuration data for mail
        /// </summary>
        /// <param name="mail"></param>
        /// <param name="data"></param>
        private void GetConfigurationDataForMail(dynamic mail, ref List<string> data)
        {
            try
            {
                Configuration config = (Configuration)mail.configurationSettings;
                data.Add(config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.SandboxEnvironment).value.ToString());
                data.Add(config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ProductionEnvironment).value.ToString());
                object obj = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.FreezeProductionChangeStartDate).value;
                DateTime freezeStartDate = DateTime.ParseExact(obj.ToString(), "MM/dd/yyyy", null);
                obj = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.FreezeProductionChangeEndDate).value;
                DateTime freezeEndDate = DateTime.ParseExact(obj.ToString(), "MM/dd/yyyy", null);

                if (freezeStartDate.Date != freezeEndDate.Date)
                    data.Add(freezeStartDate.ToString("MM/dd/yyyy") + "-" + freezeEndDate.ToString("MM/dd/yyyy"));
                else
                    data.Add(freezeStartDate.ToString("MM/dd/yyyy"));
                data.Add(config.CreatedBy.UserRole.RoleName + "-" + config.CreatedBy.UserName);

            }
            catch { throw; }
        }

        /// <summary>
        /// Method to get data for mails and sending that in mail template
        /// </summary>
        /// <param name="configTemplate"></param>
        /// <param name="mail"></param>
        /// <param name="data"></param>
        /// <param name="formatTemplate"></param>
        /// <returns></returns>
        private string GetDataIntoTemplate(string configTemplate, dynamic mail, ref List<string> data, bool formatTemplate = true)
        {
            try
            {
                //Get template
                string template = configTemplate;

                //Get approvers data
                GetDataForMail(mail, ref data);

                //append siteURl at the end
                data.Add(mail.LoginURL);
                //Format template data
                if (data != null && formatTemplate == true)
                    template = string.Format(template, data.ToArray());

                return template;
            }
            catch { throw; }
        }


        /// <summary>
        /// Method to get User related dat to be sent with mail
        /// </summary>
        /// <param name="configTemplate"></param>
        /// <param name="mail"></param>
        /// <param name="data"></param>
        /// <param name="formatTemplate"></param>
        /// <returns></returns>
        private string GetUserDataIntoTemplate(string configTemplate, dynamic mail, ref List<string> data, bool formatTemplate = true)
        {
            try
            {
                //Get template
                string template = configTemplate;

                //Get approvers data
                GetUserDataForMail(mail, ref data);


                //append siteURl at the end
                data.Add(mail.LoginURL);
                //Format template data
                if (data != null && formatTemplate == true)
                    template = string.Format(template, data.ToArray());

                return template;
            }
            catch { throw; }
        }

        /// <summary>
        /// Method to get ticket and approver details to be send in mail body  
        /// </summary>
        /// <param name="mail">mail object</param>
        /// <returns>list of data to be send in mail template body</returns>
        private void GetUserDataForMail(dynamic mail, ref List<string> data)
        {
            try
            {
                //Get ticket id and requester's name
                data.Add(mail.user.UserName);
                data.Add(mail.user.Email);
                data.Add(mail.user.UserBPU.BPU1);
                data.Add(mail.user.UserRole.RoleName);
                data.Add((mail.user.IsActive == true) ? "Yes" : "No");

            }
            catch { throw; }

        }


        /// <summary>
        /// Method to get ticket and approver details to be send in mail body  
        /// </summary>
        /// <param name="mail">mail object</param>
        /// <returns>list of data to be send in mail template body</returns>
        private void GetDataForMail(dynamic mail, ref List<string> data)
        {
            try
            {
                //Get ticket id and requester's name
                data.Add(mail.ticket.TicketId.ToString());
                data.Add(mail.ticket.RequestedBy.UserName.ToString());

                //Type of mail to be sent               
                if ((MailMessageType)mail.MailType == MailMessageType.RequesterRaisedRequest ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestSentForApproval ||
                    (MailMessageType)mail.MailType == MailMessageType.SendReminder ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestApproved ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestRejected ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestDelegated ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestRollbackOnSandBox ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestRollbackOnProduction ||
                    (MailMessageType)mail.MailType == MailMessageType.SignOff ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestFailedOnTestMachine ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestScheduledForProduction ||
                    (MailMessageType)mail.MailType == MailMessageType.ProductionChangesDoneThroughScheduler ||
                    (MailMessageType)mail.MailType == MailMessageType.RequestFailedOnProdMachine ||
                       (MailMessageType)mail.MailType == MailMessageType.ContactSupportTeam

                    )
                {
                    data.Add(mail.ticket.Application.BPU);
                    data.Add(mail.ticket.Application.ApplicationName);
                    data.Add(mail.ticket.ChangeType.ChangeTypeName);
                    data.Add(mail.ticket.AppSiteUrl);
                    // if ((MailMessageType)mail.MailType == MailMessageType.RequestSentForApproval || (MailMessageType)mail.MailType == MailMessageType.SendReminder)
                    if ((MailMessageType)mail.MailType != MailMessageType.RequesterRaisedRequest)
                    {
                        string status = Enum.GetName(typeof(TicketStatus), mail.ticket.FinalTicketStatus);
                        data.Add(status);
                    }

                    if ((MailMessageType)mail.MailType == MailMessageType.RequestScheduledForProduction ||
                        (MailMessageType)mail.MailType == MailMessageType.ProductionChangesDoneThroughScheduler)
                    {
                        //Show both start time and end time for production changes in mail
                        DateTime? prodDateTimeStart = mail.ticket.ScheduleDateTimeStart;
                        DateTime? prodDateTimeEnd = mail.ticket.ScheduleDateTimeEnd;
                        string date = string.Empty;
                        date = String.Format(Constants.DateTimeFormat, prodDateTimeStart);
                        if (prodDateTimeStart != prodDateTimeEnd)
                            date = date + "-" + String.Format(Constants.DateTimeFormat, prodDateTimeEnd);
                        data.Add(date);
                    }

                }

                StringBuilder approverString = new StringBuilder();
                //If Approver's exists
                if (mail.ticket.Approvals != null && mail.ticket.Approvals.Count > 0 && (MailMessageType)mail.MailType != MailMessageType.RequestRollbackOnProduction)
                {
                    //check if any of the emie camp has approved the request then get back that approver's object
                    dynamic emieCampApproved = CheckIfAnyEMIECampHasApproved(mail.ticket.Approvals);
                    dynamic emieChampComments = GetEMIEChampGroupApprovalComments(mail.ticket.Approvals);
                    if (emieCampApproved != null)
                    {
                        string ApproverComments = "";
                        if (emieChampComments.ApproverComments != null)
                        {
                            ApproverComments = emieChampComments.ApproverComments.ToString();
                        }
                        string htmlApproverTag = string.Concat(Constants.ApproverRowHTML, emieCampApproved.Approver.UserRole.RoleName, " - ", emieCampApproved.Approver.UserName,
                            Constants.ApproverRowHTML1, emieCampApproved.ApprovalState.ToString(),
                             Constants.ApproverRowHTML1, ApproverComments, Constants.ApproverRowHTML2);
                        approverString.Append(htmlApproverTag);
                    }
                    else if (emieChampComments != null)
                    {
                        string ApproverComments = "";
                        if (emieChampComments.ApproverComments != null)
                        {
                            ApproverComments = emieChampComments.ApproverComments.ToString();
                        }
                        string htmlApproverTag = string.Concat(Constants.ApproverRowHTML, Constants.EMIEChampGroup,
                         Constants.ApproverRowHTML1, "Pending",
                         Constants.ApproverRowHTML1, ApproverComments, Constants.ApproverRowHTML2);
                        approverString.Append(htmlApproverTag);
                    }
                    //Check for other approvers
                    foreach (var approval in mail.ticket.Approvals)
                    {
                        if (approval.Approver.UserRole.RoleId != (int)UserRole.EMIEChampion)
                        {
                            string ApproverComments = "";
                            if (approval.ApproverComments != null)
                            {
                                ApproverComments = approval.ApproverComments.ToString();
                            }
                            string htmlApproverTag = string.Concat(Constants.ApproverRowHTML, approval.Approver.UserRole.RoleName, " - ", approval.Approver.UserName,
                           Constants.ApproverRowHTML1, approval.ApprovalState.ToString(),
                            Constants.ApproverRowHTML1, ApproverComments, Constants.ApproverRowHTML2);
                            approverString.Append(htmlApproverTag);
                        }
                    }
                    data.Add(approverString.ToString());
                }

                if ((MailMessageType)mail.MailType == MailMessageType.RequestFailedOnTestMachine || (MailMessageType)mail.MailType == MailMessageType.RequestRollbackOnSandBox)
                {
                    data.Add("ISSUE DETAILS");
                    data.Add(mail.ticket.SandboxFailureComments);
                }
                if ((MailMessageType)mail.MailType == MailMessageType.RequestRollbackOnProduction)
                {
                    data.Add("ISSUE DETAILS");
                    data.Add(mail.ticket.ProductionFailureComments);
                }
                if ((MailMessageType)mail.MailType == MailMessageType.ContactSupportTeam)
                {
                    data.Add("MESSAGE DETAILS");
                    data.Add(mail.ticket.ProductionSuccessComments);
                }
                if ((MailMessageType)mail.MailType == MailMessageType.RequestRejected)
                {
                    if (mail.ticket.ProductionFailureComments != null)
                    {
                        data.Add("BLOCK");//this is to hide issue detail section from email template
                        data.Add("REASON");
                        data.Add(mail.ticket.ProductionFailureComments);
                    }
                    else
                    {
                        data.Add("NONE");//this is to hide issue detail section from email template
                        data.Add("ISSUE DETAILS");
                        data.Add("");
                    }
                }
                if ((MailMessageType)mail.MailType == MailMessageType.RequestFailedOnProdMachine)
                {
                    data.Add("BLOCK");//this is to unhide issue detail section from email template
                    data.Add("ISSUE DETAILS");
                    data.Add(mail.ticket.ProductionFailureComments);
                }
            }
            catch { throw; }

        }

        /// <summary>
        /// Method to check if any of the emie camp has approved the request then send back that approver's object
        /// </summary>
        /// <param name="Approvals">approver who has approved the request</param>
        /// <returns></returns>
        private dynamic CheckIfAnyEMIECampHasApproved(dynamic Approvals)
        {
            dynamic emieCampApproved = null;
            foreach (var appr in Approvals)
            {
                //If approver is emie camp and has approved the request
                if (appr.Approver.UserRole.RoleId == (int)UserRole.EMIEChampion && (int)appr.ApprovalState != (int)ApprovalState.Pending)
                {
                    emieCampApproved = appr;
                    break;
                }
            }

            return emieCampApproved;
        }

        /// <summary>
        /// Method get emie champ approval comments
        /// </summary>
        /// <param name="Approvals">approver who has approved the request</param>
        /// <returns></returns>
        private dynamic GetEMIEChampGroupApprovalComments(dynamic approvals)
        {
            dynamic emieCampComments = null;
            foreach (var appr in approvals)
            {
                //If approver is emie camp and has approved the request
                if (appr.Approver.UserRole.RoleId == (int)UserRole.EMIEChampion)
                {
                    emieCampComments = appr;
                    break;
                }
            }

            return emieCampComments;
        }
        /// <summary>
        /// Method to send mail using SMTP client
        /// </summary>
        /// <param name="mailMessage">Mail Message to be send</param>
        private async Task<bool> SendMail(MailMessage mailMessage, dynamic mail)
        {
            
                //SMTP client object to send mails
                SmtpClient smtpClient = null;

                //Get Mail client configurations
                if (smtpClient == null)
                    smtpClient = GetSmtpClient(mail);

                //Get from address for mails 
                mailMessage.From = new MailAddress(mail.UserNameOfEmailAccount);
                smtpClient.SendCompleted += new SendCompletedEventHandler(SendCompletedCallback);

                //Send mail
                Object state = mailMessage;

                await Task.Run(() => smtpClient.SendAsync(mailMessage, state));
                return true;
                //smtpClient.SendAsync(mailMessage, state);
            
        }

        /// <summary>
        /// this code used to SmtpClient.SendAsyncCancel Method
        /// </summary>
        // static bool mailSent = false;
        void SendCompletedCallback(object sender, AsyncCompletedEventArgs e)
        {

            MailMessage mail = e.UserState as MailMessage;

            if (!e.Cancelled && e.Error == null)
            {
                Log("Mail sent successfully");
            }
            else
            {
                if (e.Error != null)
                    Log(e.Error.Message);
                else
                    Log("EMIE mail not sent , unknown error");
            }
        }

        /// <summary>
        /// Get SMTP mail client details
        /// </summary>
        /// <returns>smtp client</returns>
        private SmtpClient GetSmtpClient(dynamic mail)
        {
            try
            {

                SmtpClient smtpClient = new SmtpClient();
                smtpClient.Host = config.Host;
                //smtpClient.Port = config.Port;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(mail.UserNameOfEmailAccount, mail.UserPasswordOfEmailAccount);
                smtpClient.EnableSsl = config.Ssl;

                return smtpClient;
            }
            catch { throw; }
        }
        #endregion Send mail

        private void Log(string errorMessage)
        {
            try
            {
                // Create the source, if it does not already exist.
                if (!EventLog.SourceExists("EMIEMailer"))
                    EventLog.CreateEventSource("EMIEMailer", "EMIEMailLog");


                using (EventLog m_EventLog = new EventLog(""))
                {
                    m_EventLog.Source = "EMIEMailer";
                    m_EventLog.WriteEntry(errorMessage, EventLogEntryType.FailureAudit);
                }
            }
            catch { }
        }
    }


}
