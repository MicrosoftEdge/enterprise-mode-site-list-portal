//Config for routing to change the page while login and after login done
EMIEModule.config(function ($routeProvider) {
    $routeProvider.
        when('/Login', {
            templateUrl: '/App/Views/LoginHome.html',
            controller: 'LoginController'
        }).
    when('/SignInSuccessForRequestor', {
        templateUrl: '/App/Views/NewCR.html',
        controller: 'CRCntrl'
    }).
    when('/SignInSuccess', {
        templateUrl: '/App/Views/MyRequests.html',
        controller: 'MyApprovalController'
    }).
  when('/Register', {
      templateUrl: '/App/Views/CreateNewUser.html',
      controller: 'UserController'
  }).
    when('/Chart', {
        templateUrl: '/App/Views/Chart.html',
        controller: 'ReportsController'
    }).
    when('/Logout', {
        templateUrl: '/App/Views/LoginHome.html',
        controller: 'LogoutController'
    })
});