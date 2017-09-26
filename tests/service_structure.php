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
        $this->con = new DbCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/service_structure.tpl"); $this->layout->Set("title", "");
        $this->page = new StructurePage($this->templatepath, $this->con);
    }

  /**
   * Varmista, että sivun saa pystyyn
   */
  public function testSetupPage(){
      $page = new StructurePage($this->templatepath, $this->con);
      $this->assertRegExp("/rakenne/",$page->Output());
  }

  
  /**
   * Testaa ensimmäistä rakenne-elementtiä
   */
  public function testInsertElementAdder(){
      $page = new StructurePage($this->templatepath, $this->con);
      $page->InsertElementAdder();
      $this->AssertRegExp("/Yksittäinen dia/", $page->addermenu->Output());
  }

//
//  /**
//   * Ajax-lataa messudataa 
//   */
//  public function testLoadDataForInjection(){
//      $loader= new ServiceLoader("config.ini");
//      $loader->LoadResponsibilities();
//      $this->AssertTrue(sizeof($loader->data)>0);
//  }

  /**
   * Ajax-lataa messudataa 
   */
  public function testSaveInfoSegment(){
      $loader= new InfoSegmentSaver("config.ini", Array("maintext"=>"TEkstiä","header"=>"Otsikko","genheader"=>"Mjakkamssu","subgenheader"=>"hyvä aihe","slideclass"=>"infosegment","slot_number"=>1,"slot_name"=>"alkuinfo"));
      $loader->SetContentId()->SetSlotData();
      $this->AssertTrue($loader->content_id>0);
  }


  /**
   * Tallenna laulusegmentti
   */
  public function testSaveSongSegment(){
      $loader= new SongSegmentSaver("config.ini", Array("slideclass"=>"songsegment","slot_number"=>1,"description"=>"Tämä laulutaan aluksi","restricted_to"=>"","slot_name"=>"testilaulu","multiname"=>""));
      $loader->SetContentId()->SetSlotData();
      $this->AssertTrue($loader->content_id>0);
  }



  /**
   * Lataa kaikki olemassaolevat slotit.
   */
  public function testLoadSlots(){
      $this->page->LoadSlots();
      $this->AssertRegExp("/class=.structural/",$this->page->Output());
  }

  /**
   * Lataa kaikki olemassaolevat slotit.
   */
  public function testLoadInfoslide(){
      $loader= new InfoSegmentLoader("config.ini", 1);
      $loader->LoadInfoSlide();
      $this->AssertTrue(array_key_exists("genheader",$loader->data));
  }

}



?>
