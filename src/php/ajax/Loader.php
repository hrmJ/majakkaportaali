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
use Portal\content\BibleLoader;
use Portal\slides\SlideStyle;


$config = parse_ini_file("../../../config.ini");
$database = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => 'localhost',
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
]);

$database_bible = new Medoo([
    'database_type' => 'mysql',
    'database_name' => 'bibles',
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
    case "load_booknames":
        $loader = new BibleLoader($params["testament"], $database_bible);
        $loader->LoadBooknames();
        echo json_encode($loader->GetData());
        break;
    case "load_chapters":
        $loader = new BibleLoader($params["testament"], $database_bible);
        $loader->LoadChapters($params["book"]);
        echo json_encode($loader->GetData());
        break;
    case "load_verses":
        $loader = new BibleLoader($params["testament"], $database_bible);
        $loader->LoadVerses($params["book"], $params["chapter"]);
        echo json_encode($loader->GetData());
        break;
    case "load_verse_content":
        $loader = new BibleLoader($params["testament"], $database_bible);
        $loader->LoadVerseContent($params["startverse"], $params["endverse"]);
        echo json_encode($loader->GetData());
        break;
    case "load_comments":
        $comment= new Comment($database, $params["service_id"], $m);
        echo $comment->LoadAll();
        break;
    case "get_list_of_responsibilities":
        $com= new Community($database);
        echo json_encode($com->GetListOfResponsibilities());
        break;
    case "get_list_of_service_meta":
        $com= new Community($database);
        echo json_encode($com->GetListOfServiceMeta());
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
        echo $songlist->LoadSongSlots($params["service_id"])->slots_as_string;
        break;
    case "load_slots":
        $structure = new Structure($database, $m);
        if($params["service_id"] != 0){
            //tarkoituksella != eikä !==
            $structure->SetAsServiceSpecific($params["service_id"], false);
        }
        echo $structure->PrintStructure()->slotstring;
        break;
    case "load_slots_to_container":
        $songlist = new Songlist($database, $params["service_id"], $m);
        echo json_encode($songlist->LoadSlotsToCont($params["cont_name"]));
        break;
    case "get_infoslide":
        $structure = new Structure($database, $m);
        if($params["service_id"] != 0){
            //tarkoituksella != eikä !==
            $structure->SetAsServiceSpecific($params["service_id"], false);
        }
        echo json_encode($structure->LoadSlide($params["id"], "infosegments"));
        break;
    case "get_songslide":
        $structure = new Structure($database, $m);
        if($params["service_id"] != 0){
            //tarkoituksella != eikä !==
            $structure->SetAsServiceSpecific($params["service_id"], false);
        }
        echo json_encode($structure->LoadSlide($params["id"], "songsegments"));
        break;
    case "get_bibleslide":
        $structure = new Structure($database, $m);
        if($params["service_id"] != 0){
            //tarkoituksella != eikä !==
            $structure->SetAsServiceSpecific($params["service_id"], false);
        }
        echo json_encode($structure->LoadSlide($params["id"],"biblesegments"));
        break;
    case "get_slideclass_names":
        $style = new SlideStyle($database);
        echo json_encode($style->LoadSlideClassNames());
        break;
    case "load_styles":
        $style = new SlideStyle($database);
        $style->LoadAllStyles($params["stylesheet"]);
        echo $style->html;
        break;
    case "load_stylesheets":
        $style = new SlideStyle($database);
        $data = $style->LoadAllStyleSheets();
        echo json_encode($data);
        break;
    case "update_style_rows":
        $style = new SlideStyle($database);
        $data = $style->UpdateStyles($params["rows_to_update"],$params["current_sheet"],$params["isnew"]);
        echo json_encode($data);
        break;
    case "styles_as_array":
        $style = new SlideStyle($database);
        $data = $style->LoadAllStylesAsArrayOfStrings($params["current_sheet"]);
        echo json_encode($data);
        break;
    case "get_slide_image_names":
        $structure = new Structure($database, $m);
        echo json_encode($structure->LoadSlideImageNames());
        break;
    case "get_slide_image_description":
        $structure = new Structure($database, $m);
        echo json_encode($structure->LoadSlideImageDescription($params["filename"]));
        break;
    case "get_list_of_services":
        $servicelist = new Servicelist($database);
        $servicelist->SetSeason();
        echo json_encode($servicelist->ListServices());
        break;
    case "get_filtered_list_of_services":
        $servicelist = new Servicelist($database);
        $servicelist->SetSeason();
        echo json_encode($servicelist->ListServicesFilteredBy($params["filteredby"]));
        break;
    case "get_songlist_alpha":
        $songlist = new Songlist($database, $params["service_id"], $m);
        echo json_encode($songlist->GetAlphabets());
        break;
    case "get_song_titles":
        $sid = (isset($params["service_id"]) ? $params["service_id"] : 0);
        $songlist = new Songlist($database, $sid, $m);
        echo json_encode($songlist->GetTitles($params["title"]));
        break;
    case "check_song_title":
        $sid = (isset($params["service_id"]) ? $params["service_id"] : 0);
        $songlist = new Songlist($database, $sid, $m);
        echo json_encode($songlist->CheckTitle($params["title"]));
        break;
    case "get_songs_in_list_alpha":
        $sid = (isset($params["service_id"]) ? $params["service_id"] : 0);
        $songlist = new Songlist($database, $sid, $m);
        echo json_encode($songlist->GetTitlesByLetter($params["letter"]));
        break;
    case "check_last_index_of_segment_type":
        echo json_encode($database->max($params["segment_type"] . "s","id"));
        break;
    case "fetch_lyrics":
        $songlist = new Songlist($database, $sid, $m);
        echo json_encode($songlist->FetchLyricsById($params["song_id"]));
        break;
    case "get_service_verses":
        $service = new Service($database, $params["service_id"]);
        echo json_encode($service->GetBibleSegments());
        break;
    case "get_bible_segments_content":
        $service = new Service($database, $params["service_id"]);
        echo json_encode($service->GetBibleSegmentsContent());
        break;
    case "load_slides_to_presentation":
        $structure = new Structure($database, $m);
        $structure->SetAsServiceSpecific($params["service_id"], false);
        echo $structure->LoadSlidesForPresentation()->InjectData()->slotstring;
        break;
}



?>
