<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class StructureTest extends TestCase
{

  protected function setUp()
    {
        $this->templatepath="src/templates";
        $this->con = new SongCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/service_structure.tpl"); $this->layout->Set("title", "");
        $this->page = new SongPage($this->templatepath, 10);
    }

  /**
   * Varmista, että sivun saa pystyyn
   */
  public function testSetupPage(){
      $page = new StructurePage($this->templatepath);
      $this->assertRegExp("/rakenne/",$page->Output());
  }

  
  /**
   * Testaa ensimmäistä rakenne-elementtiä
   */
  public function testInsertElementAdder(){
      $page = new StructurePage($this->templatepath);
      $page->InsertElementAdder();
      $this->AssertRegExp("/Yksittäinen dia/", $page->addermenu->Output());
  }

  /**
   * Ajax-lataa messudataa 
   */
  public function testLoadDataForInjection(){
      $loader= new ServiceLoader("config.ini");
      $loader->LoadResponsibilities();
      $this->AssertTrue(sizeof($loader->data)>0);
  }



  /**
   * Ajax-lataa messudataa 
   */
  public function testSaveInfoSegment(){
      $loader= new InfoSegmentLoader("config.ini", Array("maintext"=>"TEkstiä","header"=>"Otsikko","genheader"=>"Mjakkamssu","subgenheader"=>"hyvä aihe","slideclass"=>"infosegment","slot_number"=>1));
      $this->AssertTrue($loader->content_id>0);
  }

}



?>
