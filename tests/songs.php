
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
        $this->songslistcontent = new Template("$this->templatepath/songlist.tpl");
    }


    public function testSingleSongs()
    {

        $songdata = Array(Array("category"=>"alkulaulu","value"=>""),
                             Array("category"=>"päivän laulu","value"=>""));

        $tablecontent = new SongDataTable($this->templatepath, $songdata);
        $this->songslistcontent->Set("singlesongs", $tablecontent->Output());
        $this->layout->Set("content", $this->songslistcontent->Output());
        $this->assertRegExp('/type="text" name="alkulaulu"/', $this->layout->Output());
    }
    
    public function testWorshipSongs()
    {

        $songdata = Array(Array("category"=>"Ylistyslaulu 1","value"=>""));

        $tablecontent = new SongDataTable($this->templatepath, $songdata);
        $this->songslistcontent->Set("worshipsongs", $tablecontent->Output());
        $this->layout->Set("content", $this->songslistcontent->Output());
        $this->assertRegExp('/type="text" name="alkulaulu"/', $this->layout->Output());
    }


}




?>
