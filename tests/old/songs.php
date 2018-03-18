
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



    public function testOutPutPage()
    {
        $this->assertRegExp('/Laulujen syöttö/', $this->page->OutputPage());
    }



    //public function testLoadListOfSongs(){
    //    $songs = new SongData($this->con);
    //    $songs->OutputSongTitles("irsi");
    //    $this->assertTrue(sizeof($songs->titleslist)>10);
    //}

    //public function testLoadSongInfo(){
    //    $songs = new SongData($this->con);
    //    $songs->OutputSongInfo("Virsi 001", "title");
    //    $this->assertArrayHasKey("verses",$songs->songcontent);
    //}

    //public function testAddLyrics(){
    //    $songs = new SongData($this->con);
    //    $songs->ProcessEditedLyrics("Ihan uusi laulu", "Heippa vaan, laalaalaa", "title");
    //    $songs->OutputSongInfo("Ihan uusi laulu", "title");
    //    $this->assertRegExp('/Heippa vaan/', $songs->songcontent["verses"]);
    //}

    //public function testEditLyrics(){
    //    $songs = new SongData($this->con);
    //    $songs->ProcessEditedLyrics("Virsi 001", "Hoosianna, TAAvetin POIKA\n\n Hoosiaaaanna, joossokijoaisjoi\n Hoosiaanna...alskdjasldkj, hOOoss\n\n", "title");
    //    $songs->OutputSongInfo("Virsi 001", "title");
    //    $this->assertRegExp('/TAAvetin POIKA/', $songs->songcontent["verses"]);
    //}

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

    //public function testAlphabetSelect(){
    //    $this->page->SetSongViewElements();
    //    $this->assertRegExp('/Virsi \d+ - Virsi \d+/', $this->page->Output());
    //}

    public function testLoadSongTypes(){
        $this->page->id = 2;
        $this->page->LoadSongTypes();
        $this->assertRegExp("/songslot/",$this->page->Output());
    }


   public function testLoadRestrictedSong(){
       $this->page->LoadSongTypes();
       $this->assertRegExp("/select/",$this->page->Output());
   }


}




?>
