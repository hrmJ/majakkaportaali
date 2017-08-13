
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class SongListTests extends TestCase
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
        $this->page = new SongPage($this->templatepath, 10);
    }


    public function testSetSingleSongData(){
    
        $this->page->SetSingleSongs();
        $this->assertRegExp('/name="alkulaulu"/', $this->page->Output());
    }


    public function testSetWsAndComSongs()
    {
        $this->page->SetMultiSongs(Array("com","ws"));
        $this->assertRegExp('/name="ws_1"/', $this->page->Output());
        $this->assertRegExp('/name="com_1"/', $this->page->Output());
    }


    public function testOutPutPage()
    {
        $this->assertRegExp('/Laulujen syöttö/', $this->page->OutputPage());
    }

    public function testLiturgicalSongs()
    {
        $this->page->SetLiturgicalSongs(Array("jumalan_karitsa","pyha"));
        $this->assertRegExp('/<option.*Jumalan karitsa \(/', $this->page->Output());
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
        $songs->OutputSongInfo("Virsi 001", "title");
        $this->assertArrayHasKey("verses",$songs->songcontent);
    }

    public function testAddLyrics(){
        $songs = new SongData($this->con);
        $songs->ProcessEditedLyrics("Ihan uusi laulu", "Heippa vaan, laalaalaa", "title");
        $songs->OutputSongInfo("Ihan uusi laulu", "title");
        $this->assertRegExp('/Heippa vaan/', $songs->songcontent["verses"]);
    }

    public function testEditLyrics(){
        $songs = new SongData($this->con);
        $songs->ProcessEditedLyrics("Virsi 001", "Hoosianna, TAAvetin POIKA\n\n Hoosiaaaanna, joossokijoaisjoi\n Hoosiaanna...alskdjasldkj, hOOoss\n\n", "title");
        $songs->OutputSongInfo("Virsi 001", "title");
        $this->assertRegExp('/TAAvetin POIKA/', $songs->songcontent["verses"]);
    }

    /***
     *
     * Testaa, onnistuuko nykyistä lähimmän päivämäärän hakeminen.
     *
     */
    public function testLoadWithoutId(){
        $date = new DateTime('2017-01-01');
        $date = $date->format('Y-m-d');
        $closestid = GetIdByDate($this->con, $date);
        $this->assertEquals($closestid,"1");

        $date = new DateTime('2017-02-06');
        $date = $date->format('Y-m-d');
        $closestid = GetIdByDate($this->con, $date);
        $this->assertEquals($closestid,"1");

        $date = new DateTime('2017-03-20');
        $date = $date->format('Y-m-d');
        $closestid = GetIdByDate($this->con,$date);
        $this->assertEquals($closestid,"6");

        $date =  new DateTime('2017-03-21');
        $date = $date->format('Y-m-d');
        $closestid = GetIdByDate($this->con,$date);
        $this->assertEquals($closestid,"7");

        $date = new DateTime('2021-03-21');
        $date = $date->format('Y-m-d');
        $closestid = GetIdByDate($this->con,$date);
        $this->assertEquals($closestid,"10");

    }

    public function testAlphabetSelect(){
        $this->page->SetSongViewElements();
        $this->assertRegExp('/Virsi \d+ - Virsi \d+/', $this->page->Output());
    }


}




?>
