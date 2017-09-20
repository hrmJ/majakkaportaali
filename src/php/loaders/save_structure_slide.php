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
require("../service_structure_loader.php");
switch($_POST["slideclass"]){
    case "infosegment":
        $params = Array("maintext"=>$_POST["maintext"],"header"=>$_POST["header"],"genheader"=>$_POST["genheader"],"subgenheader"=>$_POST["subgenheader"],"slideclass"=>$_POST["slideclass"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"]);
        $loader= new InfoSegmentSaver("../../../config.ini", $params);
        $loader->SetContentId()->SetSlotData();
        break;
}

?>
