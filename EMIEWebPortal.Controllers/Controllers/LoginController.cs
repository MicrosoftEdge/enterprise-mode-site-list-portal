using EMIEWebPortal.DataModel;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Threading;
using EMIEWebPortal.Common;

namespace EMIEWebPortal.Controllers
{
    public class LoginController : Controller
    {
        public static Configuration config = null;
        /// <summary>
        /// Index method to return view
        /// </summary>
        /// <returns>ActionResult</returns>
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Get configuration settings at the start and store it to global variable
        /// </summary>
        public JsonResult GetConfigurationAtStart()
        {        
            using (ConfigurationController configController = new ConfigurationController())
            {
                config = configController.GetConfiguration();
                if (config.ConfigSettings.Count > 2)
                    return Json(false, JsonRequestBehavior.AllowGet);
                else
                    return Json(true, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Method will check Valid windows identity of logged in user and then 
        /// it will check validaty of logged in user in EMIE database
        /// </summary>
        /// <returns>User object with role data if logged in user is valid user else returns NULL</returns>
        public JsonResult GetValidLoggedInUser()
        {       
            //Get windows identity of logged in user
            var user = User.Identity;

            //If user not found or if user is not authenticated then return null
            if (user != null)
            {
                //Get log in Id of user e.g. fateast\\v-id 
                string userLogOnID = user.Name;

                //return Json(userLogOnID + "Outside Function", JsonRequestBehavior.AllowGet);
                //Get only VID from logged in user email
                if (!String.IsNullOrEmpty(userLogOnID))
                {

                    var Index = userLogOnID.Split('\\');
                    //Get only v-id
                    userLogOnID = Index[1];

                    //Get complete user object for logged in user

                    using (UserController userController = new UserController())
                    {
                        var userObj = userController.GetUser(userLogOnID);

                        //If user not found in EMIE DB then return null else return user object with role and other details
                        if (userObj != null)
                            return userObj;
                    }
                }
            }
            //if usre is null then return null
            return null;

        }
    }
}
