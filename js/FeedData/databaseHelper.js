///all server related codes are here 

var adminPassword = "admin";

var getDistrictsNames = function($http, $scope)
{
    var url = 'serverSide/getDistrictsNames.php'; // The url of our search
    $http.get(url).
            success(function(data, status) {
        for (var key in data)
        {
            $scope.districts.push(data[key]);
        }
        ;
    })
            .
            error(function(data, status) {
        $scope.districts = [];
    });
};

var getDistrictsDetails = function($http, $scope)
{
    var url = 'serverSide/getDistrictDetails.php'; // The url of our search
    $http.get(url).
            success(function(data, status) {
        $scope.districtDetails=data;
    })
            .
            error(function(data, status) {
        $scope.districtDetails = [];
    });
};
var getAllCrops = function($http, $scope, type)
{

    $scope.result = [];
    var url = 'serverSide/getAllCrops.php'; // The url of our search
    var getData = function()
    {
        $http.get(url).
                success(function(data, status) {
            $scope.result = data;
        })
                .
                error(function(data, status) {
        });
    };
    getData();
//    safe(getData);
//    $.ajax({
//        type: "POST",
//        url: url,
//        success: function(data, datatype, status) {
//            $scope.result = JSON.parse(data);
//        },
//        fail: function(jqXHR, textStatus, errorThrown)
//        {
//
//        }
//    });

};
var addCropEntry = function($http, $scope)
{

    var jsonObject = {"crop": $scope.crop, "startEarly": $scope.startEarly, "investment": $scope.investment,
        "startEnd": $scope.startEnd, "risk": $scope.risk,
        "duration": $scope.duration, "profit": $scope.profit, "phenoInput": $scope.phenoInput, "soilTypes": $scope.soilTypes, "pheno": $scope.pheno};
    var url = 'serverSide/addCropEntry.php'; // The url of our search
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
var addDistrictEntry = function($http, $scope)
{

    var jsonObject = {"district": $scope.district, "array": $scope.weatherInput};
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
var uploadFile = function(fileNaeme)
{

};
