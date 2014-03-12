//goog.require('goog.dom');
var finalCropList = [];
var cropList = [];
var minimumWater = 30;
var maximumWater = 30;
var topK = 5;
var capitalRisk = 1000;
var adminPassword = "admin";
var calculateRisk = function($scope, plan)
{
    //soil check
    for (var i = 0; i < plan.length; i++)
    {
        var index = plan[i].index;
        var flag = 0;
        for (var j = 0; j < $scope.result[index].cropSoils.length; j++)
        {
            for (var k = 0; k < $scope.soilTypes.length; k++)
            {
                if (($scope.result[index].cropSoils[j] === $scope.soilTypes[k][0]) && $scope.soilTypes[k][1])
                {
                    flag = 1;
                    break;
                }
            }
            if (flag)
                break;
        }
        if (flag !== 1)
            return 1000;
    }

    var baseRisk = 0;

//float not considered
    for (var i = 0; i < plan.length; i++)
    {
        baseRisk = baseRisk + parseFloat($scope.result[plan[i].index].risk);
    }
    baseRisk = baseRisk / plan.length;

    var addRisk = 0;

//Temperature Risk
    var tempRisk = 0;
    var count = 0;
    for (var i = 0; i < plan.length; i++)
    {
        var index = plan[i].index;
        var beg = plan[i].start;
        for (var j = 0; j < $scope.result[index].phenophase.length; j++)
        {
            for (var k = beg;
                    k !== (beg + parseInt($scope.result[index].phenophase[j].duration)) % 52;
                    k = (k + 1) % 52)
            {
                count++;
                var Tmin = parseFloat($scope.result[index].phenophase[j].Tmin);
                var Tmax = parseFloat($scope.result[index].phenophase[j].Tmax);
                var Topt = (Tmin + Tmax) / 2.0;
                var T = (parseFloat($scope.districtDetails[$scope.district].Tmin[k])
                        + parseFloat($scope.districtDetails[$scope.district].Tmax[k])) / 2.0;
                var risk = 0;
                risk = 1.0 - ((Tmax - T) / (Tmax - Topt)) * Math.pow(T / Topt, Topt / (Tmax - Topt));
                if (risk < 0)
                    risk *= -1;
                if (risk > 1)
                    risk = 1;
                tempRisk = tempRisk + risk * 10;
            }
            beg = (beg + parseInt($scope.result[index].phenophase[j].duration)) % 52;
        }
        var marao = false;
    }
    tempRisk = tempRisk / count;

    addRisk = tempRisk;

    //Water Risk
    var waterRisk = 0;
    $scope.weeklyWater = [];
    var weekIndex = 0;
    for (var i = 0; i < $scope.months.length; i++)
    {
        var value = $scope.months[i];
        var monthlyWater = parseFloat($scope.waterAvailability[value]);
        var limit = $scope.hashMapMonthToWeek[$scope.tempMonths[$scope.hashMap[value] + 1]];
        for (; weekIndex < limit; weekIndex++)
            $scope.weeklyWater[weekIndex] = monthlyWater;
    }
    ;
    for (var i = 0; i < plan.length; i++)
    {
        var index = plan[i].index;
        var beg = plan[i].start;
        var cropWaterRisk = 0;
        for (var j = 0; j < $scope.result[index].phenophase.length; j++)
        {
            var phenoWater = 0;
            var count = 0;
            for (var k = beg;
                    k !== (beg + parseInt($scope.result[index].phenophase[j].duration)) % 52;
                    k = (k + 1) % 52)
            {
                var waterGiven = $scope.weeklyWater[k];
                var rainfall = parseFloat($scope.districtDetails[$scope.district].rain[k]);
                phenoWater += waterGiven + rainfall / 10;
                count++;
            }
            var waterRequired = parseFloat($scope.result[index].phenophase[j].water);
            phenoWater /= count;
            if (phenoWater < waterRequired)
            {
                cropWaterRisk += 1 - 1 / (waterRequired / phenoWater);
            }


            beg = (beg + parseInt($scope.result[index].phenophase[j].duration)) % 52;
        }
        waterRisk += cropWaterRisk / $scope.result[index].phenophase.length;
        var marao = false;
    }
    waterRisk /= plan.length;
    waterRisk *= 40;

    //Labour Risk
    var labourRisk = 0;
    $scope.weeklyLabour = [];
    var weekIndex = 0;
    for (var i = 0; i < $scope.months.length; i++)
    {
        var value = $scope.months[i];
        var monthlyWater = parseFloat($scope.labourAvailability[value]);
        var limit = $scope.hashMapMonthToWeek[$scope.tempMonths[$scope.hashMap[value] + 1]];
        for (; weekIndex < limit; weekIndex++)
            $scope.weeklyLabour[weekIndex] = monthlyWater;
    }
    ;

    for (var i = 0; i < plan.length; i++)
    {
        var index = plan[i].index;
        var beg = plan[i].start;
        var cropLabourRisk = 0;
        for (var j = 0; j < $scope.result[index].phenophase.length; j++)
        {
            var phenoLabour = 0;
            var count = 0;
            for (var k = beg;
                    k !== (beg + parseInt($scope.result[index].phenophase[j].duration)) % 52;
                    k = (k + 1) % 52)
            {
                phenoLabour += $scope.weeklyLabour[k];
                count++;
            }
            var laborRequired = parseFloat($scope.result[index].phenophase[j].labor);
            phenoLabour /= count;

            if (laborRequired - phenoLabour > 2)
                return 1000;
            else if (laborRequired - phenoLabour > 0)
                cropLabourRisk += (laborRequired - phenoLabour) * 5;

            beg = (beg + parseInt($scope.result[index].phenophase[j].duration)) % 52;
        }
        labourRisk += cropLabourRisk / $scope.result[index].phenophase.length;
        var marao = false;
    }
    labourRisk /= plan.length;

    //Investment Risk
    var investRisk = 0;
    for (var i = 0; i < plan.length; i++)
        investRisk += parseFloat($scope.result[plan[i].index].invest);
    investRisk /= plan.length;
    if (investRisk <= $scope.investmentAvailability)
        investRisk = 0;
    else if (investRisk - $scope.investmentAvailability > 2)
        return 1000;
    else
        investRisk = (investRisk - $scope.investmentAvailability) * 5;

    //Profit Risk
    var profitRisk = 0;
    var count = 0;
    for (var i = 0; i < plan.length; i++)
    {
        profitRisk += (parseFloat($scope.result[plan[i].index].profit)
                * parseFloat($scope.result[plan[i].index].duration));
        count += parseFloat($scope.result[plan[i].index].duration);
    }
//    profitRisk /= count;
    profitRisk /= ($scope.endWeek - $scope.startWeek + 52) % 52;


    addRisk = (tempRisk + waterRisk + labourRisk + investRisk + 10 - profitRisk);

    return (baseRisk + 2 * addRisk) / 5;
};

