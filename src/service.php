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

$page_output = $layout->render(Array("content"=>$service->render()));

echo $page_output;


?>
