<?php
/**
 *
 * Luo messusisällöistä diaesityksen runkoja.
 *
 */


require("../database.php");
require("../templating.php");
require("../slide.php");
require("../segment.php");
require("../service_data_loader.php");


$templatepath = "../../templates";
$layout = new Template("$templatepath/slidelayout.tpl"); 
$seg = new InfoSegment($templatepath);
$seg->AddSlide("Muistakaa hatut","Hattumuistutus","Majakkamessu xx.xx","Hyvä aihe");
echo $seg->OutputSegment();
?>
