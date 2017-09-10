<?php
/**
 *
 * Luo messusisällöistä diaesityksen runkoja.
 *
 */


require("../database.php");
require("../templating.php");
require("../slide.php");
require("../segment.php");
require("../service_data_loader.php");

switch($_POST["slideclass"]){
    case "infosegment":
        $segment_values = Array($_POST["maintext"],$_POST["header"],$_POST["genheader"],$_POST["subgenheader"]);
        //1. Testaa, onko tällaista infodiaa jo olemassa tietokannassa
        $id = $con->q("SELECT id FROM infosegments WHERE  maintext = ? AND  header = ? AND  genheader = ? AND subgenheader = ?)",$segment_values,"row");
        if(!$id){
            //Jos ei, syötä uusi rivi
            $con->q("INSERT INTO infosegments (maintext, header, genheader, subgenheader) values (?, ?, ?, ?)", $segment_values, "none");
            $id = $con->q("SELECT id FROM infosegments WHERE  maintext = ? AND  header = ? AND  genheader = ? AND subgenheader = ?)",$segment_values,"row");
        }
        break;
}

?>
