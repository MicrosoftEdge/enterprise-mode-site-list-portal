using EMIEWebPortal.Common;
using EMIEWebPortal.DataModel;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web.Mvc;
using System.Xml;
using System.Xml.Linq;
using XMLHelperLib;



namespace EMIEWebPortal.Controllers
{
    /// <summary>
    /// This controller will have all the methods regarding XML, like edit, delete and add in Xml,
    /// Check URL in XMl and Ping URL
    /// </summary>
    public class XMLHelperController : Controller
    {

        XMLHelper xmlHelper = new XMLHelper();
        static ReaderWriterLockSlim rwLock = new ReaderWriterLockSlim();
        public XmlDocument xmlDoc = new XmlDocument();

        // GET: SiteListXml
        public ActionResult Index()
        {
            return View();
        }

        #region URLValidationFuncitonality
        /// <summary>
        /// This method check URL entered in the XML list, the method will check if the loaded XML file is
        /// v1 or v2 version, and will check if the particular file contains the URL, and accordingly gives the result
        /// </summary>
        /// <param name="findString"></param>
        /// <returns>bool</returns>
        public bool CheckUrl(Uri findString)
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
            return xmlHelper.CheckUrl(findString, config);
        }


        public void CheckFile(string path)
        {
            xmlHelper.CheckFile(path);
        }



        /// <summary>
        /// This is a private method which will return just the Host of the whole URL, this method will
        /// remove http:// or https:// from the URL
        /// </summary>
        /// <example>if "http://www.microsoft.com" is entered, this method will return "www.microsoft.com"</example>
        /// <param name="findString"></param>
        /// <returns></returns>
        public string GetUrl(Uri findString)
        {
            return xmlHelper.GetURL(findString);
        }

        /// <summary>
        /// This method tries to ping or reach the entered URL,
        /// A timeout of 15 seconds have been set
        /// </summary>
        /// <param name="URL">Full URL is to be passed as parameters</param>
        /// <example>http://www.microsoft.com</example>
        /// <returns>bool</returns>
        public bool PingUrl(Uri url)
        {
            return xmlHelper.PingURL(url);
        }



        /// <summary>
        /// This method searches for previous tickets for the URL entered
        /// and returns the ticket number if it is unclosed/
        /// </summary>
        /// <param name="findString">URL</param>
        /// <returns>Request Number</returns>
        public int PreviousTicket(string findUrl)
        {
            Uri findString = new Uri(findUrl);
            return xmlHelper.PreviousTicket(findString);
        }


        #endregion


        #region OperationOnXML's

