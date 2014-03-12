
var myModule = angular.module('crpSchd', []);
myModule.config(['$routeProvider', function($routeProvider) {
        $routeProvider.
                when('/home', {templateUrl: 'partials/home.html', controller: HomePageCtrl}).
                when('/about', {templateUrl: 'partials/about.html'}).
                when('/addcrop', {templateUrl: 'partials/addCrops.html', controller: AddCropCtrl}).
                when('/viewcrops', {templateUrl: 'partials/viewCrops.html', controller: ViewCropCtrl}).
                when('/addregionDetails', {templateUrl: 'partials/regionDetails.html', controller: addRegionCtrl}).
                otherwise({redirectTo: '/home'});
    }]);
myModule.directive("fileread", [function() {
        return {
            scope: {
                fileread: "="
            },
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                    scope.$apply(function() {
                        var f = changeEvent.target.files[0];
                        var reader = new FileReader();
                        // Closure to capture the file information.
                        if (window.File && window.FileReader && window.FileList && window.Blob) {
// Great success! All the File APIs are supported.
                        } else {
                            alert('The File APIs are not fully supported in this browser.Please open google chrome');
                        }


                        var addDistrictEntry = function(districtName, details)
                        {

                            var jsonObject = {"district": districtName, "array": details};
                            var url = 'serverSide/addDistrictEntry.php'; // The url of our search
                            var data = JSON.stringify(jsonObject);

                            $.ajax({
                                type: "POST",
                                url: url,
                                success: function(data, datatype, status) {
                                    $scope.messageFromServer = data;
                                },
                                fail: function(jqXHR, textStatus, errorThrown)
                                {

                                },
                                data: {"data": data}
                            });



                        };

                        reader.onload = (function(theFile) {
                            return function(e) {

                                try
                                {
                                    var arrayEl = e.target.result.trim().split("\n").filter(String);
                                    var districtName = arrayEl[0];
                                    var res = new Array();
                                    for (var i = 1; i < arrayEl.length; i++) {
                                        var tmp = new Object();
                                        var entry = arrayEl[i];
                                        entry = entry.split(",");
                                        if (entry.length === 3) {
                                            tmp.rainfall = entry[2];
                                            tmp.tmin = entry[1];
                                            tmp.tmax = entry[0];
                                            res[i-1] = tmp;

                                        }
                                        else
                                        {
                                            scope.fileread = "File not properly formatted, Everyline should have three column ";
                                            return;
                                        }
                                        //Run some code here
                                    }
                                    if (res.length === 52) {
                                        addDistrictEntry(districtName, res);
                                        scope.fileread = "Properly Uploaded";
                                        ;

                                    }
                                    else
                                    {
                                        scope.fileread = "File should have 52 lines containing three columns, so total of 53 lines";
                                        return;
                                    }
                                }
                                catch (err)
                                {
                                    scope.fileread = err;
                                    return;
                                    //Handle errors here
                                }

                                i++;
                            };
                        })(f);
                        reader.readAsText(f);
                    });
                });
            }
        };
    }]);
//    .service('myService', function($http, $scope) {
//    $scope.url = 'getRegioNames.php'; // The url of our search
//    $scope.keywords = 'php';
//    // service is just a constructor function
//    // that will be called with 'new'
//
//    this.getRegionNames = function()
//    {
//        // Create the http post request
//        // the data holds the keywords
//        // The request is a JSON request.
//        $http.post($scope.url, {"data": $scope.keywords}).
//                success(function(data, status) {
//            $scope.status = status;
//            $scope.data = data;
//            $scope.result = data; // Show result from server in our <pre></pre> element
//        })
//                .
//                error(function(data, status) {
//            $scope.data = data || "Request failed";
//            $scope.status = status;
//        });
//        return $scope.data;
//    };
//
//    this.sayHello = function(name) {
//        return "Hi " + name + "!";
//    };
//});


