
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\LoginController;


/**
 */
class LoginTest extends TestCase
{

    protected function SetUp(){
        $config = parse_ini_file("config.ini");
        $database = new Medoo([
        'database_type' => 'mysql',
        'database_name' => 'majakkaportaali',
        'server' => 'localhost',
        'username' => $config["un"],
        'password' => $config["pw"],
        'charset' => 'utf8'
        ]);

        $this->salt = $config["salt"];
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
        $controller = new LoginController($this->con, $this->salt);
        $this->assertInstanceOf(LoginController::class, $controller);
    }


    /**
     * Testaa, että oikeat tiedot tuottavat tuloksessaan kirjautumisen...
     */
    public function testLoginSuccess()
    {
        $controller = new LoginController($this->con, $this->salt);
        $this->assertTrue($controller->TryLogin("testikäyttäjä", "testisalasana"));
    }

    /**
     * ... ja että väärät eivät
     */
    public function testLoginFail()
    {
        $controller = new LoginController($this->con, $this->salt);
        $this->assertFalse($controller->TryLogin("testikäyttäjä", "testisalasanat"));
    }


}



?>
