<?php
/**
 *
 * Tulostaa näkymän, jossa yksittäiseen messuun liittyviä vastuita voi tutkia
 * ja muokata yksityiskohtaisemmin.
 *
 */

require("php/templating.php");

if(isset($_POST["savedetails"]))
    SaveServiceDetails($con, $_GET["id"], $_POST);

$templatepath="templates";

$servicedata = Array(Array("responsibility"=>"juontaja","responsible"=>"Jussi"),
                     Array("responsibility"=>"liturgi","responsible"=>"Ville"));

$tablecontent = new ServiceDetailsTable($templatepath, $servicedata);

$slist = new Template("$templatepath/servicedetails.tpl");
$slist->Set("table", $tablecontent->Output());
$slist->Set("theme", "Hauska messu");
$slist->Set("action", $_SERVER["PHP_SELF"] . "?id=" . $_GET["id"]);

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkamessu x.x.xxxx");
$layout->Set("content", $slist->Output());

echo $layout->Output();

?>
