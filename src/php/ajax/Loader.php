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

//Käytä joko get- tai post-dataa riippuen kutsujasta
$params = (isset($_GET["action"]) ? $_GET : $_POST);

switch($params["action"]){
    case "save_comment":
        $comment= new Comment($database, $params["service_id"], $m);
        $comment
            ->SetTheme($params["theme"])
            ->SetContent($params["content"])
            ->SetCommentator($params["commentator"])
            ->SetReplyTo($params["replyto"])
            ->Save();
        break;
    case "load_comments":
        $comment= new Comment($database, $params["service_id"], $m);
        echo $comment->LoadAll();
        break;
    case "get_responsibilities_list":
        $com= new Community($database);
        echo json_encode($com->GetListOfResponsibilities());
        break;
    case "get_responsibles":
        $service = new Service($database, $params["service_id"]);
        echo json_encode($service->GetResponsibles());
        break;
    case "get_service_theme":
        $service = new Service($database, $params["service_id"]);
        echo $service->GetTheme();
        break;
    case "get_song_slots":
        $songlist = new Songlist($database, $params["service_id"], $m);
        echo $songlist->LoadSongSlots()->slots_as_string;
        break;
    case "get_service_specific_slots":
        $structure = new Structure($database, $m);
        echo $structure->LoadSlots()->slotstring;
        break;
    case "get_infoslide":
        $structure = new Structure($database, $m);
        echo json_encode($structure->LoadInfoSlide($params["id"]));
        break;
    case "get_songslide":
        $structure = new Structure($database, $m);
        echo json_encode($structure->LoadSongSlide($params["id"]));
        break;
    case "get_bibleslide":
        $structure = new Structure($database, $m);
        echo json_encode($structure->LoadBibleSlide($params["id"]));
        break;
    case "get_slideclass_names":
        $structure = new Structure($database, $m);
        echo json_encode($structure->LoadSlideClassNames());
        break;
    case "get_slide_image_names":
        $structure = new Structure($database, $m);
        echo json_encode($structure->LoadSlideImageNames());
        break;
    case "get_list_of_services":
        $servicelist = new Servicelist($database);
        $servicelist->SetSeason();
        echo json_encode($servicelist->ListServices());
        break;
    case "get_songlist_alpha":
        $songlist = new Songlist($database, $params["service_id"], $m);
        echo json_encode($songlist->GetAlphabets());
        break;
    case "get_song_titles":
        $songlist = new Songlist($database, $params["service_id"], $m);
        echo json_encode($songlist->GetTitles($params["title"]));
        break;
    case "check_song_title":
        $songlist = new Songlist($database, $params["service_id"], $m);
        echo json_encode($songlist->CheckTitle($params["title"]));
        break;
    case "get_songs_in_list_alpha":
        $songlist = new Songlist($database, $params["service_id"], $m);
        echo json_encode($songlist->GetTitlesByLetter($params["letter"]));
        break;
}



?>
