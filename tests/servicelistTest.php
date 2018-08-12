
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Servicelist;


/**
 */
class ServicelistTest extends TestCase
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
        $servicelist = new Servicelist($this->con);
        $this->assertInstanceOf(Servicelist::class, $servicelist);
    }



    /**
     * Testaa vaihtaa kautta
     */
    public function testSwitchCurrentSeason()
    {
    }


    /**
     * Testaa hakea tämän kauden kaikki messut
     */
    public function testListServices()
    {
        $servicelist = new Servicelist($this->con);
        $servicelist->SetSeason("2018-01-01","2019-01-01");
        $services = $servicelist->ListServices();
        $this->assertTrue(sizeof($services)>0);
    }

    /**
     * Testaa hakea tämän kauden kaikki messut filtteröitynä
     */
    public function testListServicesFilteredBy()
    {
        $servicelist = new Servicelist($this->con);
        $servicelist->SetSeason("2018-01-01","2018-05-01");
        $result = $servicelist->ListServicesFilteredBy("diat");
    }



}



?>
