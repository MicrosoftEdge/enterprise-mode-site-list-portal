using EMIEWebPortal.Common;
using EMIEWebPortal.DataModel;
using EMIEWebPortal.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading;
using System.Xml;
using System.Xml.Linq;


namespace XMLHelperLib
{
    /// <summary>
    /// This controller will have all the methods regarding XML, like edit, delete and add in Xml,
    /// Check URL in XMl and Ping URL
    /// </summary>
    public class XMLHelper
    {
        private LOBMergedEntities DbEntity = new LOBMergedEntities();
        static int xmlVersion = 0;

        //This line can be used in later stages, as this "Location" tag is in metadata for comments, so this line
        //is added in all the  comments as a commented code which can be used later.
        //string Location = "Mindtree MSOF";
        XmlComment newComment;

        //statis veriables to access XML's from UNC path
        static string UNCPath = string.Empty;
        static string UserName = string.Empty;
        static string Domain = string.Empty;
        static string Password = string.Empty;

        static string V2Sandboxfile = string.Empty;
        static string V2ProdFile = string.Empty;

        static ReaderWriterLockSlim rwLock = new ReaderWriterLockSlim();


        public XmlNode rootNode;
        public XDocument xDoc;
        public XmlDocument xmlDoc = new XmlDocument();


        #region URLValidationFuncitonality
        /// <summary>
        /// This method check URL entered in the XML list, the method will check if the loaded XML file is
        /// v1 or v2 version, and will check if the particular file contains the URL, and accordingly gives the result
        /// </summary>
        /// <param name="findUrl"></param>
        /// <returns>bool</returns>
        public bool CheckUrl(Uri findUrl, Configuration config)
        {
            try
            {
                if (config != null)
                {
                    GetSandboxConfigSettings(config);
                }

                //if config settings are done in DB then use that environment and credential else user logged in user's credential
                if (config != null)
                {
                    using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
                    {
                        if (unc.NetUseWithCredentials(UNCPath, UserName, Domain, Password))
                        {
                            CheckFile(V2Sandboxfile);
                            return CheckUrlForSandbox(findUrl);
                        }
                        else
                        {
                            throw new Exception("Unable to update EMIE site list. Please contact Site Administrator");
                        }
                    }
                }

            }
            catch (Exception)
            {

                throw;
            }
            return false;
        }


        /// <summary>
        /// This method check if any XML is present in the location as per the configuration data, if not 
        /// a V2 xml tags should be created as default, with version as '1' and also with 'created by' tags.
        /// </summary>
        /// <param name="path">XML Path</param>
        public void CheckFile(string path)
        {
            try
            {
                //If the path does not exists,generate the path with default tags.
                if (!System.IO.File.Exists(path))
                {
                    XDocument doc = new XDocument(
                        new XElement("site-list",
                            new XAttribute("version", "1"),
                            new XElement("createdby",
                                new XElement("tool", "EMIESelfServicePortal"),
                                new XElement("version", "1.0"),
                                new XElement("date-created", DateTime.Now.ToString(new CultureInfo("en-GB"))))));
                    doc.Save(path);

                }
                else
                {
                    if (xDoc == null)
                    {
                        xDoc = XDocument.Load(path);
                        //if path exist but with blank file, generate the tags.
                        if (xDoc.Root == null)
                        {
                            XDocument doc = new XDocument(
                            new XElement("site-list",
                                new XAttribute("version", "1"),
                                new XElement("createdby",
                                    new XElement("tool", "EMIESelfServicePortal"),
                                    new XElement("version", "1.0"),
                                    new XElement("date-created", DateTime.Now.ToString(new CultureInfo("en-GB"))))));
                            doc.Save(path);
                        }

                    }
                }
            }
            catch
            {

                throw;
            }
        }

        /// <summary>
        /// Method will check url existance in Sandbox Xml based on the XML file version, present on the 
        /// specified location in the configuration file and return the result in bool if the url is present
        /// </summary>
        /// <param name="findString">url to be searched</param>
        /// <returns>bool value</returns>
        private bool CheckUrlForSandbox(Uri findString)
        {
            bool result = false;
            xDoc = XDocument.Load(V2Sandboxfile);
            xmlDoc.Load(V2Sandboxfile);
            string version = CheckVersion();
            string urlHost = null;
            Uri uri = findString;

            //Check if URL consists of subdomain, and get the domain accordingly
            if (!uri.AbsolutePath.Trim().Equals(@"/"))
                urlHost = uri.Host.Trim() + uri.AbsolutePath.Trim();
            else
                urlHost = uri.Host.Trim();

            try
            {
                if (version == "V2")
                {
                    if (xDoc.Element("site-list").Descendants("site") != null)
                    {
                        // Getting the URL list from V2 XML
                        var URLlist = from i in xDoc.Element("site-list").Descendants("site")
                                      select new
                                      {
                                          URL = (string)i.Attribute("url")
                                      };

                        //Matching with the entered URL
                        if (URLlist.Any(o => o.URL.ToLower().Equals(urlHost.ToLower())))
                            result = true;
                        else
                            result = false;
                    }
                    else
                        result = false;

                }
                else
                {
                    //Check if URL contains the subdomain.
                    bool isSubdomainPresent = urlHost.Contains('/');

                    //Check if subdomain is null
                    if (uri.AbsolutePath.Trim().Equals(@"/"))
                        isSubdomainPresent = false;


                    if (xDoc.Descendants(XName.Get("domain")) != null)
                    {
                        if (!isSubdomainPresent)
                        {
                            //If subdomain is null, check only domain in the V1 file.
                            var UrlList = xDoc.Descendants(XName.Get("domain")).Where(o => o.FirstNode.ToString().Trim().ToLower().Equals(uri.Host.Trim()));
                            if (UrlList.Count() > 0)
                                result = true;
                        }
                        else
                        {
                            var UrlList = xDoc.Descendants(XName.Get("domain")).Where(o => o.FirstNode.ToString().Trim().ToLower().Equals(uri.Host.Trim()));
                            IEnumerable<XElement> subDomainlist = null;

                            if (UrlList.Count() > 0)
                            {
                                //Check domain in the V1 file.
                                foreach (var item in UrlList)
                                {
                                    //Check subdomain in the domain found of V1 file.
                                    subDomainlist = item.Descendants("path").Where(o => o.FirstNode.ToString().Trim().ToLower().Equals(uri.AbsolutePath.Trim()));
                                    if (subDomainlist.Count() > 0)
                                        result = true;
                                }
                            }

                        }

                    }
                    else
                        result = false;
                }

                return result;
            }

            catch (Exception)
            {

                throw;
            }
        }


        /// <summary>
        /// This is a private method which will return just the Host of the whole URL, this method will
        /// remove http:// or https:// from the URL
        /// </summary>
        /// <example>if "http://www.microsoft.com" is entered, this method will return "www.microsoft.com"</example>
        /// <param name="findUrl"></param>
        /// <returns></returns>
        public string GetURL(Uri findUrl)
        {
            if (findUrl != null)
            {
                Uri uri = findUrl;
                return uri.Host.Trim();
            }
            else
                return "";
        }


        /// <summary>
        /// This method tries to ping or reach the entered URL,
        /// A timeout of 15 seconds have been set
        /// </summary>
        /// <param name="URL">Full URL is to be passed as parameters</param>
        /// <example>http://www.microsoft.com</example>
        /// <returns>bool</returns>
        public bool PingURL(Uri url)
        {
            WebRequest request = WebRequest.Create(url);
            request.Timeout = 30000;
            try
            {
                //Implemented to see if the URL is reachable
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();

                if (response == null || response.StatusCode != HttpStatusCode.OK)
                {
                    //alert
                }
            }
            catch (WebException)
            {
                return false;

            }
            catch (Exception)
            {
                return false;
                throw;
            }

            return true;

        }


        /// <summary>
        /// This method searches for previous tickets for the URL entered
        /// and returns the ticket number if it is unclosed/
        /// </summary>
        /// <param name="findUrl">URL</param>
        /// <returns>Request Number</returns>
        public int PreviousTicket(Uri findUrl)
        {
            int id = 0;
            int previousid = 0;
            List<int> idList;
            try
            {
                if (findUrl != null)
                {
                    //Want to keep this, can be used. Will delete later -- Pallav
                    //if (findUrl[findUrl.Length - 1].Equals('/'))
                    //    findUrl = findUrl.Remove(findUrl.Length - 1);

                    //Get the list of previous logged ticket for the same URL

                    //Matching the URL with the entered Url, if the absolute path of the url is null
                    if (findUrl.AbsolutePath.Equals("/"))
                    {
                        idList = (from ticket in DbEntity.EMIETickets.DefaultIfEmpty()
                                  where (ticket.AppSiteLink.ToLower().Equals(findUrl.OriginalString) || ticket.AppSiteLink.ToLower().Equals(findUrl.Host) || ticket.AppSiteLink.ToLower().Equals(findUrl.AbsoluteUri))
                                  select ticket.TicketId).ToList();
                    }
                    //Matching the URL with the entered Url, if the absolute path of the url is not null
                    else
                    {
                        idList = (from ticket in DbEntity.EMIETickets.DefaultIfEmpty()
                                  where ticket.AppSiteLink.ToLower().Equals(findUrl.AbsoluteUri)
                                  select ticket.TicketId).ToList();
                    }
                    if (idList.Count != 0)
                    {
                        //Taking the latest ticket logged.
                        previousid = idList.Max();
                        if (DbEntity.EMIETickets.Any(o => o.TicketId == previousid && o.FinalCRStatusId != (int)TicketStatus.SignedOff && o.FinalCRStatusId != (int)TicketStatus.RolledBack))
                        {
                            //If the last ticket logged is still active, return the ticket id.
                            return previousid;
                        }
                    }

                    //if no previous ticket logged, return 0.
                    return id;
                }
                else
                    return id;
            }
            catch (Exception)
            {

                throw;
            }
        }

        #endregion


        #region ConfigurationSettingsRegion
        /// <summary>
        /// Get UNc path and user credential from database in order to access XML,
        /// </summary>
        /// <param name="operation">Operation</param>
        private static void GetConfiguredCredentials(Operation operation, Configuration config)
        {
            if (config != null)
            {
                //If sandbox environment operation is to be done
                if (operation == Operation.AddInSandbox || operation == Operation.SandboxRollback)
                {
                    //Config settings for sandbox environment
                    GetSandboxConfigSettings(config);
                }
                else
                {
                    //If production environment operation is to be done
                    if (operation == Operation.AddInProduction || operation == Operation.ProductionRollback)
                    {
                        //Config settings for production environment
                        GetProductionConfigSettings(config);
                    }
                }

            }
        }


