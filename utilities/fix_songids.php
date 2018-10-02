<?php

require '../vendor/autoload.php';

use Medoo\Medoo;
$config = parse_ini_file("../config.ini");
$db = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => 'localhost',
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
]);


$titles = $db->select("servicesongs", ["id", "song_title"]);

foreach($titles as $title){
    $song_id = $db->get("songdata", "id", ["title" => $title["song_title"]]);
    if($song_id){
        $db->update("servicesongs", ["song_id" => $song_id], ["id" => $title["id"]]);
    }
}


?>
