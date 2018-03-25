<?php
/**
 *
 * Yksittäistä messua koskeva informaatio: laulut, vastuunkantajat jne.
 *
 **/

require '../vendor/autoload.php';

use Medoo\Medoo;
use Portal\content\Comment;

$config = parse_ini_file("../config.ini");
$database = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => 'localhost',
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
]);

$m = new Mustache_Engine(array(
    'loader' => new Mustache_Loader_FilesystemLoader(__DIR__ . '/views')
    ));

$layout = $m->loadTemplate('layout'); 
$service = $m->loadTemplate('service'); 

$comment= new Comment($database, $_GET["service_id"], $m);
$service_content = Array("comments" => $comment->LoadAll());

$page_content = Array(
    "content" => $service->render($service_content),
    "byline" => "<h2>Majakkamessu 10.10.2010</h2>",
    "bodyclass" => "songs"
    );

$page_output = $layout->render($page_content);

echo $page_output;


?>
