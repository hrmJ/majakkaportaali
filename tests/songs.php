
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class SongListTest extends TestCase
{

  protected function setUp()
    {
        $this->templatepath="src/templates";
        $this->con = new DBcon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/layout.tpl");
        $this->layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
        $this->songlistcontent = new Template("$this->templatepath/songlist.tpl");
    }


    public function testSingleSongs()
    {

        $songdata = Array(Array("name"=>"alkulaulu", "category"=>"alkulaulu","value"=>""),
                          Array("name"=>"Päivän laulu", "category"=>"päivän laulu","value"=>""));

        $tablecontent = new SongDataTable($this->templatepath, $songdata);
        $this->songlistcontent->Set("singlesongs", $tablecontent->Output());
        $this->layout->Set("content", $this->songlistcontent->Output());
        $this->assertRegExp('/type="text" name="alkulaulu"/', $this->layout->Output());
    }
    
    public function testWorshipSongs()
    {

        $songdata = Array(Array("name"=>"ws1","category"=>"Ylistyslaulu 1","value"=>""));

        $tablecontent = new SongDataTable($this->templatepath, $songdata);
        $this->songlistcontent->Set("worshipsongs", $tablecontent->Output());
        $this->layout->Set("content", $this->songlistcontent->Output());
        $this->assertRegExp('/type="text" name="ws1"/', $this->layout->Output());
    }

    public function testSingleSongsWithDbData()
    {

        //$songdata = $this->con->q("SELECT ")

    }

}




?>
