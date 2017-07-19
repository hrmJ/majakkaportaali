<?php

require("../database.php");
require("../songs.php");
$songs = new SongData(new SongCon("../../../config.ini"));
$by = (isset($_GET["byid"]) ? "id" : "title");
$songs->OutputSongInfo(trim($_GET["songname"]),$by);
?>
