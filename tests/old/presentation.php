<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class PresentationTest extends TestCase
{

  protected function setUp()
    {
        $this->templatepath="src/templates";
        $this->con = new SongCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/presentation.tpl");
        $this->layout->Set("title", "");
        $this->songlistcontent = new Template("$this->templatepath/songlist.tpl");
        $this->page = new SongPage($this->templatepath, 10);
    }


    /**
     * Testaa, että pohjaolio on määritelty ja sitä pystyy käyttämään.
     */
    public function testRepresentSong()
    {
        $this->mytemplate = new PresentationSong($this->templatepath, "Ukko Nooa");
        $this->assertTrue(get_class($this->mytemplate) == "PresentationSong", "Ei onnistuttu luomaan template-oliota");
        $this->assertRegExp('/.*oli kunnon mies.*/', $this->mytemplate->songdata["verses"]);
        $this->mytemplate->Set("title",$this->mytemplate->songdata["title"])
                         ->Set("lyricsby",$this->mytemplate->songdata["lyrics"])
                         ->Set("composer",$this->mytemplate->songdata["composer"])
                         ->Set("verses", $this->mytemplate->SetVerses());
        $this->assertRegExp('/.*oli kunnon mies.*/', $this->mytemplate->Output());
    }


}



?>
