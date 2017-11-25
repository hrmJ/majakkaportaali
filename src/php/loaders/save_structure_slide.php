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
require("../styles_saver.php");

if(isset($_POST["removeslide"])){
    $con= new DbCon("../../../config.ini");
    $con->q("DELETE FROM presentation_structure WHERE id = :slot_id", Array("slot_id"=>$_POST["id"]), "none");
}
else{
    switch($_POST["slideclass"]){
        case "songsegment":
            $params = Array("description"=>$_POST["songdescription"],"slideclass"=>$_POST["slideclass"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"],"restricted_to"=>$_POST["restricted_to"],"multiname"=>$_POST["multiname"],"addedclass"=>$_POST["addedclass"]);
            $loader= new SongSegmentSaver("../../../config.ini", $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "infosegment":
            $params = Array("maintext"=>$_POST["maintext"],"header"=>$_POST["header"],"genheader"=>$_POST["genheader"],"subgenheader"=>$_POST["subgenheader"],"slideclass"=>$_POST["slideclass"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"], "addedclass"=>$_POST["addedclass"]);
            $loader= new InfoSegmentSaver("../../../config.ini", $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "update_numbers":
            $con= new DbCon("../../../config.ini");
            foreach($_POST["newids"] as $idpair){
                $con->q("UPDATE presentation_structure SET slot_number = :newnumber WHERE id = :slot_id",$idpair,"none");
            }
            break;

    }

    if($_POST["slideclass"]!="update_numbers"){
        //Päivitä diaesityksen tyylit uusien dialuokkien varalta
        UpdateAndAddClasses($loader->con,$_POST["addedclass"]);
    }
}

?>

