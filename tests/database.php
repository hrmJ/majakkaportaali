<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers DBcon
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
        var_dump($results[0]);
        $this->assertInternalType("array", $results);
    }

}



?>
