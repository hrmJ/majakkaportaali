<?php
/**
 *
 * Ajax-hae diasisältöä 
 *
 */



require("../database.php");
require("../templating.php");
require("../slide.php");
require("../segment.php");
require("../service_data_loader.php");

switch($_GET["slideclass"]){
    case "infosegment":
        $loader= new InfoSegmentLoader("../../../config.ini", $_GET["id"]);
        $loader->LoadInfoSlide();
        break;
    case "songsegment":
        $loader= new SongSegmentLoader("../../../config.ini", $_GET["id"]);
        $loader->LoadSongSlide();
        break;
}

echo $loader->OutputData();
?>
