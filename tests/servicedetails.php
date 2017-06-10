
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class ServiceDetailsTest extends TestCase
{

    /**
     * Testaa, että riveillä on id:t
     */
    public function testRowsHaveValues()
    {
        $templatepath="src/templates";

        $servicedata = Array(Array("responsibility"=>"juontaja","responsible"=>"Jussi"),
                             Array("responsibility"=>"liturgi","responsible"=>"Ville"));

        $tablecontent = new ServiceDetailsTable($templatepath, $servicedata);

        $slist = new Template("$templatepath/servicedetails.tpl");
        $slist->Set("table", $tablecontent->Output());
        $slist->Set("theme", "Hauska messu");

        $layout = new Template("$templatepath/layout.tpl");
        $layout->Set("title", "Majakkamessu x.x.xxxx");
        $layout->Set("content", $slist->Output());
        $this->assertRegExp('/type="text" name="liturgi"/', $layout->Output());
    }

}



?>
