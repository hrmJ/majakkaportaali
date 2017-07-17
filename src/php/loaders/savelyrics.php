<?php
/**
 *
 * TODO: kirjautumislogiikka tännekin!
 *
 */

require("../database.php");
require("../songs.php");
$songs = new SongData(new SongCon("../../../config.ini"));
if(isset($_POST["editedverses"]))
    $songs->ProcessEditedLyrics($_POST["songname"],$_POST["editedverses"]);
?>
