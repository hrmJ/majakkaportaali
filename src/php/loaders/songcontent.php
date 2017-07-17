<?php

require("../database.php");
require("../songs.php");
$songs = new SongData(new SongCon("../../../config.ini"));
$songs->OutputSongInfo(trim($_GET["songname"]));
?>
