<?php
/**
 *
 * Yksittäistä messua koskeva informaatio: laulut, vastuunkantajat jne.
 *
 **/
session_start();

require '../vendor/autoload.php';
error_reporting(E_ERROR | E_PARSE);

use Medoo\Medoo;
use Portal\LoginController;

$config = parse_ini_file("../config.ini");
$database = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => $config["hostname"],
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
]);
$login_controller = new LoginController($database, $config["salt"]);

$m = new Mustache_Engine(array(
    'loader' => new Mustache_Loader_FilesystemLoader(__DIR__ . '/views')
    ));

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
