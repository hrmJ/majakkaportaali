<?php

require("../database.php");
require("../songs.php");
$songs = new SongData(new SongCon("../../../config.ini"));
$fullname = (isset($_GET["fullname"]) ? true : false);
$by = (isset($_GET["byid"]) ? "id" : "title");
$songs->OutputSongTitles(trim($_GET["songname"]), $fullname, $by);

?>
