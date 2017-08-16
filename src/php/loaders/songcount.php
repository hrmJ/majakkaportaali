<?php

require("../database.php");
require("../songs.php");
$songs = new SongData(new SongCon("../../../config.ini"));
$by = (isset($_GET["byid"]) ? "id" : "title");
if(isset($_GET["firstspan"])){
    $songs->firstspan = $_GET["firstspan"];
    $songs->lastspan = $_GET["lastspan"];
    $songs->OutputSongTitles(trim($_GET["songname"]), "spans", $by);
}
else{
    $songs->OutputSongTitles(trim($_GET["songname"]), $_GET["fullname"], $by);
}

?>
