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

switch($_POST["slideclass"]){
    case "infosegment":
        $seg = new InfoSegment($templatepath);
        $seg->AddSlide($_POST["maintext"],$_POST["header"],$_POST["genheader"],$_POST["subgenheader"]);
        break;
}

echo $seg->OutputSegment();
?>
