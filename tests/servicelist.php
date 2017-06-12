
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class ServiceListTest extends TestCase
{

    /**
     * Testaa, että riveillä on id:t
     */
    public function testTemplateClassExists()
    {
        $templatepath="src/templates";
        
        $con = new DBcon("config.ini");

        $date = date('Y-m-d');
        $season = GetCurrentSeason($con);
        $servicedata = $con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));

        $tablecontent = new ServiceListTable($templatepath, $servicedata);

        $slist = new Template("$templatepath/servicelist.tpl");
        $slist->Set("table", $tablecontent->Output());

        $layout = new Template("$templatepath/layout.tpl");
        $layout->Set("title", "Majakkaportaali");
        $layout->Set("content", $slist->Output());

        $this->assertRegExp('/<tr id=/', $layout->Output());
    }

}



?>
