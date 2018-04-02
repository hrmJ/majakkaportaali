
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

}



?>
