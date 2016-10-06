
EMIEModule.controller('LogoutController', function ($scope, $rootScope, SharedProperties,$interval, $location, $sessionStorage) {
                SharedProperties.setProperty(null);               
    $scope.$on('$destroy', function () {
        $interval.cancel($rootScope.countPromise);
    });
                $rootScope.User = null;
                $sessionStorage.User = null;
                $sessionStorage.TicketIdToShow = null;
                $(".tooltip").toggleClass("in");
                $(".EMIEuserpaneltoggler").addClass('hidden');
                $("#EMIEusermenu").addClass('hidden');
                $(".EMIEsetting").addClass("hidden");
                $(".EMIEstats").addClass("hidden");
                $(".EMIEusrconfig").addClass("hidden");
                $(".EMIEentapp").addClass("hidden");
               // $("#EMIEUserPanel").removeClass();
                $location.path("/Login");
});

