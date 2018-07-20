
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
    public function testLoadBookNames() {
        $loader = new BibleLoader("nt", $this->con);
        $booknames = $loader->LoadBooknames();
        $this->assertTrue(in_array("Matt", $loader->GetData()));
    }

//    /**
//     * Testaa lukujen nimien lataamista
//     */
//    public function testLoadChapterNames()
//    {
//        $loader = new BibleLoader("nt", $this->con);
//        $booknames = $loader->LoadChapters();
//        $this->assertTrue(in_array("Matt", $loader->GetData()));
//    }

}



?>
