
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\data\InfoSegmentSaver;
use Portal\data\SongSegmentSaver;
use Portal\data\ServiceStructureLoader;
use Portal\data\ServiceDataLoader;
use Portal\data\SongLoader;
use Portal\data\SongSegmentLoader;
use Portal\data\InfoSegmentLoader;
use Portal\data\BibleSegmentLoader;
use Portal\data\BibleLoader;


/**
 */
class ServicedataTest extends TestCase
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
     * Testaa yleislataajan luonti
     */
    public function testCreateObject()
    {
        $loader = new ServiceDataLoader($this->con);
        $this-> assertInstanceOf(ServiceDataLoader::class,$loader);
    }

    /**
     * Testaa lauludatan lataajan luonti
     */
    public function testCreateSongLoaderObject()
    {
        $loader = new SongLoader("Ukko Nooa", $this->con);
        $this-> assertInstanceOf(SongLoader::class,$loader);
    }

    /**
     * Testaa laulusegmenttien lataajan luonti
     */
    public function testCreateSongSegmentLoaderObject()
    {
        $loader = new SongSegmentLoader($this->con);
        $this-> assertInstanceOf(SongSegmentLoader::class,$loader);
    }


    /**
     * Testaa laulusegmenttien tallentajan luonti
     */
    public function testSongSegmentSaver()
    {
        $loader = new SongSegmentSaver($this->con,["slot_number"=>1,
            "slot_name"=>"Testilaulu",
            "restricted_to"=>NULL,
            "multiname"=>NULL,
            "slideclass"=>"",
            "addedclass"=>"",
            "description"=>"Tää on se laulu, joka lauletaan aina aluksi"]);
        $this-> assertInstanceOf(SongSegmentSaver::class,$loader);
    }

    /**
     * Testaa laulusegmenttien tallentajan luonti ja id:n haku
     */
    public function testSongSegmentSaverGetId()
    {
        $loader = new SongSegmentSaver($this->con,["slot_number"=>1,
            "slot_name"=>"Testilaulu",
            "restricted_to"=>NULL,
            "multiname"=>NULL,
            "slideclass"=>"",
            "addedclass"=>"",
            "description"=>"Tää on se laulu, joka lauletaan aina aluksi"]);
        $loader->SetContentId();
        $this->assertTrue($loader->content_id > 0);
    }


    /**
     * Testaa laulusegmenttien tallentajan luonti ja id:n haku, kun jokin olemassaoleva
     */
    public function testSongSegmentSaverGetIdAndUpdate()
    {
        $loader = new SongSegmentSaver($this->con,["slot_number"=>1,
            "slot_name"=>"Testilaulu",
            "restricted_to"=>NULL,
            "multiname"=>NULL,
            "slideclass"=>"",
            "addedclass"=>"",
            "description"=>"Tää on se laulu, joka lauletaan aina aluksi"]);
        $loader->SetContentId();
        $loader->SetSlotData();
    }

    /**
     * Testaa laulusegmenttien tallentajan luonti
     */
    public function testInfoSegmentSaver()
    {
        $loader = new InfoSegmentSaver($this->con,["imgname"=>"laksjd","imgpos"=>"","slot_number"=>1,"slot_name"=>"","restricted_to"=>"","multiname"=>"","slideclass"=>"","addedclass"=>"","description"=>"","maintext"=>"","header"=>"","genheader"=>"","subgenheader"=>""]);
        $this-> assertInstanceOf(InfoSegmentSaver::class,$loader);
    }
    
    /**
     * Testaa infosegmenttien lataajan luonti
     */
    public function testCreateInfoSegmentLoaderObject()
    {
        $loader = new InfoSegmentLoader($this->con);
        $this-> assertInstanceOf(InfoSegmentLoader::class,$loader);
    }

    /**
     * Testaa raamattusegmenttien lataajan luonti
     */
    public function testCreateBibleSegmentLoaderObject()
    {
        $loader = new BibleSegmentLoader($this->con);
        $this-> assertInstanceOf(BibleSegmentLoader::class,$loader);
    }

    /**
     * Testaa raamattusegmenttien lataajan luonti
     */
    public function testCreateBibleLoaderObject()
    {
        $loader = new BibleLoader("nt", $this->con);
        $this-> assertInstanceOf(BibleLoader::class,$loader);
    }



}



?>
