<?php
require("src/php/database.php");

$con = new DbCon("config.ini");

$con->select("DELETE FROM responsibilities",Array(),"none");
$con->select("DELETE FROM services",Array(),"none");
$con->select("DELETE FROM seasons",Array(),"none");


$con->select("INSERT INTO seasons (startdate, enddate, name) VALUES ('2017-01-01','2020-12-12','testseason')",Array(),"none");
$con->select("INSERT INTO services (servicedate, theme) VALUES ('2017-02-06', 'Eka messu')",Array(),"none");
$con->select("INSERT INTO services (servicedate, theme) VALUES ('2017-02-13', 'Toka messu')",Array(),"none");
$con->select("INSERT INTO services (servicedate, theme) VALUES ('2017-02-20', 'Kolmas messu')",Array(),"none");

$con->select("INSERT INTO services (servicedate, theme) VALUES ('2017-03-06', 'Neljäs messu')",Array(),"none");
$con->select("INSERT INTO services (servicedate, theme) VALUES ('2017-03-13', 'Viides messu')",Array(),"none");
$con->select("INSERT INTO services (servicedate, theme) VALUES ('2017-03-20', 'Kuudes messu')",Array(),"none");

$ids = $con->select("SELECT id FROM services",Array(),"all");
$responsibilities = Array("juontaja","liturgi","saarna","diat","bändi");
foreach($ids as $id){
    foreach($responsibilities as $res){
        $con->select("INSERT INTO responsibilities (messu_id, responsibility) VALUES (:id, :res)",Array("id"=>$id["id"], "res"=>$res),"none");

    }
}


?>
