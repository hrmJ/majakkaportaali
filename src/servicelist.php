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

#Valmistelu ja tietokantayhteys
$con = new ServiceListCon("../config.ini");
$season = GetCurrentSeason($con);
if(isset($_POST["filteredchanges"]))
    $con->SaveData($_GET["filterby"], $_POST);


#Select-elementti vastuiden suodattamista varten
$responsibilities = $con->q("SELECT DISTINCT responsibility FROM responsibilities", Array());
$filterby = (isset($_GET["filterby"]) ? $_GET["filterby"] : "Yleisnäkymä");
$select = new Select($templatepath, $responsibilities, $filterby, "Yleisnäkymä","respfilter");

#Varsinainen lista messuista
$servicedata = FilterContent($con, $filterby, $season);
$tablecontent = new ServiceListTable($templatepath, $servicedata);

#Kootaan yllä tuotettu sisältö
$slist = new Template("$templatepath/servicelist.tpl");
$slist->Set("action", $_SERVER["PHP_SELF"] . "?filterby=" . $_GET["filterby"]);
$slist->Set("table", $tablecontent->Output());
$slist->Set("select", $select->Output());
if($filterby!="Yleisnäkymä"){
    $sub = new Submit($templatepath, "filteredchanges","Tallenna","");
    $subval = $sub->Output();
}
else{
    $subval = "";
}
$slist->Set("submit", $subval);

#Sivun yleinen ulkoasu ja tiedot
$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Majakkaportaali");
$layout->Set("content", $slist->Output());
$layout->Set("jsaddress", "js/servicelist.js");

echo $layout->Output();

?>
