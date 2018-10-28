
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
use Portal\LoginController;
use Portal\content\Comment;
use Portal\content\Community;
use Portal\content\Service;
use Portal\content\Structure;
use Portal\content\Servicelist;
use Portal\content\Songlist;


$config = parse_ini_file("../config.ini");
$con = new Medoo([
    'database_type' => 'mysql',
    'database_name' => $config["dbname"],
    'server' => 'localhost',
    'username' => $config["un"],
    'password' => $config["pw"],
    'charset' => 'utf8'
]);


$m = new Mustache_Engine(array(
    'loader' => new Mustache_Loader_FilesystemLoader('../build/views')
    ));



//Riemumessu
$id1 = $con->get("versedata", "song_id", ["verse[~]" => ["on Jeesuksen uhrissa"]]);
$con->insert("songtags",["song_id" => $id1, "tag" => "jumalan karitsa"]);
$con->update("songdata",
    ["title" => "Jumalan karitsa riemumessusta (on Jeesuksen uhrissa...)"],
    ["id" => $id1]);


//Oi, jumalan
$id2 = $con->get("versedata", "song_id", ["verse[~]" => ["rauhasi ja siunauksesi"]]);
$con->insert("songtags",["song_id" => $id2, "tag" => "jumalan karitsa"]);
$con->update("songdata",
    ["title" => "Jumalan karitsa (Rantatalo = Oi, Jumalan...)"],
    ["id" => $id2]);


//2. säv.sarj.
$id = $con->get("versedata", "song_id", ["verse[~]" => ["joka kannat maailman synnin"], "id[!]" => [$id1, $id2]]);
$con->insert("songtags",["song_id" => $id, "tag" => "jumalan karitsa"]);
$con->update("songdata",
    ["title" => "Jumalan karitsa (1.-4. sävelmäsarja)"],
    ["id" => $id]);

//$ids = $con->select("songdata", "id", ["title[~]" => ["UMALAN KAR","umalan kari"]]);

?>
