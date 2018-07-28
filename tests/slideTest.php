
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\slides\Loader;


/**
 */
class SlideTest extends TestCase
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
     * Testaa perittävän olion luonti
     */
    public function testCreateLoaderObject()
    {
        $loader= new Loader($this->con);
        $this-> assertInstanceOf(Loader::class,$loader);
    }


    /**
     * Testaa perittävän olion luonti
     */
    public function testCreateLoaderObject()
    {
        $loader= new Loader();
        $this-> assertInstanceOf(ServiceLoader::class,$loader);
    }

}



?>
