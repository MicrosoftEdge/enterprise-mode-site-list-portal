//This config file has the routing rules for VerifySandBoxPage
EMIEModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/VerifySandbox', {
            templateUrl: '/App/Views/VerifySandbox.html',
            controller: 'VerifySandboxController'
        }).
    when('/SandboxPage', {
        templateUrl: '/App/Views/VerifySandbox.html',
        controller: 'VerifySandboxController'
    }).
     when('/ProductionChanges', {
         templateUrl: '/App/Views/ProductionChanges.html',
         controller: 'ProdChangesController'
     }).
    when('/ProductionChangePage', {
        templateUrl: '/App/Views/ProductionChanges.html',
        controller: 'ProdChangesController'
    }).
    when('/VerifyProduction', {
        templateUrl: '/App/Views/VerifyProduction.html',
        controller: 'VerifyProductionController'
    }).
    when('/SignOffPage', {
        templateUrl: '/App/Views/VerifyProduction.html',
        controller: 'VerifyProductionController'
    });
}]); 