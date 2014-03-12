<?php

include 'header.php';


if (isset($_POST["data"])) {

//    foreach ($_POST as $param_name => $param_val) {
//        echo "Param: $param_name; Value: $param_val<br />\n";
//    }
    $input = json_decode($_POST["data"], true);
//    var_dump($input);

    $cropName = $input['crop'];
    $cropSEarly = $input['startEarly'];
    $cropSEnd = $input['startEnd'];
    $cropDur = $input['duration'];
    $cropInv = $input['investment'];
    $cropProfit = $input['profit'];
    $cropRisk = $input['risk'];
    $croppheno = $input['pheno'];
    $cropphenoInput = $input['phenoInput'];
    $cropsoilTypes = $input['soilTypes'];


    //inserting into cropDetail
    $sql = "INSERT INTO cropDetail (cropName,profit,risk,invest,startWeek,startEndWeek,duration) 
        VALUES ('$cropName','$cropProfit','$cropRisk','$cropInv','$cropSEarly','$cropSEnd','$cropDur')";

    if (!mysqli_query($con, $sql)) {
        echo 'Error:' . mysqli_error($con) . '\n';
        die();
    }
    $cropId = mysqli_insert_id($con);

    //inserting into cropSoil
    foreach ($cropsoilTypes as $soil) {
        if ($soil[1] == true) {
            $sql = "INSERT INTO cropSoil (cropName, soilName) VALUES ('$cropName','$soil[0]')";
            if (!mysqli_query($con, $sql)) {

                echo 'Error:' . mysqli_error($con) . '\n';
//                mysqli_query($con, "DELETE FROM cropDetail WHERE cropName='$cropName'");
//                mysqli_query($con, "DELETE FROM cropSoil WHERE cropName='$cropName'");

                die();
            }
        }
    }
//    echo "Crop Soil types record added</br>";
    //inserting into cropTime
    $index = 0;
    foreach ($cropphenoInput as $tmp) {

        if ($index == intval($croppheno))
            break;
        $phenoName = $tmp["phenoName"];
        $water = $tmp["water"];
        $labour = $tmp["labour"];
        $tmax = $tmp["tmax"];
        $tmin = $tmp["tmin"];
        $duration = $tmp["duration"];


        $sql = "INSERT INTO cropTime (cropName, phaseNumber, 
        phaseName,water,labor,Tmin,Tmax,duration) VALUES ('$cropName','$index','$phenoName',
            '$water','$labour','$tmin','$tmax','$duration')";
        
        if (!mysqli_query($con, $sql)) {

            echo 'Error:' . mysqli_error($con) . '\n';
//            mysqli_query($con, "DELETE FROM cropDetail WHERE cropName='$cropName'");
//            mysqli_query($con, "DELETE FROM cropSoil WHERE cropName='$cropName'");
//            mysqli_query($con, "DELETE FROM cropTime WHERE cropName='$cropName'");
            die();
        }
        $index++;
    };
//    echo "Crop Phenophase record added\n";
        echo "Crop record added</br>";
        
    mysqli_close($con);
} else {
    echo "Data not sent:Error in data sending\nNeed post Input";
}
?>
