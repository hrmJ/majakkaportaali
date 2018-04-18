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
use Portal\content\Servicelist;


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
    case "get_list_of_services":
        $servicelist = new Servicelist($database);
        $servicelist->SetSeason();
        echo json_encode($servicelist->ListServices());
        break;
}



?>
