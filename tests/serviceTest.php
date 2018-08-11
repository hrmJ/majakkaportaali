
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Service;


/**
 */
class ServiceTest extends TestCase
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
     * Testaa messuolion luonti
     */
    public function testCreateObject()
    {
        $service= new Service($this->con, 2);
        $this-> assertInstanceOf(Service::class,$service);
    }


    /**
     * Testaa messun aiheen hakeminen
     */
    public function testFetchTheme()
    {
        $service = new Service($this->con, 2);
        $this->assertTrue(!empty($service->GetTheme()));
    }


    /**
     * Testaa messun vastuunkantajien hakeminen
     */
    public function testFetchResponsibles()
    {
        $service = new Service($this->con, 2);
        $this->assertTrue(sizeof($service->GetResponsibles())>1);
    }

    /**
     * Testaa messun vastuunkantajien tallentaminen / päivitys
     */
    public function testSaveResponsibles()
    {
        $service = new Service($this->con, 2);
        $service->SaveResponsibles([
            ["responsibility"=>"juontaja",
           "responsible" => "Jari Kurri"] ,
            ["responsibility"=>"liturgi",
           "responsible" => "Kille K."] ,
        ]);
        $this->assertTrue(sizeof($service->GetResponsibles())>1);
    }

    /**
     * Testaa messun perustietojen tallentaminen
     */
    public function testSaveDetails()
    {
        $service = new Service($this->con, 2);
        $service->SaveDetails([
            ["type"=>"theme",
             "value" => "Teeemaa"] 
        ]);
        $this->assertTrue($service->GetTheme() == "Teeemaa"); 
    }

    /**
     *
     * Testaa yhden tietyn messun laulujen tallentamista
     *
     */
    public function testSaveServiceSongs()
    {
        $service = new Service($this->con, 2);
        $service->SaveSongs([
                    ["song_id" => 2,
                    "song_title" => "Ukko Nooa",
                    "songtype" => "Alkulaulu"],
                    ["song_id" => 3,
                    "song_title" => "Satu meni saunaan",
                    "songtype" => "Alkulaulu"]
        ]);
        $this->assertTrue(sizeof($this->con->select("servicesongs", "song_id", [
            "songtype" => "Alkulaulu"
        ]))>0);
    }

    /**
     *
     * Testaa yhden tietyn messun raamatunkohtien lataamista
     *
     */
    public function testLoadBibleSegments()
    {
        $service = new Service($this->con, 2);
        $slots = $service->GetBibleSegments();
        $this->assertTrue(sizeof($slots)>0);
    }


    /**
     *
     * Testaa yhden tietyn messun raamatunkohtien sisällön lataamista
     *
     */
    public function testLoadBibleSegmentContent()
    {
        $service = new Service($this->con, 2);
        $slots = $service->GetBibleSegmentsContent();
        $this->assertTrue(sizeof($slots)>0);
    }


    /**
     *
     * Testaa yhden tietyn messun aiheen ja päivän muuttamista
     *
     */
    public function testChangeDateTheme()
    {
        $service = new Service($this->con, 1);
        $service->SaveThemeAndDate(["servicedate" => "2018/02/10", "theme" => "Kaihdettu teema"]);
        $theme = $service->GetTheme();
        $this->assertEquals($theme,"Kaihdettu teema");
    }


}



?>
