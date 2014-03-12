<?php

include 'header.php';

$sql = "select distinct districtName from district;";
$result = mysqli_query($con, $sql);
//var_dump($result);
$districtNames = array();
while ($row = mysqli_fetch_array($result)) {
    array_push($districtNames, $row['districtName']);
}
$districtDetails = array();

foreach ($districtNames as $districtName) {
    $districtDetails[$districtName] = array();
    $districtDetails[$districtName]['weekId'] = array();
    $districtDetails[$districtName]['Tmin'] = array();
    $districtDetails[$districtName]['Tmax'] = array();
    $districtDetails[$districtName]['rain'] = array();


    $result = mysqli_query($con, "select * from district where districtName='$districtName';");
    while ($col = mysqli_fetch_array($result)) {

        array_push($districtDetails[$districtName]['weekId'], $col['weekId']);
        array_push($districtDetails[$districtName]['Tmin'], $col['Tmin']);
        array_push($districtDetails[$districtName]['Tmax'], $col['Tmax']);
        array_push($districtDetails[$districtName]['rain'], $col['rain']);
    }
};
exit(json_encode($districtDetails));
mysqli_close($con);
?>
