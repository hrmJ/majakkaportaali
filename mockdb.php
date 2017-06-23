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

//laulutietokantaan täytettä
//

echo "Inserting songs...";
$dir = new DirectoryIterator(dirname("mocksongdata/*"));
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
        $songtext = file_get_contents("mocksongdata/" . $fileinfo->getFilename());
        $slines = preg_split("/\n{2}/", $songtext);
        $title = $slines[0];
        $verses = implode("\n\n",array_slice($slines,1));
        $con->q("INSERT INTO songdata (title, verses) VALUES (:title, :verses)",Array("title"=>$title,"verses"=>$verses),"none");
    }
}

//Lauluja messuun nro 2
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 1, 'alkulaulu')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 2, 'paivanlaulu')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 4, 'loppulaulu')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 7, 'ws')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 9, 'ws')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 8, 'ws')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 10, 'com')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 11, 'com')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_id, songtype) VALUES (2, 12, 'com')",Array(),"none");


$ids = $con->q("SELECT id FROM services",Array(),"all");
$responsibilities = Array("juontaja","liturgi","saarna","diat","bändi");
foreach($ids as $id){
    foreach($responsibilities as $res){
        $con->q("INSERT INTO responsibilities (service_id, responsibility) VALUES (:id, :res)",Array("id"=>$id["id"], "res"=>$res),"none");

    }
}


$con->q("UPDATE responsibilities SET responsible=:res WHERE service_id=:sid AND responsibility=:resbty",Array("res"=>"Bill Craig","sid"=>2,"resbty"=>"liturgi"),"none");
$con->q("UPDATE responsibilities SET responsible=:res WHERE service_id=:sid AND responsibility=:resbty",Array("res"=>"James Rodriguez","sid"=>2,"resbty"=>"juontaja"),"none");
$con->q("UPDATE responsibilities SET responsible=:res WHERE service_id=:sid AND responsibility=:resbty",Array("res"=>"Eero Huovinen","sid"=>3,"resbty"=>"saarna"),"none");
$con->q("UPDATE responsibilities SET responsible=:res WHERE service_id=:sid AND responsibility=:resbty",Array("res"=>"The Afters","sid"=>3,"resbty"=>"bändi"),"none");

echo "Database ready..\n";

?>
