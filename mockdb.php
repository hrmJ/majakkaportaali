<?php

require 'vendor/autoload.php';
use Medoo\Medoo;


function InsertLiturgical($con, $file, $role, $titleseparator){
    $songtext = file_get_contents("mocksongdata/liturgical/$role/$file");
    $slines = preg_split("/\n{2}/", $songtext);
    $title = $slines[0];
    $verses = implode("\n\n",array_slice($slines,1));
    $titleseparator = (empty($titleseparator) ? "" : " ($titleseparator)" );
    $con->insert("liturgicalsongs", [
        "title" => $title,
        "verses" => utf8_encode($verses),
        "role" => $role,
        "titleseparator" => $titleseparator
    ]) ;
}

$config = parse_ini_file("config.ini");
$con = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => 'localhost',
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
    ]);

echo "Deleting and creating database majakkaportaali\n";

$commandstart = "mysql -u{$config["un"]} -p{$config["pw"]} -h localhost ";  
$output = shell_exec($commandstart . "< 'table_structure.sql'");

echo "Inserting mock data..\n";

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
        $con->insert("songdata", Array("title"=>$title,"verses"=>utf8_encode($verses)));
    }
}






$con->insert("seasons",  ["startdate" => '2018-01-01', "enddate"=>'2020-12-12', "name"=> 'testseason']);
$con->insert("services", ["servicedate"=> '2018-02-06', "theme"=> 'Eka messu']);
$con->insert("services", ["servicedate"=> '2018-02-13', "theme" => 'Toka messu']);
$con->insert("services", ["servicedate"=> '2018-02-20', "theme" => 'Kolmas messu']);
$con->insert("services", ["servicedate"=> '2018-02-27', "theme" => 'Neljäs messu']);
$con->insert("services", ["servicedate"=> '2018-03-04', "theme" => 'Viides messu']);
$con->insert("services", ["servicedate"=> '2018-03-11', "theme" => 'Kuudes messu']);
$con->insert("services", ["servicedate"=> '2018-03-18', "theme" => 'Seitsemäs messu']);
$con->insert("services", ["servicedate"=> '2018-04-02', "theme" => 'Kahdeksas messu']);
$con->insert("services", ["servicedate"=> '2018-04-09', "theme" => 'Huhtikuussa messuilla on hirveän']);
$con->insert("services", ["servicedate"=> '2018-04-16', "theme" => 'Pitkät nimet
    ja tauti sentään kun ne nimet voi olla hiirveän piitkiäääää! Onnetonta!']);
$con->insert("services", ["servicedate"=> '2018-05-09', "theme" => 'Toukokuinen messu tadaa']);
$con->insert("services", ["servicedate"=> '2018-05-16', "theme" => 'Toinen toukokuinen messu']);


#//Lauluja messuun nro 2
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Be all end all',      "songtype" =>] 'alkulaulu'   )",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Ukko Nooa',           "songtype" =>] 'keskilaulu'  )",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Satu meni saunaan',   "songtype" =>] 'loppulaulu'   )",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Virsi 011',           "songtype" =>] 'ylistyslaulu'          )",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Virsi 029',           "songtype" =>] 'ylistyslaulu')",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Virsi 028',           "songtype" =>] 'ylistyslaulu')",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Virsi 006',           "songtype" =>] 'ylistyslaulu')",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Virsi 002',           "songtype" =>] 'ylistyslaulu')",Array(),"none");
#$con->insert("servicesongs" [service_id => 2, "song_title" => 'Virsi 018',           "songtype" =>] 'com')",Array(),"none");


