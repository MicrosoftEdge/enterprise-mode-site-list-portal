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
    InProgress: '#7Fd7F1',
 
    //Initiated
    Initiated: "#5E89C6",
 
    //Approved:
    Approved: "#93BB88",
 
    //ProductionReady:
    ProductionReady: "#A7C3D8",
 
    //ProductionChangesScheduled
    ProductionChangesScheduled: "#7B9894",
 
    //PartiallyApproved
    PartiallyApproved: "#ECE5B8",
 
    //BarRejected= this colour was needed for bar chart reject status 
    BarRejected: "#F6A6AC",
 
    // Rejected= this status is for pie chart
    Rejected: '#F6A6AC',
 
    // SignedOff
    SignedOff: '#8F74B2',
 
    //RolledBack
    RolledBack: '#7FD8C9',
 
    //Closed =this status is for pie chart
    Closed: '#DCEB84',
 
    //ClosBarClosed =this colour was needed for bar chart closed status
    BarClosed: "#DCEB84",
 
    //ApprovalPending
    ApprovalPending: '#FFD49F',
 
    //UAStringDependency
    UAStringDependency: "#A97191",
 
    //DocModeDependency
    DocModeDependency: "#BBB8C7",
 
    //ContentMissing
    ContentMissing: "#F37669"
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

