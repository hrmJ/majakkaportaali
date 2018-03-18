<?php
/**
 *
 * Tulostaa näkymän, jossa käyttäjä voi syöttää, mitä lauluja
 * jossakin tietyssä messussa lauletaan. Näyttää taulukoita, joissa
 * laulut syötetään rooleittain, esimerkiksi "Alkulaulu: X" jne.
 *
 */

require(__DIR__  . "/../vendor/autoload.php");

use Portal\utilities\SongCon;

$con = new SongCon("../config.ini");
$id = (isset($_GET["service_id"]) ? $_GET["service_id"] : GetIdByDate($con, date('Y-m-d'))); 
echo "lkj";
#$page = new SongPage("templates", $id);
#if (isset($_POST["savesongs"]))
#    $con->SaveData($id,$_POST);
#
#echo $page->LoadSongTypes()->SetSongViewElements()->Set("action", "{$_SERVER['PHP_SELF']}?service_id=$id")->OutputPage();

?>


