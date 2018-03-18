<?php
/**
 *
 * Yksittäistä messua koskeva informaatio: laulut, vastuunkantajat jne.
 *
 **/

require '../vendor/autoload.php';

$m = new Mustache_Engine(array(
    'loader' => new Mustache_Loader_FilesystemLoader(__DIR__ . '/views')
    ));

$layout = $m->loadTemplate('layout'); 
$service = $m->loadTemplate('service'); 

$page_content = Array("content"=>$service->render(),
    "byline" => "<h2>Majakkamessu 10.10.2010</h2>",
    "bodyclass" => "songs"
    );
$page_output = $layout->render($page_content);

echo $page_output;


?>
