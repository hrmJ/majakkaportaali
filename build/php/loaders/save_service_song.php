<?php
/**
 *
 * Ajax-tallentaa käyttäjän messuun asettamat laulut tietokannan servicesongs-tauluun.
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */

require("../database.php");
require("../songs.php");

$con = new DbCon("../../../config.ini");
if(isset($_POST["cleansongs"]))
    $con->q("DELETE FROM servicesongs WHERE service_id = :service_id ",Array("service_id"=>$_POST["service_id"]),"none");
else
    $con->q("INSERT INTO servicesongs (service_id, songtype, multisong_position, song_title) VALUES(:service_id,:songtype,:multisong_position,:song_title)",$_POST,"none");
?>
