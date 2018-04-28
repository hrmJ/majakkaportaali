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

$page_content = Array(
    "content" => $service->render(
        [
            "songlist" => $songlist->render()
        ]
    ),
    "byline" => "<h2>Majakkamessu 10.10.2010</h2>",
    "bodyclass" => "servicedetails"
    );

echo $layout->render($page_content);


?>