$ids = $con->select("services", "id");
$responsibilities = ["juontaja","liturgi","saarna","diat","bändi"];
foreach($ids as $id){
    foreach($responsibilities as $res){
        $con->insert("responsibilities", ["service_id" => $id, "responsibility" => $res]);
    }
}
#
#
$con->update("responsibilities", ["responsible" => "Neymar"], ["service_id" => 2,  "responsibility"  => "juontaja"]);
$con->update("responsibilities", ["responsible" => "Coutinho"], ["service_id" => 2, "responsibility"  => "liturgi"]);
$con->update("responsibilities", ["responsible" => "Casemiro"], ["service_id" => 2,  "responsibility"  => "saarna"]);
$con->update("responsibilities", ["responsible" => "Allison and the boys"], ["service_id" => 2, "responsibility"  => "bändi"]);
$con->update("responsibilities", ["responsible" => "Neymar"], ["service_id" => 3,  "responsibility"  => "juontaja"]);
$con->update("responsibilities", ["responsible" => "Miranda"], ["service_id" => 3, "responsibility"  => "liturgi"]);
$con->update("responsibilities", ["responsible" => "Willian"], ["service_id" => 3,  "responsibility"  => "saarna"]);
$con->update("responsibilities", ["responsible" => "Marcello and hair"], ["service_id" => 3, "responsibility"  => "bändi"]);
 
#//Feikkikommentteja

$con->insert("comments", ["reply_to" => 0, "service_id"=>2, "theme"=>"juontaja", "commentator"=>"Ville", 
    "content" => "Olen sitä mieltä, että messussa on tähän merkitty väärä juontaja, mutta täytyy vielä varmistaa", 
    "comment_time" => "2017-01-01 15:40:22"]);
$con->insert("comments", ["reply_to" => 1, "service_id"=>2, "theme"=>"juontaja", "commentator"=>"Ville", 
    "content" => "Ei ei, kyllä se on ihan oikein", 
    "comment_time" => "2017-01-01 17:40:22"]);
$con->insert("comments", ["reply_to" => 1, "service_id"=>2, "theme"=>"juontaja", "commentator"=>"Ville", 
    "content" => "Ootko Mirkku ihan varma?", 
    "comment_time" => "2017-01-02 11:40:22"]);
$con->insert("comments", ["reply_to" => 0, "service_id"=>2, "theme"=>"juontaja", "commentator"=>"Ville", 
    "content" => "Messun jälkeen lumitöitä tarjolla kaikille halukkaille", 
    "comment_time" => "2017-01-02 11:40:22"]);
#
#
#// Messusisältöä
#//
#//
#//
#
#
#$con->q("INSERT INTO songsegments (songdescription, singlename) VALUES (:sd,:sn)",Array("sd"=>"Tää on se laulu, joka lauletaan aina aluksi", "sn"=>"Alkulaulu"),"none");
#$con->q("INSERT INTO infosegments (maintext, header, imgname, imgposition) VALUES (:mt,:h,:i,:ipos)",Array("mt"=>'Tervetuloa kaikki tähän hienoon messuun, jossa tapahtuu paljon ja kaikenlaista.',"h"=>"Tervetuloa!","i"=>'Ubuntu-MATE-Snowflake.jpg',"ipos"=>"left"),"none");
#$con->q("INSERT INTO infosegments (maintext, header) VALUES (:mt,:h)",Array("mt"=>"Lähtekää rauhassa ja palvelkaa Herraa iloiten!","h"=>"Tervemenoa!"),"none");
#$con->q("INSERT INTO presentation_structure (slot_name, slot_number, slot_type, addedclass, content_id) VALUES (:sn,:snu,:st,:ac,:cid)",Array("sn"=>'alkuinfo',"snu"=>1,"st"=>'infosegment',"ac"=>'.Teksti',"cid"=>1),"none");
#$con->q("INSERT INTO presentation_structure (slot_name, slot_number, slot_type, addedclass, content_id) VALUES (:sn,:snu,:st,:ac,:cid)",Array("sn"=>'alkulaulu',"snu"=>2,"st"=>'songsegment',"ac"=>'.Teksti',"cid"=>1),"none");
#$con->q("INSERT INTO presentation_structure (slot_name, slot_number, slot_type, addedclass, content_id) VALUES (:sn,:snu,:st,:ac,:cid)",Array("sn"=>'loppuinfo',"snu"=>3,"st"=>'infosegment',"ac"=>'.Teksti',"cid"=>2),"none");
#
#//slide header templates
#
#$con->q("INSERT INTO headers (template_name, maintext) VALUES (:tn,:mt)",Array("tn"=>"perus","mt"=>"Majakkamessu silloin ja silloin. Aiheena se ja se."),"none");


echo "Database ready..\n";

?>
