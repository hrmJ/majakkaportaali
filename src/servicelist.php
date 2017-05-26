<?php
/**
 *
 * Tulostaa näkymän, jossa koko yhden kauden (TODO linkki) messuja voi tutkia
 * listana. Lisäksi tässä näkymässä on mahdollista tarkastella kaikkia messuja
 * jonkin tietyn vastuun (TODO linkki) osalta.
 *
 */

require("php/templating.php");

$layout = new Template("templates/layout.tpl");
$layout->Set("title", "Majakkaportaali");
echo $layout->Output();


?>
