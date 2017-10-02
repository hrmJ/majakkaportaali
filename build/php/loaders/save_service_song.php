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
$con->q("DELETE FROM servicesongs WHERE service_id = :service_id AND songtype = :songtype AND multisong_position = :multisong_position AND id <> :song_title",$_POST,"none");
$con->q("INSERT INTO servicesongs (service_id, songtype, multisong_position, song_title) VALUES(:service_id,:songtype,:multisong_position,:song_title)",$_POST,"none");
?>
