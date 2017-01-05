
namespace EMIEWebPortal.Common
{
    /// <summary>
    /// This class contains all the constant variables that will be used in the application.
    /// This will be helpful if we need to change any  messages/texts..etc.
    /// Please update this class with constants as and when needed.
    /// </summary>
    public static class Constants
    {
        //This region contains all the public constants
        #region Public Constants

        /// <summary>
        /// This contant contains the constant to merge in login id 
        /// </summary>
        public const string EmailDomainString = "@microsoft.com";

        /// <summary>
        /// This constant contains the product category to store in logger
        /// Change this string according to the product being used
        /// </summary>
        public const string ProductCategory = "EMIE";

        /// <summary>
        /// This constant contains the type of method which is add.
        /// </summary>
        public const string Add = "ADD";

        /// <summary>
        /// This constant contains the type of method which is delete.
        /// </summary>
        public const string Delete = "DELETE";

        /// <summary>
        /// This constant contains the type of method which is update.
        /// </summary>
        public const string Update = "UPDATE";

        /// <summary>
        /// This constant contains the string for ticketstatus.
        /// </summary>
        public const string TicketStatus = "The request {0} has been {1} by the user {2}";

        /// <summary>
        /// This constant contains the type of method which is APPROVED..
        /// </summary>
        public const string Approved = "approved";

        /// <summary>
        /// This constant contains the type of method which is REJECTED..
        /// </summary>
        public const string Rejected = "rejected";

        /// <summary>
        /// This constant contains the string for NewUserAdded.
        /// </summary>
        public const string NewUserAdded = "A new user with id {0} has been added by {1}";

        /// <summary>
        /// This constant contains the string for DeleteUser.
        /// </summary>
        public const string DeleteUser = "The user named {0} has been made inactive by {1}";

        /// <summary>
        /// This constant contains the string for ticketstatus.
        /// </summary>
        public const string ConfigSettings = "The configuration settings have been set by the user {0}";

        /// <summary>
        /// This constant contains the string for ChangeRequestMethod.
        /// </summary>
        public const string ChangeRequestMethod = "ChangeRequest";


        /// <summary>
        /// This constant contains the string for ChangeRequestMethod.
        /// </summary>
        public const string ConfigurationSettingsAddedMethod = "ConfigurationSettings";

        /// <summary>
        /// Contains the path where files will be stored. Currently its on local machine. We can save it to any server.
        /// Be cautious while copying the new Bins to production. Just copy the Dlls. 
        /// </summary>
        public const string FileUploadPath = "~/App/Uploads/";
        public const string FileUploadVerifySandboxSuccessfulPath = "\\VerifySandBox\\Successful\\";
        public const string FileUploadVerifySandboxFailurePath = "\\VerifySandBox\\Failure\\";
        public const string FileUploadVerifyProductionSuccessfulPath = "\\VerifyProduction\\Successful\\";
        public const string FileUploadVerifyProductionFailurePath = "\\VerifyProduction\\Failure\\";

        /// <summary>
        /// SuccessMessageForActions message
        /// </summary>
        public const string SuccessMessageForActions = "Action Performed Successfully!!";

        /// <summary>
        /// ErrorMessage message
        /// </summary>
        public const string ErrorMessage = "Some error occurred";

        /// <summary>
        /// UploadedSuccessfully message
        /// </summary>
        public const string UploadedSuccessfully = " Files Uploaded Successfully";

        /// <summary>
        /// UploadFailed message
        /// </summary>
        public const string UploadFailed = "Upload Failed";
        
        /// <summary>
        /// DeletedSuccessfully message
        /// </summary>
        public const string DeletedSuccessfully = " has been deleted successfully";

        /// <summary>
        /// CannotBeDeleted message
        /// </summary>
        public const string CannotBeDeleted = " cannot be deleted";

        /// <summary>
        /// This contant contains the full computer name part 
        /// </summary>
        public const string EMIEChampGroup = "EMIE CHAMP GROUP";

        public const string EMIEChampion = "EMIE Champion";
        #endregion
      
        #region UserManagement Constants

        public const string UserNotFound = "Unable to search user {0}.";

        public const string NoRolesFound = "No such roles are present.";

        public const string NoGroupsFound = "No such groups are present.";

        public const string UserDeactivatedSuccessfully = "Selected user has been deactivated.";

        public const string UserActivatedSuccessfully = "Selected user has been activated.";

        public const string UserRegisteredSuccessfully = "Selected user(s) registered successfully.";

        public const string UserEditedSuccessfully = "Selected user information has been edited.";

        public const string UnableToEditDuplicateUser = "Unable to edit user information, user with {0} role within {1} group already exist.";

        public const string UnableToEditUser = "Unable to edit user.";

        public const string UserDeactivationFailed = "Unable to deactivate selected user.";

        public const string UserActivationFailed = "Unable to activate selected user.";

        public const string OperationFailed = "Unable to perform operation.";

        public const string UserRegistrationSent = "You have successfully registered the user. You will receive an email notification on account activation.";

        public const string UserAlreadyRegistered = "User is already registered. Click 'Login' to continue.";

        public const string UserWithDuplicateRole = "User with specified role already present.";

        public const string UserRegistrationPending = "Your registration request is in pending state. You will receive an email notification on account activation.";

        public const string UserAdded = "New user information added successfully.";

        public const string ActionMethodForDeleteUser = "DeleteUser";

        public const string ActionMethodForAddUserInfo = "AddUserInfo";

        public const string ActionMethodForActivateUser = "ActivateUser";

        #endregion

        #region XmlCommentsConstants
        /// <summary>
        /// This constant is for the Name of the application
        /// </summary>
        public const string Name = "Name : ";
        /// <summary>
        /// This constant is for the Owner of the application(ticket raised by)
        /// </summary>
        public const string Owner = "Owner : ";
        /// <summary>
        /// This constant is for the email id of the owner
        /// </summary>
        public const string Email = "Email : ";
        /// <summary>
        /// This constant is for the Ticket id of the request
        /// </summary>
        public const string TicketId = "Current Ticket ID : ";
        /// <summary>
        /// This constant is for the Edited date of the ticket
        /// </summary>
        public const string EditedDate = "Edited Date : ";
        /// <summary>
        /// This constant is for the spacing and new line
        /// </summary>
        public const string Spacing = "\n\t\t";
        /// <summary>
        /// This constant is for Previous id's of the request
        /// </summary>
        public const string PreviousTicketId = "Previous IDs : ";
        /// <summary>
        /// This constant is for last modified by user
        /// </summary>
        public const string LastEditedBy = "Last Edited By : ";
        /// <summary>
        /// This constant is for indicating a bulk import from the Enterprise Mode Site List Manager
        /// </summary>
        public const string BulkImport = "Site added via bulk import";
        #endregion

    }
}