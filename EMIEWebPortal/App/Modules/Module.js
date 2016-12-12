var EMIEModule = angular.module("EMIEModule", ["ui.bootstrap", "ngRoute",
    "ui.filters", 'ngAnimate', "disableAll",'ngSanitize',
    "angularUtils.directives.dirPagination",
    'angular-loading-bar', 'ngStorage', 'ngFileSaver','angular-growl']);

EMIEModule.run(['$route', function ($route) {
    $route.reload();
}]);


//Function added to restrict the user from redirection 
EMIEModule.config(['$routeProvider', function () { }])
.run(function ($rootScope, $location, SharedProperties) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (current != null) {
            var prop = SharedProperties.getProperty();
            if (next.templateUrl == "/App/Views/NewCR.html" && ($rootScope.isNonEdit != undefined && $rootScope.isNonEdit != true))
                SharedProperties.setProperty(null);
            if (current.templateUrl == "/App/Views/NewCR.html" && SharedProperties.getProperty() == null) {
                if (next.$$route.originalPath == "/ApproversPage" || next.$$route.originalPath == "/ProductionChangePage"
                    || next.$$route.originalPath == "/SignOffPage" || next.$$route.originalPath == "/SandboxPage")
                event.preventDefault();
            }

            if (SharedProperties.getProperty() != null && next && next.$$route && next.$$route.originalPath) {
                if (next.$$route.originalPath == "/ApproversPage") {
                    if (prop.FinalTicketStatus < 3 || prop.FinalTicketStatus == 9)
                        event.preventDefault();
                }

                if (next.$$route.originalPath == "/ProductionChangePage") {
                    if (prop.FinalTicketStatus < 5 || prop.FinalTicketStatus == 6 || prop.FinalTicketStatus == 9)
                        event.preventDefault();
                }

                if (next.$$route.originalPath == "/SignOffPage") {
                    if (prop.FinalTicketStatus < 7 || prop.FinalTicketStatus == 9 || prop.FinalTicketStatus == 12)
                        event.preventDefault();
                }
            }
        }
    })

});


//this function will prevent right click
EMIEModule.directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {
$event: event
});
});
});
    };
    });

EMIEModule.config(['growlProvider', function (growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalDisableCountDown(true);
    //growlProvider.globalInlineMessages(true);
}]);


//This filter is added to search/filter configutaion settings using key from list of key-value pairs
EMIEModule.filter('getByKey', function () {
    return function (input, key) {
        len = input.length;
        for (var i=0; i < len; i++) {
            if (input[i].key == key) {
                return input[i];
            }
        }
        return null;
    }
});


//String Constants for Confiration settings
EMIEModule.value('ConfigConstants', {
    //SandboxEnvironment
    SandboxEnvironment: 'SandboxEnvironment',

    // SandboxUserName
    SandboxUserName: 'SandboxUserName',

    // SandboxUserDomain
    SandboxUserDomain: 'SandboxUserDomain',

    //SandboxPassword
    SandboxPassword: 'SandboxPassword',

    //ProductionEnvironment
    ProductionEnvironment: 'ProductionEnvironment',

    //ProductionUserName
    ProductionUserName: 'ProductionUserName',


    //ProductionUserDomain
    ProductionUserDomain: 'ProductionUserDomain',

    //ProductionPassword
    ProductionPassword: 'ProductionPassword',

    //FreezeProductionChangeStartDate
    FreezeProductionChangeStartDate: 'FreezeProductionChangeStartDate',

    //FreezeProductionChangeEndDate
    FreezeProductionChangeEndDate : 'FreezeProductionChangeEndDate',

    //AttachmentLocation
    UploadAttachmentsLocation: 'UploadAttachmentsLocation',

    //UploadAttachmentUserName
    UploadAttachmentUserDomain : 'UploadAttachmentUserDomain',
    
    //UploadAttachmentUserName
    UploadAttachmentUserName: 'UploadAttachmentUserName',

    //UploadAttachmentPassword
    UploadAttachmentPassword: 'UploadAttachmentPassword',

    //ConfigurationSettingsLocation
    ConfigurationSettingsLocation: 'ConfigurationSettingsLocation',
     
    //ConfigurationSettingsUserDomain
    ConfigurationSettingsUserDomain: 'ConfigurationSettingsUserDomain',

    //ConfigurationSettingsUserName
    ConfigurationSettingsUserName: 'ConfigurationSettingsUserName',

    //ConfigurationSettingsPassword
    ConfigurationSettingsPassword: 'ConfigurationSettingsPassword',

    //SiteDomainName
    SiteDomainName: 'SiteDomainName',

    //EmailUserName
    EmailUserName: 'EmailUserName',

    //EmailUserAPssword
    EmailPassword: 'EmailPassword'
});

