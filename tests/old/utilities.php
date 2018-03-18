<?php 
use PHPUnit\Framework\TestCase;


class UtilitiesTest extends TestCase
{

    /**
     * Testaa muuttaa päivämäärä suomalaiseen formaattiin
     */
    public function testTemplateClassExists()
    {
        $date = "2017-05-30";
        $this->assertEquals("30.5.2017",FormatDate($date));
    }
}

?>
