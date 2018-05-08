
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
     * Testaa messukohtaisen rakenteen lataamista tietokannasta
     */
    public function testLoadServiceSpecificStructure()
    {
        $service = new Service($this->con, 2);
        $service->LoadStructure();
    }

}



?>
