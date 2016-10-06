using EMIEWebPortal.DataModel;
using EMIEWebPortal.Common;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EMIEWebPortal.Controllers
{
    public class LoggerController : Controller
    {
        // GET: Logger
        public ActionResult Index()
        {
            return View();
        }
        /// <summary>
        /// This region will contain all the private variables 
        /// </summary>
        #region PrivateVariables

        private LOBMergedEntities DbEntity = new LOBMergedEntities();

        #endregion

        /// <summary>
        /// This method will add the information of changes in database to the logger object and return it from where it is called
        /// Database save would be done in calling function to do both operation in one transaction
        /// </summary>
        /// <param name="Loggers">logger object which is to be saved in database</param>       
        /// <returns>Logger object of datamodel which is added</returns>        
        public Logger LoggerMethod(Loggers loggers)
        {
            /// <example>
            /// Copy these lines and add information accordingly
            /// description = string.Format("STRING WHICH IS TO BE ENTERED IN DATABASE AS DESCRIPTION");
            /// Logger logger = LoggerObj.LoggerMethod(LoggedONUserID, "METHODNAME", description, Constants.DELETE* );   ///*(Type of method for example, for deleteuser)
            /// DbEntity.Loggers.Add(logger);
            /// </example>

            try
            {
                if (loggers == null)
                    return null;
                //Create new logger object
                Logger logger = new Logger
                {
                    UserID = loggers.UserID,
                    LoggedOn = DateTime.Now,
                    ActionMethod = loggers.ActionMethod,
                    Description = loggers.Description,
                    Operation = loggers.Operation,
                    //Product category is EMIE to indicate logged data of EMIE app
                    ProductCategory = Constants.ProductCategory
                };

                //return Json(logger, JsonRequestBehavior.AllowGet);
                return logger;
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// This method will log the information of changes in database to the database
        /// </summary>
        /// <param name="userId">User Id logging the data</param>
        /// <param name="actionMethod">Method name </param>
        /// <param name="description">Description of logged data</param>
        /// <param name="operation">Insert/Update/Delete</param>
        /// <returns>bool value to indicate Logged data saved successfully or not</returns>
        public bool LoggerMethodSave(int? userId, string actionMethod, string description, string operation)
        {
            bool result = false;
            try
            {
                //Add logger entity to logger table
                DbEntity.Loggers.Add(new Logger
                {
                    UserID = userId,
                    LoggedOn = DateTime.Now,
                    ActionMethod = actionMethod,
                    Description = description,
                    Operation = operation,
                    //Product category is EMIE to indicate logged data of EMIE app
                    ProductCategory = Constants.ProductCategory
                });

                //Save data to database
                result = Convert.ToBoolean(DbEntity.SaveChanges());
                return result;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}