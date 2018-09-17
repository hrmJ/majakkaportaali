<?php
/**
 *
 * Yksittäistä messua koskeva informaatio: laulut, vastuunkantajat jne.
 *
 **/

require '../vendor/autoload.php';

use Medoo\Medoo;
use Portal\LoginController;

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
$login_controller = new LoginController($database, $config["salt"]);

$layout = $m->loadTemplate('layout'); 
$nav = $m->loadTemplate('servicelist_nav'); 
$servicelist = $m->loadTemplate('servicelist'); 
$song_controls = $m->loadTemplate('song_controls'); 
$slide_models = $m->loadTemplate('slide_models'); 

$page_content = [
    "content" => $servicelist->render(),
    "byline" => "<h2>Messut / kausi</h2>",
    "bodyclass" => "servicelist",
    "nav" => $nav->render(),
    "song_controls" => $song_controls->render(),
    "slide_models" => $slide_models->render(),
    "login_ready" => $login_controller->TestWhoIsLoggedIn(),
    ];

echo $layout->render($page_content);


?>
