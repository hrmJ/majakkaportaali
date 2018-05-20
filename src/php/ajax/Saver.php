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
    case "save_infosegment":
        $struct = new Structure($database, $m);
        if(isset($params["id"])){
            $struct->UpdateInfoSlide($params["id"], $params["params"]);
        }
        else{
            $struct->InsertInfoSlide($params["params"]);
        }
        break;
}



?>
