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

$comment= new Comment(new DbCon("../../../config.ini"), $_GET["id"], "../../templates");
echo $comment->LoadAll();
?>
