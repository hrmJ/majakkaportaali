
<?php 
use PHPUnit\Framework\TestCase;
use Portal\utilities\DbCon;
use Portal\utilities\SongCon;


/**
 * @covers DbCon
 */
class DbTest extends TestCase
{

    public function testCreateConnection() {
        $n = new DbCon("config.ini");
        $this->assertInstanceOf(DbCon::class,$n);
    }

    public function testCreateSongConnection() {
        $n = new SongCon("config.ini");
        $this->assertInstanceOf(SongCon::class,$n);
    }

}



?>
