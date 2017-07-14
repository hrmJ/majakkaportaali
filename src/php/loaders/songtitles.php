<?php

require("../database.php");
require("../songs.php");
$songs = new SongData(new SongCon("../../../config.ini"));
$fullname = (isset($_GET["fullname"]) ? true : false);
$songs->OutputSongTitles(trim($_GET["songname"]), $fullname);

?>
