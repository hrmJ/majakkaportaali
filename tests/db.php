
<?php 
use PHPUnit\Framework\TestCase;
use Portal\utilities\DbCon;


/**
 * @covers DbCon
 */
class DbTest extends TestCase
{

    public function testCreateConnection()
    {
        $n = new DbCon("config.ini");
        var_dump($n);
    }

}



?>
