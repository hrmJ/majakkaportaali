
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class ServiceDetailsTest extends TestCase
{

  protected function setUp()
    {
        $this->templatepath="src/templates";
        $this->con = new ServiceDetailsCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/layout.tpl");
        $this->page = new DetailsPage("$this->templatepath", 2);
    }

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

    /**
     * Testaa, että tiedon hakeminen onnistuu
     */
    public function testCanFetchData()
    {
        $volunteers = $this->con->q("SELECT responsible, responsibility FROM responsibilities WHERE service_id = :id",Array("id"=>1),"all");
        $this->assertTrue(sizeof($volunteers)>3);
    }

    /**
     * Testaa, että tiedon tallentaminen onnistuu
     */
    public function testCanSaveData()
    {
        $id = 2;
        $savedname = $this->con->q("SELECT responsible FROM responsibilities WHERE service_id = :id AND responsibility = :res",Array("id"=>$id,"res"=>"liturgi"),"column");
        $this->con->SaveData($id, Array("liturgi"=>"Ville Vallaton","juontaja"=>"Gareth Bale"));
        $savedname = $this->con->q("SELECT responsible FROM responsibilities WHERE service_id = :id AND responsibility = :res",Array("id"=>$id,"res"=>"liturgi"),"column");
        $this->assertEquals($savedname, "Ville Vallaton");
    }

    public function testHasResponsibleData()
    {
        $this->page->SetResponsibleData();
        $this->assertRegExp("/juontaja/",$this->page->Output());
    }

}




?>
