
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Songlist;


/**
 */
class SongsTest extends TestCase
{

    protected function SetUp(){
        $config = parse_ini_file("config.ini");
        $database = new Medoo([
        'database_type' => 'mysql',
        'database_name' => $config["dbname"],
        'server' => 'localhost',
        'username' => $config["un"],
        'password' => $config["pw"],
        'charset' => 'utf8'
        ]);
        $this->con = $database;
        $this->m = new Mustache_Engine(array(
            'loader' => new Mustache_Loader_FilesystemLoader(__DIR__ . '/../src/views')
            ));
    }

    /**
     * Testaa, että olion voi luoda
     */
    public function testCreateObject()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $this-> assertInstanceOf(Songlist::class, $songlist);
    }

    /**
     * Testaa, että yhden messun laulut voi hakea
     */
    public function testLoadSongTypes()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $songlist->LoadSongSlots(2);
        $this->assertRegExp("/slotcontainer/",$songlist->slots_as_string);
    }


    /**
     * Testaa aakkoslistan haku
     */
    public function testLoadAlpha()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $this->assertTrue(sizeof($songlist->GetAlphabets())>0);
    }


    /**
     * Testaa hakea yhden kirjaimen kaikki laulut
     */
    public function testLoadByLetter()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $this->assertTrue(sizeof($songlist->GetTitlesByLetter("S"))>0);
    }

    /**
     * Testaa hakea kaikki laulujen nimet
     */
    public function testLoadSongTitles()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        #var_dump($songlist->GetTitles("Satu"));
        $this->assertTrue(sizeof($songlist->GetTitles("Ukk"))>0);
    }

    /**
     * Testaa testata laulun nimen löytymistä
     */
    public function testCheckSongTitle()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $this->assertTrue(sizeof($songlist->CheckTitle("Ukko Nooa"))>0);
        $this->assertFalse(sizeof($songlist->CheckTitle("lkjsadlasd"))>0);
        $this->assertFalse(sizeof($songlist->CheckTitle(""))>0);
    }


    /**
     * Testaa kontin sisäisten slottien latausta
     */
    public function testLoadSlotsToCont()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $songlist->LoadSlotsToCont("alkulaulu");
    }


    /**
     *
     * Testaa sanojen hakemista.
     *
     */
    public function testFetchLyrics()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $this->assertFalse(empty($songlist->FetchLyricsById(2)));
    }

    /**
     *
     * Testaa sanojen tallentamista.
     *
     */
    public function testSaveLyrics()
    {
        $verses = ["Eukko Nooa, Eukko Nooa oli kunnon emäntä.", 
            "kun hän meni saunaan, laittoi laukun naulaan", 
            "lalla laa l al al slkdja lskdj laksjd lakjdlakjdlkasj dlksajd"];
        $songlist = new Songlist($this->con, 2, $this->m);
        $songlist->SaveEditedLyrics(2, $verses);
        $verses = $songlist->FetchLyricsById(2);
        $this->assertRegExp("/Eukko/", $verses[0]["verse"]);
    }


    /**
     *
     * Testaa uusien sanojen tallentamista.
     *
     */
    public function testAddLyrics()
    {
        $verses = ["Eukko Nooa, Eukko Nooa oli kunnon emäntä.", 
            "kun hän meni saunaan, laittoi laukun naulaan", 
            "lalla laa l al al slkdja lskdj laksjd lakjdlakjdlkasj dlksajd"];
        $songlist = new Songlist($this->con, 2, $this->m);
        $songlist->AddLyrics("Testilaulu", $verses);
        $id = $this->con->max("songdata","id");
        $last_title = $this->con->get("songdata","title",["id"=>$id]);
        $this->assertTrue($last_title == "Testilaulu");
        if($last_title == "Testilaulu"){
            $this->con->delete("versedata",["song_id"=>$id]);
            $this->con->delete("songdata",["id"=>$id]);
        }

            $slots = $this->con->select("service_specific_presentation_structure", 
                "*",
                ['ORDER' => [ 'slot_number' => 'ASC' ]]);
        var_dump($slots);
    }


}



?>
