<?php
/**
 *
 * Tulostaa näkymän, jossa yksittäiseen messuun liittyviä vastuita voi tutkia
 * ja muokata yksityiskohtaisemmin.
 *
 */

require("php/templating.php");
require("php/services.php");
require("php/database.php");
require("php/utilities.php");

$con = new DBcon("../config.ini");

if(isset($_POST["savedetails"]))
    SaveServiceDetails($con, $_GET["id"], $_POST);

$volunteers = $con->q("SELECT responsible, responsibility FROM responsibilities WHERE service_id = :id",Array("id"=>$_GET["id"]),"all");
$servicemeta = $con->q("SELECT theme, servicedate FROM services WHERE id = :id",Array("id"=>$_GET["id"]),"row");

$templatepath="templates";
$tablecontent = new ServiceDetailsTable($templatepath, $volunteers);
$slist = new Template("$templatepath/servicedetails.tpl");
$slist->Set("table", $tablecontent->Output());
$slist->Set("theme", "Hauska messu");
$slist->Set("action", $_SERVER["PHP_SELF"] . "?id=" . $_GET["id"]);

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkamessu " . FormatDate($servicemeta["servicedate"]) . ": " . $servicemeta["theme"]);
$layout->Set("content", $slist->Output());
$layout->Set("jsaddress", "js/servicedetails.js");

echo $layout->Output();

?>
