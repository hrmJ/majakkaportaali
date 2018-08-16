
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

    /**
     *
     * Testaa, että messujen lisäminen onnistuu
     *
     */
    public function testSaveNewServices() {
        $community= new Community($this->con);
        $community->SaveNewServices(["2018-12-30"]);
    }


    /**
     *
     * Testaa, että vastuiden lis'äminen onnistuu
     *
     */
    public function testSaveNewResponsibilities() {
        $community= new Community($this->con);
        $community->SaveNewResponsibility("TESTIvastuu", "MOROvaan selitys");
        $tv = $this->con->get("responsibilities_meta","description",
            ["responsibility" => "TESTIvastuu"]);
        $this->assertEquals($tv, "MOROvaan selitys");
            
    }
}



?>
