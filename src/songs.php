
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

$con = new DBcon("../config.ini");
$templatepath="templates";
$id = (isset($_GET["service_id"]) ? $_GET["service_id"] : GetIdByDate());

// Lataa data.
$singlesongsdata = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype in ('alkulaulu','paivanlaulu','loppulaulu')",Array("sid"=>$id));
$wssongs = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));
$comsongs = $con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'com'",Array("sid"=>$id));

$singlesongstable = new SongDataTable($templatepath, $singlesongsdata);
$singlesongs->Set("singlesongs", $singlesongs->Output());

$songslistcontent = new Template("$templatepath/songlist.tpl");
$songslistcontent->Set("singlesongs", $singlesongs->Output());

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
$layout->Set("content", $songslistcontent->Output());

echo $layout->Output();

?>
