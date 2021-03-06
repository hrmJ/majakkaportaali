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
    case "infoslide":
        $loader= new InfoSegmentLoader("../../../config.ini", $_GET["id"]);
        $loader->LoadInfoSlide();
        break;
    case "songslide":
        $loader= new SongSegmentLoader("../../../config.ini", $_GET["id"]);
        $loader->LoadSongSlide();
        break;
    case "bibleslide":
        $loader= new BibleSegmentLoader("../../../config.ini", $_GET["id"]);
        $loader->LoadBibleSlide();
        break;
    case "list_all":
        $loader= new ServiceDataLoader("../../../config.ini", $_GET["id"]);
        $loader->LoadSlideClasses();
        break;
    case "headernames":
        $loader= new ServiceDataLoader("../../../config.ini", $_GET["id"]);
        $loader->LoadSlideHeaders();
        break;
}

echo $loader->OutputData();
?>
