using EMIEWebPortal.Common;
using EMIEWebPortal.DataModel;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;

namespace EMIEWebPortal.Controllers
{
    public class ReportsHelperController : Controller
    {

        private LOBMergedEntities DbEntity = new LOBMergedEntities();

        // GET: Ticket
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// This Function will return all the BPUs which will be populate to a dropdown 
        /// </summary>
        /// <returns></returns>
        public JsonResult GetAllBPU(Users user, bool isEMIEChampion)
        {
            if (!isEMIEChampion)
            {
                var BPUList = DbEntity.UserRoleBPUMappings
                        .Join(DbEntity.BPUs, userrolebpumapping => userrolebpumapping.BPUId, bpu => bpu.BPUId, (userrolebpumapping, bpu) => new { userrolebpumapping, bpu })
                        .Where(final => final.bpu.BPUId > 0 && final.bpu.IsActive == true && (bool)(isEMIEChampion ? (final.bpu.BPUId.ToString().StartsWith("")) : final.userrolebpumapping.UserId == user.UserId && final.userrolebpumapping.IsActive == true && final.userrolebpumapping.RoleId == user.UserRole.RoleId))
                        .OrderBy(result => result.userrolebpumapping.BPUId)
                         .Select(bpu => new
                         {
                             BPUId = bpu.bpu.BPUId,
                             BPUFullname = bpu.bpu.BPU1
                         }).ToList().Distinct();
                return Json(BPUList.ToList(), JsonRequestBehavior.AllowGet);
            }
            else
            {
                var BPUList =DbEntity.BPUs
                       .Where(final => final.BPUId > 0 && final.IsActive == true)
                       .OrderBy(result => result.BPUId)
                        .Select(bpu => new
                        {
                            BPUId = bpu.BPUId,
                            BPUFullname = bpu.BPU1
                        }).ToList().Distinct();
                return Json(BPUList.ToList(), JsonRequestBehavior.AllowGet);
            }

        }


