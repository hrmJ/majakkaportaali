
<?php
/**
 *
 * Tulostaa näkymän, jossa voi muokata oletuksena olevaa messun rakennetta.
 *
 */

require("php/database.php");
require("php/comments.php");
require("php/templating.php");
require("php/service_structure_page.php");
require("php/structural_unit.php");
require("php/slot.php");
require("php/utilities.php");

$page = new StructurePage("templates",new DbCon("../config.ini"));
$page->LoadSlots();
echo $page->InsertElementAdder()->OutputPage();

?>
