using EMIEWebPortal.DataModel;
using EMIEWebPortal.Common;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace EMIEWebPortal.Controllers
{
    public class ApprovalController : Controller
    {
        /// <summary>
        /// DB entity for database operations
        /// </summary>
        public LOBMergedEntities DbEntity = new LOBMergedEntities();

        //Logger object to log data in DB
        LoggerController LoggerObj = new LoggerController();

        //Datamodel Logger object which would be returned from logger controller and saved here in DB
        Logger logger = new Logger();

        TicketController ticketCntrl = new TicketController();
        // GET: Approval
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// method to get all ticket list of logged user
        /// </summary>
        /// <param name="logOnId"></param>
        /// <returns></returns>
        public List<Tickets> GetTicketListOfLoggedUser(string logOnId)
        {

            List<Tickets> lstTickets = new List<Tickets>();
            try
            {
                //In case we are appending domain here, uncomment next line
                var isEmailPresent = DbEntity.Users.Where(user => user.LoginId.Equals(logOnId)).Select(user => user.Email).FirstOrDefault();
                logOnId = isEmailPresent == null ? string.Empty : isEmailPresent.ToString();

                //This query will get the list of tickets which are tagged to the logged in user, Only fetch "Pending" tickets is to be implemented in future
                IQueryable<int> ticketList = (from user in DbEntity.Users
                                              join ticket in DbEntity.EMIETicketAprovals on user.UserId equals ticket.CreatedById
                                              where (user.Email.Equals(logOnId.Trim()))
                                              select ticket.TicketId).Distinct();

                //Other information for the tickets will be fetched and added to dictionary in following query
                foreach (var ticket1 in ticketList)
                {
                    lstTickets.Add(ticketCntrl.GetTicketObjectData(ticket1));
                }
            }
            catch (Exception)
            {

                throw;
            }
            return lstTickets;
        }

        /// <summary>
        /// method to get all approvers of given ticket
        /// </summary>
        /// <param name="ticketId">ticket id of which approvers need to be fetched</param>
        /// <returns>list of all approvers of given ticket</returns>
        public JsonResult GetApproversOfTicket(int ticketId)
        {
            try
            {

                Tickets Ticket = ticketCntrl.GetTicketObjectData(ticketId);
                if (Ticket != null)
                {
                    return Json(Ticket.Approvals, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception)
            {
                throw;
            }
            return null;
        }

        /// <summary>
        /// method to get all ticket which are pending for approvals
        /// </summary>
        /// <param name="logOnId">logOnId=v-aswag</param>
        /// <returns></returns>
        public JsonResult GetPendingApproverList(Users userObj, bool isAllRequest)
        {
            List<MyApprovalData> pendingList = null;
            try
            {
                //In case we are appending domain here, uncomment next line
                if (userObj == null)
                    return null;
                var isEmailPresent = DbEntity.Users.Where(user => user.LoginId.Equals(userObj.LogOnId)).Select(user => user.Email).FirstOrDefault();
                userObj.LogOnId = isEmailPresent == null ? string.Empty : isEmailPresent.ToString();
                if (isAllRequest)
                {
                    pendingList = (from user in DbEntity.Users
                                   join userbpurolemapping in DbEntity.UserRoleBPUMappings on user.UserId equals userbpurolemapping.UserId
                                   join approval in DbEntity.EMIETicketAprovals on userbpurolemapping.ID equals approval.UserRoleBPUMappingId
                                   join ticket in DbEntity.EMIETickets on approval.TicketId equals ticket.TicketId
                                   join Requestor in DbEntity.Users on ticket.CreatedById equals Requestor.UserId
                                   where (approval.TicketStateId == (int)ApprovalState.Pending && (ticket.FinalCRStatusId == (int)Common.TicketStatus.ApprovalPending || ticket.FinalCRStatusId == (int)Common.TicketStatus.PartiallyApproved))
                                   select new MyApprovalData
                                  {
                                      TicketId = approval.TicketId,
                                      Application = ticket.Application.Application1,
                                      RequestedBy = Requestor.UserName,
                                      FinalTicketStatus = (int)ticket.FinalCRStatusId,
                                      
                                  }).Distinct().ToList();
                }
                else
                {
                    pendingList = (from user in DbEntity.Users
                                   join userbpurolemapping in DbEntity.UserRoleBPUMappings on user.UserId equals userbpurolemapping.UserId
                                   join approval in DbEntity.EMIETicketAprovals on userbpurolemapping.ID equals approval.UserRoleBPUMappingId
                                   join ticket in DbEntity.EMIETickets on approval.TicketId equals ticket.TicketId
                                   join Requestor in DbEntity.Users on ticket.CreatedById equals Requestor.UserId
                                   where (userbpurolemapping.IsActive == true && user.Email.Equals(userObj.LogOnId.Trim()) && approval.TicketStateId == (int)ApprovalState.Pending && (ticket.FinalCRStatusId == (int)Common.TicketStatus.ApprovalPending || ticket.FinalCRStatusId == (int)Common.TicketStatus.PartiallyApproved))
                                   select new MyApprovalData
                                   {
                                       TicketId = approval.TicketId,
                                       Application = ticket.Application.Application1,
                                       RequestedBy = Requestor.UserName,
                                       FinalTicketStatus = (int)ticket.FinalCRStatusId
                                   }).Distinct().ToList();
                }
                foreach (var ticketitem in pendingList)
                {
                    List<Approvals> approvals = (
                                                  from ticket in DbEntity.EMIETickets
                                                  join ticketApproval in DbEntity.EMIETicketAprovals on ticket.TicketId equals ticketApproval.TicketId
                                                  join userBpurolemapping in DbEntity.UserRoleBPUMappings on ticketApproval.UserRoleBPUMappingId equals userBpurolemapping.ID
                                                  join user in DbEntity.Users on userBpurolemapping.UserId equals user.UserId
                                                  join role in DbEntity.Roles on userBpurolemapping.RoleId equals role.RoleId
                                                  where (ticket.TicketId == ticketitem.TicketId)
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
                                                      ApprovalState = (ApprovalState)ticketApproval.TicketStateId,
                                                      ApproverComments=ticketApproval.ApproverComments
                                                  }
                                                    ).ToList();

                    ticketitem.Approvers = approvals;
                }
                List<MyApprovalData> removerApproversItem = new List<MyApprovalData>();
                foreach (var item in pendingList)
                {
                    if (item.FinalTicketStatus > (int)TicketStatus.ApprovalPending)
                    {
                        //GET ALL EMIE APPROVERS    
                        List<Approvals> approversLIst = item.Approvers.Where(approver => approver.Approver.UserRole.RoleId == 4).ToList();
                        if (approversLIst.Count >= 1)
                        {
                            //get approved emie approver
                            var isapproved = approversLIst.Where(approver => approver.ApprovalState == Common.ApprovalState.Approved).ToList();
                            if (isapproved.Count >= 1)
                            {
                                //remove all emie approvers and insert single approved emie  approver
                                foreach (var approveritem in approversLIst)
                                {
                                    item.Approvers.Remove(approveritem);
                                }
                                item.Approvers.Add(isapproved[0]);
                                if (!isAllRequest)
                                {
                                    //check other approvers if they are logged in user and in approved state then remove it from my pending approver list
                                    List<Approvals> approverslisttemp = item.Approvers.Where(approver => approver.Approver.UserId == userObj.UserId &&
                                        approver.Approver.UserRole.RoleId != 4).ToList();
                                    if (approverslisttemp.Count == 0)
                                    {
                                        removerApproversItem.Add(item);
                                    }
                                }
                            }
                            else
                            {
                                //remove all emie approvers 
                                foreach (var approveritem in approversLIst)
                                {
                                    item.Approvers.Remove(approveritem);
                                }
                                //check if logged user is in emie approver 
                                Approvals loggeduser = approversLIst.Where(approver => approver.Approver.UserId == userObj.UserId).FirstOrDefault();
                                if (loggeduser != null)
                                {
                                    loggeduser.Approver.Email = Constants.EMIEChampGroup;
                                    item.Approvers.Add(loggeduser);
                                }
                                else
                                {
                                    Approvals approver = new Approvals() { Approver = userObj, ApprovalState = Common.ApprovalState.Pending, IsActive = (bool)userObj.IsActive};
                                    approver.Approver.Email = Constants.EMIEChampGroup;
                                    item.Approvers.Add(approver);
                                }

                            }
                        }
                    }
                    else//make email as "EMIE CHAMP GROUP" for pending emie champ
                    {
                        List<Approvals> approversLIst = item.Approvers.Where(x => x.Approver.UserRole.RoleId == 4).ToList();
                        if (approversLIst.Count > 0)
                        {
                            approversLIst[0].Approver.Email = Constants.EMIEChampGroup;
                            var allemeiApprovers = item.Approvers.Where(x => x.Approver.UserRole.RoleId == 4).ToList();
                            if (allemeiApprovers.Count > 0)
                            {
                                foreach (var approveritem in allemeiApprovers)
                                {
                                    item.Approvers.Remove(approveritem);
                                }
                            }
                            //add llogged user if emie approver
                            var isloggedUserIsEMIE = allemeiApprovers.Where(approver => approver.Approver.UserId == userObj.UserId).FirstOrDefault();
                            if (isloggedUserIsEMIE != null)
                            {
                                isloggedUserIsEMIE.Approver.Email = Constants.EMIEChampGroup;
                                item.Approvers.Add(isloggedUserIsEMIE);
                            }
                            else
                            {
                                Approvals approver = new Approvals() { Approver = userObj, ApprovalState = Common.ApprovalState.Pending, IsActive = (bool)userObj.IsActive};
                                approver.Approver.Email = Constants.EMIEChampGroup;
                                item.Approvers.Add(approver);
                            }
                            //this code is kept for future reference
                            //else
                            //    item.Approvers.Add(approversLIst[0]);
                        }
                    }

                }

                foreach (var item in removerApproversItem)
                {
                    pendingList.Remove(item);
                }

            }

            catch (Exception)
            {

                throw;
            }
            return Json(pendingList, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// This method will approve or reject the ticket status
        /// </summary>
        /// <param name="ticketIds"> contain list of tickets</param>
        /// <param name="isApproved">If true will approve the status of the tickets else will reject</param>
        /// <returns>returns number of succesfully updation</returns>     
        public JsonResult PerformRequest(List<int> ticketIds, bool isApproved, int loggedInUserId, string rejectionComments)
        {
            int finalTicketStatus = 0;
            List<int> updatedTicketList = new List<int>();
            string Request = string.Empty;
            string description = string.Empty;
            int state = 0;
            if (!ModelState.IsValid || ticketIds == null || loggedInUserId == 0)
            {
                return null;
            }
            try
            {
                for (int ticketcount = 0; ticketcount < ticketIds.Count(); ticketcount++)
                {
                    int ticketid = ticketIds[ticketcount];
                    //Getting the list of the tickets and updating the individual status of the ticket in the database through enum
                    List<EMIETicketAproval> ticketApproval = (from approval in DbEntity.EMIETicketAprovals
                                                              join userBpurolemapping in DbEntity.UserRoleBPUMappings on approval.UserRoleBPUMappingId equals userBpurolemapping.ID
                                                              join user in DbEntity.Users on userBpurolemapping.UserId equals user.UserId
                                                              where (approval.TicketId == ticketid && user.UserId == loggedInUserId)
                                                              select approval).ToList();
                    if (ticketApproval.Count > 0)
                    {
                        foreach (var approval in ticketApproval)
                        {
                            if (approval.TicketStateId == (int)ApprovalState.Pending)
                            {
                                string UserName = DbEntity.Users.Where(userid => userid.UserId == loggedInUserId).Select(username => username.UserName).FirstOrDefault().ToString();
                                if (isApproved)
                                {
                                    state = (int)ApprovalState.Approved;
                                    Request = "ApproveRequest";
                                    description = string.Format(Constants.TicketStatus, ticketid, Constants.Approved, UserName);
                                }
                                else
                                {
                                    state = (int)ApprovalState.Rejected;
                                    Request = "RejectRequest";
                                    description = string.Format(Constants.TicketStatus, ticketid, Constants.Rejected, UserName);
                                }
                                approval.TicketStateId = state;
                                approval.ModifiedById = loggedInUserId;
                                approval.ModifiedDate = DateTime.Now;
                            }
                            else
                            {
                                //this function will add the newly joined emie champ for the respective ticket
                                AddNewlyAddedEMIEChamp(loggedInUserId, ticketid, isApproved);

                            }


                        }
                    }
                    else
                    {
                        //this function will add the newly joined emie champ for the respective ticket
                        AddNewlyAddedEMIEChamp(loggedInUserId, ticketid, isApproved);
                    }
                    //UserObj = DbEntity.Users.Where(userid => userid.UserId == loggedInUserId).Select(username => username.UserName).FirstOrDefault().ToString();


                    #region Logger
                    //this section will log the every single operation performed
                    Loggers loggers = new Loggers
                    {
                        ActionMethod = Request,
                        Description = description,
                        Operation = Constants.Update,
                        UserID = loggedInUserId
                    };

                    logger = LoggerObj.LoggerMethod(loggers);
                    DbEntity.Loggers.Add(logger);

                    #endregion
                    DbEntity.SaveChanges();
                    finalTicketStatus = FinalCRStatus(ticketid);

                    //Changing the final cr status of ticket
                    EMIETicket emieTicket = DbEntity.EMIETickets.SingleOrDefault(o => o.TicketId == ticketid);
                    emieTicket.FinalCRStatusId = finalTicketStatus;

                    //add rejection reason to emie ticket table
                    if (rejectionComments != null)
                        emieTicket.RejectedReason = rejectionComments;

                    DbEntity.SaveChanges();
                    updatedTicketList.Add(ticketid);

                    //Need this comment 
                    // Please uncomment this code once Approve/Reject functionality is working for other logged in users
                    #region Send Mails
                    for (int cnt = 0; cnt < updatedTicketList.Count(); cnt++)
                    {
                        TicketController controller = new TicketController();
                        Tickets ticket = controller.GetTicketObjectData(updatedTicketList[ticketcount]);
                        if (rejectionComments != null)
                            ticket.ProductionFailureComments = rejectionComments;
                        if (ticket.FinalTicketStatus == TicketStatus.Approved || ticket.FinalTicketStatus == TicketStatus.PartiallyApproved)
                            CommonFunctions.SendMail(ticket, MailMessageType.RequestApproved);
                        else
                            if (ticket.FinalTicketStatus == TicketStatus.Rejected)
                                CommonFunctions.SendMail(ticket, MailMessageType.RequestRejected);
                    }
                    #endregion Send Mails
                }
            }
            catch (Exception)
            {
                throw;
            }
            return Json(updatedTicketList, JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// this function will adde the newlu join EMIE champ against respective user
        /// </summary>
        /// <param name="loggedInUserId"></param>
        /// <param name="ticketid"></param>
        public void AddNewlyAddedEMIEChamp(int loggedInUserId, int ticketid, bool isApproved)
        {
            int ticketstate=0;
            string commentsofEMIEChamp = string.Empty;
            var Userrolebpumappingobj = (from user in DbEntity.Users
                                         join userrolebpumapping in DbEntity.UserRoleBPUMappings on user.UserId equals userrolebpumapping.UserId
                                         where user.UserId == loggedInUserId && userrolebpumapping.RoleId == (int)UserRole.EMIEChampion
                                         select userrolebpumapping).FirstOrDefault();
            if (Userrolebpumappingobj != null)
            {
                var approversLIst = DbEntity.EMIETicketAprovals.Where(x => x.TicketId == ticketid && x.UserRoleBPUMapping.RoleId == (int)UserRole.EMIEChampion).FirstOrDefault();
                if (approversLIst!= null)
                {
                    commentsofEMIEChamp = approversLIst.ApproverComments;
                }
                if (isApproved)
                {
                    ticketstate = (int)ApprovalState.Approved;
                }
                else
                {
                    ticketstate = (int)ApprovalState.Rejected;
                }
                DbEntity.EMIETicketAprovals.Add(new EMIETicketAproval()
                {
                    CreatedById = loggedInUserId,
                    ModifiedById = loggedInUserId,
                    TicketId = ticketid,
                    TicketStateId = ticketstate,
                    UserRoleBPUMappingId = Userrolebpumappingobj.ID,
                    NoOfReminders=0,
                    CreatedDate = DateTime.Now,
                    ModifiedDate = DateTime.Now,
                    ApproverComments = commentsofEMIEChamp
                });

                DbEntity.SaveChanges();
            }
        }


        /// <summary>
        /// This method is for checking the final CR Status for the respective ticket
        /// </summary>
        /// <param name="ticketId">1247</param>
        /// <returns>Final CR Status</returns>
        public int FinalCRStatus(int ticketId)
        {
            int finalTicketStatus = 0;
            try
            {
                List<Approvals> approvalList = ticketCntrl.GetApprovers(ticketId);

                bool IsEmieApproved = false;

                //Getting the rejected approval for the ticket.
                var rejectedApprovers = approvalList.Where(approver => approver.ApprovalState == Common.ApprovalState.Rejected).FirstOrDefault();
                if (rejectedApprovers != null)
                {
                    //If any approval is rejected, ticket status will be updated as rejected
                    finalTicketStatus = (int)TicketStatus.Rejected;
                }
                else
                {
                    //Getting the pending approval counts for the ticket approvals
                    int pendingApproversCount = approvalList.Where(approver => approver.ApprovalState == Common.ApprovalState.Pending).Count();

                    //If the pending count is equal to the total approval count, set the ticket status 
                    if (pendingApproversCount == approvalList.Count)
                        finalTicketStatus = (int)TicketStatus.ApprovalPending;
                    else
                    {
                        //get all approvers who are EMIE champs
                        var emieApproversList = approvalList.Where(approver => approver.Approver.UserRole.RoleId == 4).ToList();

                        //Checking whether any EMIE Champ from the EMIEChampionGroup has approved the ticket by getting the approved count
                        var approvedEMIEApproversCount = emieApproversList.Where(approver => approver.ApprovalState == Common.ApprovalState.Approved).Count();
                        //If ticket is approved by any emieChamp, marked it as EmieApproved
                        if (approvedEMIEApproversCount > 0)
                            IsEmieApproved = true;

                        //Checking if the ticket has only Emie Group approvals
                        if (emieApproversList.Count == approvalList.Count)
                        {
                            if (IsEmieApproved)
                                finalTicketStatus = (int)TicketStatus.Approved;
                            else
                                finalTicketStatus = (int)TicketStatus.ApprovalPending;
                        }
                        else
                        {
                            //getting Non-EmieGroup approvals
                            var otherApprovalsList = approvalList.Where(approver => approver.Approver.UserRole.RoleId != 4).ToList();

                            //Getting the approved list count for the ticket
                            int OtherApprovedCount = otherApprovalsList.Where(approver => approver.ApprovalState == Common.ApprovalState.Approved).Count();

                            //If all the approvals are approved and also Emie Champ has been approved, set ticket status approved
                            if (OtherApprovedCount == otherApprovalsList.Count() && IsEmieApproved)
                                finalTicketStatus = (int)TicketStatus.Approved;
                            else if (OtherApprovedCount == otherApprovalsList.Count() || IsEmieApproved)
                            {
                                //If any one of them is not approved, set partially approved
                                finalTicketStatus = (int)TicketStatus.PartiallyApproved;
                            }
                            else if (OtherApprovedCount > 0)
                            {
                                //If any one of them is not approved, set partially approved
                                finalTicketStatus = (int)TicketStatus.PartiallyApproved;
                            }
                            else
                            {
                                //If none of the approvals are approved, set pending as the status
                                finalTicketStatus = (int)TicketStatus.ApprovalPending;
                            }
                        }

                    }
                }
                return finalTicketStatus;

            }
            catch (Exception)
            {

                throw;
            }

        }

        /// <summary>
        /// Send reminder mail to selected approvals for approving the ticket
        /// </summary>
        /// <param name="listOfApproverIds">List OF Approvals objects</param>
        /// <param name="ticket">Ticket Object</param>
        public void SendReminder(List<Approvals> listOfApprovers, Tickets ticket)
        {
            try
            {

                if (ticket.RequestedBy == null)
                {
                    TicketController cntrlr = new TicketController();
                    ticket = cntrlr.GetTicketObjectData(ticket.TicketId);
                }
                if (listOfApprovers != null)
                {
                    List<Approvals> lstApprovers = new List<Approvals>();
                    foreach (var singleapprover in listOfApprovers)
                    {
                        UserController userController = new UserController();
                        // Users approverUser = userController.GetUser(singleapprover.Approver.UserId);

                        Approvals approver = new Approvals();
                        approver.Approver = singleapprover.Approver;
                        approver.ApprovalState = ApprovalState.Pending;
                        approver.ApproverComments = singleapprover.ApproverComments;

                        lstApprovers.Add(approver);
                    }
                    if (ticket != null)
                        ticket.Approvals = lstApprovers;
                    //Get FinalCRS statusID of ticket while sending mail            
                    EMIETicket savedEmieTicket = DbEntity.EMIETickets.Single(o => o.TicketId == ticket.TicketId);
                    ticket.FinalTicketStatus = (TicketStatus)savedEmieTicket.FinalCRStatusId;
                    CommonFunctions.SendMail(ticket, MailMessageType.SendReminder);
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}