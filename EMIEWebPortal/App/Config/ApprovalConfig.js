//Config for routing to change the page
//This config will work for all request related to approval part i.e. pending approval,all request
EMIEModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/Approvers', {
            templateUrl: '/App/Views/Approvers.html',
            controller: 'ApprovalController'
        }).
    when('/MyRequests', {
        templateUrl: '/App/Views/MyRequests.html',
        controller: 'MyApprovalController'
    }).
    when('/ApproversPage', {
        templateUrl: '/App/Views/Approvers.html',
        controller: 'ApprovalController'
    });

}]);