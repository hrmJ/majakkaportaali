
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\utilities\DateFormatter;


/**
 */
class DateFormatterTest extends TestCase
{

    /**
     * Testaa, että kommenttiolion voi luoda
     */
    public function testCreateObject()
    {
        $df = new DateFormatter();
        $this-> assertInstanceOf(DateFormatter::class,$df);
    }

}


?>
