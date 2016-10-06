using EMIEWebPortal.DataModel;
using EMIEWebPortal.Common;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Security.Cryptography;
using System.IO;
using EMIEWebPortal.Controllers;

namespace EMIEWebPortal.Controllers
{

    /// <summary>
    /// Controller class for Configurations which has all DB interactions related to Configurations Settings
    /// </summary>
    public class ConfigurationController : Controller
    {
        /// <summary>
        /// DB entity for database operations
        /// </summary>
        private LOBMergedEntities DbEntity = new LOBMergedEntities();
        //Logger object to log data in DB
        LoggerController LoggerObj = new LoggerController();
        UserController userCntrlObj = new UserController();

        //Datamodel Logger object which would be returned from logger controller and saved here in DB
        Logger logger = new Logger();

        // GET: Ticket
        public ActionResult Index()
        {
            return View();
        }

        #region Configuration
        /// <summary>
        /// Checks if the UNC path has the access
        /// </summary>
        /// <param name="keyValueData">key value pair for Username, UserDomain, UNC Path, Password</param>
        /// <returns>Bool</returns>
        public bool CheckUNCAccess(List<ConfigurationData> keyValueData)
        {
            Configuration configuration = new Configuration();
            configuration.ConfigSettings = keyValueData;

            string UNC = null;
            string domain = null;
            string username = null;
            string password = null;
            #region Validations

            //Validations
            if (configuration == null)
                return false;

            if (!ModelState.IsValid) { return false; }
            #endregion Validations
            foreach (ConfigurationData obj in configuration.ConfigSettings)
            {
                if (obj.key == ConfigConstants.UploadAttachmentsLocation || obj.key == ConfigConstants.ConfigurationSettingsLocation)
                    UNC = obj.value.ToString();

                if(obj.key == ConfigConstants.SandboxEnvironment || obj.key == ConfigConstants.ProductionEnvironment)
                {
                    int index = obj.value.ToString().LastIndexOf('\\');
                    UNC = obj.value.ToString().Substring(0, index);
                }

                if (obj.key == ConfigConstants.SandboxUserDomain || obj.key == ConfigConstants.ProductionUserDomain || obj.key == ConfigConstants.UploadAttachmentUserDomain || obj.key == ConfigConstants.ConfigurationSettingsUserDomain)
                    domain = obj.value.ToString();

                if (obj.key == ConfigConstants.SandboxUserName || obj.key == ConfigConstants.ProductionUserName || obj.key == ConfigConstants.UploadAttachmentUserName || obj.key == ConfigConstants.ConfigurationSettingsUserName)
                    username = obj.value.ToString();

                if (obj.key == ConfigConstants.SandboxPassword || obj.key == ConfigConstants.ProductionPassword|| obj.key == ConfigConstants.UploadAttachmentPassword || obj.key == ConfigConstants.ConfigurationSettingsPassword)
                    password = obj.value.ToString();
            }

            //Check the access to the path
            using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
            {
                if (unc.VerifyAccessWithCredentials(UNC, username, domain, password))
                {
                    return true;
                }
                else
                    return false;
            }
        }


