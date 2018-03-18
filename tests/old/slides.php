<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class SlideText extends TestCase
{

  protected function setUp()
    {
        $this->templatepath="src/templates";
        $this->con = new SongCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->layout = new Template("$this->templatepath/slidelayout.tpl"); 
    }

  /**
   * Varmista, että sivun saa pystyyn
   */
 // public function testSetHeaders(){
 //     $loader = new Slide("config.ini");
 //     $loader->SetGenHeader("Majakkamessu xx.xx");
 //     $loader->SetSubGenHeader("Hyvä messuaihe.");
 //     $this->assertEquals($loader->genheader,"<h1>Majakkamessu xx.xx</h1>");
 //     $this->assertEquals($loader->subgenheader,"<h2>Hyvä messuaihe.</h2>");
 // }
  //
  //

  public function testCreateSegment(){
      $seg = new Segment("src/templates");
      $this->assertTrue($seg instanceof Segment);
  }

  public function testCreateSlide(){
      $slide = new Slide("src/templates");
      $this->assertTrue($slide instanceof Slide);
  }


  public function testCreateInfoSegment(){
      $seg = new InfoSegment("src/templates");
      $this->assertTrue($seg instanceof InfoSegment);
  }

  public function testAddInfoSlide(){
      $seg = new InfoSegment("src/templates");
      $seg->AddSlide("Muistakaa hatut","Hattumuistutus","Majakkamessu xx.xx","Hyvä aihe");
      $this->assertRegExp("/<h3>Hattumuistutus/",$seg->Slides[0]->OutputSlide());
      $this->assertRegExp("/Muistakaa hatut/",$seg->Slides[0]->OutputSlide());
      $this->assertRegExp("/<h2>Hyvä aihe/",$seg->Slides[0]->OutputSlide());
  }


  public function testOutputSegment(){
      $seg = new InfoSegment("src/templates");
      $seg->AddSlide("Muistakaa hatut","Hattumuistutus","Majakkamessu xx.xx","Hyvä aihe");
      $this->assertRegExp("/<section class/",$seg->OutputSegment());
      $this->assertRegExp("/Muistakaa hatut/",$seg->OutputSegment());
      $this->assertRegExp("/<h3>Hattumuistutus/",$seg->OutputSegment());
  }

  public function testPrintLayout(){
      $seg = new InfoSegment("src/templates");
      $seg->AddSlide("Muistakaa hatut","Hattumuistutus","Majakkamessu xx.xx","Hyvä aihe");
      $this->layout->Set("content", $seg->OutputSegment());
      $this->assertRegExp("/<h3>Hattumuistutus/",$this->layout->Output());
  }

}



?>
