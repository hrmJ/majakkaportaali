<?php
/**
 *
 * Prosessoi pyynnön ladata komentit tietokannasta
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */


require("../database.php");
require("../service_data_loader.php");

$loader= new ServiceLoader("../../../config.ini");
$loader->data = $loader->con->q("SELECT DISTINCT filename FROM {$_GET["asset_type"]} order by filename",Array(),"all_flat");
$loader->OutputData();
?>