        /// <summary>
        /// Method to add configuration data to DB
        /// </summary>
        /// <Param>keyValueData : list of configuration items and its values </Param>
        /// <Param>createdby</Param>
        /// <returns></returns>        
        public JsonResult AddConfigurationSetting(List<ConfigurationData> keyValueData, Users createdBy)
        {

            try
            {
                Configuration configuration = new Configuration();
                configuration.ConfigSettings = keyValueData;
                configuration.CreatedBy = createdBy;

                #region Validations

                //Validations
                if (configuration == null)
                    return Json(-1, JsonRequestBehavior.AllowGet);

                if (!ModelState.IsValid) { return Json(-1, JsonRequestBehavior.AllowGet); }
                #endregion Validations

                //Copy Ticket object details to EMIETicket object which would be saved to db
                #region Copy Data to EMIEConfiguration

                //Configuration object
                //Below code will set isactive= false for the previous configuration entries
                DbEntity.EMIEConfigurationSettings.Where(c => c.IsActive == true && c.ConfigItem != ConfigConstants.EMIEAdminUserName && c.ConfigItem != ConfigConstants.EMIEAdminPassword).ToList<EMIEConfigurationSetting>().ForEach(a => a.IsActive = false);

                //Below code will add the new configuration entry to the database
                foreach (ConfigurationData obj in configuration.ConfigSettings)
                {
                    EMIEConfigurationSetting dbConfig = new EMIEConfigurationSetting();
                    dbConfig.ConfigItem = obj.key;
                    if (obj.key == ConfigConstants.SandboxUserName || obj.key == ConfigConstants.SandboxPassword || obj.key == ConfigConstants.ProductionUserName || obj.key == ConfigConstants.ProductionPassword
                        || obj.key == ConfigConstants.UploadAttachmentUserName || obj.key == ConfigConstants.UploadAttachmentPassword || obj.key == ConfigConstants.ConfigurationSettingsUserName ||
                        obj.key == ConfigConstants.ConfigurationSettingsPassword || obj.key == ConfigConstants.EmailUserName || obj.key == ConfigConstants.EmailPassword)
                        dbConfig.ConfiguredValue = Encrypt(obj.value.ToString());
                    else
                    {
                        if(obj.value == null)
                        dbConfig.ConfiguredValue = null;
                        else
                            dbConfig.ConfiguredValue = obj.value.ToString();

                    }
                    dbConfig.CreatedById = configuration.CreatedBy.UserId;
                    dbConfig.CreatedDate = DateTime.Now;
                    dbConfig.IsActive = true;
                    DbEntity.EMIEConfigurationSettings.Add(dbConfig);
                }

                #endregion Copy Data to EMIEConfiguration

                //Save ticket to DB               
                #region Add and save

                //Save changes to database
                DbEntity.SaveChanges();

                #endregion Add and save

                //restore the static variable with latest values of configsettings
                LoginController.config = GetConfiguration();

                #region Send mail
                //Send mail 

                using (UserController userController = new UserController())
                {
                    List<Users> emieUsers = userController.GetAllUsersOfRole(UserRole.EMIEChampion);

                    CommonFunctions.SendMail(null, MailMessageType.ConfigurationSettingsEdited, null, null, null, null, configuration, emieUsers);
                }
                #endregion Send mail


                #region Logger
                //This logic has to be checked while raising the ticket
                string UserName = DbEntity.Users.Where(o => o.UserId == configuration.CreatedBy.UserId).Select(o => o.UserName).FirstOrDefault().ToString();

                string description = string.Format(Constants.ConfigSettings, UserName);

                //Create Logger object 
                Loggers loggers = new Loggers
                {
                    ActionMethod = Constants.ConfigurationSettingsAddedMethod,
                    Description = description,
                    Operation = "Insert",
                    UserID = configuration.CreatedBy.UserId
                };

                logger = LoggerObj.LoggerMethod(loggers);
                DbEntity.Loggers.Add(logger);

                //Save database changes

                DbEntity.SaveChanges();

                #endregion

              

                //return ticket ID
                //return dbTicket.TicketId;
                return Json(1, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }
        }


        /// <summary>
        /// Method to get active configuration settings (key-values) from DB ,returns JSonResult
        /// </summary>
        /// <returns>Configuration object's JsonResult</returns>

        public JsonResult GetConfigSettings()
        {
            try
            {
                Configuration config = new Configuration();
                if (LoginController.config == null)
                {
                    config = GetConfiguration();
                }
                else
                {
                    config = LoginController.config;
                }
                if (config != null)
                    return Json(config, JsonRequestBehavior.AllowGet);
                else
                    return Json(-1, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Method to get active configuration settings (key-value) from DB
        /// </summary>
        /// <returns>configuration object</returns>
        public Configuration GetConfiguration()
        {
            //Copy Ticket object details to EMIETicket object which would be saved to db
            #region Configuration

            //Configuration object            
            var data = DbEntity.EMIEConfigurationSettings.Where(c => c.IsActive == true).ToList();

            if (data.Count != 0)
            {

                using (UserController userController = new UserController())
                {
                    Configuration config = new Configuration();
                    List<ConfigurationData> configData = new List<ConfigurationData>();

                    foreach (EMIEConfigurationSetting dbConfig in data)
                    {
                        ConfigurationData configItem = new ConfigurationData();
                        configItem.key = dbConfig.ConfigItem;
                        if (configItem.key == ConfigConstants.SandboxUserName || configItem.key == ConfigConstants.SandboxPassword
                            || configItem.key == ConfigConstants.ProductionUserName || configItem.key == ConfigConstants.ProductionPassword
                            || configItem.key == ConfigConstants.UploadAttachmentUserName || configItem.key == ConfigConstants.UploadAttachmentPassword
                            || configItem.key == ConfigConstants.ConfigurationSettingsUserName || configItem.key == ConfigConstants.ConfigurationSettingsPassword ||
                            configItem.key == ConfigConstants.EmailUserName || configItem.key == ConfigConstants.EmailPassword)
                            configItem.value = Decrypt(dbConfig.ConfiguredValue);
                        else
                            configItem.value = dbConfig.ConfiguredValue;
                        configData.Add(configItem);
                        if (dbConfig.CreatedById != null)
                        {
                            config.CreatedBy = userController.GetUser((int)dbConfig.CreatedById);
                        }
                        config.CreatedDate = dbConfig.CreatedDate;
                    }

                    config.ConfigSettings = configData;
                     return config;
                }
            }
            #endregion Configuration
            return null;
        }




        //AES Symmetric key (Same key) algorithm 
        /// <summary>
        /// Encrypt Credential data 
        /// </summary>
        /// <param name="cipherText"></param>
        /// <returns></returns>
        public string Encrypt(string clearText)
        {
            string EncryptionKey = "MAKV2SPBNI99212";
            byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }
                    clearText = Convert.ToBase64String(ms.ToArray());
                }
            }
            return clearText;
        }

        /// <summary>
        /// Decrypt Credential data 
        /// </summary>
        /// <param name="cipherText"></param>
        /// <returns></returns>
        public string Decrypt(string cipherText)
        {
            string EncryptionKey = "MAKV2SPBNI99212";
            byte[] cipherBytes = Convert.FromBase64String(cipherText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, 0, cipherBytes.Length);
                        cs.Close();
                    }
                    cipherText = Encoding.Unicode.GetString(ms.ToArray());
                }
            }
            return cipherText;
        }

        /// <summary>
        /// This functions edits the rolename in the database the new name should reflect everywhere after the updation
        /// </summary>
        /// <param name="newName">this is the new name to be update to</param>
        /// <param name="oldName">this is the old name of the role which will get updated to newname</param>
        /// <param name="oldName">if true means requster must have to get approval from the mandatory Approver</param>
        public void EditRoleName(string newName, string oldName, bool IsMandatory)
        {
            try
            {
                var result = DbEntity.Roles.SingleOrDefault(o => o.RoleName == oldName);
                if (result != null)
                {
                    if (newName != null)
                    result.RoleName = newName;
                    result.MandatoryApproval = IsMandatory;
                }
                DbEntity.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

       //code is commented for now might have use in future
        /// <summary>
        /// This method will update the mandatory Approval roles 
        /// </summary>
        /// <param name="roleList">roleList contains all the roles including the roles which needs to be updated</param>
        //public void updateMandatoryRoles(List<Roles> roleList)
        //{
        //    try
        //    {

        //        foreach(Roles role in roleList)
        //        {
        //            if(!role.RoleName.Equals(Constants.EMIEChampion))
        //            {
        //                var result = DbEntity.Roles.SingleOrDefault(o=>o.RoleName==role.RoleName);
        //                if(result!=null)
        //                {
        //                    result.MandatoryApproval = role.MandatoryApproval;
        //                }
        //            }
        //        }

        //        DbEntity.SaveChanges();
        //    }
        //    catch (Exception e)
        //    {
        //        throw e;
        //    }
        //}
        #endregion Add Configuration

               
        /// <summary>
        /// Gets the group head Username and Email of the particular BPU
        /// </summary>
        /// <param name="bpus">BPU model object particularly BPU ID</param>
        /// <returns>JSON result of a list containing UserName and EMail</returns>
        public JsonResult GetGroupHead(BPUs bpus)
        {
            try
            {
                var Userdetails = DbEntity.Users
                           .Join(DbEntity.UserRoleBPUMappings, userrolebpumapping => userrolebpumapping.UserId, user => user.UserId, (user, userrolebpumapping) => new { userrolebpumapping, user })
                           .Join(DbEntity.BPUs, result => result.userrolebpumapping.BPUId, bpu => bpu.BPUId, (result, bpu) => new { result, bpu })
                           .Where(final => final.result.userrolebpumapping.BPUId == bpus.BPUId && final.result.userrolebpumapping.RoleId == (int)UserRole.GroupHead)
                            .Select(finalresult => new
                            {
                                UserName = finalresult.result.user.UserName,
                                EmailId = finalresult.result.user.Email,
                                IsActive = finalresult.bpu.IsActive
                            }).ToList().FirstOrDefault();

                if (Userdetails == null)
                {
                    var BpuDetails = DbEntity.BPUs
                           .Where(final => final.BPUId == bpus.BPUId)
                            .Select(finalresult => new
                            {
                                IsActive = finalresult.IsActive
                            }).ToList().FirstOrDefault();
                    return Json(BpuDetails, JsonRequestBehavior.AllowGet);
                }

                return Json(Userdetails, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                throw;
            }
        }

        /// <summary>
        /// This method add new group to the database if do not exist before, with given user as the group head
        /// </summary>
        /// <param name="userRole">UserMapping object</param>
        /// <param name="action">Insert user</param>
        /// <returns></returns>
        public bool AddNewGroup(UserMapping userRole, Operation action)
        {
            try
            {
                bool isGroupPresent = DbEntity.BPUs.Any(o => o.BPU1.Equals(userRole.User.UserBPU.BPU1));

                if (isGroupPresent == false)
                {
                    DbEntity.BPUs.Add(new BPU
                    {
                        BPU1 = userRole.User.UserBPU.BPU1.ToUpper(),
                        IsActive = userRole.User.UserBPU.IsActive
                    });

                    DbEntity.SaveChanges();

                    var userRoleDB = DbEntity.Roles.Where(role => role.RoleId == (int)UserRole.GroupHead).FirstOrDefault();
                    userRole.RoleId = userRoleDB.RoleId;
                    userRole.User.UserRole = new Roles
                    {
                        RoleId = userRoleDB.RoleId,
                        RoleName = userRoleDB.RoleName
                    };

                    var groupId = DbEntity.BPUs.Where(group => group.BPU1.Equals(userRole.User.UserBPU.BPU1)).FirstOrDefault();
                    userRole.User.BPUId = groupId.BPUId;

                    userCntrlObj.AddUser(userRole, action);

                    return true;
                }
            }
            catch (Exception)
            {

                throw;
            }

            return false;
        }

        /// <summary>
        /// This method edit group name and isactive to the database
        /// </summary>
        /// <param name="userRole">UserMapping object</param>
        /// <returns></returns>
        public bool EditGroup(UserMapping userRole)
        {
            bool result = false;
            try
            {
                BPU bpuObj = DbEntity.BPUs.Where(id => id.BPUId == userRole.User.UserBPU.BPUId).First();

                if (userRole.User.UserBPU.BPU1 != null)
                    bpuObj.BPU1 = userRole.User.UserBPU.BPU1.ToUpper();
                bpuObj.IsActive = userRole.User.UserBPU.IsActive;
                bpuObj.ModifiedById = userRole.User.UserBPU.ModifiedById;

                result = Convert.ToBoolean(DbEntity.SaveChanges());

            }
            catch (Exception)
            {

            }

            return result;
        }


        /// <summary>
        ///Method to get all active or inactive BPUs
        /// </summary>
        /// <returns>List of BPUs</returns>
        public JsonResult GetAllGroupList()
        {
            var bpuList = DbEntity.BPUs.Where(id=>id.BPUId > 0).Select(ch => new BPUs
            {
                BPUId = ch.BPUId,
                BPU1 = ch.BPU1
            }).OrderBy(x => x.BPU1).Distinct();

            return Json(bpuList, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Returns the roles information
        /// </summary>
        /// <returns></returns>
        public JsonResult GetRoles()
        {

            IQueryable<Roles> roles = null;

            roles = DbEntity.Roles.Where(id => id.RoleId > (int)UserRole.Requester).Select(role => new Roles
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                RolePriority = role.RolePriority,
                RoleDetails = role.RoleDetails,
                MandatoryApproval = role.MandatoryApproval
            });

            return Json(roles, JsonRequestBehavior.AllowGet);
        }


        
    }



}