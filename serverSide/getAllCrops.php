<?php

include 'header.php';

$result = mysqli_query($con, "select distinct cropName from cropDetail");
//var_dump($result);
$cropNames=array();
while ($row = mysqli_fetch_array($result)) {
    array_push($cropNames, $row['cropName']);
}


$value = array();
foreach ($cropNames as $cropName) {
    $ret = array();
    $ret['cropName'] = $cropName;
    $result = mysqli_query($con, "select * from cropDetail where cropName='$cropName';");
    while ($col = mysqli_fetch_array($result)) {
        $ret['profit'] = $col['profit'];
        $ret['risk'] = $col['risk'];    
        $ret['invest'] = $col['invest'];
        $ret['startWeek'] = $col['startWeek'];
        $ret['startEndWeek'] = $col['startEndWeek'];
        $ret['duration'] = $col['duration'];
    }

    $cropSoils = array();
    $result = mysqli_query($con, "select * from cropSoil where cropName='$cropName';");
    while ($col = mysqli_fetch_array($result)) {
        array_push($cropSoils, $col['soilName']);
    }

    $ret['cropSoils'] = $cropSoils;
    $phenoPhase = array();
    $result = mysqli_query($con, "select * from cropTime where cropName='$cropName';");
    while ($col = mysqli_fetch_array($result)) {
        $tmp = array();
        $tmp['phaseNumber'] = $col['phaseNumber'];
        $tmp['phaseName'] = $col['phaseName'];
        $tmp['water'] = $col['water'];
        $tmp['labor'] = $col['labor'];
        $tmp['Tmin'] = $col['Tmin'];
        $tmp['Tmax'] = $col['Tmax'];
        $tmp['duration'] = $col['duration'];
        array_push($phenoPhase, $tmp);
    };

    $ret['phenophase'] = $phenoPhase;

    array_push($value, $ret);
}

exit(json_encode($value));
mysqli_close($con);
?>