        /// <summary>
        /// Gets the UNCPath and config details for the production environment
        /// </summary>
        /// <param name="config">configuration object</param>
        private static void GetProductionConfigSettings(Configuration config)
        {
            int index = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ProductionEnvironment).value.ToString().LastIndexOf('\\');
            UNCPath = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ProductionEnvironment).value.ToString().Substring(0, index);
            UserName = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ProductionUserName).value.ToString();
            Domain = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ProductionUserDomain).value.ToString();
            Password = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ProductionPassword).value.ToString();
            V2ProdFile = config.ConfigSettings.SingleOrDefault(item => item.key == ConfigConstants.ProductionEnvironment).value.ToString();
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
        #endregion


        #region OperationOnXML's

        /// <summary>
        /// This method will decide which method to call based on the version of XML
        /// </summary>
        /// <param name="ticket">ticket object has to be passed as first parameter</param>
        /// <param name="operation">Operation enumeration parameter</param>
        /// <example>OperationOnXML(ticketObject, Operation.ProductionRollBack)</example>
        public void OperationOnXML(Tickets ticket, Operation operation, Configuration config)
        {
            //Get UNc path and user credential from database in order to access XML
            GetConfiguredCredentials(operation, config);

            try
            {
                //Get access to UNC path
                using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
                {
                    if (unc.NetUseWithCredentials(UNCPath, UserName, Domain, Password) || unc.LastError==1219)
                    {
                        if (operation == Operation.AddInSandbox || operation == Operation.SandboxRollback)
                        {
                            CheckFile(V2Sandboxfile);
                        }
                        else if (operation == Operation.AddInProduction || operation == Operation.ProductionRollback)
                        {
                            CheckFile(V2ProdFile);
                        }


                        rootNode = InitializeXMLDetails(operation);
                        string version = null;

                        switch (operation)
                        {
                            //If operation is add, update or delete from Sandbox File
                            case Operation.AddInSandbox:
                                version = CheckVersion();

                                //Get the archive for the ticket logged and the data in the xml
                                GetArchive(ticket, version);
                                if (version == "V2")
                                {
                                    //Operate on the V2 xml according to the operation specified
                                    OperationOnV2(ticket, operation);
                                }
                                else
                                {
                                    //Operate on the V1 xml according to the operation specified
                                    OperationOnV1(ticket, operation);
                                }
                                break;

                            //If operation is add, update or delete from Production File
                            case Operation.AddInProduction:
                                version = CheckVersion();
                                if (version == "V2")
                                {
                                    //Operate on the V2 xml according to the operation specified
                                    OperationOnV2(ticket, operation);
                                }
                                else
                                {
                                    //Operate on the V1 xml according to the operation specified
                                    OperationOnV1(ticket, operation);
                                }
                                break;

                            //If operation is related to rollback from Sandbox File
                            case Operation.SandboxRollback:
                                Rollback(ticket, operation);
                                break;

                            //If operation is related to rollback from Production File
                            case Operation.ProductionRollback:
                                Rollback(ticket, operation);
                                break;
                        }
                    }
                    else
                    {
                        throw new ArgumentException("Unable to update EMIE site list. Please contact site administrator");
                    }
                }
            }
            catch (Exception)
            {

                throw;
            }
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
            try
            {
                Uri uri = new Uri(ticket.AppSiteUrl);
                string URL = null;

                if (!uri.AbsolutePath.Trim().Equals(@"/"))
                    URL = uri.Host.Trim() + uri.AbsolutePath.Trim();
                else
                    URL = uri.Host.Trim();
                string version = CheckVersion();

                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                {
                    //If the ticket was added on a ticket, the changetype would be set to add
                    //and when it is opted to rolledback, it have to be deleted from the XML
                    if (version == "V2")
                        DeleteFromV2XML(URL);
                    else
                        DeleteFromV1XML(ticket);


                }
                else if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Delete)
                {
                    //If the ticket was deleted on a ticket, the changetype would be set to delete
                    //and when it is opted to rolledback, it have to be added back to the XML
                    if (version == "V2")
                        AddToV2XML(ticket, URL);
                    else
                        AddToV1XML(ticket);
                }
                else
                {
                    if (version == "V2")
                        EditInV2XML(ticket, URL);
                    else
                        EditInV1XML(ticket);
                }

                ChangeType changeType = (ChangeType)ticket.ChangeType.ChangeTypeId;

                XmlComment eventLog = xmlDoc.CreateComment(TicketStatus.RolledBack + " " + changeType + " from "
                        + ticket.TicketId + " at " + DateTime.Now);


                bool result = SaveXML(eventLog, ticket, operation);


                //If save to XML is successfull, we need to change the 
                //SandboxRollback or ProductionRollback to 0 in EMIE Tickets Archive table
                if (result)
                {
                    EMIETicketsArch emieTicket = DbEntity.EMIETicketsArches.Single(o => o.TicketId == ticket.TicketId);

                    if (operation == Operation.SandboxRollback)
                        emieTicket.SandboxRollback = false;
                    else
                    {
                        emieTicket.ProductionRollback = false;
                    }

                    DbEntity.SaveChanges();
                }
            }
            catch (Exception)
            {

                throw;
            }
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
            string rootName = xmlDoc.DocumentElement.Name;

            if (rootName == "rules")
                return "V1";
            else
                return "V2";

        }

        /// <summary>
        /// This method is to take the archive of the XML content to the EMIE Archive table as a back up
        /// So if rolledback is selected in future, the contents can be filled back to XML from the database table.
        /// </summary>
        /// <param name="ticketObj">Tickets model object is required</param>
        private void GetArchive(Tickets ticketObj, string version)
        {
            try
            {
                #region UrlDetail
                //Get the domain and subdomain from the url
                Uri uri = new Uri(ticketObj.AppSiteUrl);
                string domain = uri.Host.Trim();
                string subdomain = uri.AbsolutePath.Trim();
                #endregion

                #region PublicVariables
                int domainDocmode = (int)CompatModes.Default;
                int subdomainDocmode = 0;
                string domainOpenIn = null;
                string subDomainOpenIn = null;
                bool searchDomainInDocmode = false;
                bool searchSubDomainInDocMode = true;

                #endregion

                //Creating the object context, so that database and xml can be in sync and if the xml
                //changes failed, the database rows can be reverted as well. objectContext object will
                //open wherever we are entering some data in XML or database and close it wherever we need
                var objectContext = ((IObjectContextAdapter)DbEntity).ObjectContext;

                objectContext.Connection.Open();

                //Get the ticket from the EMIETicketsArch table.
                EMIETicketsArch emieticketArch = DbEntity.EMIETicketsArches.Single(dbTicket => dbTicket.TicketId == ticketObj.TicketId);

                //If the ticket is added in the XML, so we need not do the following operation as
                // there would not be any content to save from XML to table as a backup in case of rollback
                if (ticketObj.ChangeType.ChangeTypeId != (int)ChangeType.Add)
                {
                    #region V2Archive
                    if (version == "V2")
                    {
                        //Take archive from V2 Xml
                        GetV2Archive(domain, subdomain, ref domainDocmode, ref subdomainDocmode, ref domainOpenIn, ref subDomainOpenIn);

                    }
                    #endregion
                    #region V1Archive
                    else
                    {
                        //In case of V1 xml, breaking in two parts, first getting all the 'emie' nodes from the xml.
                        #region EmieSectionArchive
                        GetV1EMIEArchive(domain, subdomain, ref domainDocmode, ref subdomainDocmode, ref domainOpenIn, ref subDomainOpenIn, ref searchDomainInDocmode, ref searchSubDomainInDocMode);
                        #endregion

                        #region DocModeArchive
                        GetV1DocModeArchive(domain, subdomain, ref domainDocmode, ref subdomainDocmode, ref domainOpenIn, ref subDomainOpenIn, searchDomainInDocmode, searchSubDomainInDocMode);
                        #endregion
                    }
                    #endregion
                    #region EmieTicketArchiveTableUpdate
                    //Entering the retreived data in the EMIETICKETARCH table for Domain open in
                    if (domainOpenIn == OpenIn.MSEdge.ToString())
                        emieticketArch.DomainOpenInEdge = true;
                    else if (domainOpenIn == OpenIn.IE11.ToString())
                        emieticketArch.DomainOpenInEdge = false;

                    //Entering the retreived data in the EMIETICKETARCH table for Domain DocModeId
                    emieticketArch.DocModeId = domainDocmode;

                    //Entering data for SubDomain
                    if (!String.IsNullOrEmpty(subdomain) && !subdomain.Equals(@"/"))
                    {
                        emieticketArch.SubDomainDocModeId = subdomainDocmode;

                        if (subDomainOpenIn == OpenIn.MSEdge.ToString())
                            emieticketArch.SubDomainOpenInEdge = true;
                        else if (subDomainOpenIn == OpenIn.IE11.ToString())
                            emieticketArch.SubDomainOpenInEdge = false;
                    }
                    #endregion
                }

                //Making sandbox rollback entry as true, so to know if the following entry can be rolled back from sandbox environment
                emieticketArch.SandboxRollback = true;

                //Save changes in the transition scope, and closing the object context connection
                DbEntity.SaveChanges();
                objectContext.Connection.Close();

            }
            catch (Exception)
            {

                throw;
            }
        }


        /// <summary>
        /// This methods gets the data of V1 xml entry and store it in the database for future use, if
        /// rollback operation is selected, this method retreives the data store in domain tags of "docMode"
        /// section of the V1 xml, and store in the reference variables of GetArchive method to enter in database
        /// </summary>
        /// <param name="domain">domain string</param>
        /// <param name="subdomain">subdomain string</param>
        /// <param name="domainDocmode">domain docmode id</param>
        /// <param name="subdomainDocmode">subdomain docmode id</param>
        /// <param name="domainOpenIn">domain open in edge(bool)</param>
        /// <param name="subDomainOpenIn">domain open in edge(bool)</param>
        /// <param name="searchDomainInDocmode">bool search for domain</param>
        /// <param name="searchSubDomainInDocMode">bool search for subdomain</param>
        private void GetV1DocModeArchive(string domain, string subdomain, ref int domainDocmode, ref int subdomainDocmode, ref string domainOpenIn, ref string subDomainOpenIn, bool searchDomainInDocmode, bool searchSubDomainInDocMode)
        {
            //Get the docMode tag node children for matching with domain and subdomain
            XmlNodeList docModeNodes = rootNode.SelectNodes("docMode//domain");
            foreach (XmlNode docModeDomainNode in docModeNodes)
            {
                string[] words = docModeDomainNode.InnerText.Trim().Split('/');
                if (words[0].Trim().ToLower().Equals(domain))
                {
                    //if the information was not found in emie section, will check in the docMode section
                    if (searchDomainInDocmode)
                    {

                        string docModeInteger = docModeDomainNode.Attributes["docMode"].Value;

                        if (docModeDomainNode.Attributes["doNotTransition"] != null)
                            domainOpenIn = OpenIn.MSEdge.ToString();

                        //Converting string to integer docMode 
                        domainDocmode = ConvertValueToDocMode(docModeInteger);


                    }

                    //If subdomain is not found in emie section, will check in docMode section.
                    if (searchSubDomainInDocMode)
                    {
                        XmlNodeList docModeChildren = docModeDomainNode.ChildNodes;
                        if (docModeChildren.Count > 0 && subdomain != "/")
                        {
                            foreach (XmlNode docModeChild in docModeChildren)
                            {
                                if (docModeChild.NodeType == XmlNodeType.Element && docModeChild.InnerText == subdomain)
                                {
                                    //Getting the tag details of subdomain
                                    string subDomaindocModeInteger = docModeChild.Attributes["docMode"].Value;

                                    if (docModeChild.Attributes["doNotTransition"] != null)
                                        subDomainOpenIn = OpenIn.MSEdge.ToString();

                                    subdomainDocmode = ConvertValueToDocMode(subDomaindocModeInteger);

                                }
                            }
                        }
                        else
                        {
                            subdomainDocmode = (int)CompatModes.Default;
                        }
                    }
                }
            }
        }

        /// <summary>
        /// This methods gets the data of V1 xml entry and store it in the database for future use, if
        /// rollback operation is selected, this method retreives the data store in domain tags of "emie"
        /// section of the V1 xml, and store in the reference variables of GetArchive method to enter in database
        /// </summary>
        /// <param name="domain">domain string</param>
        /// <param name="subdomain">subdomain string</param>
        /// <param name="domainDocmode">domain docmode id</param>
        /// <param name="subdomainDocmode">subdomain docmode id</param>
        /// <param name="domainOpenIn">domain open in edge(bool)</param>
        /// <param name="subDomainOpenIn">domain open in edge(bool)</param>
        /// <param name="searchDomainInDocmode">bool search for domain</param>
        /// <param name="searchSubDomainInDocMode">bool search for subdomain</param>
        private void GetV1EMIEArchive(string domain, string subdomain, ref int domainDocmode, ref int subdomainDocmode, ref string domainOpenIn, ref string subDomainOpenIn, ref bool searchDomainInDocmode, ref bool searchSubDomainInDocMode)
        {
            XmlNodeList emieNodes = rootNode.SelectNodes("emie//domain");
            foreach (XmlNode emiedomainNode in emieNodes)
            {
                string[] words = emiedomainNode.InnerText.Trim().Split('/');
                if (words[0].Trim().ToLower().Equals(domain))
                {
                    //Getting the details of 'exclude' tags, if exclude is false, will check other details,
                    //else will check the domain details in 'docMode' xml section
                    if (emiedomainNode.Attributes["exclude"].Value == "false")
                    {
                        //Getting details of 'forceCompatView' attribute.
                        if (emiedomainNode.Attributes["forceCompatView"] != null && emiedomainNode.Attributes["forceCompatView"].Value == "false")
                        {
                            domainDocmode = (int)CompatModes.IE7EnterpriseMode;
                        }
                        else
                            domainDocmode = (int)CompatModes.IE8EnterpriseMode;

                        //Getting detail of 'doNotTransition', if true, open in edge
                        if (emiedomainNode.Attributes["doNotTransition"] != null && emiedomainNode.Attributes["doNotTransition"].Value == "true")
                            domainOpenIn = OpenIn.MSEdge.ToString();

                        //if found the details of the tag, we will not check it's detail in docMode section
                        searchDomainInDocmode = false;
                    }
                    else
                    {
                        //if the details are not found, will check docMode section for the details.
                        searchDomainInDocmode = true;

                        if (emiedomainNode.Attributes["doNotTransition"] != null && emiedomainNode.Attributes["doNotTransition"].Value == "true")
                            domainOpenIn = OpenIn.MSEdge.ToString();
                    }


                    //Get the children of this node, to match the subdomain and get its details
                    XmlNodeList emieChildren = emiedomainNode.ChildNodes;

                    if (emieChildren.Count > 0 && subdomain != "/")
                    {
                        foreach (XmlNode emieChild in emieChildren)
                        {
                            if (emieChild.NodeType == XmlNodeType.Element && emieChild.InnerText == subdomain)
                            {
                                //Get the 'exclude' attribute details
                                if (emieChild.Attributes["exclude"].Value == "false")
                                {
                                    //Getting details of 'forceCompatView' attribute.
                                    if (emieChild.Attributes["forceCompatView"] != null && emieChild.Attributes["forceCompatView"].Value == "false")
                                    {
                                        subdomainDocmode = (int)CompatModes.IE7EnterpriseMode;
                                    }
                                    else
                                        subdomainDocmode = (int)CompatModes.IE8EnterpriseMode;


                                    //Getting details of 'doNotTransition' attribute.
                                    if (emieChild.Attributes["doNotTransition"] != null && emieChild.Attributes["doNotTransition"].Value == "true")
                                        subDomainOpenIn = OpenIn.MSEdge.ToString();

                                    searchSubDomainInDocMode = false;
                                }
                                else
                                {
                                    searchSubDomainInDocMode = true;

                                    if (emieChild.Attributes["doNotTransition"] != null && emieChild.Attributes["doNotTransition"].Value == "true")
                                        subDomainOpenIn = OpenIn.MSEdge.ToString();
                                }
                            }
                        }
                    }
                    else
                    {
                        searchSubDomainInDocMode = false;
                    }
                }
            }
        }

        /// <summary>
        /// This methods gets the data of V2 xml entry and store it in the database for future use, if
        /// rollback operation is selected, this method retreives the data store in site tags of site-list
        /// section of the V2 xml, and store in the reference variables of GetArchive method to enter in database
        /// </summary>
        /// <param name="domain">domain string</param>
        /// <param name="subdomain">subdomain string</param>
        /// <param name="domainDocmode">domain docmode id</param>
        /// <param name="subdomainDocmode">subdomain docmode id</param>
        /// <param name="domainOpenIn">domain open in edge(bool)</param>
        /// <param name="subDomainOpenIn">domain open in edge(bool)</param>
        /// <param name="searchDomainInDocmode">bool search for domain</param>
        /// <param name="searchSubDomainInDocMode">bool search for subdomain</param>
        private void GetV2Archive(string domain, string subdomain, ref int domainDocmode, ref int subdomainDocmode, ref string domainOpenIn, ref string subDomainOpenIn)
        {
            //Get the all childnodes from the xml list.
            XmlNodeList siteNodes = rootNode.ChildNodes;
            foreach (XmlNode siteNode in siteNodes)
            {
                //if node is 'Element' and 'URL'-Attribute is present.
                if (siteNode.NodeType == XmlNodeType.Element && siteNode.Attributes["url"] != null)
                {
                    //If 'url'-attribute matches with the domain, get the tag details and save in EMIETicketsArch table
                    if (siteNode.Attributes["url"].Value == domain)
                    {
                        string documentMode = siteNode["compat-mode"].InnerText;

                        domainDocmode = ConvertV2ValueToDocMode(documentMode);
                        domainOpenIn = siteNode["open-in"].InnerText;

                    }

                    //If subdomain is also present,get the tag details and save in EMIETicketsArch table
                    if (!String.IsNullOrEmpty(subdomain) && !subdomain.Equals(@"/"))
                    {
                        if (siteNode.Attributes["url"].Value == domain + subdomain)
                        {
                            string documentMode = siteNode["compat-mode"].InnerText;

                            subdomainDocmode = ConvertV2ValueToDocMode(documentMode);

                            subDomainOpenIn = siteNode["open-in"].InnerText;
                        }
                    }
                }
            }
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
            try
            {
                rwLock.EnterReadLock();


                switch (operation)
                {
                    case Operation.AddInSandbox:
                        xmlDoc.Load(V2Sandboxfile);
                        break;
                    case Operation.AddInProduction:
                        xmlDoc.Load(V2ProdFile);
                        break;
                    case Operation.SandboxRollback:
                        xmlDoc.Load(V2Sandboxfile);
                        break;
                    case Operation.ProductionRollback:
                        xmlDoc.Load(V2ProdFile);
                        break;
                }
                rwLock.ExitReadLock();

                //Getting the root node from the xml
                XmlNode xmlRootNode = xmlDoc.DocumentElement;

                //Getting the new version to be updated in the xml
                xmlVersion = ChangeXMLVersion();

                rwLock.EnterWriteLock();

                //Updating the rootnode version number in xml
                xmlRootNode.Attributes[0].Value = xmlVersion.ToString();

                return xmlRootNode;
            }
            catch (Exception)
            {

                throw;
            }
        }


        /// <summary>
        /// This method will check the version number of the loaded XML and return the next version number to be added.
        /// </summary>
        /// <returns>Version Number</returns>
        private int ChangeXMLVersion()
        {
            int xmlversion = Convert.ToInt32(xmlDoc.DocumentElement.Attributes[0].Value);
            xmlversion = xmlversion + 1;
            return xmlversion;
        }


        /// <summary>
        /// This is a private method used to get the Docmode name from the Docmode Id. When we read data from the XML:
        /// it will be read in the form of a string, and to convert that string to Docmode, this is a helper method which
        /// will retrung the integer of the Docmode.
        /// </summary>
        /// <param name="DomaindocModeInteger">Docmode is as a string</param>
        /// <returns>Docmode</returns>
        private int ConvertValueToDocMode(string DomaindocModeInteger)
        {
            if (DomaindocModeInteger == "5")
                return (int)CompatModes.IE5DocumentMode;
            else if (DomaindocModeInteger == "7")
                return (int)CompatModes.IE7DocumentMode;
            else if (DomaindocModeInteger == "8")
                return (int)CompatModes.IE8DocumentMode;
            else if (DomaindocModeInteger == "9")
                return (int)CompatModes.IE9DocumentMode;
            else if (DomaindocModeInteger == "10")
                return (int)CompatModes.IE10DocumentMode;
            else if (DomaindocModeInteger == "11" || DomaindocModeInteger == "edge")
                return (int)CompatModes.IE11DocumentMode;
            else
                return (int)CompatModes.Default;
        }

        /// <summary>
        /// This is a private method used to get the Docmode ID from the Docmode. When we read data from the XML:
        /// it will be read in the form of a string, and to convert that string to Docmode ID, this is a helper method which
        /// will retrung the integer of the Docmode. This method is a helper for converting DocMode found in V2 file
        /// </summary>
        /// <param name="DomaindocModeInteger">Docmode is as a string</param>
        /// <returns>Docmode</returns>
        private int ConvertV2ValueToDocMode(string DomaindocModeInteger)
        {
            if (DomaindocModeInteger == "IE5")
                return (int)CompatModes.IE5DocumentMode;
            else if (DomaindocModeInteger == "IE7")
                return (int)CompatModes.IE7DocumentMode;
            else if (DomaindocModeInteger == "IE8")
                return (int)CompatModes.IE8DocumentMode;
            else if (DomaindocModeInteger == "IE9")
                return (int)CompatModes.IE9DocumentMode;
            else if (DomaindocModeInteger == "IE10")
                return (int)CompatModes.IE10DocumentMode;
            else if (DomaindocModeInteger == "IE11" || DomaindocModeInteger == "MSEdge")
                return (int)CompatModes.IE11DocumentMode;
            else
                return (int)CompatModes.Default;
        }


        /// <summary>
        /// Returns custom docMode string which will be stored in V1 xml file
        /// </summary>
        /// <param name="docModeName">String Docmode</param>
        /// <returns>DocMode for V1</returns>
        private static string ConvertDocModeToValue(string docModeName)
        {
            switch (docModeName)
            {
                case "IE7Enterprise":
                    return "IE7";
                case "IE8Enterprise":
                    return "IE8";
                case "IE5":
                    return "5";
                case "IE7":
                    return "7";
                case "IE8":
                    return "8";
                case "IE9":
                    return "9";
                case "IE10":
                    return "10";
                case "IE11":
                    return "11";
                default: return "edge";
            }
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
            string URL = null;
            try
            {
                Uri uri = new Uri(ticket.AppSiteUrl);
                if (uri.AbsolutePath.Trim().Equals(@"/"))
                    URL = uri.Host.Trim();
                else
                    URL = uri.Host.Trim() + uri.AbsolutePath.Trim();


                //Particular action would be operated on site to Sandbox or Production XML, depending on the flow of the ticket
                //If change type is selected as "Add In EMIE" while raising request, the site would be added in XML/to EMIE 
                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                {
                    AddToV2XML(ticket, URL);
                }
                //If change type is selected as "Update In EMIE" while raising request, the site would be updated in XML/to EMIE
                else if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Update)
                {
                    EditInV2XML(ticket, URL);
                }
                //If change type is selected as "Delete from EMIE" while raising request, the site would be deleted from XML/to EMIE
                else
                {
                    DeleteFromV2XML(URL);
                }

                XmlComment eventLog = xmlDoc.CreateComment((ChangeType)ticket.ChangeType.ChangeTypeId + " from "
                    + ticket.TicketId + " at " + DateTime.Now);

                SaveXML(eventLog, ticket, operation);
            }
            catch (Exception)
            {
                throw;
            }

        }


        /// <summary>
        /// This method will add the URL in the xml with sibling comments. 
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        /// <param name="URL">URL without http:// or https://</param>
        /// <param name="rootnode">Rootnode which is intialized in InitializeXMLDetails</param>
        public void AddToV2XML(Tickets ticket, string URL)
        {
            if (URL != null)
            {
                string[] urlDomain = URL.Trim().Split('/');
                XmlElement SiteElement = null;
                XmlElement SiteSubDomainElement = null;

                XmlNode sitelistNode = xmlDoc.SelectSingleNode("site-list");
                if (sitelistNode == null)
                {
                    XmlElement sitelistElement = xmlDoc.CreateElement("site-list");
                    xmlDoc.AppendChild(sitelistElement);
                }

                #region CreateXmlTags
                //Making tags and inserting information

                //Making site tag for domain element
                SiteElement = xmlDoc.CreateElement("site");
                if (ticket.SubDomainUrl != null)
                    //Making site tag for suddomain element
                    SiteSubDomainElement = xmlDoc.CreateElement("site");



                //updating url attribute for domain
                SiteElement.SetAttribute("url", urlDomain[0].ToLower());

                if (ticket.SubDomainUrl != null)
                    //updating url attribute for subdomain
                    SiteSubDomainElement.SetAttribute("url", URL.ToLower());

                XmlElement FirstDomainElement = xmlDoc.CreateElement("compat-mode");
                XmlElement SecondDomainElement = xmlDoc.CreateElement("open-in");

                XmlElement FirstSubDomainElement = xmlDoc.CreateElement("compat-mode");
                XmlElement SecondSubDomainElement = xmlDoc.CreateElement("open-in");
                #endregion

                //Get all the 'site' nodes from Xml.
                XmlNodeList siteNode = rootNode.SelectNodes("site");
                //XmlNode previousdomainNode = null;
                bool isDomainPresent = false;
                foreach (XmlNode domainNode in siteNode)
                {
                    //Check if domain is already present in the Xml, if yes, domain is not to be added or updated again
                    if (domainNode.Attributes["url"].Value.ToLower().Equals(urlDomain[0].ToLower()))
                    {
                        isDomainPresent = true;
                        //previousdomainNode = domainNode;
                    }
                }

                //If no such domain is present in the xml, create tags for the same.
                if (!isDomainPresent)
                {
                    if (ticket.DocMode.DocModeId >= (int)CompatModes.Default)
                    {
                        FirstDomainElement.InnerText = ticket.DocMode.DocModeName;

                        if (ticket.DomainOpenInEdge == true)
                            SecondDomainElement.InnerText = OpenIn.MSEdge.ToString();
                        else
                            SecondDomainElement.InnerText = OpenIn.IE11.ToString();
                    }

                    SiteElement.AppendChild(FirstDomainElement);
                    SiteElement.AppendChild(SecondDomainElement);
                }


                //If subdomain also entered, get the details and make the tag enteries
                if (ticket.SubDomainUrl != null)
                {
                    if (ticket.SubDomainDocMode.DocModeId >= (int)CompatModes.Default)
                    {
                        FirstSubDomainElement.InnerText = ticket.SubDomainDocMode.DocModeName;

                        if (ticket.SubDomainOpenInEdge == true)
                            SecondSubDomainElement.InnerText = OpenIn.MSEdge.ToString();
                        else
                            SecondSubDomainElement.InnerText = OpenIn.IE11.ToString();
                    }
                    SiteSubDomainElement.AppendChild(FirstSubDomainElement);
                    SiteSubDomainElement.AppendChild(SecondSubDomainElement);
                }


                //Adding logic for the comments of the domain tag.
                newComment = xmlDoc.CreateComment(Constants.Name + ticket.Application.ApplicationName +
                    Constants.Spacing+Constants.Owner + ticket.RequestedBy.UserName +
                    Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                    Constants.Spacing + Constants.TicketId + ticket.TicketId +
                    Constants.Spacing + Constants.EditedDate + DateTime.Now
                    //+"\n\t\tLocation : " + Location
                    );

                //Adding logic for the comments of the subdomain tags.
                XmlComment newSubDomainComment = xmlDoc.CreateComment(Constants.Name + ticket.Application.ApplicationName +
                    Constants.Spacing + Constants.Owner + ticket.RequestedBy.UserName +
                    Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                    Constants.Spacing + Constants.TicketId + ticket.TicketId +
                    Constants.Spacing + Constants.EditedDate + DateTime.Now
                    //+"\n\t\tLocation : " + Location
                    );


                //Append enteried to rootnode
                if (!isDomainPresent)
                {
                    rootNode.AppendChild(newComment);
                    rootNode.AppendChild(SiteElement);
                }

                if (ticket.SubDomainUrl != null)
                {
                    rootNode.AppendChild(newSubDomainComment);
                    rootNode.AppendChild(SiteSubDomainElement);
                }
            }

        }


        /// <summary>
        /// This method will edit/update the URL's content in the V2 xml with sibling comments. 
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        /// <param name="URL">URL without http:// or https://</param>
        /// <param name="rootnode">Rootnode which is intialized in InitializeXMLDetails</param>
        public void EditInV2XML(Tickets ticket, string URL)
        {
            XmlNodeList siteNode = rootNode.SelectNodes("site");

            if (URL != null)
            {
                string[] urlDomain = URL.Trim().Split('/');

                foreach (XmlNode node in siteNode)
                {
                    #region DomainEdit
                    if (ticket.SubDomainUrl == null || ticket.SubDomainUrl.Equals("/"))
                    {
                        //Match the domain url with the 'url'attribute
                        if (node.Attributes["url"].Value.ToLower().Equals(urlDomain[0].ToLower()))
                        {
                            XmlNodeList childNodes = node.ChildNodes;
                            foreach (XmlNode child in childNodes)
                            {
                                //Get the detail of compat-mode tag
                                if (child.Name == "compat-mode")
                                {
                                    child.InnerText = ticket.DocMode.DocModeName;
                                }
                                //Get the detail of open-in tag
                                if (child.Name == "open-in")
                                {
                                    if (ticket.DocMode.DocModeId == (int)CompatModes.Default)
                                        child.InnerText = OpenIn.MSEdge.ToString();
                                    else
                                        child.InnerText = OpenIn.IE11.ToString();
                                }
                            }

                            #region CreateDomainComment
                            var previousComment = node.PreviousSibling;

                            string previousTickets = GetPreviousTickets(previousComment);

                            //Adding logic for the comments.
                            newComment = xmlDoc.CreateComment(
                                Constants.Name + ticket.Application.ApplicationName +
                                Constants.Spacing + Constants.LastEditedBy + ticket.RequestedBy.UserName +
                                Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                                Constants.Spacing + Constants.TicketId + ticket.TicketId +
                                Constants.Spacing + Constants.PreviousTicketId + previousTickets +
                                Constants.Spacing + Constants.EditedDate + DateTime.Now
                                //+"\n\t\tLocation : " + Location 
                            #endregion
                        );

                            rootNode.ReplaceChild(newComment, previousComment);
                        }
                    }

                    #endregion
                    #region SubDomainEdit'
                    if (ticket.SubDomainUrl != null)
                    {
                        if (!ticket.SubDomainUrl.Equals("/"))
                        {
                            //Match the whole url with the 'url' attribute in xml
                            if (node.Attributes["url"].Value.ToLower().Equals(URL))
                            {
                                XmlNodeList childNodes = node.ChildNodes;
                                foreach (XmlNode child in childNodes)
                                {
                                    //Get the detail of compat-mode tag
                                    if (child.Name == "compat-mode")
                                    {
                                        child.InnerText = ticket.SubDomainDocMode.DocModeName;
                                    }
                                    //Get the detail of open-in tag
                                    if (child.Name == "open-in")
                                    {
                                        if (ticket.SubDomainOpenInEdge == true)
                                            child.InnerText = OpenIn.MSEdge.ToString();
                                        else
                                            child.InnerText = OpenIn.IE11.ToString();
                                    }
                                }

                                #region CreateSubDomainComment
                                var previousSubDomainComment = node.PreviousSibling;
                                string previousTickets = GetPreviousTickets(previousSubDomainComment);

                                //Adding logic for the comments.
                                XmlComment newSubDomainComment = xmlDoc.CreateComment(
                                    Constants.Name + ticket.Application.ApplicationName +
                                    Constants.Spacing + Constants.LastEditedBy + ticket.RequestedBy.UserName +
                                    Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                                    Constants.Spacing + Constants.TicketId+ ticket.TicketId +
                                    Constants.Spacing + Constants.PreviousTicketId + previousTickets +
                                    Constants.Spacing + Constants.EditedDate + DateTime.Now
                                    //+"\n\t\tLocation : " + Location 
                                #endregion
                            );

                                rootNode.ReplaceChild(newSubDomainComment, previousSubDomainComment);
                            }
                        }

                    }
                    #endregion
                }
            }
        }

        /// <summary>
        /// This method will delete the existing URL in the xml with sibling comment
        /// </summary>
        /// <param name="URL">URL without http:// or https://</param>
        /// <param name="rootnode">Rootnode which is intialized in InitializeXMLDetails</param>
        public void DeleteFromV2XML(string URL)
        {
            //Retreive all the 'site' nodes.
            XmlNodeList siteNode = rootNode.SelectNodes("site");
            foreach (XmlNode node in siteNode)
            {
                //Match the 'url'-attribute with entered Url
                if (node.Attributes["url"].Value.ToLower().Equals(URL))
                {
                    var previousComment = node.PreviousSibling;

                    //Remove the node as well as the comment
                    rootNode.RemoveChild(node);
                    rootNode.RemoveChild(previousComment);
                }
            }
        }


        #endregion


        #region PreviousCommentsRelated


        /// <summary>
        /// Get the previous requests ids in the comments as a string.
        /// </summary>
        /// <param name="node">Node for which the requests ids in the comment to be retreived</param>
        /// <returns>string</returns>
        private string GetPreviousTicketsFromComment(XmlNode node)
        {
            XmlNode previousComment = null;
            string previousCommentTickets = null;
            if (node.PreviousSibling.NodeType == XmlNodeType.Comment)
            {
                //get the previous sibling if it is a comment and retreive the previous requessts/ticket numbers from it.
                previousComment = node.PreviousSibling;
                previousCommentTickets = GetPreviousTickets(previousComment);
            }
            return previousCommentTickets;
        }


        /// <summary>
        /// This method will get the previous ticket from the comment which will be added
        /// and return all the tickets as a string
        /// </summary>
        /// <param name="previousComment">XMLNode comment which is added before every entry</param>
        /// <returns>Ticket ID's String</returns>
        private string GetPreviousTickets(XmlNode previousComment)
        {
            string ticketNumbers = "";
            string comment = previousComment.Value.ToString();

            //Get the request numbers from the previous comments
            if (comment.Contains(Constants.Spacing + Constants.PreviousTicketId))
            {
                string latestTicket = GetBetween(comment, Constants.TicketId,Constants.Spacing+ Constants.PreviousTicketId);
                string previousList = GetBetween(comment, Constants.Spacing + Constants.PreviousTicketId, Constants.Spacing + Constants.EditedDate);
                ticketNumbers = latestTicket + "," + previousList;
            }
            else
            {
                ticketNumbers = GetBetween(comment, Constants.TicketId, Constants.Spacing + Constants.EditedDate);
            }
            return ticketNumbers;

        }

        /// <summary>
        /// This method is a helper method for GetPreviousTickets, this method will help to 
        /// get the words between two different string in the whole sentence
        /// </summary>
        /// <param name="strSource">Sentence in which word has to be looked into</param>
        /// <param name="startWord">Staring string from which the word will start</param>
        /// <param name="strEnd">End string to which the word will exist</param>
        /// <returns></returns>
        public static string GetBetween(string source, string startWord, string endWord)
        {
            if (!String.IsNullOrEmpty(source) && !String.IsNullOrEmpty(startWord) && !String.IsNullOrEmpty(endWord))
            {
                int Start, End;
                if (source.Contains(startWord) && source.Contains(endWord))
                {
                    Start = source.IndexOf(startWord, 0) + startWord.Length;
                    End = source.IndexOf(endWord, Start);
                    return source.Substring(Start, End - Start);
                }
                else
                {
                    return "";
                }
            }
            else
                return "";
        }
        #endregion


        #region OperationOnV1XML
        /// <summary>
        /// This method will operate for the URL in V1 XML on according to changetype which is selected 
        /// while raising request, Add , Update and Delete are the options to be selected from the list
        /// and accordinly the methods will be called in following method.
        /// </summary>
        /// <param name="ticket">ticket object has to be passed as first parameter</param>
        /// <param name="operation">Operation enumeration parameter</param>
        /// <example>OperationOnV1(ticketObject, Operation.AddInSandbox)</example>
        public void OperationOnV1(Tickets ticket, Operation operation)
        {
            //Particular action would be operated on site to Sandbox or Production XML, depending on the flow of the ticket
            //If change type is selected as "Add In EMIE" while raising request, the site would be added in XML/to EMIE 
            if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
            {
                AddToV1XML(ticket);
            }
            //If change type is selected as "Update In EMIE" while raising request, the site would be updated in XML/to EMIE
            else if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Update)
            {
                EditInV1XML(ticket);
            }
            //If change type is selected as "Delete from EMIE" while raising request, the site would be deleted from XML/to EMIE
            else
            {
                DeleteFromV1XML(ticket);
            }


            //Comment for the the latest update on Xml, which will be updated at the top of the xml
            XmlComment eventLog = xmlDoc.CreateComment((ChangeType)ticket.ChangeType.ChangeTypeId + " from "
                    + ticket.TicketId + " at " + DateTime.Now);


            //Save the made changes
            SaveXML(eventLog, ticket, operation);
        }



        #region AddInV1Operation
        /// <summary>
        /// This method will add the URLdomain and subdomain in the "V1" xml with sibling comments. 
        /// The method will take care of all the possible scenarios of the V1 schema,
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        public void AddToV1XML(Tickets ticket)
        {
            try
            {
                #region CreatingV1Tags

                //Create rules tag, and enter details if not present
                XmlNode ruleNode = xmlDoc.SelectSingleNode("rules");
                if (ruleNode == null)
                {
                    XmlElement rulesElement = xmlDoc.CreateElement("rules");
                    rulesElement.SetAttribute("version", "1");
                    xmlDoc.AppendChild(rulesElement);
                }

                //Create emie section, and append to rootnode.
                XmlNode emieNode = rootNode.SelectSingleNode("emie");
                if (emieNode == null)
                {
                    XmlElement emieElement = xmlDoc.CreateElement("emie");
                    rootNode.AppendChild(emieElement);
                }

                //Create docMode section, and append to rootnode.
                XmlNode docModeNode = rootNode.SelectSingleNode("docMode");
                if (docModeNode == null)
                {
                    XmlElement docModeElement = xmlDoc.CreateElement("docMode");
                    rootNode.AppendChild(docModeElement);
                }

                Uri uri = new Uri(ticket.AppSiteUrl);

                string domain = uri.Host.Trim().ToLower();
                string subdomain = uri.AbsolutePath.Trim().ToLower();

                XmlElement domainElement = null;
                XmlElement pathElement = xmlDoc.CreateElement("path");
                #endregion


                //Create comments for Emie section entry
                XmlComment addEmieNewComment = xmlDoc.CreateComment(Constants.Name + ticket.Application.ApplicationName +
                                              Constants.Spacing+Constants.Owner + ticket.RequestedBy.UserName +
                                              Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                                              Constants.Spacing + Constants.TicketId + ticket.TicketId +
                                              Constants.Spacing + Constants.EditedDate + DateTime.Now
                    //+"\n\t\tLocation : " + Location
                                                );

                //Create comments for Emie section entry
                XmlComment addDocModeNewComment = xmlDoc.CreateComment(Constants.Name + ticket.Application.ApplicationName +
                                              Constants.Spacing + Constants.Owner + ticket.RequestedBy.UserName +
                                              Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                                              Constants.Spacing + Constants.TicketId + ticket.TicketId +
                                              Constants.Spacing + Constants.EditedDate + DateTime.Now
                    //+"\n\t\tLocation : " + Location
                                                );

                #region AddingOperationOnV1

                //If subdomain is empty in url, then only add domain
                if (String.IsNullOrEmpty(subdomain) || subdomain.Equals("/"))
                {

                    domainElement = AddDomainOnly(ticket, emieNode, docModeNode, domain, domainElement, addEmieNewComment, addDocModeNewComment);

                }
                else if (!String.IsNullOrEmpty(domain) && !String.IsNullOrEmpty(subdomain))
                {
                    //if subdomain is not null, and its docmode is enterprise mode or default.
                    if (ticket.SubDomainDocMode.DocModeId <= (int)CompatModes.IE8EnterpriseMode)
                    {
                        XmlElement domainEmieElement = null;
                        XmlElement domainDocModeElement = null;

                        //if domains docmode is in enterprise modes or default
                        if (ticket.DocMode.DocModeId <= (int)CompatModes.IE8EnterpriseMode)
                        {
                            domainEmieElement = AddSubDInEmie_DomainInEmie(ticket, domain, domainEmieElement);
                        }
                        if (ticket.DocMode.DocModeId > (int)CompatModes.IE8EnterpriseMode)
                        {
                            AddSubDInEmie_DomainInDM(ticket, domain, ref domainEmieElement, ref domainDocModeElement);
                        }

                        //Create subdomain path for emie section
                        CreatePathElementForEmie(ticket, subdomain, pathElement);

                        //append path to domain, domain to emie/docMode, emie/docMode to rootnode
                        AppendSubDomainPathForEmie(ticket, emieNode, docModeNode, pathElement, addEmieNewComment, addDocModeNewComment, domainEmieElement, domainDocModeElement);

                    }
                    else if (ticket.SubDomainDocMode.DocModeId > (int)CompatModes.IE8EnterpriseMode)
                    {
                        //if docmode of subdomain is in document mode, this process will be followed
                        XmlElement domainEmieElement = null;
                        XmlElement domainDocModeElement = null;


                        if (ticket.DocMode.DocModeId <= (int)CompatModes.IE8EnterpriseMode)
                        {
                            domainEmieElement = EmieElement_SubDInDM_DomainInEmie(ticket, domain);
                            domainDocModeElement = DocModeElement_SubDInDM_DomainInEmie(domain);

                        }
                        if (ticket.DocMode.DocModeId > (int)CompatModes.IE8EnterpriseMode)
                        {
                            domainDocModeElement = AddSubDInDocMode_DomainInDM(ticket, domain);
                        }

                        //Create subdomain path for docMode section
                        CreatePathElementForDocMode(ticket, subdomain, pathElement);

                        //append path to domain, domain to emie/docMode, emie/docMode to rootnode
                        AppendSubDomainPathForDocMode(ticket, emieNode, docModeNode, pathElement, addEmieNewComment, addDocModeNewComment, domainEmieElement, domainDocModeElement);
                    }
                }
                #endregion
            }
            catch (Exception)
            {

                throw;
            }

        }


        #region AddDomain

        /// <summary>
        /// Makes the domain tag for adding domain url in either emie section/node
        /// or docMode section/node according to the details enetered and passed through 
        /// ticket object, also adds the comment before the element for emie or docMode
        /// </summary>
        /// <param name="ticket">the ticket model object</param>
        /// <param name="emieNode">XmlNode emieNode section</param>
        /// <param name="docModeNode">XmlNode docModeNode section</param>
        /// <param name="domain">domain url</param>
        /// <param name="domainElement">XmlElement domainElement tag</param>
        /// <param name="addEmieNewComment">XmlComment for adding before node</param>
        /// <returns>XmlElement</returns>
        private XmlElement AddDomainOnly(Tickets ticket, XmlNode emieNode, XmlNode docModeNode, string domain, XmlElement domainElement, XmlComment addEmieNewComment, XmlComment addDocModeNewComment)
        {

            //Create domain tag, and enter domain url as inner text.
            domainElement = xmlDoc.CreateElement("domain");
            domainElement.InnerText = domain;

            //If domain Docmode is in enterprise mode or default
            if (ticket.DocMode.DocModeId <= (int)CompatModes.IE8EnterpriseMode)
            {
                //exclude tag will be false for IE7Enterprise and IE8Enterprise mode
                if (ticket.DocMode.DocModeId > (int)CompatModes.Default)
                {
                    domainElement.SetAttribute("exclude", "false");
                }
                //exclude tag will be true default
                else if (ticket.DocMode.DocModeId == (int)CompatModes.Default)
                    domainElement.SetAttribute("exclude", "true");

                //forceCompatView as true for IE7Enterprise mode
                if (ticket.DocMode.DocModeId == (int)CompatModes.IE7EnterpriseMode)
                {
                    domainElement.SetAttribute("forceCompatView", "true");
                }

                //doNotTransition as true for open in edge
                if (ticket.DomainOpenInEdge == true)
                {
                    domainElement.SetAttribute("doNotTransition", "true");
                }

                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                    emieNode.AppendChild(addEmieNewComment);
                emieNode.AppendChild(domainElement);
            }
            else if (ticket.DocMode.DocModeId > (int)CompatModes.IE8EnterpriseMode)
            {
                //create docMode tag with docmode
                domainElement.SetAttribute("docMode", ConvertDocModeToValue(ticket.DocMode.DocModeName));

                if (ticket.DomainOpenInEdge == true)
                {
                    domainElement.SetAttribute("doNotTransition", "true");
                }

                //If the ticket change type is 'Add', then only add comment,
                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                    docModeNode.AppendChild(addDocModeNewComment);
                docModeNode.AppendChild(domainElement);
            }
            return domainElement;
        }


        #endregion


        #region AddSubDomainInEMIE

        /// <summary>
        /// Makes the domain tag/element for docMode as well as emie section/node for the
        /// data entered accordingly, for which the subdomain is to be added in emie section/node
        /// and domain url is also to be added in emie section/node in V1 xml.
        /// </summary>
        /// <param name="ticket">the ticket object</param>
        /// <param name="domain">doamin url</param>
        /// <param name="domainEmieElement">XElement domainEmieElement</param>
        /// <returns></returns>
        private XmlElement AddSubDInEmie_DomainInEmie(Tickets ticket, string domain, XmlElement domainEmieElement)
        {
            //get the domain tags in emie section
            XmlNodeList siteNode = rootNode.SelectNodes("emie//domain");
            foreach (XmlNode node in siteNode)
            {
                string[] words = node.InnerText.Trim().Split('/');
                if (words[0].ToLower().Trim().Equals(domain))
                {
                    //Getting the domain element in the EMIE section
                    domainEmieElement = (XmlElement)node;
                }
            }

            //If no element was found in xml, create an element with the entered data
            if (domainEmieElement == null)
            {
                domainEmieElement = xmlDoc.CreateElement("domain");

                //in case of docmode as default, exclude attribute will be true, else false
                if (ticket.DocMode.DocModeId > (int)CompatModes.Default)
                    domainEmieElement.SetAttribute("exclude", "false");
                else if (ticket.DocMode.DocModeId == (int)CompatModes.Default)
                    domainEmieElement.SetAttribute("exclude", "true");


                if (ticket.DocMode.DocModeId == (int)CompatModes.IE7EnterpriseMode)
                {
                    domainEmieElement.SetAttribute("forceCompatView", "true");
                }

                //if open in edge for domain is checked, doNotTransition tag will be true
                if (ticket.DomainOpenInEdge == true)
                {
                    domainEmieElement.SetAttribute("doNotTransition", "true");
                }

                domainEmieElement.InnerText = domain;
            }
            return domainEmieElement;
        }

        /// <summary>
        /// Makes the domain tag/element for docMode as well as emie section/node for the
        /// data entered accordingly, for which the subdomain is to be added in emie section/node
        /// and domain url is to be added in docMode section/node in V1 xml.
        /// </summary>
        /// <param name="ticket">the ticket model object</param>
        /// <param name="domain">domain url</param>
        /// <param name="domainEmieElement">XElement domainEmieElement</param>
        /// <param name="domainDocModeElement">XElement domainDocModeElement</param>
        private void AddSubDInEmie_DomainInDM(Tickets ticket, string domain, ref XmlElement domainEmieElement, ref XmlElement domainDocModeElement)
        {
            //as checking for docmode in documents mode, will check inside the docMode section.
            XmlNodeList siteNode = rootNode.SelectNodes("docMode//domain");
            foreach (XmlNode node in siteNode)
            {
                string[] words = node.InnerText.Trim().Split('/');
                if (words[0].ToLower().Trim().Equals(domain))
                {
                    //if domain is found in docMode
                    domainDocModeElement = (XmlElement)node;
                }
            }

            //also check in emie section, so to check if subdomain can be added to a valid tag
            XmlNodeList siteEmieNode = rootNode.SelectNodes("emie//domain");
            foreach (XmlNode node in siteEmieNode)
            {
                string[] words = node.InnerText.Trim().Split('/');
                if (words[0].ToLower().Trim().Equals(domain))
                {
                    //getting emie domain tag for domain
                    domainEmieElement = (XmlElement)node;
                }
            }

            //if no domain element is fount in DocMode section, will create one to add, domain to it here
            if (domainDocModeElement == null)
            {
                domainDocModeElement = xmlDoc.CreateElement("domain");
                domainDocModeElement.SetAttribute("docMode", ConvertDocModeToValue(ticket.DocMode.DocModeName));
                if (ticket.DomainOpenInEdge == true)
                {
                    domainDocModeElement.SetAttribute("doNotTransition", "true");
                }
                domainDocModeElement.InnerText = domain;
            }

            //If no domain is found in emie section, will create domain tag for 'subdomain' to add to it
            if (domainEmieElement == null)
            {
                domainEmieElement = xmlDoc.CreateElement("domain");
                domainEmieElement.SetAttribute("exclude", "true");
                if (ticket.DomainOpenInEdge == true)
                {
                    domainEmieElement.SetAttribute("doNotTransition", "true");
                }
                domainEmieElement.InnerText = domain;
            }
        }


        /// <summary>
        /// this method append the subdomain path element created to the emie section of the XML
        /// also created the docMode domain element if domain is to be added for docMode section
        /// also it replacess the previous comment, or add a new one if no comment was present
        /// </summary>
        /// <param name="ticket">tickets object</param>
        /// <param name="emieNode">'emie' element node</param>
        /// <param name="docModeNode">'docMode' element node</param>
        /// <param name="pathElement">created path element</param>
        /// <param name="addEmieComment">new comment for adding before node</param>        
        /// <param name="domainEmieElement">domain element of emie</param>
        /// <param name="domainDocModeElement">domain element of docMode</param>
        private static void AppendSubDomainPathForEmie(Tickets ticket, XmlNode emieNode, XmlNode docModeNode, XmlElement pathElement, XmlComment addEmieComment, XmlComment addDocModeComment, XmlElement domainEmieElement, XmlElement domainDocModeElement)
        {
            //Append subdomain to domain emie tag
            domainEmieElement.AppendChild(pathElement);


            if (domainEmieElement != null)
            {
                //add domain tag to emieNode, and add or replace comment, already existing
                emieNode.AppendChild(domainEmieElement);
                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                {
                    if (domainEmieElement.PreviousSibling != null && domainEmieElement.PreviousSibling.NodeType == XmlNodeType.Comment)
                    {
                        emieNode.ReplaceChild(addEmieComment, domainEmieElement.PreviousSibling);
                    }
                    else
                        emieNode.InsertBefore(addEmieComment, domainEmieElement);
                }

            }

            if (domainDocModeElement != null && ticket.DocMode.DocModeId > (int)CompatModes.Default)
            {
                //add domain tag to docModeNode, and add or replace comment, already existing
                docModeNode.AppendChild(domainDocModeElement);
                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                {
                    if (domainDocModeElement.PreviousSibling != null && domainDocModeElement.PreviousSibling.NodeType == XmlNodeType.Comment)
                    {
                        docModeNode.ReplaceChild(addDocModeComment, domainDocModeElement.PreviousSibling);
                    }
                    else
                        docModeNode.InsertBefore(addDocModeComment, domainDocModeElement);
                }
            }
        }

        #endregion


        #region CreationOfPathElement
        /// <summary>
        /// This method create the path element for subdomain to be added to domain of the docMode section of EMIE V1 schema
        /// the method takes the subdomains docmodeid and open in edge value also from the ticket object and update in the
        /// path element tag with the subdomain url, broken from the AddInV1XML method
        /// </summary>
        /// <param name="ticket">Tickets object</param>
        /// <param name="subdomain">subdomain url string</param>
        /// <param name="pathElement">created path element from AddInV1XML method</param>
        private static void CreatePathElementForDocMode(Tickets ticket, string subdomain, XmlElement pathElement)
        {
            //creating path element as per the details entered for document modes.
            pathElement.SetAttribute("docMode", ConvertDocModeToValue(ticket.SubDomainDocMode.DocModeName));
            pathElement.InnerText = subdomain;
            if (ticket.SubDomainOpenInEdge == true)
            {
                pathElement.SetAttribute("doNotTransition", "true");
            }
        }

        /// <summary>
        /// This method create the path element for subdomain to be added to domain of the 'emie' section of EMIE V1 schema
        /// the method takes the subdomains docmodeid and open in edge value also from the ticket object and update in the
        /// path element tag with the subdomain url, broken from the AddInV1XML method
        /// </summary>
        /// <param name="ticket">Tickets object</param>
        /// <param name="subdomain">subdomain url string</param>
        /// <param name="pathElement">created path element from AddInV1XML method</param>
        private static void CreatePathElementForEmie(Tickets ticket, string subdomain, XmlElement pathElement)
        {
            //creating path element as per the details added
            if (ticket.SubDomainDocMode.DocModeId > (int)CompatModes.Default)
                pathElement.SetAttribute("exclude", "false");
            else if (ticket.SubDomainDocMode.DocModeId == (int)CompatModes.Default)
                pathElement.SetAttribute("exclude", "true");

            if (ticket.SubDomainDocMode.DocModeId == (int)CompatModes.IE7EnterpriseMode)
                pathElement.SetAttribute("forceCompatView", "true");

            if (ticket.SubDomainOpenInEdge == true)
            {
                pathElement.SetAttribute("doNotTransition", "true");
            }
            pathElement.InnerText = subdomain;
        }
        #endregion

        #region AddSubDomainInDocMode

        /// <summary>
        /// this method append the subdomain path element created to the docMode section of the XML
        /// also created the emie domain element , if domain is to be added to emie section
        /// also it replacess the previous comment, or add a  new one if no comment was present
        /// </summary>
        /// <param name="ticket">tickets object</param>
        /// <param name="emieNode">'emie' element node</param>
        /// <param name="docModeNode">'docMode' element node</param>
        /// <param name="pathElement">created path element</param>
        /// <param name="addEmieComment">new comment for adding before node</param>
        /// <param name="domainEmieElement">domain element of emie</param>
        /// <param name="domainDocModeElement">domain element of docMode</param>
        private static void AppendSubDomainPathForDocMode(Tickets ticket, XmlNode emieNode, XmlNode docModeNode, XmlElement pathElement, XmlComment addEmieComment, XmlComment addDocModeComment, XmlElement domainEmieElement, XmlElement domainDocModeElement)
        {
            //appending path element to domain tag of document mode
            domainDocModeElement.AppendChild(pathElement);


            if (domainEmieElement != null)
            {
                //appending domain tags to emie element/section and updating or adding the comment accordingly
                emieNode.AppendChild(domainEmieElement);
                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                {
                    if (domainEmieElement.PreviousSibling != null && domainEmieElement.PreviousSibling.NodeType == XmlNodeType.Comment)
                    {
                        emieNode.ReplaceChild(addEmieComment, domainEmieElement.PreviousSibling);
                    }
                    else
                        emieNode.InsertBefore(addEmieComment, domainEmieElement);
                }
            }

            if (domainDocModeElement != null)
            {
                //appending domain tags to docmode element/section and updating or adding the comment accordingly
                docModeNode.AppendChild(domainDocModeElement);
                if (ticket.ChangeType.ChangeTypeId == (int)ChangeType.Add)
                {
                    if (domainDocModeElement.PreviousSibling != null && domainDocModeElement.PreviousSibling.NodeType == XmlNodeType.Comment)
                    {
                        docModeNode.ReplaceChild(addDocModeComment, domainDocModeElement.PreviousSibling);
                    }
                    else
                        docModeNode.InsertBefore(addDocModeComment, domainDocModeElement);
                }
            }
        }

        /// <summary>
        /// Makes the domain element for emie section/node, for the data entered,
        /// in which subdomain url element is to be added in docMode section/node and 
        /// domain url should be added in emie section/node in V1 xml.
        /// </summary>
        /// <param name="ticket">The ticket model object</param>
        /// <param name="domain">domain url</param>
        /// <returns>XmlElement</returns>
        private XmlElement EmieElement_SubDInDM_DomainInEmie(Tickets ticket, string domain)
        {
            //If docmode of domain is in enterprise mode or default
            XmlElement domainEmieElement = null;
            //get all the emie domain tags, and match with domain to retreive already existing domain tag matching the URL
            XmlNodeList siteNode = rootNode.SelectNodes("emie//domain");
            foreach (XmlNode node in siteNode)
            {
                string[] words = node.InnerText.Trim().Split('/');
                if (words[0].ToLower().Trim().Equals(domain))
                {
                    //if domain URL is matched in emie section
                    domainEmieElement = (XmlElement)node;
                }
            }


            //if no domain tag is found in emie section, will have to create one so domain to be added
            if (domainEmieElement == null)
            {
                domainEmieElement = xmlDoc.CreateElement("domain");
                if (ticket.DocMode.DocModeId > (int)CompatModes.Default)
                    domainEmieElement.SetAttribute("exclude", "false");
                else if (ticket.DocMode.DocModeId == (int)CompatModes.Default)
                    domainEmieElement.SetAttribute("exclude", "true");

                if (ticket.DocMode.DocModeId == (int)CompatModes.IE7EnterpriseMode)
                {
                    domainEmieElement.SetAttribute("forceCompatView", "true");
                }
                if (ticket.DomainOpenInEdge == true)
                {
                    domainEmieElement.SetAttribute("doNotTransition", "true");
                }
                domainEmieElement.InnerText = domain;
            }

            return domainEmieElement;
        }

        /// <summary>
        /// Makes the domain element for docMode section/node, for the data entered,
        /// in which subdomain url element is to be added in docMode section/node and 
        /// domain url should be added in emie section/node in V1 xml.
        /// <param name="domain">domain url</param>
        /// <returns></returns>
        private XmlElement DocModeElement_SubDInDM_DomainInEmie(string domain)
        {
            //If docmode of domain is in enterprise mode or default
            XmlElement domainDocModeElement = null;

            //get all the domain tags in docmode section matching the domain url and retreive already existing
            XmlNodeList sitedocModeNode = rootNode.SelectNodes("docMode//domain");
            foreach (XmlNode node in sitedocModeNode)
            {
                string[] words = node.InnerText.Trim().Split('/');
                if (words[0].ToLower().Trim().Equals(domain))
                {
                    //if domain URl is matched in docMode section
                    domainDocModeElement = (XmlElement)node;
                }
            }


            //if no domain tag is found for docmode section, create one for subDomaint to get added
            if (domainDocModeElement == null)
            {
                domainDocModeElement = xmlDoc.CreateElement("domain");
                domainDocModeElement.InnerText = domain;
            }
            return domainDocModeElement;
        }

        /// <summary>
        /// When adding data to V1, if the subdomain is of docMode entry and domain
        /// is also of docMode entry, this method will create the tags for docMode 
        /// entry and return the docMode element to be appended to the xml.
        /// </summary>
        /// <param name="ticket">The ticket model object</param>
        /// <param name="domain">domain url</param>
        /// <returns>XmlElement</returns>
        private XmlElement AddSubDInDocMode_DomainInDM(Tickets ticket, string domain)
        {
            XmlElement domainDocModeElement = null;
            //get all the domain tags in docmode section matching the domain url and retreive already existing
            XmlNodeList siteNode = rootNode.SelectNodes("docMode//domain");
            foreach (XmlNode node in siteNode)
            {
                string[] words = node.InnerText.Trim().Split('/');
                if (words[0].ToLower().Trim().Equals(domain))
                {
                    //if domain element is found for domain Url
                    domainDocModeElement = (XmlElement)node;
                }
            }
            //if no domain elemet is found in docMode section, create one for it
            if (domainDocModeElement == null)
            {
                domainDocModeElement = xmlDoc.CreateElement("domain");
                domainDocModeElement.SetAttribute("docMode", ConvertDocModeToValue(ticket.DocMode.DocModeName));

                if (ticket.DomainOpenInEdge == true)
                {
                    domainDocModeElement.SetAttribute("doNotTransition", "true");
                }
                domainDocModeElement.InnerText = domain;
            }
            return domainDocModeElement;
        }
        #endregion



        #endregion


        #region EditInV1Operation
        /// <summary>
        /// This method will edit/update the URL's content in the V1 xml with sibling comments. To add in V1
        /// we will first delete the earlier entry with same domain and subdomain, save its previous childs, and add that
        /// again the V1 xml
        /// </summary>
        /// <param name="ticket">Tickets model object</param>
        public void EditInV1XML(Tickets ticket)
        {
            try
            {
                Uri uri = new Uri(ticket.AppSiteUrl);
                string domain = uri.Host.Trim();
                string subdomain = uri.AbsolutePath.Trim();


                XmlElement emieElement = null;
                XmlElement docmodeElement = null;
                XmlNode[] emiePaths = null;
                XmlNode[] docmodePaths = null;

                string previousEmieCommentTickets = null;
                string previousDocModeCommentTickets = null;

                XmlNode emieNode = rootNode.SelectSingleNode("emie");
                XmlNode docModeNode = rootNode.SelectSingleNode("docMode");

                //selecting all the domain tags/elemets from the XML
                XmlNodeList allNodes = rootNode.SelectNodes("//domain");
                foreach (XmlNode node in allNodes)
                {
                    string[] words = node.InnerText.Trim().Split('/');

                    //match the element with the domain entered, and retreiving its childs/paths
                    if (words[0].Trim().ToLower().Equals(domain))
                    {
                        //if node is in emie section, will retreive its paths here
                        if (node.ParentNode.Name == "emie")
                        {
                            //Get all the emiePaths here, retreive all the paths or childs of the node, so to add
                            // it later to the domain tag/element of emie section, this method saves the childs in the 
                            //emiePaths as an array, with all the childs, including the name of the domain as text
                            emiePaths = GetEmiePaths(subdomain, node);

                            //Get the previous requests in the comments added 
                            previousEmieCommentTickets = GetPreviousTicketsFromComment(node);

                        }
                        else if (node.ParentNode.Name == "docMode")
                        {
                            //Get all the docmodePaths here, retreive all the paths or childs of the node, so to add
                            // it later to the domain tag/element of docmode section, this method saves the childs in the 
                            //docmodePaths as an array, with all the childs, including the name of the domain as text
                            docmodePaths = GetDocModePaths(subdomain, node);

                            //Get the previous requests in the comments added
                            previousDocModeCommentTickets = GetPreviousTicketsFromComment(node);
                        }

                        if (string.IsNullOrEmpty(ticket.SubDomainUrl) || ticket.SubDomainUrl.Equals("/"))
                        {
                            //delete the previous comment sibling, if exists
                            if (node.PreviousSibling.NodeType == XmlNodeType.Comment)
                            {
                                node.ParentNode.RemoveChild(node.PreviousSibling);
                            }
                            // delete the node in case of, only domain node
                            node.ParentNode.RemoveChild(node);
                        }

                    }
                }

                //As we have deleted the already existing enteries matching the domain and subdomain, we will add the new
                //information enteries, with already present AddToV1XML method.
                AddToV1XML(ticket);

                //Adding logic for the comments for emie section/element change.
                XmlComment newEmieComment = xmlDoc.CreateComment(
                    Constants.Name + ticket.Application.ApplicationName +
                    Constants.Spacing + Constants.LastEditedBy + ticket.RequestedBy.UserName +
                    Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                    Constants.Spacing + Constants.TicketId + ticket.TicketId +
                    Constants.Spacing + Constants.PreviousTicketId + previousEmieCommentTickets +
                    Constants.Spacing + Constants.EditedDate + DateTime.Now
                    //+"\n\t\tLocation : " + Location
                    );

                //Adding logic for the comments for docMode section/element change.
                XmlComment newdocModeComment = xmlDoc.CreateComment(
                    Constants.Name + ticket.Application.ApplicationName +
                    Constants.Spacing + Constants.LastEditedBy + ticket.RequestedBy.UserName +
                    Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                    Constants.Spacing + Constants.TicketId + ticket.TicketId +
                    Constants.Spacing + Constants.PreviousTicketId + previousDocModeCommentTickets +
                    Constants.Spacing + Constants.EditedDate + DateTime.Now
                    //+"\n\t\tLocation : " + Location
                    );


                //If no subdomain is entered, will change the domain only,
                if (subdomain == null || subdomain.Equals("/"))
                {
                    //get all the domain tags/element from the xml
                    XmlNodeList domainNode = rootNode.SelectNodes("//domain");
                    foreach (XmlNode node in domainNode)
                    {
                        string[] words = node.InnerText.Trim().Split('/');
                        if (words[0].Trim().ToLower().Equals(domain))
                        {
                            //getting the mathced, domain tags/element from the domain URL
                            XmlElement nodeElement = node as XmlElement;
                            if (node.ParentNode.Name == "emie")
                            {
                                emieElement = nodeElement;
                            }
                            else
                            {
                                docmodeElement = nodeElement;

                            }
                        }
                    }

                    //Adding the paths again which we retreived earlier
                    AddPaths(domain, ref emieElement, ref docmodeElement, emiePaths, docmodePaths, emieNode, docModeNode);

                }


                //Working on comments here, if comment already exists, replacing with the new comment,
                //for both docmode and emie section, if comment does not exist will add a new one
                XmlNodeList siteNode = rootNode.SelectNodes("//domain");
                foreach (XmlNode node in siteNode)
                {
                    string[] words = node.InnerText.Trim().Split('/');
                    if (words[0].Trim().ToLower().Equals(domain))
                    {
                        if (node.PreviousSibling.NodeType == XmlNodeType.Comment)
                        {
                            if (node.ParentNode.Name == "emie")
                                emieNode.ReplaceChild(newEmieComment, node.PreviousSibling);
                            if (node.ParentNode.Name == "docMode")
                                node.ParentNode.ReplaceChild(newdocModeComment, node.PreviousSibling);
                        }
                        else
                        {
                            if (node.ParentNode.Name == "emie")
                                emieNode.InsertBefore(newEmieComment, node);
                            if (node.ParentNode.Name == "docMode")
                                docModeNode.InsertBefore(newdocModeComment, node);
                        }
                    }
                }
            }
            catch (Exception)
            {

                throw;
            }

        }

        /// <summary>
        /// Gets all the paths of the emie 'domain' element which is selected to be edited
        /// after deleting the subdomain url which is to be edited by the details
        /// </summary>
        /// <param name="subdomain">subdomain url to be edited</param>
        /// <param name="node">Gets paths of this node</param>
        private XmlNode[] GetEmiePaths(string subdomain, XmlNode node)
        {
            //Get all the paths of the node of the domain tag of emie section/element in the array
            XmlNode[] emiePaths = null;
            emiePaths = node.ChildNodes.Cast<XmlNode>().ToArray();

            foreach (XmlNode searchNode in emiePaths)
            {
                if (searchNode.NodeType == XmlNodeType.Element && searchNode.InnerText.ToLower().Equals(subdomain))
                {
                    //if the subdomain mathes with already existing path, delete the entry
                    node.RemoveChild(searchNode);
                }
            }

            return emiePaths;
        }



        /// <summary>
        /// Gets all the paths of the docMode 'domain' element which is selected to be edited
        /// after deleting the subdomain url which is to be edited by the details
        /// </summary>
        /// <param name="subdomain">subdomain url to be edited</param>
        /// <param name="node">Gets paths of this node</param>
        private XmlNode[] GetDocModePaths(string subdomain, XmlNode node)
        {
            //Get all the paths of the node of the domain tag of docMode section/element in the array
            XmlNode[] docmodePaths = null;
            docmodePaths = node.ChildNodes.Cast<XmlNode>().ToArray();
            foreach (XmlNode searchNode in docmodePaths)
            {
                if (searchNode.NodeType == XmlNodeType.Element && searchNode.InnerText.ToLower().Equals(subdomain))
                {
                    //if the subdomain mathes with already existing path, delete the entry
                    node.RemoveChild(searchNode);
                }
            }

            return docmodePaths;
        }



        /// <summary>
        /// Refactored method, used to add the retreived paths back to the domain 
        /// element of emie and docmode section, so to make the consistent element
        /// which is equivalent to the element before the data interpretation
        /// </summary>
        /// <param name="domain">domain url</param>
        /// <param name="emieElement">XmlElement emie section 'domain' element</param>
        /// <param name="docmodeElement">XmlElement docmode section 'domain' element</param>
        /// <param name="emiePaths">array of emiePaths</param>
        /// <param name="docmodePaths">array of docmodePaths</param>
        /// <param name="emieNode">emie section node</param>
        /// <param name="docModeNode">docMode section node</param>
        private void AddPaths(string domain, ref XmlElement emieElement, ref XmlElement docmodeElement, XmlNode[] emiePaths, XmlNode[] docmodePaths, XmlNode emieNode, XmlNode docModeNode)
        {
            //if emie paths exists, adding back to the the dpmain tags of emie element, 
            //if emie path exists, if not, create emie element and add the paths to it
            if (emiePaths != null)
            {
                foreach (XmlNode emiepath in emiePaths)
                {
                    if (emiepath.NodeType == XmlNodeType.Element)
                    {
                        if (emieElement == null)
                        {
                            XmlElement emieDomainElements = xmlDoc.CreateElement("domain");
                            emieDomainElements.SetAttribute("exclude", "true");

                            emieDomainElements.InnerText = domain;

                            emieElement = emieDomainElements;
                            emieNode.AppendChild(emieElement);
                        }
                        emieElement.AppendChild(emiepath);


                    }

                }
            }


            //if docmode paths exists, adding back to the the domain tags of docmode element 
            //if docmode path exists, if not, create docmode element and add the paths to it
            if (docmodePaths != null)
            {
                foreach (XmlNode docmodepath in docmodePaths)
                {
                    if (docmodepath.NodeType == XmlNodeType.Element)
                    {
                        if (docmodeElement == null)
                        {
                            XmlElement docmodeDomainElements = xmlDoc.CreateElement("domain");
                            docmodeDomainElements.InnerText = domain;

                            docmodeElement = docmodeDomainElements;
                            docModeNode.AppendChild(docmodeElement);
                        }
                        docmodeElement.AppendChild(docmodepath);
                    }
                }
            }
        }


        #endregion

        #region DeleteFromV1Operation
        /// <summary>
        /// Delete the entry from the V1 XML, In this case, if the user adds subdomain, only subdomain will be deleted
        /// and if user adds domain, whole domain will be deleted.
        /// </summary>
        /// <param name="ticket">Tickets object</param>
        public void DeleteFromV1XML(Tickets ticket)
        {
            try
            {
                if (ticket == null)
                    return;
                Uri uri = new Uri(ticket.AppSiteUrl);
                string domain = uri.Host.Trim().ToLower();
                string subdomain = uri.AbsolutePath.Trim().ToLower();

                XmlNode emieNode = rootNode.SelectSingleNode("emie");
                XmlNode docModeNode = rootNode.SelectSingleNode("docMode");

                XmlNode previousEmieComment = null;
                XmlNode previousDocModeComment = null;

                string previousEmieCommentTickets = null;
                string previousDocModeCommentTickets = null;

                //get all the domain elements from the xml, and match with the domain URL, 
                //if matches delete the node and comment , only if subdomain is null
                XmlNodeList siteNode = rootNode.SelectNodes("//domain");
                if (subdomain == null || subdomain.Equals("/"))
                {
                    foreach (XmlNode node in siteNode)
                    {
                        string[] words = node.InnerText.Trim().Split('/');
                        if (words[0].Trim().ToLower().Equals(domain))
                        {
                            //domainElement = (XmlElement)node;
                            if (node.ParentNode.Name == "emie")
                            {
                                emieNode.RemoveChild(node.PreviousSibling);
                                emieNode.RemoveChild(node);
                            }
                            if (node.ParentNode.Name == "docMode")
                            {
                                docModeNode.RemoveChild(node.PreviousSibling);
                                docModeNode.RemoveChild(node);
                            }
                        }
                    }
                }
                else
                {
                    //if subdomains is not null, remove the subdomain from the node
                    foreach (XmlNode node in siteNode)
                    {
                        string[] words = node.InnerText.Trim().Split('/');
                        if (words[0].Trim().ToLower().Equals(domain))
                        {
                            XmlNodeList children = node.ChildNodes;

                            //if more than one child present in the domain tag, will remove only 
                            //the particular child, and update the comment accordingly
                            if (children.Count > 1)
                            {
                                foreach (XmlNode child in children)
                                {
                                    if (child.InnerText == subdomain.Trim())
                                    {
                                        if (node.PreviousSibling.NodeType == XmlNodeType.Comment)
                                        {
                                            if (node.ParentNode.Name == "emie")
                                            {
                                                previousEmieComment = node.PreviousSibling;
                                                previousEmieCommentTickets = GetPreviousTickets(previousEmieComment);
                                                //Adding logic for the comments.
                                                XmlComment newEmieComment = xmlDoc.CreateComment(
                                                    Constants.Name + ticket.Application.ApplicationName +
                                                    Constants.Spacing + Constants.LastEditedBy + ticket.RequestedBy.UserName +
                                                    Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                                                    Constants.Spacing + Constants.TicketId + ticket.TicketId +
                                                    Constants.Spacing + Constants.PreviousTicketId + previousEmieCommentTickets +
                                                    Constants.Spacing + Constants.EditedDate + DateTime.Now
                                                    //+"\n\t\tLocation : " + Location
                                                    );

                                                node.ParentNode.ReplaceChild(newEmieComment, node.PreviousSibling);

                                            }
                                            else if (node.ParentNode.Name == "docMode")
                                            {
                                                previousDocModeComment = node.PreviousSibling;
                                                previousDocModeCommentTickets = GetPreviousTickets(previousDocModeComment);

                                                //Adding logic for the comments.
                                                XmlComment newdocModeComment = xmlDoc.CreateComment(
                                                    Constants.Name + ticket.Application.ApplicationName +
                                                    Constants.Spacing + Constants.LastEditedBy + ticket.RequestedBy.UserName +
                                                    Constants.Spacing + Constants.Email + ticket.RequestedBy.Email +
                                                    Constants.Spacing + Constants.TicketId + ticket.TicketId +
                                                    Constants.Spacing + Constants.PreviousTicketId + previousDocModeCommentTickets +
                                                    Constants.Spacing + Constants.EditedDate + DateTime.Now
                                                    //+"\n\t\tLocation : " + Location
                                                    );

                                                node.ParentNode.ReplaceChild(newdocModeComment, node.PreviousSibling);
                                            }

                                        }
                                        node.RemoveChild(child);
                                    }
                                }
                            }
                            //if only one and only same child present, remove the node with comment
                            else
                            {
                                if (node.PreviousSibling.NodeType == XmlNodeType.Comment)
                                {
                                    if (node.ParentNode.Name == "emie")
                                        emieNode.RemoveChild(node.PreviousSibling);
                                    else if (node.ParentNode.Name == "docMode")
                                        docModeNode.RemoveChild(node.PreviousSibling);
                                }
                                if (node.ParentNode.Name == "emie")
                                    emieNode.RemoveChild(node);
                                else if (node.ParentNode.Name == "docMode")
                                    docModeNode.RemoveChild(node);
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
        #endregion

        #endregion


        #region SaveWithBackup
        /// <summary>
        /// This method will insert the comment on the top of the XML, make the backup file of loaded
        /// file with version number and save the changes
        /// </summary>
        /// <param name="eventLog">XmlComment comment, which is added at the top, for the latest change info</param>
        /// <param name="ticket">Tickets model object</param>
        /// <param name="operation">Operation enum</param>
        /// <returns></returns>
        public bool SaveXML(XmlComment eventLog, Tickets ticket, Operation operation)
        {
            bool result = false;
            try
            {
                XmlNode firstChild = xmlDoc.FirstChild;

                //if first sibling after the xml intro is the root node, will insert the eventLog comment, 
                //just before the rootnode so, to get the information of last activity
                if ((firstChild.NextSibling != null && firstChild.NextSibling.Name == "site-list") || (firstChild.NextSibling != null && firstChild.NextSibling.Name == "rules"))
                {
                    xmlDoc.InsertAfter(eventLog, firstChild);
                }
                    //If no xml intro is present, directly match the first child name
                else if (firstChild.Name == "site-list" || firstChild.Name == "rules")
                {
                    xmlDoc.InsertBefore(eventLog, firstChild);
                }
                else //if that element is already a comment, will replace the same with the new comment
                {
                    xmlDoc.ReplaceChild(eventLog, firstChild.NextSibling);
                }

                //Get the backup file name/path, so to copy the previous data to backup file and get if needed
                string backUpFile = GetBackupFile(xmlVersion, operation);

                //if operation is on the sandbox environment, will update the backup file, and save the result for the same
                if (operation == Operation.AddInSandbox || operation == Operation.SandboxRollback)
                {
                    System.IO.File.Copy(V2Sandboxfile, backUpFile);
                    xmlDoc.Save(V2Sandboxfile);
                }
                else //else if operation is on the production environment, will update the backup file, and save the result for the same
                {
                    System.IO.File.Copy(V2ProdFile, backUpFile);
                    xmlDoc.Save(V2ProdFile);

                    //Also will make the ProductionRollback entry as true in EMIETicketsArch table , so to let the user roolback from the prodction environment
                    if (operation == Operation.AddInProduction)
                    {
                        EMIETicketsArch emieticketArch = DbEntity.EMIETicketsArches.Single(dbTicket => dbTicket.TicketId == ticket.TicketId);
                        emieticketArch.ProductionRollback = true;
                        DbEntity.SaveChanges();
                    }
                }
                rwLock.ExitWriteLock();
                result = true;

            }
            catch (Exception)
            {

                throw;
            }

            return result;
            //To be checked
            //Thread.Sleep(100);
        }


        /// <summary>
        /// This method makes the backupfile name according to the file which is loaded
        /// i.e. from Sanbox file or Production file
        /// </summary>
        /// <param name="xmlVersion">XML Version</param>
        /// <param name="operation">Operation enumerations</param>
        /// <returns></returns>
        public string GetBackupFile(int xmlVersion, Operation operation)
        {
            string backUpFileName = null;
            if (operation == Operation.AddInSandbox || operation == Operation.SandboxRollback) //ticket.FinalTicketStatus == TicketStatus.Initiated
            {
                backUpFileName = V2Sandboxfile.Substring(0, V2Sandboxfile.Length - 4) + "backup" + (xmlVersion - 1) + ".xml ";  //UNCPath + "\\" + Constants.BackUpFile + (xmlVersion - 1) + ".xml ";
            }
            else
            {
                backUpFileName = V2ProdFile.Substring(0, V2ProdFile.Length - 4) + "backup" + (xmlVersion - 1) + ".xml ";//UNCPath + "\\" + Constants.ProdBackUpFile + (xmlVersion - 1) + ".xml ";
            }

            while (System.IO.File.Exists(backUpFileName))
            {
                System.IO.File.Delete(backUpFileName);
            }

            return backUpFileName;
        }

        #endregion


        //#region EnterpriseApp

        ///// <summary>
        ///// this function is for EMIE Tool it will update the informations of the existing urls into the xml file
        ///// </summary>
        ///// <param name="info">contains all the data need to be updated</param>
        //#region UpdateXMLData
        //public void UpdateXMLData(ManageSitesModel NewInfo, ManageSitesModel OldInfo)
        //{
        //    try
        //    {
        //        rwLock.EnterWriteLock();
        //        DataSet ds = new DataSet();
        //        string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");
        //        ds.ReadXml(Internal);

        //        if (NewInfo.NotesAboutURL == null)
        //            NewInfo.NotesAboutURL = "";
        //        //updating the information when the URL has a subdomain and we need to modify their parentId as well
        //        if (NewInfo.FullURL.IndexOf('/') != -1)
        //        {
        //            for (int i = 0; i < ds.Tables[2].Rows.Count; i++)
        //            {
        //                //Modifying the subdomain url informations
        //                if (ds.Tables[2].Rows[i]["FullURL"].ToString().Equals(OldInfo.FullURL))
        //                {
        //                    ds.Tables[2].Rows[i]["FullURL"] = NewInfo.FullURL;
        //                    ds.Tables[2].Rows[i]["LastModifiedBy"] = NewInfo.LastModifiedBy;
        //                    ds.Tables[2].Rows[i]["Notes"] = NewInfo.NotesAboutURL;
        //                    ds.Tables[2].Rows[i]["docMode"] = NewInfo.SubStringDocMode;
        //                    ds.Tables[2].Rows[i]["OpenInIE"] = NewInfo.OpenInForSubdomain;
        //                    for (int k = 0; k < ds.Tables[2].Rows.Count; k++)
        //                    {
        //                        //Modifying the parent information as well
        //                        if (ds.Tables[2].Rows[i]["parentId"].ToString().Equals(ds.Tables[2].Rows[k]["FullURL"].ToString()))
        //                        {
        //                            ds.Tables[2].Rows[k]["LastModifiedBy"] = NewInfo.LastModifiedBy;
        //                            ds.Tables[2].Rows[k]["FullURL"] = NewInfo.DomainURL;
        //                            ds.Tables[2].Rows[k]["Notes"] = NewInfo.NotesAboutURL;
        //                            ds.Tables[2].Rows[k]["docMode"] = NewInfo.DomainDocMode;
        //                            ds.Tables[2].Rows[k]["OpenInIE"] = NewInfo.OpenIn;
        //                            break;
        //                        }
        //                    }
        //                }
        //            }
        //        }
        //        else
        //        {
        //            //if the url has no subdomain part means we don't have to modify the parent information so only modifying the domain info
        //            for (int i = 0; i < ds.Tables[2].Rows.Count; i++)
        //            {
        //                if (ds.Tables[2].Rows[i]["FullURL"].ToString().Equals(OldInfo.FullURL))
        //                {
        //                    ds.Tables[2].Rows[i]["LastModifiedBy"] = NewInfo.LastModifiedBy;
        //                    ds.Tables[2].Rows[i]["FullURL"] = NewInfo.DomainURL;
        //                    ds.Tables[2].Rows[i]["Notes"] = NewInfo.NotesAboutURL;
        //                    ds.Tables[2].Rows[i]["docMode"] = NewInfo.DomainDocMode;
        //                    ds.Tables[2].Rows[i]["OpenInIE"] = NewInfo.OpenIn;
        //                    break;
        //                }
        //            }
        //        }
        //        ds.Tables[0].Rows[0]["version"] = (Convert.ToInt32(ds.Tables[0].Rows[0]["version"].ToString()) + 1).ToString();
        //        ds.WriteXml(Internal);
        //        rwLock.ExitWriteLock();
        //    }
        //    catch (Exception)
        //    {
        //    }
        //}
        //#endregion
        //public bool InsertXMLData(ManageSitesModel info)
        //{
        //    rwLock.EnterWriteLock();
        //    try
        //    {

        //        string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");
        //        XmlDocument xmlDoc = new XmlDocument();
        //        DataSet ds = new DataSet();

        //        //Spliting the URL into two parts the domain url part will be parentId for the subdomain
        //        string[] a = info.FullURL.Split(new[] { '/' }, 2); string parent = null;
        //        if (a.Length > 1)
        //        {
        //            info.URLSubstring = "/" + a[1];
        //            parent = a[0];
        //        }
        //        else
        //            parent = null;
        //        info.DomainURL = a[0];

        //        if (info.NotesAboutURL == null)
        //            info.NotesAboutURL = "";

        //        //Creating the xml structure to save the information if not present already
        //        //if the file has no any info all the data is deleted by mistake then this will throw an exception which is already handled and will create the required structure
        //        using (XmlReader reader = XmlReader.Create(Internal))
        //        {
        //            try
        //            {
        //                if (reader.Read() != true)
        //                    CreateStructure(Internal);
        //            }
        //            catch (XmlException)
        //            {
        //                reader.Close();
        //                CreateStructure(Internal);
        //            }
        //        }

        //        //loading the information file
        //        XDocument xdocemie = XDocument.Load(Internal);

        //        //loading tall the domain node informations
        //        var list = xdocemie.Descendants("domain").ToList();

        //        //if the domain URL info is already present then remove that in order to avoid the repestation and add the new info
        //        foreach (var domain in list)
        //        {
        //            if (domain.Attribute("FullURL") != null)
        //                if (domain.Attribute("FullURL").Value.Equals(info.DomainURL))
        //                {
        //                    domain.Remove();
        //                }
        //        }

        //        //adding the domain URL informations 
        //        xdocemie.Root.Element("emie").AddFirst(new XElement("domain", new XAttribute("LastModifiedBy", info.LastModifiedBy)
        //            , new XAttribute("Notes", info.NotesAboutURL), new XAttribute("FullURL", info.DomainURL)
        //            , new XAttribute("docMode", info.DomainDocMode), new XAttribute("OpenInIE", info.OpenIn), new XAttribute("parentId", "null")));

        //        //adding the subdomain URL information
        //        if (parent != null)
        //        {
        //            xdocemie.Root.Element("emie").AddFirst(new XElement("domain", new XAttribute("LastModifiedBy", info.LastModifiedBy)
        //          , new XAttribute("Notes", info.NotesAboutURL), new XAttribute("FullURL", info.FullURL)
        //          , new XAttribute("docMode", info.SubStringDocMode), new XAttribute("OpenInIE", info.OpenInForSubdomain), new XAttribute("parentId", parent)));
        //        }
        //        xdocemie.Save(Internal);

        //        //as the websites are added the older information is now changed to increasing the version of the file by one
        //        ds.ReadXml(Internal);
        //        ds.Tables[0].Rows[0]["version"] = (Convert.ToInt32(ds.Tables[0].Rows[0]["version"].ToString()) + 1).ToString();
        //        ds.WriteXml(Internal);

        //    }

        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //    finally
        //    {
        //        rwLock.ExitWriteLock();
        //    }
        //    return true;
        //}

        ///// <summary>
        ///// this method create the basic static structure of the xml file
        ///// </summary>
        ///// <param name="Internal">its the xml path</param>
        //private void CreateStructure(string Internal)
        //{
        //    rwLock.EnterWriteLock();
        //    //Creating the declaration into the xml
        //    XmlDeclaration dec = xmlDoc.CreateXmlDeclaration("1.0", null, null);
        //    xmlDoc.AppendChild(dec);
        //    //creating the root element
        //    XmlElement RuleElement = xmlDoc.CreateElement("rules");
        //    RuleElement.SetAttribute("version", "0");
        //    //Creating the required elements static through out the code
        //    XmlElement EMIEElement = xmlDoc.CreateElement("emie");
        //    XmlElement EMIEDomainElement = xmlDoc.CreateElement("domain");
        //    RuleElement.AppendChild(EMIEElement);
        //    xmlDoc.AppendChild(RuleElement);
        //    xmlDoc.Save(Internal);
        //    rwLock.ExitWriteLock();
        //}

        ///// <summary>
        ///// This function returns all the URL related information to be sent to UI to display
        ///// the data on the page load
        ///// </summary>
        ///// <returns>URL's info in Json format</returns>
        //public JsonResult GetSiteInfo()
        //{
        //    string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");
        //    List<ManageSitesModel> list = new List<ManageSitesModel>(); //int i = 0;
        //    try
        //    {
        //        rwLock.EnterReadLock();
        //        //load the xml in XDocument object
        //        XDocument doc = XDocument.Load(Internal);
        //        //selecting the related information from the XML file 
        //        var excludeAttribute = doc.Descendants("domain").Attributes("OpenInIE").ToList();
        //        var LastModifiedBy = doc.Descendants("emie").Elements("domain").Attributes("LastModifiedBy").ToList();
        //        var Notes = doc.Descendants("emie").Elements("domain").Attributes("Notes").ToList();
        //        var docModeAttribute = doc.Descendants("domain").Attributes("docMode").ToList();
        //        var parentIdAttribute = doc.Descendants("domain").Attributes("parentId").ToList();
        //        var FullURL = doc.Descendants("emie").Elements("domain").Attributes("FullURL").ToList();
        //        string version = doc.Root.Attribute("version").Value;
        //        //Inserting the data into ManageSitesModel object and adding into the list
        //        for (int k = 0; k < excludeAttribute.Count; k++)
        //        {
        //            ManageSitesModel site = new ManageSitesModel();
        //            //if the exclude is true means openInIE is false
        //            site.OpenIn = (excludeAttribute[k].Value);
        //            site.LastModifiedBy = LastModifiedBy[k].Value;
        //            site.NotesAboutURL = Notes[k].Value;
        //            site.DomainDocMode = docModeAttribute[k].Value;
        //            site.FullURL = FullURL[k].Value;
        //            site.EmieVersion = version;
        //            site.ParentId = parentIdAttribute[k].Value == "null" ? null : parentIdAttribute[k].Value;
        //            list.Add(site);
        //        }

        //    }
        //    catch (Exception)
        //    {
        //    }
        //    finally
        //    {
        //        rwLock.ExitReadLock();
        //    }
        //    JsonResult json = new JsonResult(); json.MaxJsonLength = int.MaxValue; json.Data = list;
        //    return json;
        //}

        ///// <summary>
        ///// This function clears all the domain node in the internalUrls.xml file 
        ///// giving no site info available to be displayed on the UI
        ///// </summary>
        //public void ClearLists()
        //{
        //    rwLock.EnterWriteLock();
        //    string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");
        //    XDocument xdocemie = XDocument.Load(Internal);
        //    xdocemie.Descendants("domain").ToList().Remove();
        //    xdocemie.Save(Internal);
        //    DataSet ds = new DataSet();
        //    ds.ReadXml(Internal);
        //    ds.Tables[0].Rows[0]["version"] = "0";
        //    ds.WriteXml(Internal);
        //    rwLock.ExitWriteLock();
        //}



        ///// <summary>
        ///// This function will fetch the whole docMode name from the docmodeid
        ///// </summary>
        ///// <param name="docmodeId">it is only name id of the docmode</param>
        ///// <returns>returns the whole name of the docmode</returns>
        //public string GetDocMode(string docmodeId)
        //{
        //    switch (docmodeId)
        //    {
        //        case "edge":
        //            return "IE11 Document Mode";

        //        case "11":
        //            return "IE11 Document Mode";

        //        case "10":
        //            return "IE10 Document Mode";

        //        case "9":
        //            return "IE9 Document Mode";

        //        case "8":
        //            return "IE8 Document Mode";

        //        case "7":
        //            return "IE7 Document Mode";

        //        case "5":
        //            return "IE5 Document Mode";

        //        default: return "Default Mode";

        //    }
        //}

        ///// <summary>
        ///// This function will add bulk websites from the file the file is already parsed and the 
        ///// informations of the websites to be added will be received in the manageSites model array
        ///// </summary>
        ///// <param name="info"></param>
        //public void BulkAddFromFile(ManageSitesModel[] info)
        //{
        //    rwLock.EnterWriteLock();
        //    try
        //    {

        //        //File path string
        //        string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");

        //        //Loading the xml file into the xdocument object
        //        XDocument xdocemie = XDocument.Load(Internal);

        //        //get the list of all the domain info added into the xml file
        //        var list = xdocemie.Descendants("domain").ToList();
        //        var distinctList = info.Select(o => o.FullURL).ToArray();
        //        //Remove all the websites which are already present as they need to be updated by the bulk file uploaded information
        //        foreach (var domain in list)
        //        {
        //            for (int i = 0; i < distinctList.Length; i++)
        //            {
        //                if (domain.Attribute("FullURL") != null)
        //                    if (domain.Attribute("FullURL").Value.Equals(distinctList[i]))
        //                    {
        //                        domain.Remove();
        //                        i++;
        //                    }
        //            }
        //        }


        //        //Adding the nodes to the xml for the bulk upload file
        //        foreach (var information in info)
        //        {

        //            xdocemie.Root.Element("emie").AddFirst(new XElement("domain", new XAttribute("LastModifiedBy", information.LastModifiedBy)
        //                   , new XAttribute("Notes", "Bulk Added On " + DateTime.Now.ToString("dd/MM/yyyy") + ""), new XAttribute("FullURL", information.FullURL)
        //                   , new XAttribute("docMode", information.DomainDocMode), new XAttribute("OpenInIE", (information.OpenIn == "true" || information.OpenIn == "True" || information.OpenIn == "IE11") ? "IE11" : "None"), new XAttribute("parentId", information.ParentId == null ? "null" : information.ParentId)));

        //        }
        //        xdocemie.Save(Internal);

        //        //Incereasing hte version of the emie website list by 1
        //        DataSet ds = new DataSet();
        //        ds.ReadXml(Internal);
        //        ds.Tables[0].Rows[0]["version"] = (Convert.ToInt32(ds.Tables[0].Rows[0]["version"].ToString()) + 1).ToString();
        //        ds.WriteXml(Internal);

        //    }
        //    catch (Exception e) { throw e; }
        //    finally
        //    {
        //        rwLock.ExitWriteLock();
        //    }
        //}

        ///// <summary>
        ///// this function finds the matching url and delete from the record
        ///// </summary>
        ///// <param name="SiteInfo">contains all the info of the website to be deleted</param>
        //public void DeleteSite(ManageSitesModel SiteInfo)
        //{
        //    try
        //    {
        //        rwLock.EnterWriteLock();
        //        //File path string
        //        string Internal = System.Web.Hosting.HostingEnvironment.MapPath("~/App/XML/InternalURLs.xml");

        //        //Loading the xml file into the xdocument object
        //        XDocument xdocemie = XDocument.Load(Internal);

        //        //get the list of all the domain info added into the xml file
        //        var list = xdocemie.Descendants("domain").ToList();
        //        //Remove  the websites which is matching with the info in the siteInfo object
        //        foreach (var domain in list)
        //        {
        //            if (domain.Attribute("FullURL") != null)
        //                if (domain.Attribute("FullURL").Value.Contains(SiteInfo.FullURL))
        //                {
        //                    domain.Remove();
        //                    xdocemie.Save(Internal);
        //                }
        //        }
        //        rwLock.ExitWriteLock();
        //    }
        //    catch (Exception) { }
        //}

        //#endregion

        /// <summary>
        /// this function will get the production sites xml and retuns all the xml in string format
        /// </summary>
        /// <param name="config">this is configration settings</param>
        /// <returns>this function returns all the xml in the string format</returns>
        public string getProductionSites(Configuration config)
        {
            GetProductionConfigSettings(config);
            string lines="";
            using (UNCAccessWithCredentials unc = new UNCAccessWithCredentials())
            {
                if (unc.NetUseWithCredentials(UNCPath, UserName, Domain, Password) || unc.LastError == 1219)
                {
                   lines = System.IO.File.ReadAllText(V2ProdFile);
                }
            }
            return lines;
        }
    }
}