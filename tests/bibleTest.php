
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\BibleLoader;


/**
 */
class BibleTest extends TestCase
{

    protected function SetUp(){
        $config = parse_ini_file("config.ini");
        $database = new Medoo([
        'database_type' => 'mysql',
        'database_name' => 'bibles',
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
        $loader = new BibleLoader("nt", $this->con);
        $this->assertInstanceOf(BibleLoader::class, $loader);
    }

    /**
     * Testaa kirjojen nimien lataamista
     */
    public function testLoadBookNames()
    {
        $loader = new BibleLoader("nt", $this->con);
        $loader->LoadBooknames();
        $this->assertTrue(in_array("Matt", $loader->GetData()));
    }

    /**
     * Testaa lukujen nimien lataamista
     */
    public function testLoadChapters()
    {
        $loader = new BibleLoader("nt", $this->con);
        $loader->LoadChapters("Matt");
        $this->assertTrue(sizeof($loader->GetData())==28);
    }

    /**
     * Testaa jakeiden nimien lataamista
     */
    public function testLoadVerses()
    {
        $loader = new BibleLoader("nt", $this->con);
        $loader->LoadVerses("Matt",1);
        $this->assertTrue(sizeof($loader->GetData())==25);
    }

}



?>
