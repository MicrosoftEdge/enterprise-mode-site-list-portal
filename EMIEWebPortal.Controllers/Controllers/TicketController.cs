using EMIEWebPortal.DataModel;
using EMIEWebPortal.Common;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web.Mvc;
using System.Xml;
//using System.Data.Objects;
using System.Data.Entity.Infrastructure;
using System.Threading;
//using System.DirectoryServices;



namespace EMIEWebPortal.Controllers
{

    /// <summary>
    /// Controller class for Ticket which has all DB interactions related to ticket handling
    /// </summary>
    public class TicketController : Controller
    {
        /// <summary>
        /// DB entity for database operations
        /// </summary>
        private LOBMergedEntities DbEntity = new LOBMergedEntities();
        XMLHelperController xmlObject = new XMLHelperController();
        //Logger object to log data in DB
        LoggerController LoggerObj = new LoggerController();

        //statis veriables to access XML's from UNC path
        static string UNCPath = string.Empty;
        static string UserName = string.Empty;
        static string Domain = string.Empty;
        static string Password = string.Empty;
        static string V2Sandboxfile = string.Empty;

        static string ConfigUNCPath = string.Empty;
        static string ConfigUserName = string.Empty;
        static string ConfigDomain = string.Empty;
        static string ConfigPassword = string.Empty;
        static string ConfigFilePath = string.Empty;


        //Datamodel Logger object which would be returned from logger controller and saved here in DB
        Logger logger = new Logger();

        //creating lock object for multiple user access
        ReaderWriterLockSlim rwLock = new ReaderWriterLockSlim();

        // GET: Ticket
        public ActionResult Index()
        {
            return View();
        }

