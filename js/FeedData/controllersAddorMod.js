var AddCropCtrl = function($scope, $http)
{

    $scope.messageFromServer = "";
    $scope.regionNames = [];
    $scope.file = "";
    $scope.error1 = 0;
    $scope.error2 = 0;
    $scope.errorMsg1 = "";
    $scope.errorMsg2 = "";
    $scope.crop = "";
    $scope.startEarly = "1";
    $scope.startEnd = "1";
    $scope.duration = "1";
    $scope.profit = "5";
    $scope.investment = "1000";
    $scope.risk = '3';
    $scope.pheno = 1;
    $scope.phenoArray = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5,6,7], [1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
    $scope.phenoInput = new Array();
    for (var i = 0; i < 10; i++)
    {
        var tmp = new Object();
        tmp.phenoName = "";
        tmp.water = "";
        tmp.labour = "";
        tmp.duration = "";
        tmp.tmin = "";
        tmp.tmax = "";
        $scope.phenoInput[i] = tmp;
    }
    $scope.soilTypes = [["Alluvial Soils", false], ["Black Soils", false], ["Red/Yellow Soils", false],
        ["Laterite Soils", false], ["Mountain Soils", false], ["Desert Soils", false]];
//    getRegionNames($http, $scope);

    var soilTypesNotFilled = function()
    {
        for (var i = 0; i < $scope.soilTypes.length; i++)
            if ($scope.soilTypes[i][1] === true)
                return false;
        return true;
    };
    var phenoNotFilled = function()
    {
        for (var i = 0; i < $scope.pheno; i++)
        {
            var tmp = $scope.phenoInput[i];
            if (tmp.phenoName === "" || tmp.water === "" ||
                    tmp.labour === "" || tmp.duration === "" || tmp.tmin === "" || tmp.tmax === "")
            {
                return true;
            }
        }
        return false;
    }

    $scope.uploadCrop = function()
    {

        if ($scope.crop === "" || $scope.startEarly === "" || $scope.startEnd === ""
                || $scope.duration === "" || $scope.investment === "" || $scope.profit === ""
                || $scope.risk === "" || phenoNotFilled() || soilTypesNotFilled())
        {
            $scope.error1 = 1;
            $scope.errorMsg1 = "Fill all the fields";
        }
        else
        {
            $scope.error1 = 0;
            addCropEntry($http, $scope);
        }
    };
    $scope.uploadFile = function()
    {
        if ($scope.file === "")
        {
            $scope.error2 = 1;
            $scope.errorMsg2 = "File is not choosen";
        }

        else
        {
            uploadFile($scope.file);
            $scope.error2 = 0;
        }
    };
};
var addRegionCtrl = function($scope, $http)
{

    $scope.uploadme = "Random";
    $scope.error1 = 0;
    $scope.errorMsg1 = "";
    $scope.error2 = 0;
    $scope.errorMsg2 = "";
    $scope.district = "";
    $scope.weatherInput = new Array();

    $scope.messageFromServer = "";
    for (var i = 0; i < 52; i++)
    {
        var tmp = new Object();
        tmp.rainfall;
        tmp.tmin;
        tmp.tmax;
        $scope.weatherInput[i] = tmp;
    }
    $scope.uploadFile = function()
    {
        if ($scope.uploadme === "")
        {
            $scope.error2 = 1;
            $scope.errorMsg2 = "File Not FOUND !!!";
        }
        else
        {
            $scope.error2 = 0;
        }
    };
    var checkNullInput = function()
    {
        if ($scope.district === '')
            return true;
        for (var i = 0; i < 52; i++)
        {
            var tmp = $scope.weatherInput[i];
            if (tmp.rainfall === undefined || tmp.tmax === undefined || tmp.tmin === undefined)
                return true;
            if (tmp.rainfall === '' || tmp.tmin === '' || tmp.tmax === '')
                return true;
        }
        return false;
    };
    $scope.uploadDetails = function()
    {
        if (!checkNullInput())
        {
            $scope.error1 = 0;
            addDistrictEntry($http, $scope);
        }
        else
        {
            $scope.error1 = 1;
            $scope.errorMsg1 = "Please fill all the entries";
        }
    };
};
var ViewCropCtrl = function($scope, $http)
{
    getAllCrops($http, $scope, 0);
   
};