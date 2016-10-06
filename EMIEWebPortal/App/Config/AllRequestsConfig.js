EMIEModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/AllRequests', {
            templateUrl: '/App/Views/AllRequests.html',
            controller: 'AllRequestsController'      
        });
}]);