        #region New/Update CR
        /// <summary>
        /// Method to create/update change request
        /// </summary>
        /// <Param>ticket : Ticket to be added or updated</Param>
        /// <Param>action : Insert/Update/Delete</Param>
        /// <returns>Ticket ID</returns>        
        public JsonResult ChangeRequest(Tickets ticket, Operation action)
        {
            Configuration config = null;
            if (LoginController.config == null)
            {
                using (ConfigurationController configController = new ConfigurationController())
                {
                    config = configController.GetConfiguration();
                }
            }
            else
            {
                config = LoginController.config;
            }

            if (config == null)
            {
                return null;
            }
            else
            {
                GetSandboxConfigSettings(config);
                if (V2Sandboxfile == null)
                    return null;
            }

            bool transactionSuccess = false;
            var objectContext = ((IObjectContextAdapter)DbEntity).ObjectContext;
            var option = new System.Transactions.TransactionOptions();
            option.IsolationLevel = System.Transactions.IsolationLevel.Serializable;
            option.Timeout = TimeSpan.FromSeconds(15);
            try
            {


                #region Validations

                //Validations
                if (ticket == null || ticket.Application == null || ticket.RequestedBy == null ||
                    ticket.ChangeType == null)
                    // || ticket.ReasonForChange == null || ticket.DocMode == null
                    // The above line is deleted as DocMode is null in Delete option

                    return Json(-1, JsonRequestBehavior.AllowGet);

                if (!ModelState.IsValid) { return Json(-1, JsonRequestBehavior.AllowGet); }
                #endregion Validations

                //Copy Ticket object details to EMIETicket object which would be saved to db
                #region Copy Data to EMIETicket

                //Ticket object
                EMIETicket dbTicket = null;
                EMIETicketsArch archTicket = null;
                using (System.Transactions.TransactionScope tc = new System.Transactions.TransactionScope(System.Transactions.TransactionScopeOption.Required, option))
                {
                    try
                    {
                        //If it is a new Ticket
                        if (action == Operation.Insert)
                        {
                            dbTicket = new EMIETicket();
                            dbTicket.AppId = ticket.Application.AppId;
                            dbTicket.BPUId = ticket.Application.BPUId;
                        }
                        //If updating ticket
                        else
                        {
                            if (ticket.TicketId != 0)
                            {
                                DbEntity.Configuration.ProxyCreationEnabled = false;
                                dbTicket = DbEntity.EMIETickets.Find(ticket.TicketId);
                            }
                        }
                        //Copy rest of the details of ticket
                        dbTicket.CreatedById = ticket.RequestedBy.UserId;
                        dbTicket.CreatedDate = DateTime.Now;
                        dbTicket.ChangeTypeId = ticket.ChangeType.ChangeTypeId;
                        // dbTicket.BrowserId = ticket.Browser.BrowserId;
                        dbTicket.ReasonForChangeId = ticket.ReasonForChange.ReasonForChangeId;
                        dbTicket.Comments = ticket.Description;
                        dbTicket.BusinessImpact = ticket.BusinessImpact;
                        dbTicket.DocModeId = ticket.DocMode.DocModeId;
                        dbTicket.X_UAMetaTage = ticket.X_UAMetaTage;
                        dbTicket.X_UAMetaTageDetails = ticket.X_UAMetaTageDetails;
                        dbTicket.X_UAHonor = ticket.X_UAHonor;
                        dbTicket.MultipleX_UA = ticket.MultipleX_UA;
                        dbTicket.ExternalFacingSite = ticket.ExternalFacingSite;
                        dbTicket.AppSiteLink = ticket.AppSiteUrl;
                        dbTicket.DomainOpenInEdge = ticket.DomainOpenInEdge;
                        dbTicket.FinalCRStatusId = (int)ticket.FinalTicketStatus;
                        dbTicket.SubDomainDocModeId = ticket.SubDomainDocMode.DocModeId;
                        dbTicket.SubDomainSiteLink = ticket.SubDomainUrl;
                        dbTicket.SubDomainOpenInEdge = ticket.SubDomainOpenInEdge;
                        dbTicket.SubDomainX_UAHonor = ticket.SubDomainX_UAHonor;
                        dbTicket.ModifiedById = null;
                        dbTicket.ModifiedDate = null;

                #endregion Copy Data to EMIETicket



                        //Save ticket to DB               

                        objectContext.Connection.Open();
                        #region Add and save

                        //Add ticket object to EMIE tickets collection
                        if (action == Operation.Insert)
                        {
                            DbEntity.EMIETickets.Add(dbTicket);

                        }
                        //Save changes to database
                        DbEntity.SaveChanges();




                        //Added By Pallav
                        if (action == Operation.Insert)
                        {
                            archTicket = new EMIETicketsArch();
                            archTicket.AppId = dbTicket.AppId;
                            archTicket.BPUId = dbTicket.BPUId;
                        }
                        //If updating ticket
                        else
                        {
                            if (ticket.TicketId != 0)
                            {
                                DbEntity.Configuration.ProxyCreationEnabled = false;
                                archTicket = DbEntity.EMIETicketsArches.Find(ticket.TicketId);
                            }
                        }
                        archTicket.TicketId = dbTicket.TicketId;
                        archTicket.DocModeId = dbTicket.DocModeId;
                        archTicket.SandboxRollback = false;
                        archTicket.ProductionRollback = false;
                        //archTicket.AppId = dbTicket.AppId;
                        //archTicket.BPUId = dbTicket.BPUId;
                        archTicket.CreatedById = dbTicket.CreatedById;
                        //archTicket.BrowserId = dbTicket.BrowserId;
                        archTicket.CreatedDate = DateTime.Now;
                        archTicket.ChangeTypeId = dbTicket.ChangeTypeId;
                        archTicket.ReasonForChangeId = dbTicket.ReasonForChangeId;
                        archTicket.Comments = dbTicket.Comments;
                        archTicket.BusinessImpact = dbTicket.BusinessImpact;
                        archTicket.X_UAMetaTage = dbTicket.X_UAMetaTage;
                        archTicket.X_UAMetaTageDetails = dbTicket.X_UAMetaTageDetails;
                        archTicket.X_UAHonor = dbTicket.X_UAHonor;
                        archTicket.MultipleX_UA = dbTicket.MultipleX_UA;
                        archTicket.ExternalFacingSite = dbTicket.ExternalFacingSite;
                        archTicket.AppSiteLink = dbTicket.AppSiteLink;
                        archTicket.DomainOpenInEdge = dbTicket.DomainOpenInEdge;
                        archTicket.FinalCRStatusId = dbTicket.FinalCRStatusId;
                        archTicket.SubDomainDocModeId = dbTicket.SubDomainDocModeId;
                        archTicket.SubDomainSiteLink = dbTicket.SubDomainSiteLink;
                        archTicket.SubDomainOpenInEdge = dbTicket.SubDomainOpenInEdge;
                        archTicket.SubDomainX_UAHonor = dbTicket.SubDomainX_UAHonor;
                        archTicket.ModifiedById = null;
                        archTicket.ModifiedDate = null;

                        if (action == Operation.Insert)
                        {
                            DbEntity.EMIETicketsArches.Add(archTicket);
                        }
                        //End

                        DbEntity.SaveChanges();
                        objectContext.Connection.Close();
                        #endregion Add and save



                        #region Add in XML
                        ticket.TicketId = dbTicket.TicketId;
                        //Adding in XML method called here                    
                        xmlObject.OperationOnXML(ticket, Operation.AddInSandbox);

                        #endregion
                    
                        tc.Complete();
                        transactionSuccess = true;
                    }
                    catch (Exception)
                    {
                        transactionSuccess = false;
                        System.Transactions.Transaction.Current.Rollback();
                        
                        throw;
                    }
                    finally
                    {
                        tc.Dispose();

                        if (transactionSuccess)
                        {
                            //This logic has to be checked while raising the ticket
                            string UserName = DbEntity.Users.Where(o => o.UserId == ticket.RequestedBy.UserId).Select(o => o.UserName).FirstOrDefault().ToString();

                            string description = string.Format(Constants.TicketStatus, dbTicket.TicketId, "raised", UserName);

                            //Check if ticket inserted or Updated
                            string operation = null;
                            if (action == Operation.Insert)
                                operation = Constants.Add;
                            else
                                operation = Constants.Update;

                            //Create Logger object 
                            Loggers loggers = new Loggers
                            {
                                ActionMethod = Constants.ChangeRequestMethod,
                                Description = description,
                                Operation = operation,
                                UserID = ticket.RequestedBy.UserId
                            };

                            logger = LoggerObj.LoggerMethod(loggers);
                            DbEntity.Loggers.Add(logger);

                            //Save database changes

                            DbEntity.SaveChanges(); 
                        }
                    }

                }
                GetConfigurationSettingsForMail(config);
                //sPath = System.Web.Hosting.HostingEnvironment.MapPath(ConfigFilePath);
                CommonFunctions.SendMail(ticket, MailMessageType.RequesterRaisedRequest, GetAttachements(ConfigFilePath));


                //return ticket ID
                //return dbTicket.TicketId;
                return Json(dbTicket, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                objectContext.Connection.Close();
            }
        }

        /// <summary>
        /// Gets the UNCPath and config details for the sandbox environment
        /// </summary>
        /// <param name="config">configuration object</param>
        private static void GetSandboxConfigSettings(Configuration config)
        {
            int index = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.SandboxEnvironment).value.ToString().LastIndexOf('\\');
            UNCPath = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.SandboxEnvironment).value.ToString().Substring(0, index);
            UserName = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.SandboxUserName).value.ToString();
            Domain = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.SandboxUserDomain).value.ToString();
            Password = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.SandboxPassword).value.ToString();
            V2Sandboxfile = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.SandboxEnvironment).value.ToString();
        }

        /// <summary>
        /// Gets the UNCPath and config details for the sandbox environment
        /// </summary>
        /// <param name="config">configuration object</param>
        private static void GetConfigurationSettingsForMail(Configuration config)
        {
            int index = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ConfigurationSettingsLocation).value.ToString().LastIndexOf('\\');
            ConfigUNCPath = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ConfigurationSettingsLocation).value.ToString().Substring(0, index);
            ConfigUserName = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ConfigurationSettingsUserName).value.ToString();
            ConfigDomain = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ConfigurationSettingsUserDomain).value.ToString();
            ConfigPassword = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ConfigurationSettingsPassword).value.ToString();
            ConfigFilePath = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ConfigurationSettingsLocation).value.ToString();
        }

        #endregion New/Update CR

        #region Get Ticket Data
        /// <summary>
        /// This method will fetch and return the pending tickets of the respective user 
        /// </summary>
        /// <param name="logOnId">Logged in VID</param>
        /// <returns>List of ticket class</returns>               
        public JsonResult GetTicketsList(string logOnId)
        {
            List<Tickets> lstTickets = new List<Tickets>();
            try
            {

                //In case we are appending domain here, uncomment next line
                logOnId = logOnId + Constants.EmailDomainString;

                User user = DbEntity.Users.Where(usr => usr.Email == logOnId).First();
                if (user != null)
                {
                    //This query will get the list of tickets which are tagged to the logged in user and "Pending" tickets.
                    List<EMIETicket> ticketList = DbEntity.EMIETickets.Where(ticket => ticket.CreatedById == user.UserId && ticket.FinalCRStatusId <= (int)TicketStatus.ProductionReady).ToList<EMIETicket>();
                    //Other information for the tickets will be fetched and added to dictionary in following query
                    foreach (var ticket in ticketList)
                    {
                        //Adding the ticketid with respective information in the dictionary
                        lstTickets.Add(GetTicketObjectData(ticket.TicketId));
                    }
                }

            }
            catch (Exception)
            {
                throw;
            }
            return Json(lstTickets, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get ticket object in JsonResult format with all nested ticket informations for particular ticket id
        /// </summary>       
        public JsonResult GetTicketsData(int ticketId)
        {
            return Json(GetTicketObjectData(ticketId), JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// Get ticket object with all nested ticket informations for particular ticket id
        /// </summary>       
        public Tickets GetTicketObjectData(int ticketId)
        {

            // Populate the values in tickets class using the entity classes
            //Approvals will have to be filled seperately
            Tickets tickets = (from
                            ticket in DbEntity.EMIETickets
                               join applications in DbEntity.Applications on ticket.AppId equals applications.AppId
                               join user in DbEntity.Users.DefaultIfEmpty() on ticket.CreatedById equals user.UserId
                               join finalStatus in DbEntity.EMIETicketStatus on ticket.FinalCRStatusId equals finalStatus.TicketStatusId
                               join docmode in DbEntity.DocModes on ticket.DocModeId equals docmode.DocModeId into dc
                               join subdocmode in DbEntity.DocModes on ticket.SubDomainDocModeId equals subdocmode.DocModeId into sdc
                               from subdocmode in sdc.DefaultIfEmpty()
                               from changetype in DbEntity.EMIEChangeTypes.DefaultIfEmpty()
                               from reasonforchange in DbEntity.EMIEReasonForChanges.DefaultIfEmpty()
                               from docmode in dc.DefaultIfEmpty()
                               where (ticket.TicketId == ticketId)
                               select new Tickets
                               {
                                   // Get the values that we can get directly from the DB
                                   TicketId = ticket.TicketId,
                                   X_UAMetaTage = ticket.X_UAMetaTage,
                                   X_UAMetaTageDetails = ticket.X_UAMetaTageDetails,
                                   X_UAHonor = ticket.X_UAHonor,
                                   MultipleX_UA = ticket.MultipleX_UA,
                                   ExternalFacingSite = ticket.ExternalFacingSite,
                                   FQDN = ticket.FQDN,
                                   AppSiteUrl = ticket.AppSiteLink,
                                   Description = ticket.Comments,
                                   ReasonForChangeComments = ticket.Comments,
                                   BusinessImpact = ticket.BusinessImpact,
                                   ProductionSuccessComments = ticket.ProductionSuccessComments,
                                   ProductionFailureComments = ticket.ProductionFailureComments,
                                   //These properties are present as a class in the Tickets model. 
                                   // Hence, we should populate them using below operation
                                   Application = new Applications
                                   {
                                       AppId = applications.AppId,
                                       ApplicationName = applications.Application1,
                                       BPU = applications.BPU.BPU1,
                                       BPUId = applications.BPU.BPUId
                                   },
                                   RequestedBy = new Users
                                   {
                                       UserId = user.UserId,
                                       UserName = user.UserName,
                                       Email = user.Email
                                   },
                                   ChangeType = new ChangeTypes
                                   {
                                       ChangeTypeId = changetype.ChangeTypeId,
                                       ChangeTypeName = changetype.ChangeType
                                   },
                                   ReasonForChange = new ReasonForChanges
                                   {
                                       ReasonForChangeId = reasonforchange.ReasonForChangeId,
                                       ReasonForChangeName = reasonforchange.ReasonForChange
                                   },
                                   DocMode = new Models.DocModes
                                   {
                                       DocModeId = docmode.DocModeId,
                                       DocModeName = docmode.DocMode1
                                   },
                                   DomainOpenInEdge = ticket.DomainOpenInEdge,
                                   SubDomainUrl = ticket.SubDomainSiteLink,
                                   SubDomainDocMode = new DocModes
                                   {
                                       DocModeId = subdocmode.DocModeId,
                                       DocModeName = subdocmode.DocMode1
                                   },
                                   SubDomainOpenInEdge = ticket.SubDomainOpenInEdge,
                                   SubDomainX_UAHonor = ticket.SubDomainX_UAHonor,
                                   FinalTicketStatus = (TicketStatus)finalStatus.TicketStatusId,
                                   ScheduleDateTimeStart = ticket.ProductionDeployDateStart,
                                   ScheduleDateTimeEnd = ticket.ProductionDeployDateEnd

                               }).FirstOrDefault();

            //Populate the approvals class with list of approvals from db            
            //Assign approvers of ticket to ticket object
            if (tickets != null)
            {
                tickets.Approvals = GetApprovers(ticketId);
            }
            tickets.DateTimeOffset = (int)TimeZoneInfo.Local.GetUtcOffset(DateTime.UtcNow).TotalMinutes;
            return tickets;

        }



        #endregion Get Ticket Data

        #region GetTicketDataForAllRequestPage
        /// <summary>
        /// This method will return only required ticket details for the all request page so that it can load from database in lesser time
        /// </summary>
        /// <param name="logOnId"></param>
        /// <param name="isEMIEChampion">isEMIEChampion=true ,when role is EMIEChampion</param>
        /// <returns>JsonResult</returns>
        public JsonResult GetTicketDataForAllRequest(string logOnId, bool? isEMIEChampion)
        {
            List<Tickets> listtickets = new List<Tickets>();
            try
            {
                //In case we are appending domain here, uncomment next line
                //logOnId = logOnId + Constants.EmailDomainString;
                listtickets = (from user in DbEntity.Users
                               join ticket in DbEntity.EMIETickets on user.UserId equals ticket.CreatedById
                               where ((bool)isEMIEChampion == true ? user.LoginId.StartsWith("") : user.LoginId == logOnId)
                               select new Tickets
                               {
                                   TicketId = ticket.TicketId,
                                   DocMode = new DocModes
                                   {
                                       DocModeId = ticket.DocMode.DocModeId,
                                       DocModeName = ticket.DocMode.DocMode1
                                   },
                                   Application = new Applications
                                   {
                                       AppId = ticket.Application.AppId,
                                       ApplicationName = ticket.Application.Application1,
                                       BPU = ticket.Application.BPU.BPU1
                                   },
                                   Description = ticket.Comments,
                                   AppSiteUrl = ticket.AppSiteLink,
                                   ChangeType = new ChangeTypes
                                   {
                                       ChangeTypeId = ticket.ChangeTypeId,
                                       ChangeTypeName = ticket.EMIEChangeType.ChangeType
                                   },
                                   RequestedBy = new Users
                                   {
                                       UserId = user.UserId,
                                       UserName = user.UserName,
                                       Email = user.Email,
                                       LogOnId = user.LoginId
                                   },
                                   TicketCreationDateTime = ticket.CreatedDate.ToString(),
                                   FinalTicketStatus = (TicketStatus)ticket.FinalCRStatusId,
                               }).Distinct().ToList();
            }
            catch (Exception)
            {
                throw;
            }
            return Json(listtickets, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// This function will get the data for a single ticket and it will populate new cr page in non editable mode
        /// </summary>
        /// <param name="ticketId"></param>
        /// <returns></returns>
        public JsonResult GetAllDataOfSubmittedTicket(int ticketId)
        {

            try
            {
                IQueryable<Tickets> tickets = (from
                                               ticket in DbEntity.EMIETickets
                                               join user in DbEntity.Users on ticket.CreatedById equals user.UserId
                                               join docm in DbEntity.DocModes on ticket.SubDomainDocModeId equals docm.DocModeId into dc
                                               from docm in dc.DefaultIfEmpty()
                                               where (ticket.TicketId == ticketId)
                                               select new Tickets
                                               {
                                                   // Get the values that we can get directly from the DB
                                                   TicketId = ticket.TicketId,
                                                   X_UAMetaTage = ticket.X_UAMetaTage,
                                                   X_UAMetaTageDetails = ticket.X_UAMetaTageDetails,
                                                   X_UAHonor = ticket.X_UAHonor,
                                                   MultipleX_UA = ticket.MultipleX_UA,
                                                   ExternalFacingSite = ticket.ExternalFacingSite,
                                                   FQDN = ticket.FQDN,
                                                   AppSiteUrl = ticket.AppSiteLink,
                                                   DomainOpenInEdge = ticket.DomainOpenInEdge,
                                                   Description = ticket.Comments,
                                                   BusinessImpact = ticket.BusinessImpact,
                                                   FinalTicketStatus = (TicketStatus)ticket.FinalCRStatusId,
                                                   RequestedBy = new Users
                                                   {
                                                       UserId = user.UserId,
                                                       UserName = user.UserName,
                                                       LogOnId = user.LoginId

                                                   },
                                                   SubDomainUrl = ticket.SubDomainSiteLink,
                                                   SubDomainX_UAHonor = ticket.SubDomainX_UAHonor,
                                                   SubDomainOpenInEdge = ticket.SubDomainOpenInEdge,
                                                   SubDomainDocMode = new DocModes
                                                   {
                                                       DocModeId = docm.DocModeId,
                                                       DocModeName = docm.DocMode1
                                                   },
                                                   //These properties are present as a class in the Tickets model. 
                                                   // Hence, we should populate them using below operation,},
                                                   ScheduleDateTimeStart = ticket.ProductionDeployDateStart,
                                                   ScheduleDateTimeEnd = ticket.ProductionDeployDateEnd

                                               });


                IQueryable<Applications> applications = DbEntity.EMIETickets.Where(app => app.TicketId == ticketId).Select(app => new Applications
                {
                    AppId = app.AppId == null ? 0 : app.AppId,
                    ApplicationName = app.Application.Application1,
                    BPUId = app.BPU.BPUId == null ? 0 : app.BPU.BPUId,
                    BPU = app.BPU.BPU1.ToString()
                }).OrderBy(x => x.ApplicationName);

                IQueryable<ChangeTypes> changeTypes = DbEntity.EMIETickets.Where(ch => ch.TicketId == ticketId).Select(ch => new ChangeTypes
                {
                    ChangeTypeId = ch.ChangeTypeId,
                    ChangeTypeName = ch.EMIEChangeType.ChangeType,
                }).OrderBy(x => x.ChangeTypeName);

                IQueryable<ReasonForChanges> reasonForChanges = DbEntity.EMIETickets.Where(ch => ch.TicketId == ticketId).Select(ch => new ReasonForChanges
                {
                    ReasonForChangeId = ch.EMIEReasonForChange.ReasonForChangeId,
                    ReasonForChangeName = ch.EMIEReasonForChange.ReasonForChange
                }).OrderBy(x => x.ReasonForChangeName);

                IQueryable<DocModes> docModes = DbEntity.EMIETickets.Where(ch => ch.TicketId == ticketId).Select(ch => new DocModes
                {
                    DocModeId = ch.DocMode.DocModeId,
                    DocModeName = ch.DocMode.DocMode1
                }).OrderBy(x => x.DocModeName);



                //Saving all these lists in one model class
                ChangeRequestDetails CRDetails = new ChangeRequestDetails()
                {
                    Tickets = tickets.ToList(),
                    Applications = applications.ToList(),
                    ChangeTypes = changeTypes.ToList(),
                    DocModes = docModes.ToList(),
                    ReasonForChanges = reasonForChanges.ToList(),
                    //Browsers = browser.ToList()
                };


                return Json(CRDetails, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }

        }

        #endregion

        #region Production DateTime
        /// <summary>
        ///  This service function Updates Production Deployment Date and Time
        /// </summary>
        /// <param name="ticket">ticket object</param>
        /// <returns>Success Meassage</returns>       
        public bool UpdateProductionDeployDate(Tickets ticket)
        {
            try
            {
                #region Validations

                //Check if ticket object is null
                if (ticket == null)
                    return false;
                if (!ModelState.IsValid)
                    return false;

                #endregion Validations

                #region Copy Data to EMIETicket

                //Copy Ticket object details to EMIETicket object which would be saved to db               
                EMIETicket dbTicket = DbEntity.EMIETickets.Single(EMIETicket => EMIETicket.TicketId == ticket.TicketId);
                DateTime startTime = TimeZoneInfo.ConvertTimeToUtc((DateTime)ticket.ScheduleDateTimeStart);
                DateTime endTime = TimeZoneInfo.ConvertTimeToUtc((DateTime)ticket.ScheduleDateTimeEnd);
                dbTicket.ProductionDeployDateStart = startTime;
                dbTicket.ProductionDeployDateEnd = endTime;
                dbTicket.FinalCRStatusId = (int)ticket.FinalTicketStatus;

                #endregion Copy Data to EMIETicket
                //Need this comment
                //#region Logger
                //string UserName = DbEntity.Users.Where(o => o.UserId == ticket.RequestedBy.UserId).Select(o => o.UserName).FirstOrDefault().ToString();
                //string description = string.Format(Constants.TICKETSTATUS, dbTicket.TicketId, "Added to production", UserName);

                //Loggers loggers = new Loggers
                //{
                //    ActionMethod = Constants.UpdateProdDateMethod,
                //    Description = description,
                //    Operation = Constants.UPDATE,
                //    UserID = ticket.RequestedBy.UserId
                //};

                //logger = LoggerObj.LoggerMethod(loggers);
                //DbEntity.Loggers.Add(logger);

                //#endregion

                #region save
                //Save changes to database
                DbEntity.SaveChanges();
                #endregion save

                #region AddinXML
                if (ticket.FinalTicketStatus == TicketStatus.ProductionReady)
                {
                    EMIETicket emieTicket = DbEntity.EMIETickets.Single(o => o.TicketId == ticket.TicketId);
                    var ticketProd = ConverEmieTicketToTicket(emieTicket);
                    xmlObject.OperationOnXML(ticketProd, Operation.AddInProduction);
                }
                #endregion


                #region send mail
                //Populate the approvals class with list of approvals from db 
                ticket.Approvals = GetApprovers(ticket.TicketId);
                CommonFunctions.SendMail(ticket, MailMessageType.RequestScheduledForProduction);
                #endregion

                //return Success
                return true;
            }
            catch (Exception ex)
            {
                throw;
            }
        }


        /// <summary>
        /// Method to convert DataModel Ticket object to Model Ticket object
        /// </summary>
        /// <param name="emieTicket">DataModel Ticket</param>
        /// <returns>Tickets Model</returns>
        private Tickets ConverEmieTicketToTicket(EMIETicket emieTicket)
        {
            EMIETicketsArch emieTicketArch = DbEntity.EMIETicketsArches.Single(o => o.TicketId == emieTicket.TicketId);

            if (emieTicket.DocMode2 == null)
            {
                emieTicket.DocMode2 = new DocMode
                {
                    DocMode1 = null
                };
            }

            if (emieTicket.DocMode == null)
            {
                emieTicket.DocMode = new DocMode
                {
                    DocMode1 = null
                };
            }

            Tickets ticket = new Tickets
            {
                Application = new Applications
                {
                    AppId = emieTicket.AppId,
                    ApplicationName = emieTicket.Application.Application1
                },
                AppSiteUrl = emieTicket.AppSiteLink,
                DomainOpenInEdge = emieTicket.DomainOpenInEdge,
                RequestedBy = new Users
                {
                    UserId = emieTicket.CreatedById,
                    UserName = emieTicketArch.User.UserName,
                    Email = emieTicketArch.User.Email
                },
                ChangeType = new ChangeTypes
                {
                    ChangeTypeId = emieTicket.ChangeTypeId
                },
                DocMode = new DocModes
                {
                    DocModeId = emieTicket.DocModeId,
                    DocModeName = emieTicket.DocMode.DocMode1
                },
                X_UAHonor = emieTicket.X_UAHonor,
                FinalTicketStatus = (TicketStatus)emieTicket.FinalCRStatusId,
                TicketId = emieTicket.TicketId,
                SubDomainUrl = emieTicket.SubDomainSiteLink,
                SubDomainOpenInEdge = emieTicket.SubDomainOpenInEdge,
                SubDomainDocMode = new DocModes
                {
                    DocModeId = emieTicket.SubDomainDocModeId,
                    DocModeName = emieTicket.DocMode2.DocMode1
                },
                SubDomainX_UAHonor = emieTicket.SubDomainX_UAHonor
            };

            return ticket;
        }

        /// <summary>
        /// Method to fecth approvers of ticket
        /// </summary>
        /// <param name="ticketId"></param>
        /// <returns></returns>
        public List<Approvals> GetApprovers(int ticketId)
        {
            List<Approvals> approvals = (

                                        from tickt in DbEntity.EMIETickets
                                        join ticketApproval in DbEntity.EMIETicketAprovals on tickt.TicketId equals ticketApproval.TicketId
                                        join userrolebpumapping in DbEntity.UserRoleBPUMappings on ticketApproval.UserRoleBPUMappingId equals userrolebpumapping.ID
                                        join user in DbEntity.Users on userrolebpumapping.UserId equals user.UserId
                                        join role in DbEntity.Roles on userrolebpumapping.RoleId equals role.RoleId
                                        where tickt.TicketId == ticketId
                                        //Approvers of ticket
                                        select new Approvals
                                        {
                                            Approver = new Users
                                            {
                                                UserId = user.UserId,
                                                UserName = user.UserName,
                                                UserRole = new Roles
                                                {
                                                    RoleId = role.RoleId,
                                                    RoleName = role.RoleName
                                                },
                                                Email = user.Email
                                            },
                                            ApproverComments = ticketApproval.ApproverComments,
                                            NoOfReminders = ticketApproval.NoOfReminders,
                                            ApprovalState = (ApprovalState)ticketApproval.TicketStateId
                                        }
                                          ).ToList();

            return approvals;

        }

        /// <summary>
        ///  This service function retrieves Production Deployment Date and Time
        /// </summary>
        /// <param name="ticket"></param>
        /// <returns>Date and Time of Production Deployment</returns>       
        public JsonResult GetProductionDeployDate(int ticketId)
        {
            try
            {
                return GetTicketsData(ticketId);
            }
            catch (Exception)
            {
                throw;
            }

        }
        #endregion Production DateTime

        //This can be used in Future
        //#region RollBack ticket
        ///// <summary>
        ///// This function will roll back the ticket changes
        ///// </summary>
        ///// <param name="ticket">Ticket instance</param>
        ///// <returns>ticket instance</returns>
        //public bool RollBack(int TicketId)
        //{
        //    try
        //    {
        //        //Fetch ticket from database
        //        EMIETicket emieTicket = DbEntity.EMIETickets.Single(dbTicket => dbTicket.TicketId == TicketId);

        //        //Update its Final status to rollback
        //        emieTicket.FinalCRStatusId = (int)TicketStatus.RolledBack;

        //        //Log operation to DB
        //        #region Logger
        //        string UserName = DbEntity.Users.Where(o => o.UserId == emieTicket.CreatedById).Select(o => o.UserName).FirstOrDefault().ToString();
        //        string description = string.Format(Constants.TicketStatus, emieTicket.TicketId, Constants.Rollback, UserName);

        //        Loggers loggers = new Loggers
        //        {
        //            ActionMethod = Constants.RollbackMethod,
        //            Description = description,
        //            Operation = Constants.Update,
        //            UserID = emieTicket.CreatedById
        //        };

        //        logger = LoggerObj.LoggerMethod(loggers);
        //        DbEntity.Loggers.Add(logger);
        //        #endregion

        //        //Save changes in DB
        //        Convert.ToBoolean(DbEntity.SaveChanges());
        //        return true;
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //}

        //#endregion RollBack ticket

        /// <summary>
        /// This function Gets the list of all approvers for that BPU, and grouped by their roles
        /// </summary>
        /// <param name="ticketId">TicketId for which we need the data</param>
        /// <returns>dictionary for role and Approver Names</returns>
        public JsonResult VerifySandbox(string ticketId)
        {
            if (!string.IsNullOrEmpty(ticketId))
            {
                int TicketID = int.Parse(ticketId);
                //get all emiechamps from userrolebpumapping table
                List<Approvals> emieapprovals = (
                                            from userRoleBpuMapping in DbEntity.UserRoleBPUMappings
                                            join user in DbEntity.Users on userRoleBpuMapping.UserId equals user.UserId
                                            join role in DbEntity.Roles on userRoleBpuMapping.RoleId equals role.RoleId
                                            where (role.MandatoryApproval == true && role.RoleId == 4 && userRoleBpuMapping.IsActive == true && userRoleBpuMapping.BPUId == 0)
                                            select new Approvals
                                            {
                                                Approver = new Users
                                                {
                                                    UserId = user.UserId,
                                                    UserName = user.UserName,
                                                    UserRole = new Roles
                                                    {
                                                        RoleId = role.RoleId,
                                                        RoleName = role.RoleName
                                                    },
                                                }
                                            }
                                   ).ToList();
                //get remaining approvals
                List<Approvals> otherapprovals = (
                                           from ticket in DbEntity.EMIETickets
                                           //join bpu in DbEntity.BPUs on ticket.BPUId equals bpu.BPUId
                                           join userRoleBpuMapping in DbEntity.UserRoleBPUMappings on ticket.BPUId equals userRoleBpuMapping.BPUId
                                           //join userrolemapping in DbEntity.UserRoleMappings on userRoleBpuMapping.UserId equals userrolemapping.UserId
                                           join user in DbEntity.Users on userRoleBpuMapping.UserId equals user.UserId
                                           join role in DbEntity.Roles on userRoleBpuMapping.RoleId equals role.RoleId
                                           where (ticket.TicketId == TicketID && role.MandatoryApproval == true && role.RoleId != 1 && userRoleBpuMapping.IsActive == true)
                                           select new Approvals
                                           {
                                               Approver = new Users
                                               {
                                                   UserId = user.UserId,
                                                   UserName = user.UserName,
                                                   UserRole = new Roles
                                                   {
                                                       RoleId = role.RoleId,
                                                       RoleName = role.RoleName
                                                   },
                                               }
                                           }
                                   ).ToList();


                foreach (var item in otherapprovals)
                {
                    emieapprovals.Add(item);
                }

                //getting the data in the dictionary format as the same will be easily represented in the Views
                List<ApprovalData> dict = new List<ApprovalData>();
                foreach (var row in emieapprovals)
                {
                    List<Users> RoleSpecificApprovers = new List<Users>();
                    List<Users> AppOwners = new List<Users>();
                    string RoleName = row.Approver.UserRole.RoleName;

                    if (dict.Count > 0 && dict.FirstOrDefault(x => x.Key.Equals(RoleName)) != null)
                    {
                        AppOwners = dict.First(x => x.Key.Equals(RoleName)).Value;
                        AppOwners.Add(row.Approver);
                    }
                    else
                    {
                        RoleSpecificApprovers.Add(row.Approver);
                        dict.Add(new ApprovalData { Key = RoleName, Value = RoleSpecificApprovers });
                    }
                }

                return Json(dict.ToList(), JsonRequestBehavior.AllowGet);
            }

            return Json(null, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// This function will be adding the Approval data to the database, for that ticket
        /// </summary>
        /// <param name="Tickets">Ticket details</param>
        /// <param name="approvers">List of approver id and roles</param>
        /// <returns>Success if added, error if not</returns>
        public JsonResult AddApprovalData(Tickets ticket, List<Dictionary<string, string>> approvers, List<string> comments)
        {
            try
            {
                List<Approvals> ApprovalsList = new List<Approvals>();
                UserController UserContollerObj = new UserController();

                foreach (var approver in approvers)
                {
                    var currentIndex = approvers.IndexOf(approver);
                    if (comments == null)
                    {
                        comments = new List<string>();
                    }
                    // Set blank for the null values of comments
                    if (!(comments.Count - 1 >= currentIndex))
                    {
                        comments.Add(string.Empty);
                    }

                    //This is required as same user can have different types of access for Same BPU
                    //Hence we need the unique one
                    int roleId = int.Parse(approver["Role"].ToString());
                    int userId = int.Parse(approver["Name"].ToString());
                    var UserRoleMappingData = DbEntity.UserRoleBPUMappings.Where(y => y.RoleId.Equals(roleId) && y.UserId.Equals(userId)).FirstOrDefault();

                    EMIETicketAproval TicketApproval = new EMIETicketAproval();

                    TicketApproval.TicketId = ticket.TicketId;
                    TicketApproval.UserRoleBPUMappingId = UserRoleMappingData.ID;
                    TicketApproval.ApproverComments = comments[currentIndex];
                    TicketApproval.TicketStateId = (int)ApprovalState.Pending;
                    //While sending it for the first time, its always be 0.
                    TicketApproval.NoOfReminders = 0;
                    TicketApproval.CreatedById = ticket.RequestedBy.UserId;
                    TicketApproval.CreatedDate = DateTime.Now;
                    // FOrthe first time, created and modified by will be same.
                    TicketApproval.ModifiedById = ticket.RequestedBy.UserId;
                    TicketApproval.ModifiedDate = DateTime.Now;
                    //add and save
                    DbEntity.EMIETicketAprovals.Add(TicketApproval);

                    //get the Approvers Data and Assign it to ticket,
                    // This will help in mainiaing the Ticket data consistency.
                    Users Approver = new Users();
                    Approver = UserContollerObj.GetUser(userId);

                    Approvals Approvals = new Models.Approvals
                    {
                        Approver = Approver,
                        ApproverComments = TicketApproval.ApproverComments,
                        ApprovalState = ApprovalState.Pending,
                        NoOfReminders = TicketApproval.NoOfReminders
                    };

                    ApprovalsList.Add(Approvals);
                }

                EMIETicket emieTicket = DbEntity.EMIETickets.Single(o => o.TicketId == ticket.TicketId);
                emieTicket.FinalCRStatusId = (int)TicketStatus.ApprovalPending;

                Convert.ToBoolean(DbEntity.SaveChanges());

                //Assign the Approvers List to Tickets
                ticket.Approvals = ApprovalsList;

                #region Send Mail
                //Get FinalCRS statusID of ticket while sending mail
                EMIETicket savedEmieTicket = DbEntity.EMIETickets.Single(o => o.TicketId == ticket.TicketId);
                ticket.FinalTicketStatus = (TicketStatus)savedEmieTicket.FinalCRStatusId;

                ticket.Approvals = GetApprovers(ticket.TicketId);
                CommonFunctions.SendMail(ticket, MailMessageType.RequestSentForApproval);
                #endregion Send Mail

                //Return success once completed with changes.
                return Json("Success", JsonRequestBehavior.AllowGet);

            }
            catch (Exception)
            {
                throw;
            }
        }


        /// <summary>
        /// This function uploads files to the location specified in config file. This can later be 
        /// changed to uploading at a server location with a change of URL.
        /// </summary>
        /// <returns>List of files uploaded/having error while saving</returns>
        public JsonResult FileUpload()
        {
            int UploadedFilesCount = 0;
            string UploadedFileNames = string.Empty;
            string UnUploadedFiles = string.Empty;

            //get folder access credentials from config file
            GetUploadFileAccessCredentials();

            System.Web.HttpFileCollection fileCollection = System.Web.HttpContext.Current.Request.Files;
            string TicketID = System.Web.HttpContext.Current.Request.Form.GetValues(0).FirstOrDefault();
            bool IsVerifySandBox = Boolean.Parse(System.Web.HttpContext.Current.Request.Form.GetValues("IsVerifySandbox").FirstOrDefault());
            bool IsSuccessful = Boolean.Parse(System.Web.HttpContext.Current.Request.Form.GetValues("IsSuccessful").FirstOrDefault());
            // Determine the path where you want to save it
            string sPath = string.Empty;
            if (IsVerifySandBox)
            {
                if (IsSuccessful)
                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxSuccessfulPath) + TicketID;

                else
                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxFailurePath) + TicketID;

            }
            else
            {
                if (IsSuccessful)
                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionSuccessfulPath) + TicketID;

                else
                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionFailurePath) + TicketID;

            }

            //uplaoded path of files
            UploadedFileNames = sPath + ";";

            //use unc credentials to upload files
            using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
            {
                if (unc.NetUseWithCredentials(UNCPath, UserName, Domain, Password) || unc.LastError == 1219)
                {
                    if (!Directory.Exists(sPath))
                    {
                        Directory.CreateDirectory(sPath);
                    }

                    //delete all files of present in existing directory
                    DeleteUploadedFilesFromDirectory(sPath);

                    // for each file.
                    for (int fileCount = 0; fileCount <= fileCollection.Count - 1; fileCount++)
                    {
                        System.Web.HttpPostedFile postedFile = fileCollection[fileCount];

                        if (postedFile.ContentLength > 0)
                        {
                            string FileName = postedFile.FileName;
                            //check if the file already exists
                            if (!System.IO.File.Exists(sPath + Path.GetFileName(FileName)))
                            {
                                // save the files in folder
                                postedFile.SaveAs(sPath + "\\" + Path.GetFileName(FileName));
                                UploadedFilesCount = UploadedFilesCount + 1;
                                // Add the names of uploaded files in string format
                                if (string.IsNullOrEmpty(UploadedFileNames))
                                {
                                    UploadedFileNames = Path.GetFileName(FileName) + ";";
                                }
                                else
                                {
                                    UploadedFileNames += Path.GetFileName(FileName) + ";";
                                }
                            }
                            else
                            {
                                //Add the names of unuploaded files in string format
                                if (string.IsNullOrEmpty(UploadedFileNames))
                                {
                                    UnUploadedFiles = Path.GetFileName(FileName) + ";";
                                }
                                else
                                {
                                    UnUploadedFiles += Path.GetFileName(FileName) + ";";
                                }
                            }
                        }
                    }
                }
            }

            //if all are uploaded
            if (UploadedFilesCount > 0)
            {
                return Json(UploadedFileNames + Constants.UploadedSuccessfully, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(UnUploadedFiles + Constants.UploadFailed, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// method to initialize the access parameters from config for uploading file
        /// </summary>
        private void GetUploadFileAccessCredentials()
        {
            Configuration config = null;
            if (LoginController.config == null)
            {
                ConfigurationController configcntrlr = new ConfigurationController();
                config = configcntrlr.GetConfiguration();
            }
            else
            {
                config = LoginController.config;
            }

            UNCPath = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.UploadAttachmentsLocation).value.ToString();
            UserName = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.UploadAttachmentUserName).value.ToString();
            Domain = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.UploadAttachmentUserDomain).value.ToString();
            Password = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.UploadAttachmentPassword).value.ToString();
        }

        /// <summary>
        /// This function downloads file from the server location
        /// </summary>
        /// <param name="fileName">The file that you want to Download</param>
        /// <returns>HttpResponseMessage</returns>
        public JsonResult DownloadFile(string fileName, string ticketId)
        {
            // HttpResponseMessage result = new HttpResponseMessage();
            string result = null;
            try
            {
                string sPath = string.Empty;
                sPath = System.Web.Hosting.HostingEnvironment.MapPath(Constants.FileUploadPath) + ticketId;
                sPath = sPath + "\\" + fileName;

                if (!System.IO.File.Exists(sPath))
                {
                    //Indicates the resource no longer exists
                    // result.StatusCode = HttpStatusCode.Gone;
                }
                else
                {
                    // Serve the file to the client
                    //result.StatusCode = HttpStatusCode.OK;
                    //result.Content = new StreamContent(new FileStream(sPath, FileMode.Open, FileAccess.Read));
                    //result.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                    //result.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
                    //result.Content.Headers.ContentDisposition.FileName = fileName;
                    result = sPath;
                }
            }
            catch
            {
                //result.StatusCode = HttpStatusCode.InternalServerError;
                Json(result, JsonRequestBehavior.AllowGet);
            }

            return Json(result, JsonRequestBehavior.AllowGet);

        }

        /// <summary>
        /// This function deletes teh File from the locations specified in config file
        /// </summary>
        /// <param name="fileName">Name of the file to be deleted.</param>
        /// <returns>File Name with success message</returns>
        public string DeleteFile(string filePath, string fileName)
        {
            string Message = string.Empty;
            try
            {
                //use unc credentials to upload files
                using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
                {
                    if (unc.NetUseWithCredentials(UNCPath, UserName, Domain, Password))
                    {
                        var sPath = filePath;
                        filePath = Directory.GetFiles(sPath, fileName)
                                        .FirstOrDefault();
                        if (System.IO.File.Exists(filePath))
                        {
                            System.IO.File.Delete(filePath);
                        }

                        //if upload folder is empty delete folder
                        string[] files = Directory.GetFiles(sPath);
                        if(files.Length==0)
                        {
                            DeleteUploadDirectory(sPath);
                        }
                        return Message = fileName + Constants.DeletedSuccessfully;
                    }
                    else
                        return Message = fileName + Constants.CannotBeDeleted;
                }
            }
            catch (Exception)
            {
                return Message = fileName + Constants.CannotBeDeleted;
            }
        }

        /// <summary>
        /// This Function Updates the Comments Field of Ticket
        /// </summary>
        /// <param name="ticket">Ticket details</param>
        /// <returns>True or false</returns>
        public string AddComments(Tickets ticket, VerifyActions actions)
        {
            string Message = string.Empty;
            if (ticket != null)
            {
                try
                {
                    EMIETicket emieTicket = new EMIETicket();
                    emieTicket = DbEntity.EMIETickets.Single(o => o.TicketId == ticket.TicketId);
                    EMIETicketsArch emieTicketArch = DbEntity.EMIETicketsArches.Single(o => o.TicketId == ticket.TicketId);
                    //server path where the files are uploaded
                    string configPath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionFailurePath) + ticket.TicketId;

                    //Path where the uploads are present on server location
                    string sPath = string.Empty;
                    sPath = System.Web.Hosting.HostingEnvironment.MapPath(Constants.FileUploadPath) + ticket.TicketId;
                    XMLHelperController xmlHelper = new XMLHelperController();
                    //Populate the approvals class with list of approvals from db 
                    ticket.Approvals = GetApprovers(ticket.TicketId);
                    switch (actions)
                    {
                        //case ("ProductionSuccess"):
                        case VerifyActions.ProductionSuccess:
                            emieTicket.ProductionSuccessComments = ticket.ProductionSuccessComments;
                            emieTicket.FinalCRStatusId = (int)TicketStatus.SignedOff;

                            emieTicketArch.ProductionRollback = false;
                            emieTicketArch.SandboxRollback = false;
                            DbEntity.SaveChanges();

                            ticket.FinalTicketStatus = TicketStatus.SignedOff;
                            CommonFunctions.SendMail(ticket, MailMessageType.SignOff, GetAttachements(sPath));

                            break;

                        case VerifyActions.ProductionFailure:
                            //Requester can only send the failure details to Admin and Group Head, but cannot roll back. 
                            emieTicket.ProductionFailureComments = ticket.ProductionFailureComments;
                            DbEntity.SaveChanges();
                            // Send Mail to Admin and  Group Manager
                            CommonFunctions.SendMail(ticket, MailMessageType.RequestFailedOnProdMachine, GetAttachements(configPath));

                            break;

                        case VerifyActions.ProductionRollback:
                            //If there is a roll back at the production level, the ticket will come back to initiated state, 
                            //and will have to be retested for sandBox verification, and submitted for approval.
                            emieTicket.FinalCRStatusId = (int)TicketStatus.Initiated;
                            DbEntity.EMIETicketAprovals.RemoveRange(DbEntity.EMIETicketAprovals.Where(o => o.TicketId == ticket.TicketId));
                            DbEntity.SaveChanges();

                            Tickets ticketArchProd = ConverEmieTicketToEmieTicketArch(emieTicketArch);
                            xmlHelper.OperationOnXML(ticketArchProd, Operation.ProductionRollback);

                            ticket.FinalTicketStatus = TicketStatus.Initiated;
                            // Send Mail to Admin and  Group Manager
                            CommonFunctions.SendMail(ticket, MailMessageType.RequestRollbackOnProduction, GetAttachements(configPath));
                            DeleteUploadedFilesFromDirectoryOnRollback(ticket.TicketId, null);
                            break;

                        case VerifyActions.SandboxFailure:
                            //For SandBoxFailureComments, user can send only the comments and attachments in the mail                            
                            emieTicket.SandBoxFailureComments = ticket.SandboxFailureComments;
                            DbEntity.SaveChanges();

                            //Send the mail with attachments
                            CommonFunctions.SendMail(ticket, MailMessageType.RequestFailedOnTestMachine, GetAttachements(sPath));

                            break;

                        case VerifyActions.SandboxRollback:
                            //In case of Roll back on Sandbox verification page, the entry should be removed from the Sandbox site list and the request state 
                            //should be “RolledBack”. User will have to raise a new request for adding this URL again, as the URL is already removed from the list                    
                            emieTicket.SandBoxFailureComments = ticket.SandboxFailureComments;
                            emieTicket.FinalCRStatusId = (int)TicketStatus.RolledBack;
                            DbEntity.SaveChanges();

                            Tickets ticketArch = ConverEmieTicketToEmieTicketArch(emieTicketArch);
                            xmlHelper.OperationOnXML(ticketArch, Operation.SandboxRollback);

                            //Send the mail with attachments
                            ticket.FinalTicketStatus = TicketStatus.RolledBack;
                            CommonFunctions.SendMail(ticket, MailMessageType.RequestRollbackOnSandBox, GetAttachements(sPath));

                            break;
                    }
                }
                catch (Exception ex)
                {
                    return Message = Constants.ErrorMessage;
                }

                return Message = Constants.SuccessMessageForActions;
            }

            return string.Empty;
        }

        public void DeleteUploadedFilesFromDirectoryOnRollback(int ticketId, bool? isVerifyPage)
        {
            string sPath = null;
            //get folder access credentials from config file
            GetUploadFileAccessCredentials();

            if (isVerifyPage != null)
            {
                if (isVerifyPage.Value)
                {
                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxSuccessfulPath) + ticketId;
                    DeleteUploadedFilesFromDirectory(sPath);
                    DeleteUploadDirectory(sPath);

                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxFailurePath) + ticketId;
                    DeleteUploadedFilesFromDirectory(sPath);
                    DeleteUploadDirectory(sPath);
                }
                else if (!isVerifyPage.Value)
                {
                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionSuccessfulPath) + ticketId;
                    DeleteUploadedFilesFromDirectory(sPath);
                    DeleteUploadDirectory(sPath);


                    sPath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionFailurePath) + ticketId;
                    DeleteUploadedFilesFromDirectory(sPath);
                    DeleteUploadDirectory(sPath);

                }
            }
            if (isVerifyPage == null)
            {
                sPath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxSuccessfulPath) + ticketId;
                DeleteUploadedFilesFromDirectory(sPath);
                DeleteUploadDirectory(sPath);


                sPath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxFailurePath) + ticketId;
                DeleteUploadedFilesFromDirectory(sPath);
                DeleteUploadDirectory(sPath);


                sPath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionSuccessfulPath) + ticketId;
                DeleteUploadedFilesFromDirectory(sPath);
                DeleteUploadDirectory(sPath);


                sPath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionFailurePath) + ticketId;
                DeleteUploadedFilesFromDirectory(sPath);
                DeleteUploadDirectory(sPath);

            }
        }

        private void DeleteUploadedFilesFromDirectory(string sPath)
        {
            if (Directory.Exists(sPath))
            {
                System.IO.DirectoryInfo directory = new DirectoryInfo(sPath);
                foreach (FileInfo file in directory.GetFiles())
                {
                    file.Delete();
                }
            }
        }

        private void DeleteUploadDirectory(string sPath)
        {
            if (Directory.Exists(sPath))
            {
                System.IO.DirectoryInfo directory = new DirectoryInfo(sPath);
                directory.Delete();
            }
        }

        private Tickets ConverEmieTicketToEmieTicketArch(EMIETicketsArch emieTicketArch)
        {

            if (emieTicketArch.DocMode2 == null)
            {
                emieTicketArch.DocMode2 = new DocMode
                {
                    DocMode1 = null
                };
            }

            if (emieTicketArch.DocMode == null)
            {
                emieTicketArch.DocMode = new DocMode
                {
                    DocMode1 = null
                };
            }

            Tickets ticket = new Tickets
            {
                Application = new Applications
                {
                    AppId = emieTicketArch.AppId,
                    ApplicationName = emieTicketArch.Application.Application1
                },
                AppSiteUrl = emieTicketArch.AppSiteLink,
                DomainOpenInEdge = emieTicketArch.DomainOpenInEdge,
                RequestedBy = new Users
                {
                    UserId = emieTicketArch.CreatedById,
                    UserName = emieTicketArch.User.UserName,
                    Email = emieTicketArch.User.Email
                },
                ChangeType = new ChangeTypes
                {
                    ChangeTypeId = emieTicketArch.ChangeTypeId
                },
                DocMode = new DocModes
                {
                    DocModeId = emieTicketArch.DocModeId,
                    DocModeName = emieTicketArch.DocMode.DocMode1
                },
                X_UAHonor = emieTicketArch.X_UAHonor,
                FinalTicketStatus = (TicketStatus)emieTicketArch.FinalCRStatusId,
                TicketId = emieTicketArch.TicketId,
                SubDomainUrl = emieTicketArch.SubDomainSiteLink,
                SubDomainOpenInEdge = emieTicketArch.SubDomainOpenInEdge,
                SubDomainDocMode = new DocModes
                {
                    DocModeId = emieTicketArch.SubDomainDocModeId,
                    DocModeName = emieTicketArch.DocMode2.DocMode1
                },
                SubDomainX_UAHonor = emieTicketArch.SubDomainX_UAHonor

            };

            return ticket;
        }


        /// <summary>
        /// This function gets all uploaded files
        /// </summary>
        /// <param name="ticketId">ticket id</param>
        /// <returns>list of files</returns>
        public JsonResult GetAllUploadedFiles(int ticketId, bool? isSandboxVerifyPage)
        {

            //get folder access credentials from config file
            GetUploadFileAccessCredentials();

            var ticketSearch = DbEntity.EMIETickets.Where(ticket => ticket.TicketId == ticketId);
            string filePath = null;
            int? finalCRSStatusId = ticketSearch.Select(ticket => ticket.FinalCRStatusId).FirstOrDefault();
            if (isSandboxVerifyPage == false)
            {
                if (finalCRSStatusId == 8)
                {
                    filePath = string.Concat(UNCPath, Constants.FileUploadVerifyProductionSuccessfulPath, ticketId);
                }
            }
            else
            {
                if (finalCRSStatusId == 9)
                    filePath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxFailurePath, ticketId);
                else
                {
                    filePath = string.Concat(UNCPath, Constants.FileUploadVerifySandboxSuccessfulPath, ticketId);
                }
            }

            List<string> uploadedfileName = new List<string>();
            //use unc credentials to upload files
            using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
            {
                if (unc.NetUseWithCredentials(UNCPath, UserName, Domain, Password))
                {
                    if (Directory.Exists(filePath))
                    {
                        string[] files = Directory.GetFiles(filePath);
                        uploadedfileName.Add(filePath);
                        foreach (var file in files)
                        {
                            uploadedfileName.Add(Path.GetFileName(file));
                        }
                    }
                    else
                        return null;
                }
            }
            return Json(uploadedfileName, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// This function gets failure comments
        /// </summary>
        /// <param name="ticketId">ticket id</param>
        /// <returns>list of files</returns>
        public JsonResult GetSandboxFailureComments(int ticketId)
        {
            var emieticket = (from emietckt in DbEntity.EMIETickets
                              where emietckt.TicketId == ticketId
                              select emietckt.SandBoxFailureComments);
            //EMIETicket sandboxFailureComments = (EMIETicket)emieticket[0];
            return Json(emieticket, JsonRequestBehavior.AllowGet);
        }



        /// <summary>
        /// get the list of attchments
        /// </summary>
        /// <param name="sPath"></param>
        /// <returns></returns>
        private List<Attachment> GetAttachements(string sPath)
        {
            List<Attachment> attachments = new List<Attachment>();
            if (Directory.Exists(sPath))
            {

                List<string> UploadedFileNames = Directory.GetFiles(sPath).ToList();

                foreach (var fileName in UploadedFileNames)
                {
                    Attachment attachment = new Attachment(fileName);
                    attachments.Add(attachment);
                }
            }

            return attachments;
        }

        /// <summary>
        /// this function takes the list of the ticket and bind the required counts into the TicketCount Class Properties
        /// and returns the TicketsCount object containing all the required counts
        /// </summary>
        /// <param name="counts">its the list of the Counts Class which contains ticketstatusid ,counts property to keep track of counts of each ticket status</param>
        /// <param name="pending">its approval pending request</param>
        /// <param name="isAllCounts">isAllCounts true means AllTicketCount is going to be bind</param>
        /// <returns>return TicketCounts which contains the ticketStatus along with its counts</returns>
        private TicketsCount BindCounts(Dictionary<int, int> counts, int pending, bool isAllCounts)
        {
            TicketsCount CountList = new TicketsCount();
            foreach (KeyValuePair<int, int> count in counts)
            {
                switch (count.Key)
                {
                    case (int)TicketStatus.Initiated:
                    case (int)TicketStatus.VerifiedOnTestMachine:
                    case (int)TicketStatus.Approved:
                    case (int)TicketStatus.ProductionReady:
                    case (int)TicketStatus.VerificationFailedTestMachine:
                    case (int)TicketStatus.ProductionChangesScheduled:
                        CountList.RequestInitiated += count.Value;
                        CountList.MyRequest += count.Value;
                        break;
                    case (int)TicketStatus.ApprovalPending:
                    case (int)TicketStatus.PartiallyApproved:
                        if (isAllCounts)
                            CountList.PendingApproval += count.Value;
                        CountList.RequestInitiated += count.Value;
                        CountList.MyRequest += count.Value;
                        break;
                    case (int)TicketStatus.Rejected:
                        CountList.RequestRejected = count.Value;
                        CountList.MyRequest += count.Value;
                        break;
                    case (int)TicketStatus.SignedOff:
                        CountList.SignedOff = count.Value;
                        CountList.MyRequest += count.Value;
                        break;
                    case (int)TicketStatus.RolledBack:
                        CountList.RequestRollback = count.Value;
                        CountList.MyRequest += count.Value;
                        break;
                    case (int)TicketStatus.Closed:
                        CountList.MyRequest += count.Value;
                        break;
                }
            }
            if (!isAllCounts)
                CountList.PendingApproval = pending;
            return CountList;
        }

        /// <summary>
        /// This function calculated  the ticket counts for the logged in user 
        /// </summary>
        /// <param name="userId">userid of the logged in user</param>
        /// <returns>List of 'count' class</returns>
        private Dictionary<int, int> GetMyTicketCount(int userId)
        {
            //this query gets all the tickets filed by the logged in user
            Dictionary<int, int> counts = DbEntity.EMIETickets
             .Join(DbEntity.EMIETicketStatus, tickets => tickets.FinalCRStatusId, status => status.TicketStatusId, (ticket, status) => new { ticket, status })
             .Where(ticket => ticket.ticket.CreatedById == userId)
             .GroupBy(finalCrStatus => finalCrStatus.status.TicketStatusId)
             .Select(ticket => new { TicketStatusId = ticket.Key, Counts = ticket.Distinct().Count() }).ToDictionary(t => t.TicketStatusId, t => t.Counts);

            return counts;
        }

        /// <summary>
        /// This function will find all the pending requests under the logged in user
        /// </summary>
        /// <param name="userId">userid of logged inuser</param>
        /// <param name="isEmieChamp">if user is emie champ it will be true</param>
        /// <returns>returns all the pending requests against logged in user</returns>
        private int GetMyPendingCounts(int userId, bool isEmieChamp)
        {
            int myPendingRequests = 0;
            //finding all the roles of the logged in user which are in active state
            var loggedInUserRoles = ((from userrole in DbEntity.UserRoleBPUMappings where userrole.UserId == userId && userrole.IsActive == true select new { userrole.ID, Role = userrole.Role.RoleName }).ToList());

            //this query will get all the tickets which are in pending state against the logged in user for all the roles he/she have
            var PendingRequests = (from approval in DbEntity.EMIETicketAprovals
                                   join ticket in DbEntity.EMIETickets
                                   on approval.TicketId equals ticket.TicketId
                                   where (approval.UserRoleBPUMapping.UserId == userId && approval.UserRoleBPUMapping.IsActive == true && approval.TicketStateId == (int)ApprovalState.Pending && (ticket.FinalCRStatusId == (int)TicketStatus.ApprovalPending ||
                                   ticket.FinalCRStatusId == (int)TicketStatus.PartiallyApproved))
                                   select new { ticketId = approval.TicketId, Role = approval.UserRoleBPUMapping.Role.RoleName }).ToList();
            //this query gets all the pending tickets which are in pending state for the roles other than the "EMIE champion role"
            var pendingtickets = (from pending in PendingRequests join roles in loggedInUserRoles on pending.Role equals roles.Role where pending.Role != Constants.EMIEChampion select new { ticketId = pending.ticketId, Role = pending.Role }).Distinct().ToList();

            //if the logged in user is emie champ and a particular ticket is assigned to him/her which is actually in pending state at their end
            //but That particular ticket is already approved by another emiechamp them ticket will be considered as approved and That ticket will be
            //removed from the pending list of the logged in user below is the process to remove
            if (isEmieChamp)
            {
                var approvedRequests = (from approval in DbEntity.EMIETicketAprovals
                                        join user in DbEntity.UserRoleBPUMappings on approval.UserRoleBPUMappingId equals user.ID
                                        join role in DbEntity.Roles on user.RoleId equals role.RoleId
                                        where (approval.TicketStateId == (int)ApprovalState.Approved && role.RoleName.Equals(Constants.EMIEChampion))
                                        select new { ticketId = approval.TicketId, Role = approval.UserRoleBPUMapping.Role.RoleName }).ToList();

                //check if the pending request for logged in user is already approved by another emie champ then ignore that ticketid
                var requests = PendingRequests.Except(approvedRequests.Distinct()).ToList();
                //if the EMIE champion has other roles as well add pending tickets for those roles as well into the pending tikcets list and then get the final count
                if (loggedInUserRoles.Count > 1 && pendingtickets.Count != 0)
                    requests = requests.Union(pendingtickets).ToList();
                myPendingRequests = requests.Select(o => o.ticketId).ToList().Distinct().Count();
            }
            //for Group Head and App Manager we can show the count directly no need to remove
            else
                myPendingRequests = pendingtickets.Select(o => o.ticketId).ToList().Distinct().Count();

            return myPendingRequests;
        }

        /// <summary>
        /// This method calculate the allticket count for all the tickets logged by the active users
        /// </summary>
        /// <returns>List of 'count' class</returns>
        private Dictionary<int, int> GetAllTicketCount()
        {
            //this query gets all the tickets from the database for active and inactive users
            Dictionary<int, int> counts = (from ticket in DbEntity.EMIETickets
                                           group ticket.TicketId by ticket.FinalCRStatusId into g
                                           select new
                                           {
                                               TicketStatusId = g.Key.Value,
                                               Counts = g.Distinct().Count()
                                           }).ToDictionary(t => t.TicketStatusId, t => t.Counts);

            return counts;
        }


        /// <summary>
        /// Following is a method to retreive count of different states from the database. 
        /// </summary>
        /// <param name="userId"></param>
        /// <returns>List of TicketsCount objects which are containg ticket counts for the logged in user and also for all active users</returns>
        public JsonResult GetAllCounts(int userId)
        {
            UserController userController = new UserController();
            Users loggedUser = userController.GetUser(userId);
            bool isEmieChamp = false;
            TicketsCount allCountList = new TicketsCount();
            TicketsCount myCountList = new TicketsCount();
            int allPendingRequests = 0; int myPendingRequests = 0;
            List<TicketsCount> BindAllCountList = new List<TicketsCount>();
            try
            {
                //finding whether the user is emie champion
                if (loggedUser.UserRole.RoleId == (int)Common.UserRole.EMIEChampion)
                {
                    isEmieChamp = true;
                }

                //Calling the GetMyPendingCounts function to get pending requests at logged in user's end
                myPendingRequests = GetMyPendingCounts(userId, isEmieChamp);

                //binding the counts of the myrequest into the TicketCount class object 
                myCountList = BindCounts(GetMyTicketCount(userId), myPendingRequests, false);

                //binding the counts of the allrequest in TicketCount class object
                allCountList = BindCounts(GetAllTicketCount(), allPendingRequests, true);

                //adding counts to send to the calling angular service
                BindAllCountList.Add(myCountList);
                if (isEmieChamp)
                    BindAllCountList.Add(allCountList);
            }
            catch (Exception)
            {
                throw;
            }
            return Json(BindAllCountList, JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// Method to fetch list of tickets with given ticket status id
        /// </summary>
        /// <param name="ticketStatus">ticket status (Final CR status)</param>
        /// <returns>List of tickets with given status</returns>
        public List<Tickets> GetTicketsDataByTicketStatus(TicketStatus ticketStatus)
        {
            List<Tickets> lstTickets = new List<Tickets>();
            try
            {
                //This query will get the list of tickets which are tagged to the logged in user and "Pending" tickets.
                List<EMIETicket> ticketList = DbEntity.EMIETickets.Where(ticket => ticket.FinalCRStatusId == (int)ticketStatus).ToList<EMIETicket>();

                //Other information for the tickets will be fetched and added to dictionary in following query
                foreach (var ticket in ticketList)
                {
                    //Adding the ticketid with respective information in the dictionary
                    lstTickets.Add(GetTicketObjectData(ticket.TicketId));
                }
                return lstTickets;
            }
            catch (Exception)
            {
                throw;
            }
            return null;

        }

        /// <summary>
        /// Method to update ticket status of given ticket
        /// </summary>
        /// <param name="ticket">ticket item to be updated</param>
        /// <param name="ticketStatus">status of ticket to be set</param>
        /// <returns>true if ticket status is set properly</returns>
        public bool UpdateTicketStatus(Tickets ticket, TicketStatus ticketStatus)
        {
            try
            {
                DbEntity.EMIETickets.Where(tckt => tckt.TicketId == ticket.TicketId).ToList<EMIETicket>().ForEach(t => t.FinalCRStatusId = (int)ticketStatus);
                DbEntity.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Contact support team will get mail of ticket info
        /// </summary>
        /// <param name="listOfApproverIds">List OF Approvals objects</param>
        /// <param name="ticket">Ticket Object</param>
        public void ContactSupportTeam(Tickets ticket, string contactSupportEmail)
        {
            try
            {
                //add contactSupportEmail to ticket object
                ticket.ContactSupportEmail = contactSupportEmail;
                CommonFunctions.SendMail(ticket, MailMessageType.ContactSupportTeam);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// method to download attachment form unc path
        /// </summary>
        /// <param name="downloadedPath">file path</param>
        /// <returns></returns>
        public JsonResult DownLoadAttachment(string downloadedPath)
        {
            List<string> dataInList = new List<string>();
            using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
            {
                if (unc.NetUseWithCredentials(UNCPath, UserName, Domain, Password))
                {
                    string isTextFile = Path.GetExtension(downloadedPath);
                    if (isTextFile == ".txt")
                    {
                        string[] lines = System.IO.File.ReadAllLines(downloadedPath);
                        string strdata = "";
                        // Display the file contents by using a foreach loop.
                        System.Console.WriteLine("Contents of WriteLines2.txt = ");
                        foreach (string line in lines)
                        {
                            strdata = strdata + line;
                            strdata = strdata + "\n";
                        }
                        dataInList.Add("true");//true if file is textfile
                        dataInList.Add(strdata);
                        return Json(dataInList, JsonRequestBehavior.AllowGet);
                    }
                    else//for the image files
                    {
                        FileInfo fileInfo = new FileInfo(downloadedPath);
                        // The byte[] to save the data in
                        byte[] data = new byte[fileInfo.Length];
                        using (FileStream fs = fileInfo.OpenRead())
                        {
                            fs.Read(data, 0, data.Length);
                        }
                        string strdata = Convert.ToBase64String(data);
                        dataInList.Add("false");//false if file is other than textfile
                        dataInList.Add(strdata);
                        return Json(dataInList, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                    return null;
            }

        }

    }
}