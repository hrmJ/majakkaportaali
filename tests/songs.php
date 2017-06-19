
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class SongListTest extends TestCase
{

    /**
     * Testaa, että riveillä on id:t
     */
    public function testRowsHaveValues()
    {
        $templatepath="src/templates";
        $songslistcontent = new Template("$templatepath/songlist.tpl");

        $songdata = Array(Array("category"=>"alkulaulu","value"=>""),
                             Array("category"=>"päivän laulu","value"=>""));

        $tablecontent = new SongDataTable($templatepath, $songdata);
        $songslistcontent->Set("singlesongs", $tablecontent->Output());

        $layout = new Template("$templatepath/layout.tpl");
        $layout->Set("title", "Laulujen syöttö majakkamesuun x.x.xxxx");
        $layout->Set("content", $songslistcontent->Output());
        $this->assertRegExp('/type="text" name="alkulaulu"/', $layout->Output());
    }


}




?>
