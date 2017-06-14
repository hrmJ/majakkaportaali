<?php
/**
 *
 * Tulostaa näkymän, jossa koko yhden kauden (TODO linkki) messuja voi tutkia
 * listana. Lisäksi tässä näkymässä on mahdollista tarkastella kaikkia messuja
 * jonkin tietyn responsibilityn (TODO linkki) osalta.
 *
 */

require("php/utilities.php");
require("php/templating.php");
require("php/database.php");
require("php/services.php");

$templatepath="templates";

#Valmistelu ja tietokantayhteys
$con = new DBcon("../config.ini");
$season = GetCurrentSeason($con);

#Select-elementti vastuiden suodattamista varten
$responsibilities = $con->q("SELECT DISTINCT responsibility FROM responsibilities", Array());
$select = new Select($templatepath, $responsibilities);

#Varsinainen lista messuista
$servicedata = $con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));
$tablecontent = new ServiceListTable($templatepath, $servicedata);

#Kootaan yllä tuotettu sisältö
$slist = new Template("$templatepath/servicelist.tpl");
$slist->Set("table", $tablecontent->Output());
$slist->Set("select", $select->Output());

#Sivun yleinen ulkoasu ja tiedot
$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkaportaali");
$layout->Set("content", $slist->Output());
$layout->Set("jsaddress", "js/servicelist.js");

echo $layout->Output();

?>
