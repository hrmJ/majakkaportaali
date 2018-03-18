
<?php 
use PHPUnit\Framework\TestCase;


/**
 * @covers Template
 */
class SelectTest extends TestCase
{

  protected function setUp()
    {
        $this->templatepath="src/templates";
    }

    public function testCreateSelect()
    {
        $select = new Select($this->templatepath, Array("eka","toka"));
        $this->assertRegExp("/<option.*eka/",$select->OutputSelect());
    }

    public function testChangeVals()
    {
        $select = new Select($this->templatepath, Array("eka","toka"));
        $select->SetValues(Array("ekaval","tokaval"));
        $this->assertRegExp("/<option value=\"ekaval/",$select->OutputSelect());
    }

    public function testSetId()
    {
        $select = new Select($this->templatepath, Array("eka","toka"));
        $select->SetId("uusi_id");
        $this->assertRegExp("/id=\"uusi_id\"/",$select->OutputSelect());
    }


    public function testChooseSelected()
    {
        $select = new Select($this->templatepath, Array("eka","toka"));
        $select->SetCurrentSelected("toka");
        $this->assertRegExp("/selected>toka/",$select->OutputSelect());
    }

}



?>
