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


switch($_GET["action"]){
    case "save_comment":
        $comment= new Comment($database, $_GET["service_id"], $m);
        $comment
            ->SetTheme($_GET["theme"])
            ->SetContent($_GET["content"])
            ->SetCommentator($_GET["commentator"])
            ->SetReplyTo($_GET["replyto"])
            ->Save();
        break;
    case "load_comments":
        $comment= new Comment($database, $_GET["service_id"], $m);
        echo $comment->LoadAll();
        break;
    case "save_comment":
        break;
    case "get_responsibilities_list":
        $com= new Community($database);
        echo json_encode($com->GetListOfResponsibilities());
        break;

}



?>
