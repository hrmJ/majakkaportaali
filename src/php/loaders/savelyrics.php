<?php
/**
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */

require("../database.php");
require("../songs.php");
$songs = new SongData(new SongCon("../../../config.ini"));
$by = (isset($_GET["byid"]) ? "id" : "title");
if(isset($_POST["editedverses"]))
    $songs->ProcessEditedLyrics($_POST["songname"],$_POST["editedverses"],$by);
?>
