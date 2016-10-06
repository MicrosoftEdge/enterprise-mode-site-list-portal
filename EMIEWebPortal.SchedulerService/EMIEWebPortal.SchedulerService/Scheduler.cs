using System;
using System.Collections.Generic;
using System.ServiceProcess;
//using SchedulerEntity;
using System.Threading;
using System.IO;
using EMIEWebPortal.Controllers;
using EMIEWebPortal.Models;
using XMLHelperLib;
using EMIEWebPortal.Common;
using System.Configuration;

namespace EMIESchedulerWindowsService
{
    public partial class Scheduler : ServiceBase
    {
        const string fileName = Constants.FileName;
        string logFileName = String.Empty;

        /// <summary>
        /// Constructor
        /// </summary>
        public Scheduler()
        {
            InitializeComponent();
            string baseDirPath = AppDomain.CurrentDomain.BaseDirectory;
            logFileName = baseDirPath.Substring(0, baseDirPath.Length - 11) + fileName;
        }

        /// <summary>
        /// Service onstart method
        /// </summary>
        /// <param name="args"></param>
        protected override void OnStart(string[] args)
        {

            try
            {
                Thread schedulerThread = new Thread(new ThreadStart(UpdateTicketAndXMLForProduction));
                schedulerThread.Start();
            }
            catch (Exception ex)
            {
                File.AppendAllText(logFileName, ex.Message + DateTime.Now);
            }
        }

        /// <summary>
        /// Method to update production XML and ticket status to ProductionReady
        /// </summary>
        public void UpdateTicketAndXMLForProduction()
        {
            string waitSettings = ConfigurationManager.AppSettings[Constants.SchedulerWaitTimeInMinutes];
            int waitTime = Convert.ToInt32(waitSettings) * 60000; // 5 minute

            while (true)
            {
                try
                {
                    File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + " ---------------------Started - EMIE Scheduler----------------------------");
                    File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + " Fetching Scheduled requests...........");
                    TicketController ticketController = new TicketController();
                    List<Tickets> lstTickets = ticketController.GetTicketsDataByTicketStatus(TicketStatus.ProductionChangesScheduled);
                    File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + String.Format(" Total tickets scheduled for prod changes are : {0}", lstTickets.Count));

                    //Console.WriteLine("Fetching Configuration settings for production changes...........");
                    File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + " Fetching Configuration settings for production changes...........");
                    
                    EMIEWebPortal.Models.Configuration config = null;
                    if (LoginController.config == null)
                    {
                        ConfigurationController configController = new ConfigurationController();
                        config = configController.GetConfiguration();
                    }
                    else
                    {
                        config = LoginController.config;
                    }

                    foreach (Tickets ticket in lstTickets)
                    {
                        File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + String.Format(" Checking ticket #{0}", ticket.TicketId));
                        DateTime today = DateTime.Now;
                        DateTime ProdStartDate = ((DateTime)ticket.ScheduleDateTimeStart).ToLocalTime();
                        DateTime ProdEndDate = ((DateTime)ticket.ScheduleDateTimeEnd).ToLocalTime();
                        if (today >= ProdStartDate && ticket.FinalTicketStatus==TicketStatus.ProductionChangesScheduled)
                        {
                            // Console.WriteLine(string.Format("Processing ticket #{0}...........", ticket.TicketId));
                            File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + String.Format(" Processing ticket #{0}...........", ticket.TicketId));
                            XMLHelper xmlHelper = new XMLHelper();
                            xmlHelper.OperationOnXML(ticket, Operation.AddInProduction, config);

                            ticketController.UpdateTicketStatus(ticket, TicketStatus.ProductionReady);
                            ticket.FinalTicketStatus = TicketStatus.ProductionReady;
                            CommonFunctions.SendMail(ticket, MailMessageType.ProductionChangesDoneThroughScheduler);
                        }
                    }
                    //Console.WriteLine("---------------------End - EMIE Scheduler----------------------------");
                    File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + " ---------------------End - EMIE Scheduler----------------------------");
                    //// Sleep for 5 minute

                    File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + DateTime.Now.ToString() + String.Format(" Wait for {0} milisecounds till the scheduler is called again", waitTime.ToString()));

                }
                catch (Exception ex)
                {
                    File.AppendAllText(logFileName, ex.Message + DateTime.Now);
                }
                Thread.Sleep(waitTime);
            }

        }

        /// <summary>
        /// Service On Stop method
        /// </summary>
        protected override void OnStop()
        {
            File.AppendAllText(logFileName, String.Format("{0} ", Environment.NewLine) + "Service Stopped At: " + DateTime.Now.ToString());
        }
    }
}
