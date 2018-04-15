<?php
/**
 *
 * Tulostaa näkymän, jossa voi muokata oletuksena olevaa messun rakennetta.
 *
 */

require '../vendor/autoload.php';

use Medoo\Medoo;
use Portal\content\Structure;

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

$struct = new Structure($database, $m);

$layout = $m->loadTemplate('layout'); 

$page_content = Array(
    "content" => $struct->LoadSlots()->OutputPage(),
    "byline" => "<h2>Messupohjan asetukset</h2>",
    "bodyclass" => "service_structure"
    );

echo $layout->render($page_content);


?>
