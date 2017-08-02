
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class ServiceListTest extends TestCase
{

  protected function setUp()
    {
        $this->con = new ServiceListCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/layout.tpl");
        $this->layout->Set("title", "Majakkaportaali");
        $this->responsibilities = $this->con->q("SELECT DISTINCT responsibility FROM responsibilities", Array());

        $this->servicedata = $this->con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$this->season["startdate"], "enddate"=>$this->season["enddate"]));
        $this->tablecontent = new ServiceListTable($this->templatepath, $this->servicedata);

        $this->slist = new Template("$this->templatepath/servicelist.tpl");
        $this->page = new ServiceListPage($this->templatepath, "Yleisnäkymä");
    }

    public function testTemplateClassExists()
    {
        $this->slist->Set("table", $this->tablecontent->Output());
        $this->layout->Set("content", $this->slist->Output());
        $this->assertRegExp('/datarow.* id=/', $this->layout->Output());
    }


    public function testCreateSelectForFilteringResponsibilities()
    {
        $select = new Select($this->templatepath, $this->responsibilities, "Yleisnäkymä","Yleisnäkymä");
        $this->assertRegExp('/<option.*juontaja/', $select->Output());
    }

    public function testLayoutIncludesSelect()
    {
        $select = new Select($this->templatepath, $this->responsibilities, "Yleisnäkymä", "Yleisnäkymä");
        $this->slist->Set("table", $this->tablecontent->Output());
        $this->slist->Set("select",$select->Output());
        $this->layout->Set("content", $this->slist->Output());
        $this->assertRegExp('/Yleisnäkymä/', $this->layout->Output());
    }


    public function testSubmitButton()
    {
        $sub = new Submit($this->templatepath,"filteredchanges","Tallenna","");
        $this->slist->Set("submit", $sub->Output());
        $this->assertRegExp("/input type=.submit/", $this->slist->Output());
    }

    /**
     * Testaa, että tiedon tallentaminen onnistuu
     */
    public function testCanSaveFiltered()
    {
        $fakepost =  Array("id_1"=> "", "id_2"=>"Mikko Mallikas", "id_3"=> "Alu Palu", "id_4"=> "Joku Kaveri", "id_5"=> "", "id_6"=> "", "filteredchanges"=> "Tallenna");
        $this->con->SaveData("liturgi", $fakepost);
        $newdata = $this->con->q("SELECT responsible FROM responsibilities WHERE service_id = '2' AND responsibility = 'liturgi'",Array(),"column");
        $this->assertEquals($newdata,"Mikko Mallikas");
    }

    public function testInsertSelectToTemplate()
    {
        $this->page->InsertResponsibilitySelect();
        $this->assertRegExp("/<select/",$this->page->Output());
    }

    public function testSetPageVersion()
    {
        $this->page->filterby = "juontaja";
        $this->page->SetPageVersion();
        $this->assertRegExp("/Muista tallentaa/",$this->page->Output());
        $this->page->filterby = "Yleisnäkymä";
        $this->page->SetPageVersion();
        $this->assertRegExp("/Klikkaa päivämäärää/",$this->page->Output());
    }

    public function testGetFilteredContent()
    {
        $this->page->filterby = "juontaja";
        $this->page->FilterContent();
        $this->assertRegExp("/datarow/",$this->page->Output());
    }

}



?>
