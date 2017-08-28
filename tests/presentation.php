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
    public function testLoadFirstSong()
    {
        $this->mytemplate = new Template("");
        $this->assertTrue(get_class($this->mytemplate) == "Template", "Ei onnistuttu luomaan template-oliota");
    }


}



?>
