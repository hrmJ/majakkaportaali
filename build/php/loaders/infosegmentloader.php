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
switch($_GET["fetch"]){
    case "responsibilities":
        $loader->LoadResponsibilities();
        break;
}
$loader->OutputData();
?>
