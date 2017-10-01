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
require("php/select.php");
require("php/songs.php");
require("php/songpage.php");

$con = new SongCon("../config.ini");
$id = (isset($_GET["service_id"]) ? $_GET["service_id"] : GetIdByDate($con, date('Y-m-d'))); 
$page = new SongPage("templates", $id);
if (isset($_POST["savesongs"]))
    $con->SaveData($id,$_POST);

echo $page->LoadSongTypes()->SetSongViewElements()->Set("action", "{$_SERVER['PHP_SELF']}?service_id=$id")->OutputPage();

?>


