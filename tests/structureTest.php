
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Structure;


/**
 */
class StructureTest extends TestCase{

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
     * Testaa rakenneolion luonti
     */
    public function testCreateObject()
    {
        $service = new Structure($this->con, $this->m);
        $this->assertInstanceOf(Structure::class,$service);
    }

    /**
     * Testaa, että slottien lataaminen onnistuu
     */
    public function testLoadSlots()
    {
        $struct = new Structure($this->con, $this->m);
        $struct->LoadSlots();
        $this->assertRegExp("/<div/", $struct->slotstring);
    }

    /**
     * Testaa, että slottien lataaminen onnistuu messuspesifisti
     */
    public function testLoadSlotsForService()
    {
        $struct = new Structure($this->con, $this->m);
        $struct->LoadSlots(2);
        $this->assertRegExp("/<div/", $struct->slotstring);
    }

    /**
     * Testaa, että infodian lataaminen onnistuu
     */
    public function testLoadInfoSlide()
    {
        $struct = new Structure($this->con, $this->m);
        $this->assertTrue(sizeof($struct->LoadInfoSlide(1))>0);
    }

    /**
     * Testaa, että infodian lataaminen onnistuu
     */
    public function testLoadSongSlide()
    {
        $struct = new Structure($this->con, $this->m);
        $this->assertTrue(sizeof($struct->LoadSongSlide(1))>0);
    }

    /**
     * Testaa, että dialuokkien nimien lataaminen onnistuu
     */
    public function testLoadSlideClassNames()
    {
        $struct = new Structure($this->con, $this->m);
        $this->assertTrue(sizeof($struct->LoadSlideClassNames())>0);
    }

}



?>
