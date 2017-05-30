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

}



?>
