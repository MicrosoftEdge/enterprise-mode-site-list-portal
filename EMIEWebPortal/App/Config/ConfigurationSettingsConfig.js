//Config for routing to change the page
//This config will work for Configuration Settings for EMIE Campion
EMIEModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/Configuration', {
            templateUrl: '/App/Views/ConfigurationSetting.html',
            controller: 'ConfigurationController'
        });

}]);