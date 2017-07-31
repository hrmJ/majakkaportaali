
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
$page->SetSingleSongs();
$page->SetMultiSongs(Array("ws","com"));
$page->Set("action", "{$_SERVER['PHP_SELF']}?service_id=$id");

$texts = $con->q("SELECT CONCAT(title, titleseparator) FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"jumalan_karitsa"),"all");
$ids = $con->q("SELECT id FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"jumalan_karitsa"),"all_flat");
$jkselect = new Select($templatepath, $texts, "Valitse Jumalan karitsa -hymnin versio", "Valitse Jumalan karitsa -hymnin versio", "jkselect", $valuedata=$ids);
$page->Set("jkmenu", $jkselect->Output());

$texts = $con->q("SELECT CONCAT(title, titleseparator) FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"pyha"),"all");
$ids = $con->q("SELECT id FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>"pyha"),"all_flat");
$pyhaselect = new Select($templatepath, $texts, "Valitse pyhä-hymnin versio","Valitse pyhä-hymnin versio","pyhselect",$valuedata=$ids);
$page->Set("pyhmenu", $pyhaselect->Output());

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("bodyclass", "songs");
$layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
$layout->Set("content", $page->Output());
$layout->Set("byline", "");


echo $layout->Output();

?>


