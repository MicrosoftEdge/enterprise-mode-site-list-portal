//Config for routing to change the page
//This config will work for usermanagement
EMIEModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/User', {
            templateUrl: '/App/Views/UserManagement.html',
            controller: 'UserController'
        }).
    when('/CreateNewUser', {
        templateUrl: '/App/Views/CreateNewUser.html',
        controller: 'UserController'
    }).
     when('/EMIEAdminConsole', {
         templateUrl: '/App/Views/EMIERegisterUsers.html',
         controller: 'EMIEUserManagementController'
     });

}]);