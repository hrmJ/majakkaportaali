<?php
/**
 *
 * Tulostaa näkymän, jossa koko yhden kauden (TODO linkki) messuja voi tutkia
 * listana. Lisäksi tässä näkymässä on mahdollista tarkastella kaikkia messuja
 * jonkin tietyn vastuun (TODO linkki) osalta.
 *
 */

require("php/utilities.php");
require("php/templating.php");
require("php/database.php");

$templatepath="templates";

$con = new DBcon("../config.ini");

$date = date('Y-m-d');
$season = $con->Select("SELECT id, name, startdate, enddate FROM seasons WHERE startdate <=:date AND enddate >=:date ORDER BY startdate", Array("date"=>$date),"row");
$servicedata = $con->select("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate & servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));

$tablecontent = new ServiceListTable($templatepath, $servicedata);


$tablecontent = new ServiceListTable($templatepath, $servicedata);

$slist = new Template("$templatepath/servicelist.tpl");
$slist->Set("table", $tablecontent->Output());

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkaportaali");
$layout->Set("content", $slist->Output());

echo $layout->Output();

?>
