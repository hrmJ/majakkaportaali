<?php
/**
 *
 * Tulostaa näkymän, jossa voi muokata oletuksena olevaa messun rakennetta.
 *
 */

require '../vendor/autoload.php';

use Medoo\Medoo;
use Portal\content\Structure;
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

$struct = new Structure($database, $m);

$layout = $m->loadTemplate('layout'); 
$nav = $m->loadTemplate('service_structure_nav'); 
$slide_models = $m->loadTemplate('slide_models'); 

$page_content = [
    "content" => $struct->PrintStructure()->OutputPage(),
    "byline" => "<h2>Messupohjan asetukset</h2>",
    "bodyclass" => "service_structure",
    "nav" => $nav->render(),
    "slide_models" => $slide_models->render(),
    "login_ready" => $login_controller->TestWhoIsLoggedIn(),
    ];

echo $layout->render($page_content);


?>
