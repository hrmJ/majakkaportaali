<?php
/**
 *
 * Yksittäistä messua koskeva informaatio: laulut, vastuunkantajat jne.
 *
 **/

require '../vendor/autoload.php';

use Medoo\Medoo;

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
$songlist = $m->loadTemplate('songlist'); 
$nav = $m->loadTemplate('service_nav'); 
$song_controls = $m->loadTemplate('song_controls'); 
$slide_models = $m->loadTemplate('slide_models'); 

$page_content = Array(
    "content" => $service->render(
        [
            "songlist" => $songlist->render()
        ]
    ),
    "byline" => "<h2>Majakkamessu 10.10.2010</h2>",
    "bodyclass" => "servicedetails",
    "nav" => $nav->render(),
    "song_controls" => $song_controls->render(),
    "slide_models" => $slide_models->render(),
    );

echo $layout->render($page_content);


?>
