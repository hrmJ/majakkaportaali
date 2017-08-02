<?php
/**
 *
 * Tulostaa näkymän, jossa koko yhden kauden (TODO linkki) messuja voi tutkia
 * listana. Lisäksi tässä näkymässä on mahdollista tarkastella kaikkia messuja
 * jonkin tietyn responsibilityn (TODO linkki) osalta.
 *
 */

require("php/utilities.php");
require("php/templating.php");
require("php/database.php"); 
require("php/services.php");

$templatepath="templates";

$page = new ServiceListPage("templates", (isset($_GET["filterby"]) ? $_GET["filterby"] : "Yleisnäkymä"));
if(isset($_POST["filteredchanges"]))
    $page->con->SaveData($_GET["filterby"], $_POST);

$page->InsertResponsibilitySelect();
$page->SetPageVersion();
$page->FilterContent();
$page->Set("action", "{$_SERVER["PHP_SELF"]}?filterby={$page->filterby}");

echo $page->OutputPage();

?>
