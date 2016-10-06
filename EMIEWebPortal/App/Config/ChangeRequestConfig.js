//Config for routing to change the page
EMIEModule.config(['$routeProvider', function ($routeProvider, CRService) {
    $routeProvider.
        when('/NewCR', {
            templateUrl: '/App/Views/NewCR.html',
            controller: 'CRCntrl'           
        }).
    when('/Request', {
        templateUrl: '/App/Views/NewCR.html',
        controller: 'CRCntrl'               
    }).
    when('/RequestPage', {
        templateUrl: '/App/Views/NewCR.html',
        controller: 'CRCntrl'               
    }).
    otherwise('/Login', {
            templateUrl: '/App/Views/LoginHome.html',
            controller: 'LoginController'
        });
    
}]); 