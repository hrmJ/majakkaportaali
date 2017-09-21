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
require("../service_structure_page.php");


$page = new StructurePage("../../templates",new DbCon("../../../config.ini"));
$page->LoadSlots();
echo  $page->slotstring;
?>
