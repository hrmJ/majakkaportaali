
<?php 

require 'vendor/autoload.php';
 
use Medoo\Medoo;
use PHPUnit\Framework\TestCase;


/**
 * @covers DbCon
 */
class DbTest extends TestCase
{

    /**
     * Testaa, että tietokantaan voi yhdistää
     */
    public function testConnectToDb()
    {
        $config = parse_ini_file("config.ini");
        $database = new Medoo([
        'database_type' => 'mysql',
        'database_name' => $config["dbname"],
        'server' => 'localhost',
        'username' => $config["un"],
        'password' => $config["pw"],
        ]);
        $this-> assertInstanceOf(Medoo::class,$database);
    }



}



?>
