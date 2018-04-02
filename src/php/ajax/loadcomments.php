<?php
/**
 *
 * Prosessoi pyynnön ladata komentit tietokannasta
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */

require("../database.php");
require("../songs.php");
require("../templating.php");
require("../comments.php");


$comment= new Comment($database, $_GET["service_id"], $m);
echo $comment->LoadAll();

?>
