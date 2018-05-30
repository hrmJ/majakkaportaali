
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
        $songlist->LoadSongSlots();
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
        #var_dump($songlist->GetTitles("a"));
        $this->assertTrue(sizeof($songlist->GetTitles("Ukk"))>0);
    }

    /**
     * Testaa testata laulun nimen löytymistä
     */
    public function testCheckSongTitle()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        #var_dump($songlist->GetTitles("a"));
        $this->assertTrue($songlist->CheckTitle("Ukko Nooa"));
        $this->assertFalse($songlist->CheckTitle("lkjsadlasd"));
        $this->assertFalse($songlist->CheckTitle(""));
    }


    /**
     * Testaa kontin sisäisten slottien latausta
     */
    public function testLoadSlotsToCont()
    {
        $songlist = new Songlist($this->con, 2, $this->m);
        $songlist->LoadSlotsToCont("alkulaulu");
    }

}



?>
