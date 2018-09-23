
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Structure;
use Portal\slides\Slide;
use Portal\slides\Song;


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
        $database_bible = new Medoo([
            'database_type' => 'mysql',
            'database_name' => 'bibles',
            'server' => 'localhost',
            'username' => $config["un"],
            'password' => $config["pw"],
            'charset' => 'utf8'
        ]);
        $this->con = $database;
        $this->biblecon = $database_bible;
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
        $struct->PrintStructure();
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


#    /**
#     * Testaa, että tietokannassa olevien kuvien lataus onnistuu
#     */
#    public function testLoadSlideImageNamaes()
#    {
#        $struct = new Structure($this->con, $this->m);
#        $this->assertTrue(sizeof($struct->LoadSlideImageNames())>0);
#    }
#
    /**
     * Testaa, että infodian tallentaminen onnistuu
     */
#    public function testSaveInfoSlide()
#    {
#        $struct = new Structure($this->con, $this->m);
#        $params = [
#            "maintext" =>  "Tällanen info nyt sitten!",
#            "header" => "Infoa",
#            "genheader" => NULL,
#            "subgenheader" => NULL,
#            "imgname" => NULL,
#            "imgposition" => "left"
#            ];
#        $struct->UpdateSlide($this->con->max("infosegments","id"), "infosegments", $params);
#        $newinfo = $struct->LoadSlide($this->con->max("infosegments","id"), "infosegments");
#        $this->assertRegExp("/Tällanen info/",$newinfo["maintext"]);
#    }

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
        //$this->con->delete("songsegments",["id"=>$this->con->max("songsegments","id")]);
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
        $params = $this->con->select("presentation_structure",["slot_name","addedclass"],["id" => 1]);
    }


    /**
     *
     */
    public function testslideobjet()
    {
        $slide = new Slide($this->m, []);
        $this->assertinstanceof(Slide::class, $slide);
    }


    /**
     *
     */
    public function testSongSlideObject()
    {
        $slide = new Song($this->m, [], "", "", "");
        $this->assertinstanceof(Slide::class, $slide);
    }


    /**
     * Testaa ladata diasegmentit
     */
    public function testLoadSlideSegments()
    {
        $struct = new Structure($this->con, $this->m, $this->biblecon);
        $struct->SetAsServiceSpecific(87);
        $struct->LoadSlidesForPresentation()->InjectData();
        echo $struct->slotstring;
    }

    /**
     * Testaa päivittää tyylipohja
     */
    public function testUpdateHeaderTemplate()
    {
        $struct = new Structure($this->con, $this->m);
        $struct->UpdateHeaderTemplate(1,["maintext"=>"TÖTTÖRÖÖ"]);
        $id = $this->con->get("headers","maintext", ["id" => 1]);
        $this->assertTrue($id == "TÖTTÖRÖÖ");
    }

    /**
     *
     * Testaa mainosdiojen lataus
     *
     */
    public function testGetInfos()
    {
        $struct = new Structure($this->con, $this->m);
        $struct->GetInfos();
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
