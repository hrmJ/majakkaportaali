
<?php
/**
 *
 * Tulostaa näkymän, jossa käyttäjä voi syöttää, mitä lauluja
 * jossakin tietyssä messussa lauletaan. Näyttää taulukoita, joissa
 * laulut syötetään rooleittain, esimerkiksi "Alkulaulu: X" jne.
 *
 */

require("php/templating.php");
require("php/services.php");
require("php/database.php");
require("php/utilities.php");

$con = new DBcon("../config.ini");
$templatepath="templates";


$songdata = Array(Array("category"=>"alkulaulu","value"=>""),
                     Array("category"=>"päivän laulu","value"=>""));

$singlesongs = new SongDataTable($templatepath, $songdata);

$songslistcontent = new Template("$templatepath/songlist.tpl");
$songslistcontent->Set("singlesongs", $singlesongs->Output());

$layout = new Template("$templatepath/layout.tpl");
$layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
$layout->Set("content", $songslistcontent->Output());
$this->assertRegExp('/type="text" name="alkulaulu"/', $layout->Output());


echo $layout->Output();

?>
