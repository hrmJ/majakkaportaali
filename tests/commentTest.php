
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
        'charset' => 'utf8'
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
#    public function testSaveNewComment(){
#        $comment= new Comment($this->con, 2, $this->m);
#        $comments_before = $this->con->query("SELECT count(*) FROM comments")->fetchAll(PDO::FETCH_COLUMN);
#        $comment
#            ->SetTheme("juonaja")
#            ->SetContent("Testisisältö on tässä.")
#            ->SetCommentator("Pekka")
#            ->SetReplyTo("1")
#            ->Save();
#        $comments_after = $this->con->query("SELECT count(*) FROM comments")->fetchAll(PDO::FETCH_COLUMN);
#        $this->assertTrue($comments_after > $comments_before);
#        $this->con->query("DELETE FROM comments WHERE id  = (SELECT max(id) FROM comments)");
#
#    }


}



?>
