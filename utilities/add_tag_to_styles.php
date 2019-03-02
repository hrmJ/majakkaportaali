<?php
/**
 *
 * Lataa tietokannasta ajax-tekniikalla dataa. 
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */

require '../vendor/autoload.php';

use Medoo\Medoo;


function AddNewTag($con, $tagname){

    $all_p = $con->select("styles", ["classname" , "attr", "value",  "stylesheet"], ["tagname"=>"p"]);
    $already = $con->select("styles","*",["tagname" => $tagname]);
    var_dump($already);
    if(!$already){
        foreach($all_p as $p){
            $newtag = $p;
            $newtag[ "tagname" ] = $tagname;
            var_dump($newtag);
            $con->insert("styles", $newtag);
        }
    
    }

}

$config = parse_ini_file("../config.ini");
$con = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => 'localhost',
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
]);


AddNewTag($con, "ul");
#AddNewTag($con, "ol");



?>
