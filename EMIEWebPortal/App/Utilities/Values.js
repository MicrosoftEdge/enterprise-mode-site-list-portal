//String Constants for Ticket Status settings
EMIEModule.value('TicketStatusConstants', {
    //Initiated
    Initiated: 'Initiated',

    // Approved
    Approved: 'Approved',

    // ProductionReady
    ProductionReady: 'ProductionReady',

    //ProductionChangesScheduled
    ProductionChangesScheduled: 'ProductionChangesScheduled',

    //Rejected
    Rejected: 'Rejected',

    //SignedOff
    SignedOff: 'SignedOff',

    //RolledBack
    RolledBack: 'RolledBack',

    //Closed
    Closed: 'Closed',

    //ApprovalPending
    ApprovalPending: 'ApprovalPending',

    //PartiallyApproved
    PartiallyApproved: 'PartiallyApproved'
});

//String Constants for Colour  settings
EMIEModule.value('ColorConstants', {
    //InProgress
    InProgress: '#FF8901',

    //Initiated
    Initiated: "#FF8C00",

    //Approved:
    Approved: "#D83801",

    //ProductionReady:
    ProductionReady: "#008272",

    //ProductionChangesScheduled
    ProductionChangesScheduled: "#5C005C",

    //PartiallyApproved
    PartiallyApproved: "#00B294",

    //BarRejected= this colour was needed for bar chart reject status 
    BarRejected: "#0078D7",

    // Rejected= this status is for pie chart
    Rejected: '#A80000',

    // SignedOff
    SignedOff: '#32145A',

    //RolledBack
    RolledBack: '#01BCF3',

    //Closed =this status is for pie chart
    Closed: ' #B4009E',

    //ClosBarClosed =this colour was needed for bar chart closed status
    BarClosed: "#E81123",

    //ApprovalPending
    ApprovalPending: '#004B50',

    //UAStringDependency
    UAStringDependency: "#B4A0FF",

    //DocModeDependency
    DocModeDependency: "#0078D7",

    //ContentMissing
    ContentMissing: "#004B1C"



});


//String Constants for Change Type settings
EMIEModule.value('ChangeTypeConstants', {

    //Add to EMIE
    AddtoEMIE: 'Add to EMIE',

    // Delete from EMIE
    DeletefromEMIE: 'Delete from EMIE',

    // Update to EMIE
    UpdatetoEMIE: 'Update to EMIE',

});
EMIEModule.value('ReasonForChangeConstants', {
    //SilverLight Issue
    SilverLightIssue: "SilverLight Issue",

    //Deprecated API
    DeprecatedAPI: "Deprecated API",

    //Others
    Others: "Others",

    //Authentication/SSO
    AuthenticationSSO: "Authentication/SSO",

    //Broken Functionality
    BrokenFunctionality: "Broken Functionality",

    //Crashes / Hangs 
    CrashesHangs: "Crashes / Hangs",

    //Content Missing 
    ContentMissing: "Content Missing",

    //Browser Feature Missing 
    BrowserFeatureMissing: "Browser Feature Missing",

    //DocMode Dependency 
    DocModeDependency: "DocMode Dependency",

    //Modal Dialog 
    ModalDialog: "Modal Dialog",

    //Notifications (Pop-up/Gold Bar)
    Notifications: "Notifications (Pop-up/Gold Bar)",

    //Plugins (ActiveX/Silverlight/Others)
    Plugins: "Plugins (ActiveX/Silverlight/Others)",

    //UA String Dependency
    UAStringDependency: "UA String Dependency",

    //Usability and User Experience
    UsabilityAndUserExperience: "Usability and User Experience",


});

