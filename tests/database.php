<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers DbCon
 */
class DbTest extends TestCase
{

    /**
     * Testaa, että tietokantaan voi yhdistää
     */
    public function testConnectToDb()
    {
        $con = new DBcon("config.ini");
        $this-> assertTrue(is_string($con->username));
    }

    /**
     * Testaa, että select-kysely toimii
     */
    public function testSelectFromDb()
    {
        $con = new DBcon("config.ini");
        $results = $con->ArraySelect("SELECT pvm, teema FROM messut");
        $this->assertInternalType("array", $results);
    }

    /**
     * Valitse kaikki messut kaudesta
     */
    public function testSelectServicesOfSeason()
    {
        $con = new DBcon("config.ini");
        $results = $con->ArraySelect("SELECT id, nimi, alkupvm, loppupvm from kaudet WHERE alkupvm <=:date AND loppupvm >=:date ORDER BY alkupvm", Array("date"=>$date));
        $this->assertInternalType("array", $results);
    }


}



?>
