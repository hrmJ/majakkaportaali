<?php
/**
 *
 * Tulostaa näkymän, jossa yksittäiseen messuun liittyviä vastuita voi tutkia
 * ja muokata yksityiskohtaisemmin.
 *
 */

require("php/comments.php");
require("php/templating.php");
require("php/services.php");
require("php/database.php");
require("php/utilities.php");

$page = new DetailsPage("templates", $_GET["id"]);

if(isset($_POST["savedetails"]))
    $page->con->SaveData($_GET["id"], $_POST);

$page->SetResponsibleData()->SetCommentThemeSelect()->Set("action", "{$_SERVER['PHP_SELF']}?id={$page->id}")->Set("service_id",$page->id);
echo $page->OutputPage();

?>
