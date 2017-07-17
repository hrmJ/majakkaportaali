
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
        $this->assertRegExp('/name="alkulaulu"/', $this->layout->Output());
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
        $fakepost = Array("alkulaulu"=>"Panhuilun solinaa", "paivanlaulu"=> "Jos kerran on niin...", "loppulaulu"=> "loppu nyt!", "ws_1"=> "Ultimate worship 1", "ws_2"=> "Ultimate ws 2", "ws_3"=> "Virsimuurista valo välähtää", "com_1"=> "Virsi 006", "com_2"=> "Virsi 002", "com_3"=> "Virsi 018", "savesongs"=> "Tallenna");
        $this->con->SaveData($id, $fakepost);
        $songs = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));

        $wssongs_in_db = Array();
        foreach($songs as $song){
            if($song["songtype"]=="ws"){
                $wssongs_in_db[] = $song["song_title"];
            }
        }
        $this->assertEquals("Ultimate worship 1", $wssongs_in_db[0]);
        $this->assertEquals("Virsimuurista valo välähtää", $wssongs_in_db[2]);

        $fakepost["ws_3"] = "Kiva laulu";
        $this->con->SaveData($id, $fakepost);
        $songs = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));

        $wssongs_in_db = Array();
        foreach($songs as $song){
            if($song["songtype"]=="ws"){
                $wssongs_in_db[] = $song["song_title"];
            }
        }
        $this->assertEquals("Kiva laulu", $wssongs_in_db[2]);

        $fakepost["ws_4"] = "Uusi laulu";
        $this->con->SaveData($id, $fakepost);
        $songs = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'ws'",Array("sid"=>$id));

        $wssongs_in_db = Array();
        foreach($songs as $song){
            if($song["songtype"]=="ws"){
                $wssongs_in_db[] = $song["song_title"];
            }
        }
        $this->assertEquals("Uusi laulu", $wssongs_in_db[3]);

        $alkulaulu = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'alkulaulu'",Array("sid"=>$id),"column");
        $this->assertEquals("Panhuilun solinaa", $alkulaulu);

    }

    public function testLoadListOfSongs(){
        $songs = new SongData($this->con);
        $songs->OutputSongTitles("irsi");
        $this->assertTrue(sizeof($songs->titleslist)>10);
    }

    public function testLoadSongInfo(){
        $songs = new SongData($this->con);
        $songs->OutputSongInfo("Virsi 001");
        $this->assertArrayHasKey("verses",$songs->songcontent);
    }

    public function testEditLyrics(){
        $songs = new SongData($this->con);
        $songs->ProcessEditedLyrics("Virsi 001", "Hoosianna, TAAvetin POIKA\n\n Hoosiaaaanna, joossokijoaisjoi\n Hoosiaanna...alskdjasldkj, hOOoss\n\n");
        $songs->OutputSongInfo("Virsi 001");
        $this->assertRegExp('/TAAvetin POIKA/', $songs->songcontent["verses"]);
    }

}




?>
