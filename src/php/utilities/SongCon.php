<?php

namespace Portal\utilities;
use Portal\utilities\DbCon;
use PDO;

/**
 *
 * Yhteys tietokantaan laulujen listasta käsin
 *
 * @param string $type Yhteyden tyyppi
 * @param Array $multisongs_inserted taulukko, jolla seurataan, minkä verran ehtoollis-/ylistyslauluja syötetty
 *
 */
class SongCon extends DbCon{
    protected $type = "song";
    protected $multisongs_inserted = Array("ws"=>0,"com"=>0);
}

?>


