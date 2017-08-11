<?php

function InsertLiturgical($con, $file, $role, $titleseparator){
    $songtext = file_get_contents("mocksongdata/liturgical/$role/$file");
    $slines = preg_split("/\n{2}/", $songtext);
    $title = $slines[0];
    $verses = implode("\n\n",array_slice($slines,1));
    $titleseparator = (empty($titleseparator) ? "" : " ($titleseparator)" );
    $con->q("INSERT INTO liturgicalsongs (title, verses, role, titleseparator) VALUES (:title, :verses, :role, :titleseparator)",Array("title"=>$title,"verses"=>utf8_encode($verses),"titleseparator"=>$titleseparator,"role"=>$role),"none");
}

require("src/php/database.php");

echo "Deleting and creating database majakkaportaali\n";
$con = new DbCon("config.ini",False);
$commandstart = "mysql -u{$con->username} -p{$con->password} -h {$con->hostname} ";  
$output = shell_exec($commandstart . "< 'table_structure.sql'");

echo "Inserting mock data..\n";
$con->Connect();

//Liturgiset laulut omaan tauluunsa

InsertLiturgical($con, "pyh1.txt", "pyha", "Perusversio");
InsertLiturgical($con, "pyhä kuningas.txt", "pyha", "");
InsertLiturgical($con, "pyhä yksi yhteinen.txt", "pyha", "versio 1");
InsertLiturgical($con, "pyhä yksi yhteinen2.txt", "pyha", "versio 2");
InsertLiturgical($con, "virsi 134.txt", "pyha", "");
InsertLiturgical($con, "olet pyhä.txt", "pyha", "");
InsertLiturgical($con, "halleluja kaikkivaltias hallitsee.txt", "pyha", "");
InsertLiturgical($con, "pyhä afrikkalaisesta gospelmessusta.txt", "pyha", "Afrikkalaisen gospelmessun versio");
InsertLiturgical($con, "pyhä karitsa.txt", "pyha", "");

InsertLiturgical($con, "jk1.txt", "jumalan_karitsa", "Riemumessun versio");
InsertLiturgical($con, "jk2.txt", "jumalan_karitsa", "Rantatalon versio (Oi, Jumalan..)");
InsertLiturgical($con, "jk3.txt", "jumalan_karitsa", "Toinen sävelmäsarja");
InsertLiturgical($con, "jk4.txt", "jumalan_karitsa", "Afrikkalaisen gospelmessun versio");


//laulutietokantaan täytettä

echo "Inserting songs...";
$dir = new DirectoryIterator(dirname("mocksongdata/*"));
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
        $songtext = file_get_contents("mocksongdata/" . $fileinfo->getFilename());
        $slines = preg_split("/\n{2}/", $songtext);
        $title = $slines[0];
        $verses = implode("\n\n",array_slice($slines,1));
        $con->q("INSERT INTO songdata (title, verses) VALUES (:title, :verses)",Array("title"=>$title,"verses"=>utf8_encode($verses)),"none");
    }
}






$con->q("INSERT INTO seasons (startdate, enddate, name) VALUES ('2017-01-01','2020-12-12','testseason')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-02-06', 'Eka messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-02-13', 'Toka messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-02-20', 'Kolmas messu')",Array(),"none");

$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-03-06', 'Neljäs messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-03-13', 'Viides messu')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-03-20', 'Kuudes messu')",Array(),"none");

$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-04-02', 'Huhtikuussa messuilla on hirveän')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-04-09', 'Pitkät nimet ja tauti sentään kun ne nimet voi olla hiirveän piitkiäääää! Onnetonta!')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-04-16', 'Kuudes messu c')",Array(),"none");
$con->q("INSERT INTO services (servicedate, theme) VALUES ('2017-04-23', 'Kuudes messu d')",Array(),"none");



//Lauluja messuun nro 2
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 001', 'alkulaulu')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 012', 'paivanlaulu')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 033', 'loppulaulu')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 011', 'ws')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 029', 'ws')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 028', 'ws')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 006', 'com')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 002', 'com')",Array(),"none");
$con->q("INSERT INTO servicesongs (service_id, song_title, songtype) VALUES (2, 'Virsi 018', 'com')",Array(),"none");


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

//Feikkikommentteja

$con->q("INSERT INTO comments (reply_to, service_id, theme, commentator, content, comment_time) VALUES (0, 2, 'juontaja', 'Ville', 'Olen sitä mieltä, että messussa on tähän merkitty väärä juontaja, mutta täytyy vielä varmistaa','2017-01-01 15:40:22')",Array(),"none");
$con->q("INSERT INTO comments (service_id, theme, commentator, content, reply_to, comment_time) VALUES (2, 'juontaja', 'Mirkku', 'Ei ei, kyllä se on ihan oikein', 1, '2017-01-01 17:40:22')",Array(),"none");
$con->q("INSERT INTO comments (service_id, theme, commentator, content, reply_to, comment_time) VALUES (2, 'juontaja', 'Mirkku', 'Ootko Mirkku ihan varma?', 1, '2017-01-02 11:40:22')",Array(),"none");
$con->q("INSERT INTO comments (reply_to, service_id, theme, commentator, content, comment_time) VALUES (0, 2, 'infoasia', 'Jari', 'Messun jälkeen lumitöitä tarjolla kaikille halukkaille', '2017-01-01 15:44:22')",Array(),"none");
$con->q("INSERT INTO comments (reply_to, service_id, theme, commentator, content, comment_time) VALUES (0, 2, 'infoasia', 'Jere', 'Raamista ei tällä viikolla.', '2017-03-07 11:40:22')",Array(),"none");
$con->q("INSERT INTO comments (reply_to, service_id, theme, commentator, content, comment_time) VALUES (0, 2, 'yleinen', 'Jere', 'Tämän viikon aikana on varmaan kerätty muutenkin kaikkea tavaraa, jota voidaan sitten tässä messussa jakaa sitä tarvitseville ja muutenkin pitkälti sanoisin, että pitkä oli tämä kommentti. Selvä. Jees.', '2017-03-05 15:40:22')",Array(),"none");

echo "Database ready..\n";

?>
