EMIEModule.factory('CommonFunctionsFactory', function (Constants)//factory for all common functions used in VerifySandbox/VerifyProduction controller
{
    var factory = {};

    var data = null;

    var dateConstraint = null;
    
    //Common DatePicker function
    factory.DatePicker = function ($scope, DatePickerOptions) {
        dateConstraint = new Date();
        if (DatePickerOptions ==Constants.DateAfterToday) {
            dateConstraint.setDate(dateConstraint.getDate() + 1);
        }

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : dateConstraint;
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
        };
       
        populateDatePickerUI($scope, DatePickerOptions);

        if (DatePickerOptions ==Constants.DateAfterToday) {
            $scope.toggleMin();
        }
    
    }


    //Populate datepicker popup-UI
    function populateDatePickerUI($scope, DatePickerOptions) {

        $scope.today = function () {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        if (DatePickerOptions ==Constants.DateAfterToday) {


            $scope.inlineOptions = {
                customClass: getDayClass,
                minDate: new Date(),
                maxDate: new Date(),
                showWeeks: true
            };

            $scope.dateOptions = {
                // dateDisabled: disabled, # disable weekends
                formatYear: 'yy',
                maxDate: new Date(2099, 1, 1),
                minDate: new Date(),
                startingDay: 1
            };
        }
        else {
            $scope.inlineOptions = {
                customClass: getDayClass,
                minDate: new Date(),
                showWeeks: true
            };

            $scope.dateOptions = {
                // dateDisabled: disabled, # disable weekends
                formatYear: 'yy',
                maxDate: new Date(),
                minDate: new Date(),
                startingDay: 1
            };
        }

        // Disable weekend selection
        function disabled(data) {
            var date = data.date,
              mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : dateConstraint;
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
        };

        $scope.toggleMin();

        $scope.openStartDate = function () {
            $scope.popupStartDate.opened = true;
        };

        $scope.openEndDate = function () {
            $scope.popupEndDate.opened = true;
        };

        $scope.setDate = function (year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'MM/dd/yyyy', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[2];
        // $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.popupStartDate = {
            opened: false
        };

        $scope.popupEndDate = {
            opened: false
        };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterTomorrow = new Date();
        afterTomorrow.setDate(tomorrow.getDate() + 1);
        $scope.events = [
          {
              date: tomorrow,
              status: 'full'
          },
          {
              date: afterTomorrow,
              status: 'partially'
          }
        ];

        //Date Mode function to be set from ui
        function getDayClass(data) {
            var date = data.date,
              mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }

    }

    //common function to sort data
    //dataToBeSort-data which is to be sorted,sortParameter-property of object which is used for sorting
    //increasingOrder-if true sort by ascending else sort by descending order
    //isCompareValueInt-if true ,sorting value is integer else string
    factory.sortData = function ($scope, dataToBeSort, sortParameter, increasingOrder, isCompareValueInt) {

        dataToBeSort.sort(function (a, b) {
            a = fetchPropertyValueFromObject(a, sortParameter);
            b = fetchPropertyValueFromObject(b, sortParameter);
            if (isCompareValueInt == false || isCompareValueInt == undefined) {
                if (increasingOrder == false) {
                    return (b.localeCompare(a));
                }
                else {
                    return (a.localeCompare(b));
                }
            }
            else//sort integer type data
            {
                if (increasingOrder == false) {
                    return (parseFloat(b) - parseFloat(a));
                }
                else {
                    return (parseFloat(a) - parseFloat(b));
                }
            }
        });

        return dataToBeSort;
    }

    //function to fetch property of object from string value
    //propertyInString-property to be fetched
    function fetchPropertyValueFromObject(object, propertyInString) {
        //property not found
        if (typeof object === 'undefined') return false;

        //index of next property split
        var _index = propertyInString.indexOf('.')

        //property split found; recursive call
        if (_index > -1) {
            //get object at property (before split), pass on remainder
            return fetchPropertyValueFromObject(object[propertyInString.substring(0, _index)], propertyInString.substr(_index + 1));
        }

        //no split; get property
        return object[propertyInString];
    }
    return factory;
});