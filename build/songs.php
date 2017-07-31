
<?php
/**
 *
 * Tulostaa näkymän, jossa käyttäjä voi syöttää, mitä lauluja
 * jossakin tietyssä messussa lauletaan. Näyttää taulukoita, joissa
 * laulut syötetään rooleittain, esimerkiksi "Alkulaulu: X" jne.
 *
 */

require("php/templating.php");
require("php/services.php");
require("php/database.php");
require("php/utilities.php");
require("php/songs.php");

$con = new SongCon("../config.ini");
$templatepath="templates";
$id = (isset($_GET["service_id"]) ? $_GET["service_id"] : GetIdByDate($con, date('Y-m-d')));


if (isset($_POST["savesongs"]))
    $con->SaveData($id,$_POST);

$page = new SongPage($templatepath, $id);
$page->GetSingleSongs();
$page->GetWsSongs();


$wssongsdata = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));
$comsongsdata = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'com'",Array("sid"=>$id));

$singlesongstable = new SongDataTable($templatepath, $page->singlesongsdata);
$wssongstable = new SongDataTable($templatepath, $page->wssongsdata);
$comsongstable = new SongDataTable($templatepath, $comsongsdata);

$songslistcontent = new Template("$templatepath/songlist.tpl");
$songslistcontent->Set("singlesongs", $singlesongstable->Output());
$songslistcontent->Set("worshipsongs", $wssongstable->Output());
$songslistcontent->Set("communionsongs", $comsongstable->Output());
$songslistcontent->Set("action", "{$_SERVER['PHP_SELF']}?service_id=$id");

$texts = $con->q("SELECT CONCAT(title, titleseparator) FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"jumalan_karitsa"),"all");
$ids = $con->q("SELECT id FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"jumalan_karitsa"),"all_flat");
$jkselect = new Select($templatepath, $texts, "Valitse Jumalan karitsa -hymnin versio", "Valitse Jumalan karitsa -hymnin versio", "jkselect", $valuedata=$ids);
$songslistcontent->Set("jkmenu", $jkselect->Output());

$texts = $con->q("SELECT CONCAT(title, titleseparator) FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"pyha"),"all");
$ids = $con->q("SELECT id FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"pyha"),"all_flat");
$pyhaselect = new Select($templatepath, $texts, "Valitse pyhä-hymnin versio","Valitse pyhä-hymnin versio","pyhselect",$valuedata=$ids);
$songslistcontent->Set("pyhmenu", $pyhaselect->Output());

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("bodyclass", "songs");
$layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
$layout->Set("content", $songslistcontent->Output());
$layout->Set("byline", "");


echo $layout->Output();

?>


