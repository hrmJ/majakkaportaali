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

$con = new DBcon("../config.ini");
$season = GetCurrentSeason($con);
$servicedata = $con->select("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));

$tablecontent = new ServiceListTable($templatepath, $servicedata);
$slist = new Template("$templatepath/servicelist.tpl");
$slist->Set("table", $tablecontent->Output());
$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkaportaali");
$layout->Set("content", $slist->Output());

echo $layout->Output();

?>
