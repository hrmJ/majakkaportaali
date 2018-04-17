<html>
<?php
/**
 *
 * Luo messusisällöistä diaesityksen runkoja.
 *
 */

require '../../../vendor/autoload.php';

use Medoo\Medoo;

$config = parse_ini_file("../../../config.ini");
$database = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => 'localhost',
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
]);

$m = new Mustache_Engine(array(
    'loader' => new Mustache_Loader_FilesystemLoader('../../views')
    ));


if(isset($_POST["removeslide"])){
    $database->delete("presentation_structure",  ["id" => $_POST["id"]]);
}
else{
    switch($_POST["segment_type"]){
        case "songsegment":
            $params = Array("description"=>$_POST["songdescription"],"slideclass"=>$_POST["segment_type"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"],"restricted_to"=>$_POST["restricted_to"],"multiname"=>$_POST["multiname"],"addedclass"=>$_POST["addedclass"]);
            $loader= new SongSegmentSaver($database, $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "infosegment":
            $params = Array("maintext"=>$_POST["maintext"],"header"=>$_POST["header"],"genheader"=>$_POST["genheader"],"subgenheader"=>$_POST["subgenheader"],"slideclass"=>$_POST["segment_type"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"], "addedclass"=>$_POST["addedclass"],"imgname"=>$_POST["imgname"], "imgpos"=>$_POST["imgpos"]);
            $loader= new InfoSegmentSaver($database, $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "biblesegment":
            $params = Array("maintext"=>$_POST["maintext"],"header"=>$_POST["header"],"genheader"=>$_POST["genheader"],"subgenheader"=>$_POST["subgenheader"],"slideclass"=>$_POST["segment_type"],"slot_number"=>$_POST["slot_number"],"slot_name"=>$_POST["slot_name"], "addedclass"=>$_POST["addedclass"],"imgname"=>$_POST["imgname"], "imgpos"=>$_POST["imgpos"]);
            $loader= new InfoSegmentSaver($database, $params);
            $loader->SetContentId()->SetSlotData();
            break;
        case "update_numbers":
            $con= new DbCon("../../../config.ini");
            foreach($_POST["newids"] as $idpair){
                $database->update("presentation_structure", 
                    ["slot_number" => $idpair["newnumber"]],
                    ["id" => $idpair["slot_id"]] );
                #$con->q("UPDATE presentation_structure SET slot_number = :newnumber WHERE id = :slot_id",$idpair,"none");
            }
            break;
        case "update_headertemplate":
            $database->update("headers",
                [
                    "imgname" => $_POST["imgname"],
                    "imgposition" => $_POST["imgpos"],
                    "maintext" => $_POST["maintext"],
                    "is_aside" => $_POST["is_aside"]
                ],
                [
                    "id" => $_POST["header_id"]
                ]
            );
            break;
        case "insert_headertemplate":
            $database->insert("headers", [
                "template_name" => $_POST["template_name"],
                "imgname" => "Ei kuvaa",
                "imgposition" => "left",
                "maintext" => ""
            ]);
            break;
    }

    if(!in_array($_POST["segment_type"],Array("update_numbers","update_headertemplate"))){
        //Päivitä diaesityksen tyylit uusien dialuokkien varalta
        UpdateAndAddClasses($loader->con,$_POST["addedclass"]);
    }
}

?>

</html>
