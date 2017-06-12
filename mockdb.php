<?php
require("src/php/database.php");

echo "Deleting and creating database majakkaportaali\n";
$con = new DbCon("config.ini",False);
$commandstart = "mysql -u{$con->username} -p{$con->password} -h {$con->hostname} ";  
$output = shell_exec($commandstart . "< 'table_structure.sql'");

echo "Inserting mock data..\n";
$con->Connect();
$con->q("INSERT INTO seasons (startdate, enddate, name) VALUES ('2017-01-01','2020-12-12','testseason')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-02-06', 'Eka messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-02-13', 'Toka messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-02-20', 'Kolmas messu')",Array(),"none");

$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-03-06', 'Neljäs messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-03-13', 'Viides messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-03-20', 'Kuudes messu')",Array(),"none");

$ids = $con->q("SELECT id FROM services",Array(),"all");
$responsibilities = Array("juontaja","liturgi","saarna","diat","bändi");
foreach($ids as $id){
    foreach($responsibilities as $res){
        $con->q("INSERT INTO responsibilities (service_id, responsibility) VALUES (:id, :res)",Array("id"=>$id["id"], "res"=>$res),"none");

    }
}

echo "Database ready..\n";

?>
