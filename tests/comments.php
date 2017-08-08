

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
        $this->comment= new Comment($this->con, 2);
        $this->comment
            ->SetTheme("yleinen")
            ->SetContent("Testaan kommenttia")
            ->SetCommentator("Ville")
            ->Save();
        $row = $this->con->q("SELECT * FROM comments ORDER BY id DESC LIMIT 1",Array(),"row");
        $this->assertEquals($row["content"],"Testaan kommenttia");
  }

}
