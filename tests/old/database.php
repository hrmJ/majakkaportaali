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
        $results = $con->q("SELECT servicedate, theme FROM services");
        $this->assertInternalType("array", $results);
    }

    /**
     * Valitse lähin kausi
     */
    public function testSelectServicesOfSeason()
    {
        $con = new DBcon("config.ini");

        $date = date('Y-m-d');
        $season = $con->q("SELECT id, name, startdate, enddate FROM seasons WHERE startdate <=:date AND enddate >=:date ORDER BY startdate", Array("date"=>$date),"row");
        $results = $con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate & servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));
        $this->assertInternalType("array", $results);
    }


}



?>
