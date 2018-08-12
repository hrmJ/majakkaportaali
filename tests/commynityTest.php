
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Community;


/**
 */
class CommunityTest extends TestCase
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
    }

    /**
     * Testaa, että kommenttiolion voi luoda
     */
    public function testCreateObject()
    {
        $community= new Community($this->con);
        $this-> assertInstanceOf(Community::class, $community);
    }

    /**
     * Testaa, että vastuiden listan voi tulostaa
     */
    public function testGetResponsibilities()
    {
        $community= new Community($this->con);
        $this->assertTrue(sizeof($community->GetListOfResponsibilities())>0);
    }

    /**
     * Testaa, että vastuiden listan voi tulostaa
     */
    public function testGetResponsibilitymeta()
    {
        $community= new Community($this->con);
        $meta = $community->GetResponsibilityMeta("diat");
        $this->assertTrue(sizeof($meta)>0);
    }

    /**
     *
     * Testaa, että vastuiden listan voi tulostaa
     *
     */
    public function testGetSeasonlist()
    {
        $community= new Community($this->con);
        $meta = $community->GetListOfSeasons();
        $this->assertTrue(sizeof($meta)>0);
        #$community->RemoveService(3);
    }

    /**
     *
     * Testaa, että nykyisen kauden hakeminen onnistuu
     *
     */
    public function testGetCurrentSeason()
    {
        $community= new Community($this->con);
        $season = $community->GetCurrentSeason("2018-03-02");
        $this->assertRegexp("/testsea/", $season["name"]);
    }

}



?>