var HomePageCtrl = function($scope, $location, $http) {
    $scope.showOutput = false;
    $scope.district;
    $scope.districts = [];
    $scope.districtDetails = [];
    $scope.result;
    $scope.soilTypes = [["Alluvial Soils", false], ["Black Soils", false], ["Red/Yellow Soils", false],
        ["Laterite Soils", false], ["Mountain Soils", false], ["Desert Soils", false]];
    $scope.startmonth = "Jan";
    $scope.endmonth = "Jan";
    $scope.months = new Array("Jan", "Feb", "March",
            "April", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    $scope.tempMonths = new Array("Jan", "Feb", "March",
            "April", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Next");

    $scope.waterAvailability = {};
    $.each($scope.months, function(index, value)
    {
        $scope.waterAvailability[value];
    });

    $scope.labourAvailability = {};
    $.each($scope.months, function(index, value)
    {
        $scope.labourAvailability[value];
    });

    $scope.investmentAvailability = 0;
    $scope.cropPlanCount = 10;
    $scope.hashMap = {};
    $scope.hashMapMonthToWeek = {"Jan": 0, "Feb": 4, "March": 8,
        "April": 12, "May": 17, "Jun": 22, "Jul": 26, "Aug": 30, "Sep": 34, "Oct": 39, "Nov": 43, "Dec": 47, "Next": 52};


    $.each($scope.months, function(index, value)
    {
        $scope.hashMap[value] = index;
    });

    getDistrictsNames($http, $scope);
    //  getAllCrops($http, $scope, 1);
    getAllCrops($http, $scope, 0);
    getDistrictsDetails($http, $scope);

    var soilTypesNotFilled = function()
    {
        for (var i = 0; i < $scope.soilTypes.length; i++)
            if ($scope.soilTypes[i][1] === true)
                return false;
        return true;
    };

    var check = function(hash, element)
    {
        var endIndex = element.cropStart + parseInt(element.cropDuration) - 1;
        var index = element.cropStart;
        for (var i = index; i <= endIndex; i++)
        {
            if (i === 12)
                index = 0;
            if (hash[index] > 20)
            {
                return false;
            }
            index++;

        }
        ;
        for (var i = 0; i < 12; i++)
        {
            if (hash[i] > 20)
                return true;
        }
        if (endIndex >= 12)
            endIndex -= 12;
        if (hash[endIndex] <= hash[element.cropStart])
            return false;
        return true;
    };
    var compareFunc = function(a, b)
    {
        if (a.risk < b.risk)
            return -1;
        else if (a.risk > b.risk)
            return 1;
        else
            return 0;
    };
    var arraysIdentical = function(a, b) {
        var i = a.length;
        if (i !== b.length)
            return false;
        while (i--) {
            if (a[i].index !== b[i].index)
                return false;
        }
        return true;
    };
    $scope.generateCropPlan = function()
    {
        $scope.finalOutput = [];
        $scope.cropPlanDP = new Array(52);
        $scope.finalAns = new Array();
        for (var i = 0; i < 52; i++)
        {
            $scope.cropPlanDP[i] = new Array($scope.cropPlanCount);
            for (var j = 0; j < $scope.cropPlanCount; j++)
                $scope.cropPlanDP[i][j] = {"risk": 1000, "plan": []};
        }

        var startWeek = $scope.hashMapMonthToWeek[$scope.startmonth];
        var endIndex = $scope.hashMap[$scope.endmonth];
        var endWeek = ($scope.hashMapMonthToWeek[$scope.months[(endIndex + 1) % 12]] + 51) % 52;
        $scope.startWeek = startWeek;
        $scope.endWeek = endWeek;
        for (var i = startWeek; i !== endWeek; i = (i + 1) % 52)
        {
            var sortArr = new Array();
            var count = 0;
            for (var j = startWeek; j !== i; j = (j + 1) % 52)
            {
                for (var k = 0; k < $scope.cropPlanCount; k++)
                {
                    for (var l = 0; l < $scope.result.length; l++)
                    {
                        for (var beg = parseInt($scope.result[l].startWeek) - 1;
                                beg !== parseInt($scope.result[l].startEndWeek) - 1;
                                beg = (beg + 1) % 52)
                        {
                            var end = (beg + parseInt($scope.result[l].duration)) % 52;

                            if ($scope.cropPlanDP[j][k].plan.length === 0)
                            {
                                if ((startWeek < i && beg < end &&
                                        beg >= startWeek &&
                                        end === i) ||
                                        (startWeek > i && (
                                                (beg < end && (end === i || beg >= startWeek))
                                                || (beg > end && beg >= startWeek && end === i)
                                                )))
                                {
                                    if (count < $scope.cropPlanCount)
                                    {
                                        var plan = [{"start": beg, "end": end, "index": l}];
                                        var risk = calculateRisk($scope, plan);
                                        for (var m = 0; m < count; m++)
                                        {
                                            if (arraysIdentical(sortArr[m].plan,
                                                    [{"start": beg, "end": end, "index": l}]))
                                                break;
                                            else if (m === count - 1)
                                            {
                                                count++;
                                                sortArr.push({"risk": risk,
                                                    "plan": plan});
                                                break;
                                            }
                                        }
                                        if (count === 0)
                                        {
                                            count++;
                                            sortArr.push({"risk": risk,
                                                "plan": plan});
                                        }
                                        sortArr.sort(compareFunc);
                                    }
                                    else if (risk < sortArr[count - 1].risk)
                                    {
                                        for (var m = 0; m < count; m++)
                                        {
                                            if (arraysIdentical(sortArr[m].plan, plan))
                                                break;
                                            else if (m === count - 1) {
                                                sortArr.pop();
                                                sortArr.push({"risk": risk,
                                                    "plan": plan});
                                            }
                                        }
                                        sortArr.sort(compareFunc);
                                    }
                                }
                            }
                            else
                            {
                                if ((j < i && beg < end &&
                                        beg > j && end === i) ||
                                        (j > i && (
                                                (beg < end && (end === i || beg > j))
                                                || (beg > end && beg > j && end === i)
                                                )))
                                {
                                    //var risk = $scope.cropPlanDP[j][k].risk + parseInt($scope.result[l].risk);
                                    var plan = new Array();

                                    for (var tmp = 0; tmp < $scope.cropPlanDP[j][k].plan.length; tmp++)
                                        plan.push($.extend(true, {}, $scope.cropPlanDP[j][k].plan[tmp]));

                                    plan.push({"start": beg, "end": end, "index": l});
                                    var risk = calculateRisk($scope, plan);
                                    if (count < $scope.cropPlanCount)
                                    {
                                        for (var m = 0; m < count; m++)
                                        {
                                            if (arraysIdentical(sortArr[m].plan, plan))
                                                break;
                                            else if (m === count - 1)
                                            {
                                                sortArr.push({"risk": risk, "plan": plan});
                                                count++;
                                                break;
                                            }
                                        }
                                        if (count === 0)
                                        {
                                            sortArr.push({"risk": risk, "plan": plan});
                                            count++;
                                        }
                                        sortArr.sort(compareFunc);
                                    }
                                    else if (risk < sortArr[count - 1].risk)
                                    {

                                        for (var m = 0; m < count; m++)
                                        {
                                            if (arraysIdentical(sortArr[m].plan, plan))
                                                break;
                                            else if (m === count - 1)
                                            {
                                                sortArr.pop();
                                                sortArr.push({"risk": risk, "plan": plan});
                                            }
                                        }
                                        sortArr.sort(compareFunc);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for (var j = 0; j < count; j++)
                $scope.cropPlanDP[i][j] = sortArr[j];
        }
        var ans = new Array();
        ans.push($scope.cropPlanDP[startWeek][0]);
        for (var i = startWeek; i !== endWeek; i = (i + 1) % 52)
        {
            for (var j = 0; j < $scope.cropPlanCount; j++)
            {
                for (var k = 0; k < ans.length; k++)
                {
                    if (arraysIdentical($scope.cropPlanDP[i][j].plan, ans[k].plan))
                        break;
                    else if (k === ans.length - 1)
                    {
                        ans.push($scope.cropPlanDP[i][j]);
                        break;
                    }
                }
            }
        }
        ans.sort(compareFunc);

        for (var i = 0; i < $scope.cropPlanCount && i < ans.length; i++) {
            if (ans[i].risk < 1000)
                $scope.finalAns.push(ans[i]);
        }

        var min = 123123123, max = -1233;
        for (var k = 0; k < $scope.finalAns.length; k++)
        {
            if ($scope.finalAns[k].risk < min)
                min = $scope.finalAns[k].risk;
            if ($scope.finalAns[k].risk > max)
                max = $scope.finalAns[k].risk;
        }
        for (var k = 0; k < $scope.finalAns.length; k++)
            $scope.finalAns[k].risk /= max;

        for (var i = 0; i < $scope.finalAns.length; i++)
        {
            var profit = 0;
            var profitString;
            var riskString;

            var cropArray = [];
            var count = 0;
            for (var j = 0; j < $scope.finalAns[i].plan.length; j++)
            {
                var cropName, cropStart, cropEnd;
                cropName = $scope.result[$scope.finalAns[i].plan[j].index].cropName;
                var cropProfit = $scope.result[$scope.finalAns[i].plan[j].index].profit;
                var cropRisk = $scope.result[$scope.finalAns[i].plan[j].index].risk;
                var cropInvestment = $scope.result[$scope.finalAns[i].plan[j].index].invest;
                cropStart = $scope.finalAns[i].plan[j].start;
                cropEnd = $scope.finalAns[i].plan[j].end;
                cropArray.push({"name": cropName, "start": cropStart, "end": cropEnd, "profit": cropProfit, "risk": cropRisk, "investment": cropInvestment});
                profit += parseFloat($scope.result[$scope.finalAns[i].plan[j].index].profit) * parseFloat($scope.result[$scope.finalAns[i].plan[j].index].duration);
                count += parseFloat($scope.result[$scope.finalAns[i].plan[j].index].duration);
            }
            profit /= count;

            if (profit >= 9)
                profitString = "Very High";
            else if (profit >= 7)
                profitString = "High";
            else if (profit >= 5)
                profitString = "Medium";
            else
                profitString = "Low";



            if ($scope.finalAns[i].risk >= 0.95)
                riskString = "Very High";
            else if ($scope.finalAns[i].risk >= 0.89)
                riskString = "High";
            else if ($scope.finalAns[i].risk >= 0.7)
                riskString = "Medium";
            else
                riskString = "Low";


            $scope.finalOutput.push({"crops": cropArray, "risk": riskString, "profit": profitString});
        }
        $scope.showOutput = true;

    };
};
//HomePageCtrl.$inject=['$scope','$location','myService'];


var NavgCtrl = function($scope, $location) {
    $scope.userName = "";
    $scope.password = "";
    $scope.failed = 0;
    $scope.login = 0;

    $scope.signIn = function(userName, password)
    {
        $scope.userName = userName;
        if ($scope.userName !== "" && password === "admin")
        {
            $scope.failed = 0;
            $scope.login = 1;
            $scope.password = "";
        }

        else
            $scope.failed = 1;

    };
    $scope.signOut = function()
    {

        $location.path('/home');
        $scope.failed = 0;
        $scope.login = 0;
    };
};




