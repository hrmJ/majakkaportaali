
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Medoo\Medoo;
use Portal\content\Comment;


/**
 */
class CommentTest extends TestCase
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
        $this->m = new Mustache_Engine(array(
            'loader' => new Mustache_Loader_FilesystemLoader(__DIR__ . '/../src/views')
            ));
    }

    /**
     * Testaa, että kommenttiolion voi luoda
     */
    public function testCreateObject()
    {
        $comment= new Comment($this->con, 2, $this->m);
        $this-> assertInstanceOf(Comment::class,$comment);
    }

    /**
     *
     * Testaa kommentin syöttäminen messutemplateen
     *
     **/
    public function testLoadCommentsToTemplate(){

        $comment= new Comment($this->con, 2, $this->m);
        $service = $this->m->loadTemplate('service'); 
        $this->assertRegExp("/class=.comment./",
            $service->render(Array("comments" => $comment->LoadAll())));

    }

    /**
     *
     * Testaa uuden kommentin tallentaminen tietokantaan
     *
     **/
    public function testSaveNewComment(){

        #var_dump($this->con->select("responsibilities", Medoo::raw('DISTINCT(responsibility)')));
        var_dump($this->con->query("SELECT DISTINCT responsibility FROM responsibilities")->fetchAll(PDO::FETCH_COLUMN));
        #$comment= new Comment($this->con, 2, $this->m);
        #$comment->SetTheme("yleinen")->SetReplyTo("")->SetContent
        ##uniqid()
        #$comment->Save();
        #$service = $this->m->loadTemplate('service'); 
        #$this->assertRegExp("/class=.comment./",
        #    $service->render(Array("comments" => $comment->LoadAll())));

    }


}



?>
