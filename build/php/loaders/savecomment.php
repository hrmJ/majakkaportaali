<?php
/**
 *
 * Prosessoi pyynnön tallentaa komentti tietokantaan
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */

require("../database.php");
require("../songs.php");
require("../comments.php");

$comment= new Comment(new DbCon("../../../config.ini"), $_POST["id"], "../../templates");
$replyto = ($_POST["replyto"]=="0" ? NULL : $_POST["replyto"]);
$comment
    ->SetTheme($_POST["theme"])
    ->SetContent($_POST["content"])
    ->SetCommentator($_POST["commentator"])
    ->SetReplyTo($_POST["replyto"])
    ->Save();
?>
