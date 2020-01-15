using EMIEWebPortal.DataModel;
using EMIEWebPortal.Common;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.DirectoryServices.ActiveDirectory;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EMIEWebPortal.Controllers
{

    public class UserController : Controller
    {
        /// <summary>
        /// This region will contain all the private variables 
        /// </summary>
        #region PrivateVariables
        private LOBMergedEntities DbEntity = new LOBMergedEntities();
        LoggerController LoggerObj = new LoggerController();
        private string description = null;
        Logger logger = new Logger();
        #endregion

        /// <summary>
        /// This region will contain all the public methods
        /// </summary>
        #region Public Methods


        // GET: User
        public ActionResult Index()
        {
            return View();
        }

        #region GetAll Users
        /// <summary>
        /// method to get all users
        /// </summary>
        /// <returns>list of users</returns>
        public JsonResult GetAllUsers()
        {
            try
            {
                List<UserMapping> userList = GetAllUserRoleData();
                return Json(userList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Get ActiveDirectory user from All domains
        /// </summary>
        /// <param name="userName">Alias of user</param>
        /// <returns>List of active directory users</returns>
        public JsonResult GetADUserFromAllDomain(string userName)
        {
            if (userName != null)
            {
                List<ADUsers> aduserlist = GetUserFromDifferentDomain(userName);
                if (aduserlist.Count <= 0)
                {
                    string resultString = string.Format(Constants.UserNotFound, userName);
                    return Json(resultString, JsonRequestBehavior.AllowGet);
                }
                else
                    return Json(aduserlist, JsonRequestBehavior.AllowGet);
            }
            else
            {
                string resultString = string.Format(Constants.UserNotFound, userName);
                return Json(resultString, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        ///Helper method  Get ActiveDirectory user from All domains
        /// </summary>
        /// <param name="UserName">Alias of user</param>
        /// <returns>List of active directory users</returns>
        private List<ADUsers> GetUserFromDifferentDomain(string userName)
        {
            List<ADUsers> userlist = new List<ADUsers>();
            string user = userName.Trim('"');
            int count = 0;
            foreach (string domain in GetDomains())
            // From the domains obtained from the Forest, we search the domain subtree for the given userName.
            {
                string pathNameDomain = "LDAP://" + domain;  /// this can be taken dynamically 
                try
                {
                    using (DirectoryEntry direcotyEntry = new DirectoryEntry(pathNameDomain))
                    {

                        DirectorySearcher directorySearcher = new DirectorySearcher(direcotyEntry)
                           {
                               //need this comment for future
                               //Filter = "(&(objectClass=user)(sAMAccountName=" + user + "))"
                               // Filter = "(&(objectClass=user)(mail=" + user + "*))"
                               Filter = "(&(objectClass=user)(|(mail=" + user + "*)(displayname=" + user + "*)))"
                           };

                        System.DirectoryServices.SearchResultCollection results = directorySearcher.FindAll();

                        // If the user cannot be found, then let's check next domain.
                        if (results == null || results.Count == 0)
                            continue;
                        // Here, we yield return for we want all of the domain which this userName is authenticated.

                        foreach (SearchResult searchResult in results)
                        {
                            if (searchResult.Properties.Contains("mail"))
                            {
                                var email = searchResult.Properties["mail"][0].ToString();
                                int ispresent = userlist.Where(x => x.Email.Equals(email)).Count();
                                if (ispresent == 0)
                                {
                                    userlist.Add(new ADUsers
                                    {
                                        Email = searchResult.Properties["mail"][0].ToString(),
                                        DisplayName = searchResult.Properties["displayname"][0].ToString(),
                                        UserName = searchResult.Properties["samaccountname"][0].ToString()
                                    });
                                    count++;
                                }
                            }
                        }
                    }
                }
                catch (Exception)
                {
                    throw;
                }
            }
            return userlist;
        }

        /// <summary>
        /// Helper method to get all domains from forest
        /// </summary>
        /// <returns>lis of domains</returns>
        private List<string> GetDomains()
        {
            List<string> domains = new List<string>();

            // Querying the current Forest for the domains within.
            foreach (Domain d in Forest.GetCurrentForest().Domains)
                domains.Add(d.Name);

            return domains;
        }


        /// <summary>
        /// Method to get All user role data
        /// </summary>
        /// <returns>list of users with role</returns>
        private List<UserMapping> GetAllUserRoleData()
        {
            try
            {
                var UserRoleDataList = (from usersdata in DbEntity.Users
                                        join userrolebpudata in DbEntity.UserRoleBPUMappings on usersdata.UserId equals userrolebpudata.UserId
                                        join roledata in DbEntity.Roles on userrolebpudata.RoleId equals roledata.RoleId
                                        join bpudata in DbEntity.BPUs on userrolebpudata.BPUId equals bpudata.BPUId
                                        //where usersdata.IsActive==true 
                                        select new { UserRoleBPUMapping = userrolebpudata, User = usersdata, Role = roledata, BPU = bpudata });

                List<UserMapping> userRoledata = new List<UserMapping>();
                foreach (var item in UserRoleDataList)
                {

                    userRoledata.Add(new UserMapping()
                    {
                        User = new Users
                        {
                            UserName = item.User.UserName,
                            UserId = item.User.UserId,
                            Email = item.User.Email,
                            IsActive = item.User.IsActive,
                            CreatedById = item.User.CreatedById,
                            CreatedDate = item.User.CreatedDate,
                            ModifiedById = item.User.ModifiedById,
                            ModifiedDate = item.User.ModifiedDate,
                            UserBPU = new BPUs { BPU1 = item.BPU.BPU1, BPUId = item.BPU.BPUId },
                            UserRole = new Roles { RoleId = item.Role.RoleId, RoleName = item.Role.RoleName }
                        },
                        Id = item.UserRoleBPUMapping.ID,
                        RoleId = item.Role.RoleId,
                        UserId = item.User.UserId,
                        IsActive = item.UserRoleBPUMapping.IsActive,
                        MappingDetails = item.UserRoleBPUMapping.MappingDetails,
                        IsRegistered = item.UserRoleBPUMapping.IsRegistered,
                        ModifiedDate = item.UserRoleBPUMapping.ModifiedDate
                    });
                }
                userRoledata = userRoledata.OrderByDescending(userrole => userrole.ModifiedDate).ToList<UserMapping>();

                return userRoledata;
            }
            catch (Exception)
            {
                throw;
            }
        }

        #endregion

        #region Get All Roles
        /// <summary>
        /// method to get all roles from role table
        /// </summary>
        /// <returns>list of roles</returns>
        public JsonResult GetAllRoles()
        {
            try
            {
                List<Roles> roleList = GetAllRoleData();
                if (roleList != null)
                    return Json(roleList, JsonRequestBehavior.AllowGet);
                else
                    return Json(Constants.NoRolesFound, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }

        }

        /// <summary>
        /// method to get all role data
        /// </summary>
        /// <returns>list of roles</returns>
        private List<Roles> GetAllRoleData()
        {
            try
            {
                var RoleList = DbEntity.Roles.Select(role => new Roles()
                {
                    RoleId = role.RoleId,
                    RoleName = role.RoleName,
                    RolePriority = role.RolePriority
                });
                return RoleList.ToList<Roles>();
            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion

        #region New/Edit/Delete User

        /// <summary>
        /// Method to create/update change request
        /// </summary>
        /// <Param>ticket : Ticket to be added or updated</Param>
        /// <Param>action : Insert/Update/Delete</Param>
        /// <returns>Ticket ID</returns>        
        public JsonResult AddUser(UserMapping user, Operation action, UserMapping oldUser = null, bool? activation = null)
        {

            string result = null;
            try
            {
                //If it is a new User
                if (action == Operation.Insert)
                {
                    result = InsertUser(user);
                }
                else if (action == Operation.Delete)
                {
                    result = DeactivateUser(user, activation, false);
                }
                else
                {
                    result = EditUser(user, oldUser);
                }
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Method to edit selected user
        /// </summary>
        /// <param name="user">user with new editable values</param>
        /// <param name="oldUser">selected user to edit</param>
        /// <returns>result of edit operation</returns>
        private string EditUser(UserMapping user, UserMapping oldUser)
        {
            try
            {
                user.User.CreatedByUser = GetUser((int)user.User.CreatedById);
                string resultInSTring = null;
                bool result = false;
                int count = DbEntity.UserRoleBPUMappings.Where(userfrmtbl => userfrmtbl.RoleId == user.User.UserRole.RoleId && userfrmtbl.BPUId == user.User.UserBPU.BPUId && userfrmtbl.UserId == user.User.UserId).Count();
                //check if user with edited values are same with old value then don't edit it
                if (count > 0)
                {
                    if (user.IsActive != oldUser.IsActive)
                    {
                        UserRoleBPUMapping userwithRoleBPU = DbEntity.UserRoleBPUMappings.Where(o => o.ID == oldUser.Id).FirstOrDefault();
                        user.Id = userwithRoleBPU.ID;
                        var operationsInBool = user.IsActive;
                        if (operationsInBool.Equals(false))
                        {
                            oldUser.User.ModifiedById = user.User.ModifiedById;
                            DeactivateUser(oldUser, false, true);
                            user.IsActive = false;
                            resultInSTring = Constants.UserDeactivatedSuccessfully;
                        }
                        else
                        {
                            oldUser.User.ModifiedById = user.User.ModifiedById;
                            DeactivateUser(oldUser, true, true);
                            user.IsActive = true;
                            resultInSTring = Constants.UserActivatedSuccessfully;
                        }
                        result = Convert.ToBoolean(DbEntity.SaveChanges());
                        #region Send mail
                        //Send mail                      

                        if (user.IsActive == false)
                        {
                            user.User.IsActive = false;
                            SendEmailToAllEMIEUsers(MailMessageType.UserDeactivated, user.User);
                        }
                        else
                        {
                            user.User.IsActive = true;
                            SendEmailToAllEMIEUsers(MailMessageType.UserActivated, user.User);
                        }

                        #endregion Send mail

                    }
                    else
                    {
                        if (user.MappingDetails != oldUser.MappingDetails)
                        {
                            UserRoleBPUMapping userwithRoleBPU = DbEntity.UserRoleBPUMappings.Where(o => o.ID == oldUser.Id).FirstOrDefault();
                            userwithRoleBPU.MappingDetails = user.MappingDetails;
                            result = Convert.ToBoolean(DbEntity.SaveChanges());
                            resultInSTring = Constants.UserEditedSuccessfully;
                            user.User.IsActive = user.IsActive;
                            SendEmailToAllEMIEUsers(MailMessageType.UserEdited, user.User);
                        }
                        else
                            resultInSTring = String.Format(Constants.UnableToEditDuplicateUser, user.User.UserRole.RoleName, user.User.UserBPU.BPU1);
                    }
                }
                else
                {
                    UserRoleBPUMapping userwithRoleBPU = DbEntity.UserRoleBPUMappings.Where(o => o.ID == oldUser.Id).FirstOrDefault();

                    if (!userwithRoleBPU.IsActive.Equals(user.IsActive))
                    {
                        user.Id = userwithRoleBPU.ID;
                        DeactivateUser(user, user.IsActive, true);
                    }
                    userwithRoleBPU.BPUId = user.User.UserBPU.BPUId;
                    userwithRoleBPU.RoleId = user.User.UserRole.RoleId;
                    userwithRoleBPU.MappingDetails = user.MappingDetails;
                    userwithRoleBPU.ModifiedById = user.User.CreatedById;
                    userwithRoleBPU.ModifiedDate = DateTime.Now;
                    result = Convert.ToBoolean(DbEntity.SaveChanges());
                    resultInSTring = Constants.UserEditedSuccessfully;

                    if (!result)
                        resultInSTring = Constants.UnableToEditUser;

                    user.User.IsActive = user.IsActive;

                    SendEmailToAllEMIEUsers(MailMessageType.UserEdited, user.User);
                }

                return resultInSTring;

            }
            catch (Exception)
            {
                throw;
            }
        }

        //method to send email to all emie users
        private void SendEmailToAllEMIEUsers(MailMessageType mailMessageType, Users users)
        {
            using (UserController userController = new UserController())
            {
                List<Users> emieUsers = userController.GetAllUsersOfRole(UserRole.EMIEChampion);

                CommonFunctions.SendMail(null, mailMessageType, null, users, null, null, null, emieUsers);
            }
        }


        /// <summary>
        /// Method to delete user
        /// </summary>
        /// <param name="user">selected user to delete</param>
        /// <returns>result of delete operation</returns>
        private string DeactivateUser(UserMapping user, bool? activateValue, bool? isUSerEdited)
        {
            try
            {
                if (user != null)
                {
                    bool? IsUserRegister = user.IsRegistered;

                    //Getting the particular row and mapping it to the object of the table.
                    UserRoleBPUMapping userRoleBPUMapping = DbEntity.UserRoleBPUMappings.Single(o => o.ID == user.Id);
                    //Making the role unvailable for the user by making the isactive state false
                    userRoleBPUMapping.IsActive = activateValue;
                    userRoleBPUMapping.ModifiedById = user.User.ModifiedById;
                    userRoleBPUMapping.ModifiedDate = DateTime.Now;
                    userRoleBPUMapping.CreatedById = user.User.CreatedById;
                    bool result = Convert.ToBoolean(DbEntity.SaveChanges());

                    //check if any more roles are availabel of given user
                    int roleCount = DbEntity.UserRoleBPUMappings.Where(o => o.UserId == user.User.UserId && o.IsActive == true).Count();

                    //if all roles are not active then make the user inctive/active from user table
                    if (roleCount == 0)
                    {
                        ////Getting the particular row and mapping it to the object of the table.
                        User userDB = DbEntity.Users.Single(o => o.UserId == user.User.UserId);
                        //Making the user unvailable by making the isactive state false
                        userDB.IsActive = activateValue;
                        user.IsActive = activateValue;
                        userDB.ModifiedById = user.User.ModifiedById;
                        userDB.ModifiedDate = DateTime.Now;
                    }
                    if (activateValue == true)
                    {
                        ////Getting the particular row and mapping it to the object of the table.
                        User userDB = DbEntity.Users.Single(o => o.UserId == user.User.UserId);
                        //Making the user unvailable by making the isactive state false
                        userDB.IsActive = activateValue;
                        userDB.ModifiedById = user.User.ModifiedById;
                        userDB.ModifiedDate = DateTime.Now;
                        user.IsActive = activateValue;

                        //making isregister value from userrolebpumapping table to 1 after activation
                        if (IsUserRegister == false)
                        {
                            userRoleBPUMapping.IsRegistered = true;
                        }
                    }
                    #region Logger
                    string deletedUserName = DbEntity.Users.Where(o => o.UserId == user.User.UserId).Select(o => o.UserName).FirstOrDefault().ToString();
                    description = string.Format(Constants.DeleteUser, deletedUserName, user.User.CreatedById);
                    Loggers loggers = null;
                    if (activateValue == false)
                    {
                        loggers = new Loggers
                        {
                            ActionMethod = Constants.ActionMethodForDeleteUser,
                            Description = description,
                            Operation = Constants.Delete,
                            UserID = user.User.CreatedById
                        };
                    }
                    else
                    {
                        loggers = new Loggers
                        {
                            ActionMethod = Constants.ActionMethodForActivateUser,
                            Description = description,
                            Operation = Constants.Add,
                            UserID = user.User.CreatedById
                        };
                    }


                    logger = LoggerObj.LoggerMethod(loggers);
                    DbEntity.Loggers.Add(logger);

                    #endregion

                    result = Convert.ToBoolean(DbEntity.SaveChanges());


                    string resultinString = null;
                    if (activateValue == false)
                    {
                        if (result.Equals(true) && isUSerEdited != true)
                        {
                            resultinString = Constants.UserDeactivatedSuccessfully;
                            user.User.CreatedByUser = GetUser((int)user.User.CreatedById);
                            user.User.IsActive = false;

                            SendEmailToAllEMIEUsers(MailMessageType.UserDeactivated, user.User);
                        }
                        else
                            resultinString = Constants.UserDeactivationFailed;
                    }
                    else
                    {
                        if (IsUserRegister == false && result.Equals(true) && isUSerEdited != true)
                        {
                            resultinString = Constants.UserRegisteredSuccessfully;
                            user.User.CreatedByUser = GetUser((int)user.User.CreatedById);
                            user.User.IsActive = user.IsActive;
                            SendEmailToAllEMIEUsers(MailMessageType.UserRegistered, user.User);
                        }
                        else if (result.Equals(true) && isUSerEdited != true)
                        {
                            resultinString = Constants.UserActivatedSuccessfully;
                            user.User.CreatedByUser = GetUser((int)user.User.CreatedById);
                            user.User.IsActive = user.IsActive;
                            SendEmailToAllEMIEUsers(MailMessageType.UserActivated, user.User);
                        }
                        else
                            resultinString = Constants.UserActivationFailed;
                    }

                    return resultinString;
                }
                else return Constants.OperationFailed;
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Method to insert new user with BPU and Role
        /// </summary>
        /// <param name="user">new user value</param>
        /// <returns>result of insert operation</returns>
        private string InsertUser(UserMapping user)
        {
            int NewUserID = 0;
            int newUserCount = 0;
            bool result = false;

            try
            {

                //Here we are checking if this user already exist or not in the user table.
                newUserCount = DbEntity.Users.Where(o => o.Email.Equals(user.User.Email.ToString().Trim())).Count();

                if (newUserCount == 0)
                {
                    NewUserID = CreateNewUser(user);
                    user.UserId = NewUserID;
                }
                //get user  of the user from the table
                User NewUser = DbEntity.Users.Where(o => o.Email.Equals(user.User.Email.ToString().Trim())).FirstOrDefault();

                if (user.User.CreatedById == null)
                {
                    user.User.CreatedById = NewUser.CreatedById;
                }
                int count = DbEntity.UserRoleBPUMappings.Where(o => o.UserId == NewUser.UserId && o.BPUId == user.User.BPUId && o.RoleId == user.User.UserRole.RoleId).Count();
                if (count == 0)
                {

                    DbEntity.UserRoleBPUMappings.Add(new UserRoleBPUMapping
                    {
                        IsActive = user.IsActive,
                        RoleId = user.RoleId,
                        BPUId = user.User.BPUId,
                        CreatedById = user.User.CreatedById,
                        MappingDetails = user.MappingDetails,
                        CreatedDate = DateTime.Now,
                        UserId = NewUser.UserId,
                        ModifiedById = user.User.CreatedById,
                        ModifiedDate = DateTime.Now,
                        IsRegistered = user.IsRegistered
                    });
                    result = Convert.ToBoolean(DbEntity.SaveChanges());
                }
                string resultInString = null;


                if (user.IsRegistered != null)
                {
                    //bool isregisterUser = Boolean.Parse(user.IsRegistered.ToString());

                    if (result)
                    {
                        resultInString = Constants.UserRegistrationSent;
                        #region Send mail
                        //Send mail 
                        user.User.CreatedByUser = GetUser((int)user.User.CreatedById);
                        SendEmailToAllEMIEUsers(MailMessageType.RegistrationRequested, user.User);
                        #endregion Send mail
                    }
                    else
                    {
                        //get user from userRolebpumapping table
                        var userwithRoleBPU = DbEntity.UserRoleBPUMappings.Where(o => o.UserId == NewUser.UserId && o.BPUId == user.User.BPUId && o.RoleId == user.User.UserRole.RoleId).FirstOrDefault();
                        if (userwithRoleBPU.IsActive == true)
                            resultInString = Constants.UserAlreadyRegistered;
                        else
                            resultInString = Constants.UserRegistrationPending;
                    }

                }
                else
                {
                    if (result.Equals(true))
                    {
                        resultInString = Constants.UserAdded;
                        #region Send mail
                        //Send mail 
                        user.User.CreatedByUser = GetUser((int)user.User.CreatedById);
                        user.User.IsActive = user.IsActive;
                        SendEmailToAllEMIEUsers(MailMessageType.UserAdded, user.User);
                        #endregion Send mail

                    }
                    else
                        resultInString = Constants.UserWithDuplicateRole;

                }
                return resultInString;
            }
            catch (Exception)
            {
                throw;
            }
        }


        /// <summary>
        /// Method to create new user in User table
        /// </summary>
        /// <param name="user">New User value</param>
        /// <returns>result of insert operation</returns>
        private int CreateNewUser(UserMapping user)
        {
            var logonId = User.Identity.Name;
            var Index = logonId.Split('\\');
            logonId = Index[1];

            User newUser = new User();
            newUser.UserName = user.User.UserName;
            newUser.Email = user.User.Email;
            newUser.CreatedById = user.User.CreatedById;
            newUser.CreatedDate = DateTime.Now;
            newUser.ModifiedById = user.User.CreatedById;
            newUser.ModifiedDate = DateTime.Now;
            newUser.IsActive = user.IsActive;
            newUser.LoginId = logonId;

            DbEntity.Users.Add(newUser);

            DbEntity.SaveChanges();
            if (user.User.CreatedById == null)
            {
                newUser.CreatedById = newUser.UserId;
                newUser.ModifiedById = newUser.UserId;
            }
            #region Logger

            description = string.Format(Constants.NewUserAdded, newUser.UserId, user.User.CreatedById);
            Loggers loggers = new Loggers
            {
                ActionMethod = Constants.ActionMethodForAddUserInfo,
                Description = description,
                Operation = Constants.Add,
                UserID = user.User.CreatedById
            };
            logger = LoggerObj.LoggerMethod(loggers);
            DbEntity.Loggers.Add(logger);
            #endregion

            DbEntity.SaveChanges();
            return user.UserId;
        }
        #endregion


        #region Get All BPU
        /// <summary>
        ///Method to get  all BPUs
        /// </summary>
        /// <returns>List of BPUs</returns>
        public JsonResult GetAllBPU()
        {
            try
            {
                List<BPUs> bpuList = GetAllBPUData();
                if (bpuList != null)
                    return Json(bpuList, JsonRequestBehavior.AllowGet);
                else
                    return Json(Constants.NoGroupsFound, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }

        }

        /// <summary>
        /// Get all BPU data
        /// </summary>
        /// <returns>List of BPUs</returns>
        private List<BPUs> GetAllBPUData()
        {
            try
            {
                var bpuList = DbEntity.BPUs.Where(ch => ch.IsActive == true).Select(ch => new BPUs
                {
                    BPUId = ch.BPUId,
                    BPU1 = ch.BPU1
                }).Distinct().ToList<BPUs>();

                return bpuList.OrderBy(bpu => bpu.BPU1).ToList<BPUs>();
            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion



        /// <summary>
        /// Following is a method to retreive Valid User and Top prority UserRole from the database. 
        /// </summary>
        /// <returns>Roles class</returns>    
        public Roles GetUserTopRole(string logOnId)
        {
            try
            {
                //List of Roles
                Roles roleObj = new Roles();

                string email;
                //Get Email from VID
                if (logOnId.IndexOf("@") == -1)
                {
                    var isEmailPresent = DbEntity.Users.Where(user => user.LoginId.Equals(logOnId)).Select(user => user.Email).FirstOrDefault();
                    email = isEmailPresent == null ? string.Empty : isEmailPresent.ToString();
                }
                else
                    email = logOnId;

                //Check if user exists
                int count = DbEntity.Users.Where(user => user.Email.Equals(email) && user.IsActive == true).Count();

                //If user exists
                if (count > 0)
                {
                    //Get user roles
                    IQueryable<Role> userRoles = (from user in DbEntity.Users
                                                  join usermap in DbEntity.UserRoleBPUMappings on user.UserId equals usermap.UserId
                                                  join role in DbEntity.Roles on usermap.RoleId equals role.RoleId
                                                  where (user.Email.Equals(email) && user.IsActive == true && usermap.IsActive == true)
                                                  select role);

                    //Get max priority role of user               
                    int MaxRolePriority = userRoles.Max(rl => rl.RolePriority).Value;
                    Role rol = userRoles.First(rl => rl.RolePriority == MaxRolePriority && rl.IsActive == true);

                    //Returns Role object
                    roleObj.RoleId = rol.RoleId;
                    roleObj.RoleName = rol.RoleName;
                    roleObj.RolePriority = rol.RolePriority;
                    roleObj.IsActive = (bool)rol.IsActive;
                }

                return roleObj;
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Following is a method to retreive Valid User and UserRole from the database. 
        /// </summary>
        /// <returns>Userobject with all its details including Role </returns>         
        public JsonResult GetUser(string logOnId)
        {
            try
            {
                //Users obecjt to be returned
                Users usr = null;

                string email;
                //Get Email from VID
                if (logOnId.IndexOf("@") == -1)
                {
                    var isEmailPresent = DbEntity.Users.Where(user => user.LoginId.Equals(logOnId)).Select(user => user.Email).FirstOrDefault();
                    email = isEmailPresent == null ? string.Empty : isEmailPresent.ToString();
                }
                else
                    email = logOnId;

                //If user exists or not
                int count = DbEntity.Users.Where(user => user.Email.Equals(email) && user.IsActive == true).Count();

                //If user exists
                if (count > 0)
                {
                    //Get user object
                    User usrDM = DbEntity.Users.Where(user => user.Email.Equals(email) && user.IsActive == true).First<User>();

                    usr = new Users();
                    //Form User class from DB user obejcts
                    usr.LogOnId = usrDM.LoginId;
                    usr.Password = usrDM.Password;
                    usr.UserId = usrDM.UserId;
                    usr.UserName = usrDM.UserName;
                    usr.Email = usrDM.Email;
                    usr.IsActive = usrDM.IsActive == null ? false : true;
                    usr.UserRole = GetUserTopRole(logOnId);
                }
                //Return user
                return Json(usr, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                throw;
            }
        }

        #endregion

        /// <summary>
        /// Get User data Based on UserID
        /// </summary>
        /// <param name="logOnId"></param>
        /// <returns></returns>
        public Users GetUser(int id)
        {
            try
            {
                //Users obecjt to be returned
                Users user = new Users();
                if (id > 0)
                {
                    //Get user object
                    User usrDM = DbEntity.Users.Where(User => User.UserId == id).First<User>();

                    //Form User class from DB user obejcts
                    user.LogOnId = usrDM.LoginId;
                    user.Password = usrDM.Password;
                    user.UserId = usrDM.UserId;
                    user.UserName = usrDM.UserName;
                    user.Email = usrDM.Email;
                    user.IsActive = usrDM.IsActive == null ? false : true;
                    using (UserController UserControllerObj = new UserController())
                    {
                        //Get the user Role
                        user.UserRole = UserControllerObj.GetUserTopRole(user.Email);
                    }
                }
                //Return user
                return user;
            }
            catch (Exception)
            {

                throw;
            }
        }

        /// <summary>
        /// Method will fetch all users of given role
        /// </summary>
        /// <param name="userRole">user role</param>
        /// <returns>list of users of given role</returns>
        internal List<Users> GetAllUsersOfRole(UserRole userRole)
        {
            try
            {
                var userData = (from usersdata in DbEntity.Users
                                join userrolebpudata in DbEntity.UserRoleBPUMappings on usersdata.UserId equals userrolebpudata.UserId
                                join roledata in DbEntity.Roles on userrolebpudata.RoleId equals roledata.RoleId
                                join bpudata in DbEntity.BPUs on userrolebpudata.BPUId equals bpudata.BPUId
                                where userrolebpudata.RoleId == (int)userRole && userrolebpudata.IsActive == true
                                select new { UserRoleBPUMapping = userrolebpudata, User = usersdata, Role = roledata, BPU = bpudata });

                List<Users> emieUser = new List<Users>();
                foreach (var user in userData)
                {
                    emieUser.Add(new Users()
                    {
                        UserName = user.User.UserName,
                        UserId = user.User.UserId,
                        Email = user.User.Email,
                        IsActive = user.User.IsActive,
                        CreatedById = user.User.CreatedById,
                        CreatedDate = user.User.CreatedDate,
                        ModifiedById = user.User.ModifiedById,
                        ModifiedDate = user.User.ModifiedDate,
                        UserBPU = new BPUs { BPU1 = user.BPU.BPU1, BPUId = user.BPU.BPUId },
                        UserRole = new Roles { RoleId = user.Role.RoleId, RoleName = user.Role.RoleName }
                    });
                }
                return emieUser;
            }
            catch (Exception)
            {
                throw;
            }
        }


        #region Get EMIE Champ register users
        /// <summary>
        /// method to get all emie champ register users
        /// </summary>
        /// <returns>list of users</returns>
        public JsonResult GetAllEMIEChampRegisterUsers()
        {
            try
            {
                List<UserMapping> userList = GetAllUserRoleData();
                //get registered emie champ role users
                userList = userList.Where(user => user.User.UserRole.RoleName == Constants.EMIEChampion && user.IsRegistered == false).ToList();
                return Json(userList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Validate EMIE admin
        /// </summary>
        /// <param name="EMIEUserName">username</param>
        /// <param name="EMIEPassword">password</param>
        /// <returns>true-if validated successfully</returns>
        public JsonResult ValidateEMIEAdmin(string emieUserName, string emiePassword)
        {
            try
            {
                var EMIEAdminUserNameConfigItem = DbEntity.EMIEConfigurationSettings.Where(config => config.ConfigItem.Equals(ConfigConstants.EMIEAdminUserName)).FirstOrDefault();
                var EMIEAdminPasswordConfigItem = DbEntity.EMIEConfigurationSettings.Where(config => config.ConfigItem.Equals(ConfigConstants.EMIEAdminPassword)).FirstOrDefault();

                ConfigurationController controller = new ConfigurationController();
                string EMIEUserNameCred= EMIEAdminUserNameConfigItem.ConfiguredValue;
                string EMIEUSerPAsswordCred = controller.Decrypt(EMIEAdminPasswordConfigItem.ConfiguredValue);
                if (EMIEUserNameCred.Equals(emieUserName,StringComparison.OrdinalIgnoreCase) && EMIEUSerPAsswordCred.Equals(emiePassword))
                    return Json(true, JsonRequestBehavior.AllowGet);
                else
                    return Json(false, JsonRequestBehavior.AllowGet);

            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Change EMIE admin password
        /// </summary>
        /// <param name="Newpassword">new password</param>
        /// <returns>1-if saved successfully,0 -if failed</returns>
        public JsonResult ChangeEMIEAdminCredentials(string newpassword)
        {
            var configItem = DbEntity.EMIEConfigurationSettings.Where(config => config.ConfigItem.Equals(ConfigConstants.EMIEAdminPassword)).FirstOrDefault();
            if (configItem != null)
            {
                ConfigurationController controller = new ConfigurationController();
                string encryptedPassword = controller.Encrypt(newpassword);
                configItem.ConfiguredValue = encryptedPassword;
                int result = DbEntity.SaveChanges();
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            else
                return null;
        }

        #endregion
    }
}
