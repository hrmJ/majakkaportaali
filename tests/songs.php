
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
        $this->con = new SongCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
        $this->season = GetCurrentSeason($this->con);
        $this->layout = new Template("$this->templatepath/layout.tpl");
        $this->layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
        $this->songlistcontent = new Template("$this->templatepath/songlist.tpl");
    }


    public function testSingleSongs()
    {

        $songdata = Array(Array("songtype"=>"alkulaulu", "song_title"=>""),
                          Array("songtype"=>"Päivän laulu", "song_title"=>""));

        $tablecontent = new SongDataTable($this->templatepath, $songdata);
        $this->songlistcontent->Set("singlesongs", $tablecontent->Output());
        $this->layout->Set("content", $this->songlistcontent->Output());
        $this->assertRegExp('/type="text" name="alkulaulu"/', $this->layout->Output());
    }
    
    public function testSingleSongsWithDbData()
    {
        $id = 2;
        $singlesongs = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype in ('alkulaulu','paivanlaulu','loppulaulu')",Array("sid"=>$id));
        $wssongs = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));
        $comsongs = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'com'",Array("sid"=>$id));
        $this->assertTrue(sizeof($singlesongs)>2);
        $this->assertTrue(sizeof($wssongs)>2);
        $this->assertTrue(sizeof($comsongs)>2);
        $this->assertArrayHasKey("songtype", $singlesongs[0]);

    }

    public function testSaveSongData()
    {
        $id = 2;
        $fakepost = Array("alkulaulu"=>"Virsi 001", "paivanlaulu"=> "Virsi 012", "loppulaulu"=> "Virsi 033", "ws_1"=> "Virsi 011", "ws_2"=> "Virsi 029", "ws_3"=> "Virsi 028", "com_1"=> "Virsi 006", "com_2"=> "Virsi 002", "com_3"=> "Virsi 018", "savesongs"=> "Tallenna");
        $this->con->SaveData($id, $fakepost);
        $songs = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));
        foreach($songs as $song){
            //if($song[])
        }
        var_dump($wssongs);
        //$this->assertTrue(sizeof($comsongs)>2);
    }

}




?>
