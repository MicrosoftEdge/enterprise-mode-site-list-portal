
EMIEModule.directive("messageCenter", function () {
    return {
        templateUrl: "App/Utilities/message-center.html",

        link: function (scope, element, attr) {
    
            var ss = scope;

            scope.setcss = function (clsname) {
                var val = clsname;

                if (typeof (val) != "undefined") {
                     if (val.toLowerCase() == "success") {
                         return 'Modal-success';
                        
                    }
                    if (val.toLowerCase() == "info") {

                        return 'Modal-info';
                    }
                    if (val.toLowerCase() == "warning") {

                        return 'Modal-warning';
                    }
                    if (val.toLowerCase() == "danger" || val.toLowerCase() == "error") {

                        return 'Modal-error';
                    }

                }

            }
                 }
    }
       

})