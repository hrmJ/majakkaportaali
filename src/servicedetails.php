<?php
/**
 *
 * Tulostaa näkymän, jossa yksittäiseen messuun liittyviä vastuita voi tutkia
 * ja muokata yksityiskohtaisemmin.
 *
 */

require("php/templating.php");
$templatepath="templates";

$servicedata = Array(Array("vastuu"=>"juontaja","vastuullinen"=>"Jussi"),
                     Array("vastuu"=>"liturgi","vastuullinen"=>"Ville"));

$tablecontent = new ServiceDetailsTable($templatepath, $servicedata);

$slist = new Template("$templatepath/servicedetails.tpl");
$slist->Set("table", $tablecontent->Output());
$slist->Set("theme", "Hauska messu");

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkamessu x.x.xxxx");
$layout->Set("content", $slist->Output());

echo $layout->Output();

?>
