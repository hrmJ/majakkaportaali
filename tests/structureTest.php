
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Structure;


/**
 */
class StructureTest extends TestCase{

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
     * Testaa rakenneolion luonti
     */
    public function testCreateObject()
    {
        $service = new Structure($this->con, $this->m);
        $this->assertInstanceOf(Structure::class,$service);
    }

    /**
     * Testaa, että slottien lataaminen onnistuu
     */
    public function testLoadSlots()
    {
        $struct = new Structure($this->con, $this->m);
        $struct->LoadSlots();
        $this->assertRegExp("/<div/", $struct->slotstring);
    }

    /**
     * Testaa, että slottien lataaminen onnistuu messuspesifisti
     */
    public function testLoadSlotsForService()
    {
        $struct = new Structure($this->con, $this->m);
        $struct->LoadSlots(2);
        $this->assertRegExp("/<div/", $struct->slotstring);
    }

    /**
     * Testaa, että infodian lataaminen onnistuu
     */
    public function testLoadInfoSlide()
    {
        $struct = new Structure($this->con, $this->m);
        $this->assertTrue(sizeof($struct->LoadSlide($this->con->max("infosegments","id"), "infosegments"))>0);
    }

    /**
     * Testaa, että infodian lataaminen onnistuu
     */
    public function testLoadSongSlide()
    {
        $struct = new Structure($this->con, $this->m);
        $this->assertTrue(sizeof($struct->LoadSlide($this->con->max("songsegments","id"),"songsegments"))>0);
    }

    /**
     * Testaa, että dialuokkien nimien lataaminen onnistuu
     */
    public function testLoadSlideClassNames()
    {
        $struct = new Structure($this->con, $this->m);
        $this->assertTrue(sizeof($struct->LoadSlideClassNames())>0);
    }

    /**
     * Testaa, että tietokannassa olevien kuvien lataus onnistuu
     */
    public function testLoadSlideImageNamaes()
    {
        $struct = new Structure($this->con, $this->m);
        $this->assertTrue(sizeof($struct->LoadSlideImageNames())>0);
    }

    /**
     * Testaa, että infodian tallentaminen onnistuu
     */
    public function testSaveInfoSlide()
    {
        $struct = new Structure($this->con, $this->m);
        $params = [
            "maintext" =>  "Tällanen info nyt sitten!",
            "header" => "Infoa",
            "genheader" => NULL,
            "subgenheader" => NULL,
            "imgname" => NULL,
            "imgposition" => "left"
            ];
        $struct->UpdateSlide($this->con->max("infosegments","id"), "infosegments", $params);
        $newinfo = $struct->LoadSlide($this->con->max("infosegments","id"), "infosegments");
        $this->assertRegExp("/Tällanen info/",$newinfo["maintext"]);
    }

    /**
     * Testaa, että uuden infodian syöttäminen onnistuu
     */
    public function testInsertInfoSlide()
    {
        $struct = new Structure($this->con, $this->m);
        $params = [
            "maintext" =>  "Ihan uusi info",
            "header" => "Infoa",
            "genheader" => NULL,
            "subgenheader" => NULL,
            "imgname" => NULL,
            "imgposition" => "left",
            ];
        $oldmax = $this->con->max("infosegments","id");
        $struct->InsertSlide($params, "infosegments");
        $newmax = $this->con->max("infosegments","id");
        $this->assertGreaterThan($oldmax, $newmax);
    }

    /**
     * Testaa, että uuden messuslotin syöttäminen onnistuu
     */
    public function testInsertNewSlot()
    {
        $struct = new Structure($this->con, $this->m);
        $params = [
            "slot_name" => "Tervetulosanat",
            "slot_type" => "infosegment",
            "id_in_type_table" => NULL,
            "addedclass" => ".Teksti",
            "header_id" => 0,
            "content_id" => 1,
            ];
        $oldmax = $this->con->max("presentation_structure","id");
        $struct->InsertNewSlot($params);
        $newmax = $this->con->max("presentation_structure","id");
        $this->assertGreaterThan($oldmax, $newmax);
    }

    /**
     * Testaa, että lauludian tallentaminen onnistuu
     */
    public function testSaveSongSlide()
    {
        $struct = new Structure($this->con, $this->m);
        $params = [
            "songdescription" =>  "Tällanen laulu nyt sitten!",
            "restrictedto" =>  NULL,
            "singlename" =>  "testilaulu",
            "multiname" =>  NULL
            ];
        $struct->UpdateSlide($this->con->max("songsegments","id"), "songsegments", $params);
        $newinfo = $struct->LoadSlide($this->con->max("songsegments","id"), "songsegments");
        $this->assertRegExp("/Tällanen laulu/",$newinfo["songdescription"]);
        $this->con->delete("songsegments",["id"=>$this->con->max("songsegments","id")]);
    }



    /**
     * Testaa, että slottien järjestyksen korjaaminen sujuu
     */
    public function testUpdateSlotOrder()
    {
        $struct = new Structure($this->con, $this->m);
        $struct->RefreshSlotOrder();
        $this->con->delete("presentation_structure",["slot_name" => "Testilaulu"]);
        $this->con->delete("presentation_structure",["slot_name" => "Tervetulosanat"]);
    }


    ///**
    // * Testaa, että slottien uuden järjestyksen tallentaminen sujuu
    // */
    //public function testSaveNewSlotOrder()
    //{
    //    $struct = new Structure($this->con, $this->m);
    //    $struct->UpdateSlotOrder();
    //    $this->con->delete("presentation_structure",["slot_name" => "Testilaulu"]);
    //    $this->con->delete("presentation_structure",["slot_name" => "Tervetulosanat"]);
    //}

}



?>