       /// <summary>
       /// This function will return the count of ticket status 
       /// </summary>
       /// Below parameteres will apply filters
        /// <param name="startDate">2016-01-15 00:00:00</param>
        /// <param name="endDate">2016-06-15 00:00:00</param>
       /// <param name="BPUIds">20,1,3</param>
       /// <returns></returns>
        public JsonResult GetTicketStatusCount(DateTime? startDate, DateTime? endDate, List<string> BPUIds)
        {
            if (BPUIds == null)
            {
                BPUIds = new List<string>();
            }

            var TicketCounttList = DbEntity.EMIETickets
                       .Join(DbEntity.EMIETicketStatus, ticket => ticket.FinalCRStatusId, status => status.TicketStatusId, (final, status) => new { final, status })
                       .Where(ticket => DbFunctions.TruncateTime(ticket.final.CreatedDate) >= DbFunctions.TruncateTime(startDate) && DbFunctions.TruncateTime(ticket.final.CreatedDate) <= DbFunctions.TruncateTime(endDate) && (BPUIds.Count != 0 ? BPUIds.Contains(ticket.final.BPUId.ToString()) : ticket.final.BPUId.ToString().StartsWith("")))
                        .GroupBy(finacrstatus => new { finacrstatus.status.TicketStatus })
                        .Select(count => new
                        {
                            count.Key.TicketStatus,
                            Count = count.Count(),
                        }).ToList();
            return Json(TicketCounttList.ToList(), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// This function will return the count of ticket status based on BPU
        /// </summary>
        /// Below parameteres will apply filters
        /// <param name="startDate">2016-01-15 00:00:00</param>
        /// <param name="endDate">2016-06-15 00:00:00</param>
        /// <param name="BPUIds">20,1,3</param>
        /// <returns></returns>
        public JsonResult GetBPUWiseTicketCount(DateTime? startDate, DateTime? endDate, List<string> BPUIds)
        {
            if (BPUIds == null)
            {
                BPUIds = new List<string>();
            }
            var BPUCountList = DbEntity.EMIETickets
                  .Join(DbEntity.BPUs, BPU => BPU.BPUId, Tickets => Tickets.BPUId, (bpu, Tickets) => new { bpu, Tickets })
                  .Join(DbEntity.EMIETicketStatus, ticket => ticket.bpu.FinalCRStatusId, status => status.TicketStatusId, (ticket, status) => new { ticket, status })
                   .Where(Final => Final.status.TicketStatusId != (int)TicketStatus.ApprovalPending && DbFunctions.TruncateTime(Final.ticket.bpu.CreatedDate) >= DbFunctions.TruncateTime(startDate) && DbFunctions.TruncateTime(Final.ticket.bpu.CreatedDate) <= DbFunctions.TruncateTime(endDate) && (BPUIds.Count != 0 ? BPUIds.Contains(Final.ticket.Tickets.BPUId.ToString()) : Final.ticket.Tickets.BPUId.ToString().StartsWith("")))
                  .GroupBy(BPU => new { BPU.ticket.Tickets.BPU1, BPU.status.TicketStatus })
                  .Select(count => new
                  {
                      count.Key.BPU1,
                      count.Key.TicketStatus,
                      Count = count.Count()
                  }).ToList();
            ChartTopLevelData topData = new ChartTopLevelData();

            //Below both list will contain distinct BPU and ticket status sorted BPU Wise
            List<string> lstBPU = BPUCountList.OrderBy(x => x.BPU1).Select(a => a.BPU1).Distinct<string>().ToList();
            List<string> lstStatus = BPUCountList.OrderBy(x => x.BPU1).Select(a => a.TicketStatus).Distinct<string>().ToList();

            topData.BPUs = lstBPU;

            List<BPUWiseTicketStatus> data = new List<BPUWiseTicketStatus>();

            //Below loop will arrange the data as per bar chart requirement.
            foreach (string status in lstStatus)
            {
                BPUWiseTicketStatus item = new BPUWiseTicketStatus();
                item.Status = status;
                var lstBPUnames = BPUCountList.OrderBy(x => x.BPU1).Where(a => a.TicketStatus == status).Select(b => b.BPU1).ToList();
                item.BPUname = new List<string>();
                item.StatusCount = new List<int>();

                //This will create the object for all bpu so proper placement of data is done
                for (int indx = 0; indx < lstBPU.Count; indx++)
                {
                    item.BPUname.Add(String.Empty);
                    item.StatusCount.Add(0);
                }

                //This loop will add the records as per ticket status that to bpu wise 
                foreach (var bpu in lstBPUnames)
                {
                    int index = lstBPU.FindIndex(b => b == bpu);
                    item.BPUname[index] = bpu;
                    item.StatusCount[index] = BPUCountList.Where(cnt => cnt.TicketStatus == status && cnt.BPU1 == bpu).Select(c => c.Count).FirstOrDefault();
                }
                data.Add(item);
            }
            //Complete data is added in the top level class
            topData.chartData = data;
            return Json(topData, JsonRequestBehavior.AllowGet);

        }

        /// <summary>
        /// This function will return the list of application based on change type i.e add to EMIE,Delete to EMIE,Update To EMIE
        /// </summary>
        /// Below parameteres will apply filters
        /// <param name="startDate">2016-01-15 00:00:00</param>
        /// <param name="endDate">2016-06-15 00:00:00</param>
        /// <param name="BPUIds">20,1,3</param>
        /// <returns></returns>
        public JsonResult GetListOfApplication(DateTime? startDate, DateTime? endDate, List<string> BPUIds)
        {
            if (BPUIds == null)
            {
                BPUIds = new List<string>();
            }
            var getListOfApplication = DbEntity.EMIETickets
                                         .Join(DbEntity.Applications, ticket => ticket.AppId, application => application.AppId, (ticket, application) => new { ticket, application })
                                         .Join(DbEntity.EMIEChangeTypes, changetype => changetype.ticket.ChangeTypeId, changetype => changetype.ChangeTypeId, (changetype, ticket) => new { changetype, ticket })
                                         .Join(DbEntity.BPUs, application=>application.changetype.ticket.BPUId,Bpus=>Bpus.BPUId,(application,Bpus)=>new{application,Bpus})
                                         .Where(final => final.application.changetype.ticket.FinalCRStatusId == (int)TicketStatus.SignedOff && DbFunctions.TruncateTime(final.application.changetype.ticket.CreatedDate) >= DbFunctions.TruncateTime(startDate) && DbFunctions.TruncateTime(final.application.changetype.ticket.CreatedDate) <= DbFunctions.TruncateTime(endDate) && (BPUIds.Count != 0 ? BPUIds.Contains(final.application.changetype.ticket.BPUId.ToString()) : final.application.changetype.ticket.BPUId.ToString().StartsWith("")))
                        .Select(column => new
                        {
                            ApplicationName = column.application.changetype.application.Application1,
                            AppSiteLink = column.application.changetype.ticket.AppSiteLink,
                            GroupName=column.Bpus.BPU1,
                            ChangeType = column.application.ticket.ChangeType
                        }).ToList();
            return Json(getListOfApplication.ToList(), JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// This function will return the count of ticket status based on Reason for change
        /// </summary>
        /// Below parameteres will apply filters
        /// <param name="startDate">2016-01-15 00:00:00</param>
        /// <param name="endDate">2016-06-15 00:00:00</param>
        /// <param name="BPUIds">20,1,3</param>
        /// <returns></returns>
        public JsonResult GetChangeForReasonCount(DateTime? startDate, DateTime? endDate, List<string> BPUIds)
        {
            if (BPUIds == null)
            {
                BPUIds = new List<string>();
            }
            var ReasoneChangeCounttList = DbEntity.EMIEReasonForChanges
                                         .Join(DbEntity.EMIETickets, reason => reason.ReasonForChangeId, ticket => ticket.ReasonForChangeId, (reason, ticket) => new { reason, ticket })
                                          .Where(tickets => DbFunctions.TruncateTime(tickets.ticket.CreatedDate) >= DbFunctions.TruncateTime(startDate) && DbFunctions.TruncateTime(tickets.ticket.CreatedDate) <= DbFunctions.TruncateTime(endDate) && (BPUIds.Count != 0 ? BPUIds.Contains(tickets.ticket.BPUId.ToString()) : tickets.ticket.BPUId.ToString().StartsWith("")))
                                         .GroupBy(ticket => new { ticket.reason.ReasonForChange })
                        .Select(count => new
                        {
                            count.Key.ReasonForChange,
                            Count = count.Count()
                        }).ToList();
            return Json(ReasoneChangeCounttList.ToList(), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// This function will return the count of ticket status based on Change Type
        /// </summary>
        /// Below parameteres will apply filters
        /// <param name="startDate">2016-01-15 00:00:00</param>
        /// <param name="endDate">2016-06-15 00:00:00</param>
        /// <param name="BPUIds">20,1,3</param>
        /// <returns></returns>
        public JsonResult GetChangeTypeCount(DateTime? startDate, DateTime? endDate, List<string> BPUIds)
        {
            if (BPUIds == null)
            {
                BPUIds = new List<string>();
            }
            var ChangeTypeCounttList = DbEntity.EMIEChangeTypes
                                         .Join(DbEntity.EMIETickets, changetype => changetype.ChangeTypeId, ticket => ticket.ChangeTypeId, (changetype, ticket) => new { changetype, ticket })
                                         .Where(tickets => DbFunctions.TruncateTime(tickets.ticket.CreatedDate) >= DbFunctions.TruncateTime(startDate) && DbFunctions.TruncateTime(tickets.ticket.CreatedDate) <= DbFunctions.TruncateTime(endDate) && (BPUIds.Count != 0 ? BPUIds.Contains(tickets.ticket.BPUId.ToString()) : tickets.ticket.BPUId.ToString().StartsWith("")))
                                         .GroupBy(ticket => new { ticket.changetype.ChangeType })
                        .Select(count => new
                        {
                            count.Key.ChangeType,
                            Count = count.Count()
                        }).ToList();
            return Json(ChangeTypeCounttList.ToList(), JsonRequestBehavior.AllowGet);
        }

    }
}
