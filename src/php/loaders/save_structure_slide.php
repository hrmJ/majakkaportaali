<html>
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
    switch($_POST["segment_type"]){
        case "songsegment":
            $params = Array("description"=>$_POST["songdescription"],"slideclass"=>$_POST["segment_type"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"],"restricted_to"=>$_POST["restricted_to"],"multiname"=>$_POST["multiname"],"addedclass"=>$_POST["addedclass"]);
            $loader= new SongSegmentSaver("../../../config.ini", $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "infosegment":
            $params = Array("maintext"=>$_POST["maintext"],"header"=>$_POST["header"],"genheader"=>$_POST["genheader"],"subgenheader"=>$_POST["subgenheader"],"slideclass"=>$_POST["segment_type"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"], "addedclass"=>$_POST["addedclass"],"imgname"=>$_POST["imgname"], "imgpos"=>$_POST["imgpos"]);
            $loader= new InfoSegmentSaver("../../../config.ini", $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "biblesegment":
            $params = Array("maintext"=>$_POST["maintext"],"header"=>$_POST["header"],"genheader"=>$_POST["genheader"],"subgenheader"=>$_POST["subgenheader"],"slideclass"=>$_POST["segment_type"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"], "addedclass"=>$_POST["addedclass"],"imgname"=>$_POST["imgname"], "imgpos"=>$_POST["imgpos"]);
            $loader= new InfoSegmentSaver("../../../config.ini", $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "update_numbers":
            $con= new DbCon("../../../config.ini");
            foreach($_POST["newids"] as $idpair){
                $con->q("UPDATE presentation_structure SET slot_number = :newnumber WHERE id = :slot_id",$idpair,"none");
            }
            break;
        case "update_headertemplate":
            $con= new DbCon("../../../config.ini");
            $con->q("UPDATE headers SET imgname = :imgname, imgposition = :imgpos, maintext = :maintext WHERE id = :header_id",
                Array("imgname"=>$_POST["imgname"],"header_id"=>$_POST["header_id"],
                "imgpos" => $_POST["imgpos"],"maintext"=>$_POST["maintext"]),"none");
            break;
        case "insert_headertemplate":
            $con= new DbCon("../../../config.ini");
            $con->q("INSERT INTO headers (imgname, imgposition, maintext) VALUES (:imgname,:imgpos, :maintext)",
                Array("imgname"=>$_POST["imgname"], "imgpos" =>
                $_POST["imgpos"],"maintext"=>$_POST["maintext"]),"none");
            break;
    }

    if(!in_array($_POST["segment_type"],Array("update_numbers","update_headertemplate"))){
        //Päivitä diaesityksen tyylit uusien dialuokkien varalta
        UpdateAndAddClasses($loader->con,$_POST["addedclass"]);
    }
}

?>

</html>
