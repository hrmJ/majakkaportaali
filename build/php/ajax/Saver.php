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
use Portal\LoginController;
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

$login_controller = new LoginController($database, $config["salt"]);

//DEV: Käytä joko get- tai post-dataa riippuen kutsujasta
//$params = (isset($_GET["action"]) ? $_GET : $_POST);
$params = $_POST;
if($params["action"] == "login"){
    echo $login_controller->TryLogin($params["username"], $params["password"]);
}
else{
    //Suoritetaan varsinaisia toimintoja
    echo "I'M ALMOST THERE";
    $login_controller->TestIsLoggedIn();
    echo "I'M HERE";

    $struct = new Structure($database, $m);
    $com = new Community($database);

    switch($params["action"]){
        case "save_added_Services":
            $com->SaveNewServices($params["params"]["dates"]);
            break;
        case "save_added_LiturgicalTexts":
            $songlist = new Songlist($database, 0, $m);
            $songlist->AddLtext($params["params"]["title"], $params["params"]["content"]);
            break;
        case "save_edited_LiturgicalTexts":
            $songlist = new Songlist($database, 0, $m);
            $songlist->SaveEditedLyrics($params["params"]["id"],
                $params["params"]["cols"]["content"], true);
            $songlist->SaveEditedLtextTitle($params["params"]["cols"]["title"], $params["params"]["id"]);
            break;
        case "save_added_Events":
            $com->SaveNewEvent($params["params"]);
            break;
        case "save_edited_Events":
            $com->SaveEditedEvent($params["params"]["id"], $params["params"]["cols"]);
            break;
        case "remove_event":
            $com->RemoveEvent($params["id"]);
            break;
        case "save_added_Smallgroups":
            $com->SaveNewSmallgroup($params["params"]);
            break;
        case "save_edited_Smallgroups":
            $com->SaveEditedSmallgroup($params["params"]["id"], $params["params"]["cols"]);
            break;
        case "remove_smallgroup":
            $com->RemoveSmallGroup($params["id"]);
            break;
        case "save_added_Responsibilities":
            $com->SaveNewResponsibility(
                $params["params"]["responsibility"], 
                $params["params"]["description"]
            );
            break;
        case "save_added_Offerings":
            $id = $com->SaveNewOfferingTargets(
                $params["params"]["target_name"],
                $params["params"]["target_description"]
            );
            if($params["params"]["goals"]){
                $com->SaveOfferingGoals($id, $params["params"]["goals"]);
            }
            break;
        case "remove_responsibility":
            $com->RemoveResponsibility($params["responsibility"]);
            break;
        case "remove_season":
            $com->RemoveSeason($params["season_id"]);
            break;
        case "remove_info":
            $struct->RemoveInfo($params["content_id"]);
            break;
        case "remove_service":
            $com->RemoveService($params["service_id"]);
            break;
        case "save_responsibles":
            $service = new Service($database, $params["service_id"]);
            $service->SaveResponsibles($params["data"]);
            break;
        case "save_details":
            $service = new Service($database, $params["service_id"]);
            $service->SaveDetails($params["data"]);
            break;
        case "save_service_theme_and_date":
            $service = new Service($database, $params["service_id"]);
            $service->SaveThemeAndDate($params["newvals"]);
            break;
        case "save_songs":
            $service = new Service($database, $params["service_id"]);
            $service->SaveSongs($params["data"]);
            break;
        case "save_added_Infos":
        case "save_edited_Infos":
            if(!$params["params"]["content_id"]){
                $struct->InsertSlide($params["params"]["segment"], "infosegments");
            }
            else{
                $struct->UpdateSlide($params["params"]["content_id"], "infosegments", $params["params"]["segment"]);
            }
            $struct->SaveInfo($params["params"]);
            break;
        case "save_slide":
            if(!$params["id"]){
                $struct->InsertSlide($params["params"], $params["table"]);
            }
            else{
                $struct->UpdateSlide($params["id"], $params["table"], $params["params"]);
            }
            break;
        case "insert_headertemplate":
            $struct->InsertHeaderTemplate($params["template_name"]);
            break;
        case "update_headertemplate":
            $struct->UpdateHeaderTemplate($params["header_id"], $params["params"]);
            break;
        case "remove_slot":
            if($params["service_id"] != 0){
                //tarkoituksella != eikä !==
                $struct->SetAsServiceSpecific($params["service_id"]);
            }
            $struct->RemoveSlot($params["id"]);
            break;
        case "save_slot":
            $table = "presentation_structure";
            if($params["service_id"] != 0){
                //tarkoituksella != eikä !==
                $struct->SetAsServiceSpecific($params["service_id"]);
                $table = "service_specific_presentation_structure";
            }
            $struct->UpdateSlide($params["id"], $table, $params["params"]);
            break;
        case "add_new_slot":
            if($params["service_id"] != 0){
                //tarkoituksella != eikä !==
                $struct->SetAsServiceSpecific($params["service_id"]);
            }
            $struct->InsertNewSlot($params["params"]);
            break;
        case "update_slot_order":
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
        case "bulksave_responsibilities":
            $servicelist = new Servicelist($database);
            $servicelist->BulkSaveResponsibilities($params["params"]);
            break;
        case "save_edited_Responsibilities":
            $servicelist = new Servicelist($database);
            $servicelist->SaveEditedResponsibility($params["params"]);
            break;
        case "save_edited_Services":
            $service = new Service($database, $params["params"]["service_id"]);
            $service->SaveThemeAndDate($params["params"]["newvals"]);
            break;
        case "save_added_Seasons":
        case "save_edited_Seasons":
            $com->SaveSeason($params["params"]["newvals"], $params["params"]["season_id"]);
            break;
        case "save_songtags":
            $songlist = new Songlist($database, 0, $m);
            break;
        case "add_offering_goal":
            $com->SaveOfferingGoals($params["target_id"], $params["goals"]);
            break;
        case "edit_offering_goal":
            $com->EditOfferingGoal($params["goal_id"], $params["goal_params"]);
            break;
        case "remove_offering_goal":
            $com->RemoveOfferingGoal($params["goal_id"]);
            break;
        case "remove_offering_target":
            $com->RemoveOfferingTarget($params["target_id"]);
            break;
        case "save_edited_meta":
            $songlist = new Songlist($database, 0, $m);
            if($params["meta_type"] == "songtags"){
                $songlist->SaveEditedTags($params["song_id"], $params["new_val"]);
            }
            else{
                if($params["meta_type"] == "lyricsby"){
                    $params["meta_type"] = "lyrics";
                }
                $songlist->SaveEditedAuthors($params["song_id"], $params["meta_type"], $params["new_val"]);
            }
            break;

    }



}



?>
