

<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class SongListTest extends TestCase
{
  protected function setUp()
    {
        $this->templatepath="src/templates";
        $this->con = new DbCon("config.ini");
        $this->templatepath="src/templates";
        $this->date = date('Y-m-d');
  }

  public function testCanSaveComment()
    {
        $this->comment= new Comment($this->con, 2, $this->templatepath);
        $this->comment
            ->SetTheme("yleinen")
            ->SetContent("Testaan kommenttia")
            ->SetCommentator("Ville")
            ->Save();
        $row = $this->con->q("SELECT * FROM comments ORDER BY id DESC LIMIT 1",Array(),"row");
        $this->assertEquals($row["content"],"Testaan kommenttia");
  }

  public function testCommentThemeSelector()
    {
        $responsibilities = array_merge(Array(Array("Yleinen"),Array("Infoasia")), $this->con->q("SELECT DISTINCT responsibility FROM responsibilities",Array(),"all"));
        $select = new Select($this->templatepath, $responsibilities, "Kommentin aihe", "Kommentin aihe");
        $this->assertRegExp('/>juontaja<\/option>/', $select->Output());
     }

  public function testLoadAllComments()
  {
        $comment= new Comment($this->con, 2, $this->templatepath);
        $comment->LoadAll();
  }

}
