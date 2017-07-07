
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
$id = (isset($_GET["service_id"]) ? $_GET["service_id"] : GetIdByDate());

if (isset($_POST))
    $con->SaveData($id,$_POST);

// Lataa data.
$singlesongsdata = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype in ('alkulaulu','paivanlaulu','loppulaulu')",Array("sid"=>$id));
$wssongsdata = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));
$comsongsdata = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'com'",Array("sid"=>$id));

$singlesongstable = new SongDataTable($templatepath, $singlesongsdata);
$wssongstable = new SongDataTable($templatepath, $wssongsdata);
$comsongstable = new SongDataTable($templatepath, $comsongsdata);

$songslistcontent = new Template("$templatepath/songlist.tpl");
$songslistcontent->Set("singlesongs", $singlesongstable->Output());
$songslistcontent->Set("worshipsongs", $wssongstable->Output());
$songslistcontent->Set("communionsongs", $comsongstable->Output());
$songslistcontent->Set("action", "{$_SERVER['PHP_SELF']}?service_id=$id");

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
$layout->Set("content", $songslistcontent->Output());

echo $layout->Output();

?>