        /// <summary>
        /// This method will decide which method to call based on the version of XML
        /// </summary>
        /// <param name="ticket">ticket object has to be passed as first parameter</param>
        /// <param name="operation">Operation enumeration parameter</param>
        /// <example>OperationOnXML(ticketObject, Operation.ProductionRollBack)</example>
        public void OperationOnXML(Tickets ticket, Operation operation)
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
            xmlHelper.OperationOnXML(ticket, operation, config);
        }

        #endregion

        #region CommonOperation


        /// <summary>
        /// This method will check for the version of the XML loaded and return version according to it.
        /// For example if Admin has set a XML file to be used, this method will determine if the file loaded
        /// is of version V1 or V2
        /// </summary>
        /// <returns>Version of XML</returns>
        public string CheckVersion()
        {
            return xmlHelper.CheckVersion();
        }


        /// <summary>
        /// This initialization method will load the particulat xml which is needed, as in case of
        /// sandbox it would load the sandbox xml and same in production case and also it retreive rootnode
        /// which contains the new version of the xml which will be updated on saving
        /// </summary>
        /// <param name="ticket"></param>
        /// <param name="operation"></param>
        /// <returns></returns>
        public XmlNode InitializeXMLDetails(Operation operation)
        {
            return xmlHelper.InitializeXMLDetails(operation);
        }

        /// <summary>
        /// This method will be called in case of RollBack on Sandbox or Production XML
        /// This method will change the info of the URL to previous state that was before
        /// the ticket raised
        /// </summary>
        /// <param name="ticket">ticket object has to be passed as first parameter</param>
        /// <param name="operation">Operation enumeration parameter</param>
        /// <example>RollBack(ticketObject, Operation.ProductionRollBack)</example>
        public void Rollback(Tickets ticket, Operation operation)
        {
            xmlHelper.Rollback(ticket, operation);
        }
        #endregion


        #region OperationOnV2XML
        /// <summary>
        /// This method will operate for the URL in XML on according to changetype which is selected 
        /// while raising request, Add , Update and Delete are the options to be selected from the list
        /// and accordinly the methods will be called in following method.
        /// </summary>
        /// <param name="ticket">ticket object has to be passed as first parameter</param>
        /// <param name="operation">Operation enumeration parameter</param>
        /// <example>OperationOnV2(ticketObject, Operation.AddInSandbox)</example>
        public void OperationOnV2(Tickets ticket, Operation operation)
        {
            xmlHelper.OperationOnV2(ticket, operation);
        }


        /// <summary>
        /// This method will add the URL in the xml with sibling comments. 
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        /// <param name="URL">URL without http:// or https://</param>
        /// <param name="rootnode">Rootnode which is intialized in InitializeXMLDetails</param>
        public void AddToV2Xml(Tickets ticket, string url)
        {
            xmlHelper.AddToV2XML(ticket, url);
        }


        /// <summary>
        /// This method will edit/update the URL's content in the xml with sibling comments. 
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        /// <param name="URL">URL without http:// or https://</param>
        /// <param name="rootnode">Rootnode which is intialized in InitializeXMLDetails</param>
        public void EditInV2Xml(Tickets ticket, string url)
        {
            xmlHelper.EditInV2XML(ticket, url);
        }

        /// <summary>
        /// This method will delete the existing URL in the xml with sibling comment
        /// </summary>
        /// <param name="URL">URL without http:// or https://</param>
        /// <param name="rootnode">Rootnode which is intialized in InitializeXMLDetails</param>
        public void DeleteFromV2Xml(string url)
        {
            xmlHelper.DeleteFromV2XML(url);
        }


        #endregion

        #region OperationOnV1XML
        public void OperationOnV1(Tickets ticket, Operation operation)
        {
            xmlHelper.OperationOnV1(ticket, operation);
        }

        /// <summary>
        /// This method will add the URLdomain and subdomain in the "V1" xml with sibling comments. 
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        public void AddToV1Xml(Tickets ticket)
        {
            xmlHelper.AddToV1XML(ticket);
        }

        /// <summary>
        /// This method will edit/update the URL's content in the V1 xml with sibling comments. To add in V1
        /// we will first delete the earlier entry with same domain and subdomain, save its previous childs, and add that
        /// again the V1 xml
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        public void EditInV1Xml(Tickets ticket)
        {
            xmlHelper.EditInV1XML(ticket);
        }


        public void DeleteFromV1Xml(Tickets ticket)
        {
            xmlHelper.DeleteFromV1XML(ticket);
        }

        #endregion


        #region SaveWithBackup
        /// <summary>
        /// This method will insert the comment on the top of the XML, make the backup file of loaded
        /// file with version number and save the changes
        /// </summary>
        /// <param name="xmlDoc">XmlDocument object</param>
        /// <param name="eventLog">XmlComment comment, which is added at the top, for the latest change info</param>
        /// <param name="ticket">Tickets model object</param>
        /// <param name="operation">Operation enum</param>
        /// <returns></returns>
        public bool SaveXml(XmlComment eventLog, Tickets ticket, Operation operation)
        {
            return xmlHelper.SaveXML(eventLog, ticket, operation);
        }


        /// <summary>
        /// This method makes the backupfile name according to the file which is loaded
        /// i.e. from Sanbox file or Production file
        /// </summary>
        /// <param name="xmlVersion">XML Version</param>
        /// <param name="ticket">Tickets model object</param>
        /// <param name="operation">Operation enumerations</param>
        /// <returns></returns>
        public string GetBackupFile(int xmlVersion, Operation operation)
        {
            return xmlHelper.GetBackupFile(xmlVersion, operation);
        }

        #endregion


        #region EnterpriseApp

        /// <summary>
        /// this function is for EMIE Tool it will update the informations of the existing urls into the xml file
        /// </summary>
        /// <param name="info">contains all the data need to be updated</param>
        #region UpdateXMLData
        public void UpdateXMLData(ManageSitesModel newInfo)
        {
            try
            {
                rwLock.EnterWriteLock();

                using (DataSet ds = new DataSet())
                {
                    string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");
                    ds.ReadXml(Internal);

                    if (newInfo.NotesAboutURL == null)
                        newInfo.NotesAboutURL = "";
                    //updating the information when the URL has a subdomain and we need to modify their parentId as well
                    if (newInfo.FullURL.IndexOf('/') != -1)
                    {
                        for (int i = 0; i < ds.Tables[2].Rows.Count; i++)
                        {
                            //Modifying the subdomain url informations
                            if (ds.Tables[2].Rows[i]["FullURL"].ToString().Equals(newInfo.FullURL))
                            {
                                ds.Tables[2].Rows[i]["FullURL"] = newInfo.FullURL;
                                ds.Tables[2].Rows[i]["LastModifiedBy"] = newInfo.LastModifiedBy;
                                ds.Tables[2].Rows[i]["Notes"] = newInfo.NotesAboutURL;
                                ds.Tables[2].Rows[i]["docMode"] = newInfo.SubDocMode;
                                ds.Tables[2].Rows[i]["OpenInIE"] = newInfo.OpenInForSubdomain;
                                for (int k = 0; k < ds.Tables[2].Rows.Count; k++)
                                {
                                    //Modifying the parent information as well
                                    if (ds.Tables[2].Rows[i]["parentId"].ToString().Equals(ds.Tables[2].Rows[k]["FullURL"].ToString()))
                                    {
                                        ds.Tables[2].Rows[k]["LastModifiedBy"] = newInfo.LastModifiedBy;
                                        ds.Tables[2].Rows[k]["FullURL"] = newInfo.DomainURL;
                                        ds.Tables[2].Rows[k]["Notes"] = newInfo.NotesAboutURL;
                                        ds.Tables[2].Rows[k]["docMode"] = newInfo.DomainDocMode;
                                        ds.Tables[2].Rows[k]["OpenInIE"] = newInfo.OpenIn;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        //if the url has no subdomain part means we don't have to modify the parent information so only modifying the domain info
                        for (int i = 0; i < ds.Tables[2].Rows.Count; i++)
                        {
                            if (ds.Tables[2].Rows[i]["FullURL"].ToString().Equals(newInfo.FullURL))
                            {
                                ds.Tables[2].Rows[i]["LastModifiedBy"] = newInfo.LastModifiedBy;
                                ds.Tables[2].Rows[i]["FullURL"] = newInfo.DomainURL;
                                ds.Tables[2].Rows[i]["Notes"] = newInfo.NotesAboutURL;
                                ds.Tables[2].Rows[i]["docMode"] = newInfo.DomainDocMode;
                                ds.Tables[2].Rows[i]["OpenInIE"] = newInfo.OpenIn;
                                break;
                            }
                        }
                    }
                    ds.Tables[0].Rows[0]["version"] = (Convert.ToInt32(ds.Tables[0].Rows[0]["version"].ToString()) + 1).ToString();
                    ds.WriteXml(Internal);
                }
                rwLock.ExitWriteLock();
            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion


        /// <summary>
        /// this method create the basic static structure of the xml file
        /// </summary>
        /// <param name="Internal">its the xml path</param>
        private void CreateStructure(string Internal)
        {
            rwLock.EnterWriteLock();
            XmlDocument xmldoc = new XmlDocument();
            //Creating the declaration into the xml
            XmlDeclaration dec = xmldoc.CreateXmlDeclaration("1.0", null, null);
            xmldoc.AppendChild(dec);
            //creating the root element
            XmlElement RuleElement = xmldoc.CreateElement("rules");
            RuleElement.SetAttribute("version", "0");
            //Creating the required elements static through out the code
            XmlElement EMIEElement = xmlDoc.CreateElement("emie");
            RuleElement.AppendChild(EMIEElement);
            xmldoc.AppendChild(RuleElement);
            xmldoc.Save(Internal);
            rwLock.ExitWriteLock();
        }

        /// <summary>
        /// This function returns all the URL related information to be sent to UI to display
        /// the data on the page load
        /// </summary>
        /// <returns>URL's info in Json format</returns>
        public JsonResult GetSiteInfo()
        {
            string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");
            List<ManageSitesModel> list = new List<ManageSitesModel>(); //int i = 0;
            try
            {
                rwLock.EnterReadLock();
                //load the xml in XDocument object
                XDocument doc = XDocument.Load(Internal);
                //selecting the related information from the XML file 
                var excludeAttribute = doc.Descendants("domain").Attributes("OpenInIE").ToList();
                var LastModifiedBy = doc.Descendants("emie").Elements("domain").Attributes("LastModifiedBy").ToList();
                var Notes = doc.Descendants("emie").Elements("domain").Attributes("Notes").ToList();
                var docModeAttribute = doc.Descendants("domain").Attributes("docMode").ToList();
                var parentIdAttribute = doc.Descendants("domain").Attributes("parentId").ToList();
                var FullURL = doc.Descendants("emie").Elements("domain").Attributes("FullURL").ToList();
                string version = doc.Root.Attribute("version").Value;
                //Inserting the data into ManageSitesModel object and adding into the list
                for (int k = 0; k < excludeAttribute.Count; k++)
                {
                    ManageSitesModel site = new ManageSitesModel();
                    //if the exclude is true means openInIE is false
                    site.OpenIn = (excludeAttribute[k].Value);
                    site.LastModifiedBy = LastModifiedBy[k].Value;
                    site.NotesAboutURL = Notes[k].Value;
                    site.DomainDocMode = docModeAttribute[k].Value;
                    site.FullURL = FullURL[k].Value;
                    site.EmieVersion = version;
                    site.ParentId = parentIdAttribute[k].Value == "null" ? null : parentIdAttribute[k].Value;
                    list.Add(site);
                }

            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                rwLock.ExitReadLock();
            }
            JsonResult json = new JsonResult(); json.MaxJsonLength = int.MaxValue; json.Data = list;
            return json;
        }

        /// <summary>
        /// This function clears all the domain node in the internalUrls.xml file 
        /// giving no site info available to be displayed on the UI
        /// </summary>
        public void ClearLists()
        {
            rwLock.EnterWriteLock();
            string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");
            XDocument xdocemie = XDocument.Load(Internal);
            xdocemie.Descendants("domain").ToList().Remove();
            xdocemie.Save(Internal);

            using (DataSet ds = new DataSet())
            {
                ds.ReadXml(Internal);
                ds.Tables[0].Rows[0]["version"] = "0";
                ds.WriteXml(Internal);
            }
            rwLock.ExitWriteLock();
        }


        /// <summary>
        /// This function will add bulk websites from the file the file is already parsed and the 
        /// informations of the websites to be added will be received in the manageSites model array
        /// </summary>
        /// <param name="info"></param>
        public void BulkAddFromFile1(ManageSitesModel[] info, bool? isSingleAddition)
        {
            rwLock.EnterWriteLock();
            try
            {

                //File path string
                string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");

                //Creating the xml structure to save the information if not present already
                //if the file has no any info all the data is deleted by mistake then this will throw an exception which is already handled and will create the required structure
                using (XmlReader reader = XmlReader.Create(Internal))
                {
                    try
                    {
                        if (reader.Read() != true)
                            CreateStructure(Internal);
                    }
                    catch (XmlException)
                    {
                        reader.Close();
                        CreateStructure(Internal);
                    }
                }

                //Loading the xml file into the xdocument object
                XDocument xdocemie = XDocument.Load(Internal);

                //get the list of all the domain info added into the xml file
                var list = xdocemie.Descendants("domain").ToList();
                var distinctList = info.Select(o => o.FullURL).ToArray();
                //Remove all the websites which are already present as they need to be updated by the bulk file uploaded information
                foreach (var domain in list)
                {
                    for (int i = 0; i < distinctList.Length; i++)
                    {
                        if (domain.Attribute("FullURL") != null)
                            if (domain.Attribute("FullURL").Value.Equals(distinctList[i]))
                            {
                                domain.Remove();
                                i++;
                            }
                    }
                }

                string comments = info[0].ValidateURL ? info[0].NotesAboutURL : "Bulk Added On " + DateTime.Now.ToString("MM/dd/yyyy") + "";


                //Adding the nodes to the xml for the bulk upload file
                foreach (var information in info)
                {

                    xdocemie.Root.Element("emie").AddFirst(new XElement("domain", new XAttribute("LastModifiedBy", information.LastModifiedBy)
                           , new XAttribute("Notes", comments == null ? "" : comments), new XAttribute("FullURL", information.FullURL)
                           , new XAttribute("docMode", information.DomainDocMode)
                           , new XAttribute("OpenInIE", information.OpenIn)
                           , new XAttribute("parentId", information.ParentId == null ? "null" : information.ParentId)));

                }
                xdocemie.Save(Internal);

                //Incereasing the version of the emie website list by 1
                if (rwLock.WaitingWriteCount == 0)
                {
                    DataSet ds = new DataSet();
                    ds.ReadXml(Internal);
                    ds.Tables[0].Rows[0]["version"] = (Convert.ToInt32(ds.Tables[0].Rows[0]["version"].ToString()) + 1).ToString();
                    ds.WriteXml(Internal);
                }
            }
            catch (Exception) { throw; }
            finally
            {
                rwLock.ExitWriteLock();
            }
        }

        /// <summary>
        /// this function finds the matching url and delete from the record
        /// </summary>
        /// <param name="SiteInfo">contains all the info of the website to be deleted</param>
        public void DeleteSite(ManageSitesModel siteInfo)
        {
            try
            {
                rwLock.EnterWriteLock();
                //File path string
                string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");

                //Loading the xml file into the xdocument object
                XDocument xdocemie = XDocument.Load(Internal);
                string domainUrl = null; bool isDomain = false;
                if (siteInfo.FullURL.IndexOf('/') == -1)
                    isDomain = true;
                //get the list of all the domain info added into the xml file
                var list = xdocemie.Descendants("domain").ToList();
                //Remove  the websites which is matching with the info in the siteInfo object
                foreach (var domain in list)
                {
                    if (domain.Attribute("FullURL") != null && siteInfo != null)
                    {
                        if (domain.Attribute("FullURL").Value.Contains(siteInfo.FullURL))
                        {
                            if (domain.Attribute("FullURL").Value.Equals(siteInfo.FullURL))
                            {
                                domain.Remove();
                                if (!isDomain)
                                    break;
                            }
                            else
                            {
                                if (domain.Attribute("FullURL").Value.IndexOf('/') != -1)
                                    domainUrl = domain.Attribute("FullURL").Value.Substring(0, domain.Attribute("FullURL").Value.IndexOf('/'));
                                else
                                    continue;
                                if (domainUrl.Equals(siteInfo.FullURL))
                                    domain.Remove();
                            }
                        }
                    }
                }
                xdocemie.Save(Internal);
                //Incereasing the version of the emie website list by 1
                DataSet ds = new DataSet();
                ds.ReadXml(Internal);
                ds.Tables[0].Rows[0]["version"] = (Convert.ToInt32(ds.Tables[0].Rows[0]["version"].ToString()) + 1).ToString();
                ds.WriteXml(Internal);
                rwLock.ExitWriteLock();
            }
            catch (Exception) { throw; }
        }



        /// <summary>
        /// this functions will call the bulkupload function in different threads
        /// it helps in reducing the time taken in uploading the sites
        /// </summary>
        /// <param name="info">its the array of the sites to be uploaded</param>
        public void BulkAddFromFile(ManageSitesModel[] info, bool? isSingleAddition)
        {
            ReaderWriterLock locker = new ReaderWriterLock();
            locker.AcquireWriterLock(2000);
            if (locker.WriterSeqNum > 1)
            {
                Thread th1 = new Thread(() => BulkAddFromFile1(info, isSingleAddition));
                th1.Start();
            }
            locker.ReleaseWriterLock();
        }

        /// <summary>
        /// this method will get all the websites from the production and sent to the tool to be diaplyed
        /// and it also reads all the comments to extract the application information
        /// </summary>
        /// <returns>this function returns the application info and the xml string</returns>
        public JsonResult getSitesFromProduction()
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
            string xmlData = xmlHelper.getProductionSites(config);
            //XDocument prodXml = XDocument.Parse(xmlData);
            //var comments = (from node in prodXml.Elements().DescendantNodesAndSelf()
            //                where node.NodeType == XmlNodeType.Comment
            //                select node.ToString()).ToList();
            //List<Dictionary<string,string>> sitesInformation = new List<Dictionary<string,string>>();
            //foreach (var comment in comments)
            //{
            //    Dictionary<string,string> name = new Dictionary<string,string>(); 
            //    string[] check = { Constants.spacing.ToString(), System.Environment.NewLine };
            //    var info = comment.Split(check, StringSplitOptions.None);
            //    foreach (var site in info)
            //    {
            //        if (site.IndexOf(Constants.Owner) != -1)
            //            name["Owner"] = site.Substring(site.IndexOf(Constants.Owner) + Constants.Owner.Length);
            //        if (site.IndexOf(Constants.Name) != -1)
            //            name["Name"] = site.Substring(site.IndexOf(Constants.Name) + Constants.Name.Length);
            //        if (site.IndexOf(Constants.TicketId) != -1)
            //            name["TicketId"] = site.Substring(site.IndexOf(Constants.TicketId) + Constants.TicketId.Length);
            //    }
            //    sitesInformation.Add(name);
            //}
            //var data = new { comments = sitesInformation,xmlData };
            return Json(xmlData, JsonRequestBehavior.AllowGet);
        }
        #endregion

    }
}