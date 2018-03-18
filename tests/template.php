
<?php 

use PHPUnit\Framework\TestCase;
use Portal\templates\Template;
use Portal\templates\pages\SongPage;


/**
 * @covers Template
 */
class TemplateTest extends TestCase
{

    public function testCreateTemplate() {
        $n = new Template("src/templates/layout.tpl");
        $this->assertInstanceOf(Template::class,$n);
    }

    public function testSetVal() {
        $n = new Template("src/templates/layout.tpl");
        $n->Set("bodyclass","testclass");
        $this->assertArrayHasKey("bodyclass", $n->GetValues());
    }

}

/**
 * @covers SongPage
 */
class SongPageTest extends TestCase
{

    public function testCreateSongPage() {
        $n = new SongPage("src/templates", 2);
        $this->assertInstanceOf(SongPage::class,$n);
    }

}



?>
