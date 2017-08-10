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
$songs = new SongData(new SongCon("../../../config.ini"));
$by = (isset($_GET["byid"]) ? "id" : "title");
if(isset($_POST["editedverses"]))
    $songs->ProcessEditedLyrics($_POST["songname"],$_POST["editedverses"],$by);
?>
