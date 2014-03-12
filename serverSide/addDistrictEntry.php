<?php

include 'header.php';


if (isset($_POST["data"])) {

//    foreach ($_POST as $param_name => $param_val) {
//        echo "Param: $param_name; Value: $param_val<br />\n";
//    }
    $input = json_decode($_POST["data"], true);
//    var_dump($input);

    $districtName = $input['district'];
    $districtDetails = $input['array'];
    $weekId = 0;
   foreach ($districtDetails as $tmp) {
        $tMin = $tmp["tmin"];
        $tMax = $tmp["tmax"];
        $rainfall = $tmp["rainfall"];
//        echo $tMax, $tMin, $rainfall;
        $weekId++;

        $sql = "INSERT INTO district (districtName,Tmin,Tmax,rain,weekId) 
        VALUES ('$districtName','$tMin','$tMax','$rainfall','$weekId')";
        if (!mysqli_query($con, $sql)) {
            echo 'Error:' . mysqli_error($con) . '\n';
            die();
        }
    };
    echo "Distict Details added</br>";

}
?>
