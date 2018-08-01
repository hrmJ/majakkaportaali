
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\slides\SlideStyle;


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
    public function testCreateStyleObject()
    {
        $style = new SlideStyle($this->con);
        $this->assertInstanceOf(SlideStyle::class,$style);
    }


    /**
     *
     * Testaa ladata css-luokat
     *
     */
    public function testLoadClassNames()
    {
        $style = new SlideStyle($this->con);
        $data = $style->LoadSlideClassNames();
        $this->assertTrue(!empty($data));
    }


    /**
     * Testaa ladata tyylit merkkijonona
     */
    public function testLoadStylesAsString()
    {
        $style = new SlideStyle($this->con);
        $attrs = $style->GetStylesAsString(".Teksti");
        $this->assertTrue(!empty($attrs));
    }


    /**
     *
     * Testaa ladata kaikki tyylit 
     *
     */
    public function testLoadAllStyles()
    {
        $style = new SlideStyle($this->con);
        $style->LoadAllStyles();
        $this->assertTrue(!empty($style->html));
    }


    /**
     *
     * Testaa ladata kaikki stylsheetit
     *
     */
    public function testLoadAllStyleSheets()
    {
        $style = new SlideStyle($this->con);
        $data = $style->LoadAllStyleSheets();
        $this->assertTrue(!empty($data));
    }



    /**
     *
     * Testaa ladata kaikki tyylit 
     *
     */
    public function testLoadStylesAsArrayOfStrings()
    {
        $style = new SlideStyle($this->con);
        $data = $style->LoadAllStylesAsArrayOfStrings();
        $this->assertTrue(!empty($data));
    }


    /**
     *
     */
    public function testTemporary()
    {
        $existing = $this->con->select("styles","*",["classname" => ".Teksti"]);
        if(!$existing){
            echo "NOOOO\n";
        }
    }


}



?>
