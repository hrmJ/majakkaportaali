
<?php
/**
 *
 * Tulostaa näkymän, jossa yksittäiseen messuun liittyviä vastuita voi tutkia
 * ja muokata yksityiskohtaisemmin.
 *
 */

require("php/database.php");
require("php/comments.php");
require("php/templating.php");
require("php/service_structure_page.php");
require("php/structural_unit.php");
require("php/utilities.php");

$page = new StructurePage("templates");
echo $page->InsertElementAdder()->OutputPage();

?>
