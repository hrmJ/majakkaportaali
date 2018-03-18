
<?php 
use PHPUnit\Framework\TestCase;
use Portal\utilities\DbCon;
use Portal\utilities\SongCon;


/**
 * @covers SongPage
 */
class SongListTest extends TestCase
{

    protected function SetUp() {
        $n = new DbCon("config.ini");
        $this->assertInstanceOf(DbCon::class,$n);
    }

}



?>
