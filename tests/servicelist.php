
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class ServiceListTest extends TestCase
{

  protected function setUp()
    {
        $this->con = new DBcon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/layout.tpl");
        $this->layout->Set("title", "Majakkaportaali");
        $this->responsibilities = $this->con->q("SELECT DISTINCT responsibility FROM responsibilities", Array());

        $this->servicedata = $this->con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$this->season["startdate"], "enddate"=>$this->season["enddate"]));
        $this->tablecontent = new ServiceListTable($this->templatepath, $this->servicedata);

        $this->slist = new Template("$this->templatepath/servicelist.tpl");
    }

    public function testTemplateClassExists()
    {
        $this->slist->Set("table", $this->tablecontent->Output());
        $this->layout->Set("content", $this->slist->Output());
        $this->assertRegExp('/<tr id=/', $this->layout->Output());
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

    public function testShowResponsibilitiesFiltered()
    {
        $filterbythis = "juontaja";
        $serviceids = $this->con->q("SELECT id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$this->season["startdate"], "enddate"=>$this->season["enddate"]));
        $filteredids = Array();
        foreach($serviceids as $sid){
            $sid[0];
            $filteredids[] = $sid["id"];
        }
        $filteredresponsibilities = $this->con->q("SELECT responsible FROM responsibilities WHERE responsibility = ? AND service_id IN (" .  implode(",", array_fill(0, sizeof($filteredids), "?")) . ") ORDER BY service_id", array_merge(Array($filterbythis),$filteredids));
        $this->assertEquals(sizeof($filteredresponsibilities),sizeof($serviceids));
    }


}



?>
