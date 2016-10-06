using EMIEWebPortal.DataModel;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web.Mvc;
using EMIEWebPortal.Common;

namespace EMIEWebPortal.Controllers
{
    public class ApplicationController : Controller
    {
        //
        // GET: /Application/
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// This region will contain all the private variables 
        /// </summary>
        #region Private Variables

        private LOBMergedEntities DbEntity = new LOBMergedEntities();



        #endregion

        /// <summary>
        /// This region will contain all the public methods
        /// </summary>
        #region Public Methods

        /// <summary>
        /// This service function will fetch All required data
        /// </summary>
        /// <returns>CR Details </returns>     
        public JsonResult GetAllCRDetails(Users user, bool isEMIEChampion)
        {
            try
            {
                IQueryable<Applications> applications = null;
                applications = GetAllApplications(user, isEMIEChampion, "");


                IQueryable<ChangeTypes> changeTypes = DbEntity.EMIEChangeTypes.Where(ch => ch.IsActive == true).Select(ch => new ChangeTypes
                {
                    ChangeTypeId = ch.ChangeTypeId,
                    ChangeTypeName = ch.ChangeType
                }).OrderBy(x => x.ChangeTypeName);

                IQueryable<ReasonForChanges> reasonForChanges = DbEntity.EMIEReasonForChanges.Where(ch => ch.IsActive == true).Select(ch => new ReasonForChanges
                {
                    ReasonForChangeId = ch.ReasonForChangeId,
                    ReasonForChangeName = ch.ReasonForChange
                }).OrderBy(x => x.ReasonForChangeName);

                IQueryable<DocModes> docModes = DbEntity.DocModes.Where(ch => ch.IsActive == true).Select(ch => new DocModes
                {
                    DocModeId = ch.DocModeId,
                    DocModeName = ch.DocMode1
                });

                //Saving all these lists in one model class
                ChangeRequestDetails CRDetails = new ChangeRequestDetails()
                {
                    Applications = applications.ToList(),
                    ChangeTypes = changeTypes.ToList(),
                    DocModes = docModes.ToList(),
                    ReasonForChanges = reasonForChanges.ToList(),

                };

                return Json(CRDetails, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }

        }


        /// <summary>
        /// Get the applications belong to BPU for which the logged in user has authorization, if EMIE champ get all the application
        /// </summary>
        /// <param name="user">User Object</param>
        /// <param name="isEMIEChampion">Is user is Emie Champ</param>
        /// <param name="searchApplication">Application</param>
        /// <returns></returns>
        public IQueryable<Applications> GetAllApplications(Users user, bool isEMIEChampion, string searchApplication)
        {
            string[] BpuId = null;
            IQueryable<Applications> applications = null;

            if (isEMIEChampion)
            {
                applications = DbEntity.Applications.Where(app => app.ApplicationStateId == 1 && app.BPU.BPUId != null && app.Application1.Contains(searchApplication)).Select(app => new Applications
                {
                    AppId = app.AppId == null ? 0 : app.AppId,
                    ApplicationName = app.Application1,
                    BPUId = app.BPU.BPUId == null ? 0 : app.BPU.BPUId,
                    BPU = app.BPU.BPU1.ToString()
                }).OrderBy(x => x.ApplicationName);
            }
            else
            {
                BpuId = DbEntity.UserRoleBPUMappings.Where(o => o.UserId == user.UserId && o.IsActive == true).Select(o => o.BPU.BPU1).Distinct().ToArray();
                applications = DbEntity.Applications.Where(app => app.ApplicationStateId == 1 && BpuId.Contains(app.BPU.BPU1) && app.BPU.BPUId != null).Select(app => new Applications
                {
                    AppId = app.AppId == null ? 0 : app.AppId,
                    ApplicationName = app.Application1,
                    BPUId = app.BPU.BPUId == null ? 0 : app.BPU.BPUId,
                    BPU = app.BPU.BPU1.ToString()
                }).OrderBy(x => x.ApplicationName);
            }
            return applications;
        }



        /// <summary>
        /// this method is to get all the active docmodes from the db
        /// </summary>
        /// <returns></returns>
        public JsonResult GetDocModes()
        {

            IQueryable<DocModes> docModes = DbEntity.DocModes.Where(ch => ch.IsActive == true).Select(ch => new DocModes
            {
                DocModeId = ch.DocModeId,
                DocModeName = ch.DocMode1
            });
            return Json(docModes.ToList(), JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// get all applications 
        /// </summary>
        /// <returns>list of applications</returns>
        public JsonResult GetAppListOfAllBPU(Users user, bool isEMIEChampion, string typedAppName)
        {
            IQueryable<Applications> applications = null;
            applications = GetAllApplications(user, isEMIEChampion, typedAppName);
            return Json(applications, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// get all applications of given bpu
        /// </summary>
        /// <param name="BPUId">bpu id</param>
        /// <returns>list of applications</returns>
        public JsonResult GetAppListOfSelectedBPU(string BPU)
        {
            IQueryable<Applications> applications = null;
            if (BPU != null)
            {
                applications = DbEntity.Applications.Where(app => app.BPU.BPU1 == BPU).Select(app => new Applications
                {
                    AppId = app.AppId == null ? 0 : app.AppId,
                    ApplicationName = app.Application1,
                    BPUId = app.BPU.BPUId == null ? 0 : app.BPU.BPUId,
                    BPU = app.BPU.BPU1.ToString()
                }).OrderBy(x => x.ApplicationName);
            }

            return Json(applications, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Method to create new application in table
        /// </summary>
        /// <param name="Application">a</param>
        /// <returns></returns>
        public JsonResult AddNewApplication(Applications application)
        {
            //Check whether given application alredy present if not then insert new one
            var matchApplication = DbEntity.Applications.Where(applicationSearch => applicationSearch.Application1.Equals(application.ApplicationName)).FirstOrDefault();
            if (matchApplication == null)
            {
                Application app = new Application();
                app.Application1 = application.ApplicationName;
                app.ApplicationStateId = application.ApplicationState.ApplicationStateId;
                app.BPUId = application.BPUId;
                app.CreatedById = application.User.UserId;
                app.CreatedDate = DateTime.Now;

                DbEntity.Applications.Add(app);
                int result = DbEntity.SaveChanges();

                if (result == 1)
                    return Json("New application added successfully", JsonRequestBehavior.AllowGet);
                else
                    return Json("Unable to add new application", JsonRequestBehavior.AllowGet);
            }
            else
                return Json(0, JsonRequestBehavior.AllowGet);

        }


        /// <summary>
        /// Get all bpus data by user
        /// </summary>
        /// <param name="user">user object with id</param>
        /// <returns>bpu list of user</returns>
        public JsonResult GetAllBPUOfUser(Users user)
        {
            try
            {
                if (user != null)
                {
                    if (user.UserRole.RoleName == Constants.EMIEChampion)
                    {
                        DbEntity.Configuration.ProxyCreationEnabled = false;
                        var bpulist = DbEntity.BPUs.Where(bpu => bpu.IsActive == true && bpu.BPUId != 0).OrderBy(bpu => bpu.BPU1).ToList();
                        return Json(bpulist, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        DbEntity.Configuration.ProxyCreationEnabled = false;
                        var bpulist = (from userrolebpu in DbEntity.UserRoleBPUMappings
                                       join bpu in DbEntity.BPUs on userrolebpu.BPUId equals bpu.BPUId
                                       where bpu.IsActive == true && userrolebpu.UserId == user.UserId && userrolebpu.RoleId == user.UserRole.RoleId && userrolebpu.IsActive == true
                                       select bpu).OrderBy(bpu => bpu.BPU1).Distinct().ToList();
                        return Json(bpulist, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                    return null;

            }
            catch (Exception)
            {
                throw;
            }
        }



        #endregion





    }
}