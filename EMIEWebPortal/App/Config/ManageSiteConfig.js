//Config to change the page when EMIE SiteLists tool is launched
EMIEModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
     when('/ManageSite', {
         templateUrl: '/App/Views/ManageSite.html',
         controller: 'ManageSiteController'
     }).
    when('/SiteLists', {
        templateUrl: '/App/Views/SiteLists.html',
        controller: 'SiteListsController'
    }).
     when('/ProductionSites', {
         templateUrl: '/App/Views/ProductionSites.html',
         controller: 'SiteListsController'
     })
}]);