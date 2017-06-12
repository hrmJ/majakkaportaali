<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class TemplateTest extends TestCase
{

    /**
     * Testaa, että pohjaolio on määritelty ja sitä pystyy käyttämään.
     */
    public function testTemplateClassExists()
    {
        $this->mytemplate = new Template("servicelist.tpl");
        $this->assertTrue(get_class($this->mytemplate) == "Template", "Ei onnistuttu luomaan template-oliota");
    }

    /**
     * Testaa, että pohjaan pystyy syöttämään arvoja.
     */
    public function testSetTemplateValue()
    {
        $slist = new Template("src/templates/servicelist.tpl");
        $slist->Set("tableofservices", "<table></table>");
        $this->assertRegExp('/table/', $slist->Output());
    }

    /**
     * Testaa, että layout-pohjaan voi sijoittaa arvoja
     */
    public function testSetLayoutTemplateValue()
    {
        $layout = new Template("src/templates/layout.tpl");
        $layout->Set("title", "Majakkaportaali");
        $this->assertRegExp('/Majakkaportaali/', $layout->Output());
    }

    public function testSetTemplateInsideLayout()
    {
        $slist = new Template("src/templates/servicelist.tpl");
        $slist->Set("tableofservices", "<table></table>");
        
        $layout = new Template("src/templates/layout.tpl");
        $layout->Set("content", $slist->Output());

        $this->assertRegExp('/table/', $layout->Output());

    }


    /**
     *
     * Testaa, että messudetaljisivulla on sisältöä
     *
     */
    public function testServicedetailsHasContent(){
    
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

        $this->assertRegExp('/Jussi/', $layout->Output());
    }

    /**
     * Lataa messujen lista html-taulukoksi
     **/
    public function testLoadServiceList(){
    
        $templatepath="src/templates";
        
        $con = new DBcon("config.ini");

        $date = date('Y-m-d');
        $season = GetCurrentSeason($con);
        $servicedata = $con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate & servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));

        $tablecontent = new ServiceListTable($templatepath, $servicedata);

        $slist = new Template("$templatepath/servicelist.tpl");
        $slist->Set("table", $tablecontent->Output());

        $layout = new Template("$templatepath/layout.tpl");
        $layout->Set("title", "Majakkaportaali");
        $layout->Set("content", $slist->Output());

        $this->assertRegExp('/<td>/', $layout->Output());

    
    }


}



?>
