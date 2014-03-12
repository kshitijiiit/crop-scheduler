<?php
include 'header.php';
$result = mysqli_query($con,"select distinct districtName from district");

$value = array();
while($row = mysqli_fetch_array($result))
{
    array_push($value, $row['districtName']);
}


#$data = file_get_contents("php://input");

#$objData = json_decode($data);

exit(json_encode($value));

mysqli_close($con);
?>