<?php
/**
 *
 * Lataa tietokannasta ajax-tekniikalla dataa. 
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */

require '../../../vendor/autoload.php';

use Medoo\Medoo;
use Portal\content\Comment;
use Portal\content\Community;
use Portal\content\Service;
use Portal\content\Structure;
use Portal\content\Servicelist;
use Portal\content\Songlist;


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

//DEV: Käytä joko get- tai post-dataa riippuen kutsujasta
$params = (isset($_GET["action"]) ? $_GET : $_POST);

switch($params["action"]){
    case "save_responsibles":
        $service = new Service($database, $params["service_id"]);
        $service->SaveResponsibles($params["data"]);
        break;
    case "save_details":
        $service = new Service($database, $params["service_id"]);
        $service->SaveDetails($params["data"]);
        break;
    case "save_songs":
        $service = new Service($database, $params["service_id"]);
        $service->SaveSongs($params["data"]);
        break;
    case "save_infosegment":
        $struct = new Structure($database, $m);
        if(isset($params["id"])){
            $struct->UpdateSlide($params["id"], "infosegments", $params["params"]);
        }
        else{
            $struct->InsertInfoSlide($params["params"], "infosegments");
        }
        break;
    case "save_slide":
        $struct = new Structure($database, $m);
        if(!$params["id"]){
            $struct->InsertSlide($params["params"], $params["table"]);
        }
        else{
            $struct->UpdateSlide($params["id"], $params["table"], $params["params"]);
        }
        break;
    case "save_slot":
        $struct = new Structure($database, $m);
        $struct->UpdateSlide($params["id"], "presentation_structure", $params["params"]);
        break;
    case "add_new_slot":
        $struct = new Structure($database, $m);
        if($params["service_id"] != 0){
            //tarkoituksella != eikä !==
            $struct->SetAsServiceSpecific($params["service_id"]);
        }
        $struct->InsertNewSlot($params["params"]);
        break;
    case "update_slot_order":
        $struct = new Structure($database, $m);
        if($params["service_id"] != 0){
            //tarkoituksella != eikä !==
            $struct->SetAsServiceSpecific($params["service_id"]);
        }
        $struct->SaveNewSlotOrder($params["newids"]);
        break;
    case "save_edited_lyrics":
        $songlist = new Songlist($database, 0, $m);
        if(is_numeric($params["song_id"])){
            //Jos muokataan vanhoja sanoja
            $songlist->SaveEditedLyrics($params["song_id"], $params["newtext"]);
            echo $params["song_id"];
        }
        else{
            //Jos syötetään uusi versio tai laulu
            $songlist->AddLyrics($params["song_id"], $params["newtext"]);
            echo $database->max("songdata","id");
        }
        break;
}



?>
