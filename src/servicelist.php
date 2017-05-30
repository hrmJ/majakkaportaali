<?php
/**
 *
 * Tulostaa näkymän, jossa koko yhden kauden (TODO linkki) messuja voi tutkia
 * listana. Lisäksi tässä näkymässä on mahdollista tarkastella kaikkia messuja
 * jonkin tietyn vastuun (TODO linkki) osalta.
 *
 */

require("php/templating.php");
$templatepath="templates";

$servicedata = Array(Array("date"=>"11.6.2016","theme"=>"Kesä on ihanaa"),
                     Array("date"=>"19.6.2016","theme"=>"Kohta on juhannus"));

$tablecontent = new ServiceListTable($templatepath, $servicedata);

$slist = new Template("$templatepath/servicelist.tpl");
$slist->Set("table", $tablecontent->Output());

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkaportaali");
$layout->Set("content", $slist->Output());

echo $layout->Output();

?>
