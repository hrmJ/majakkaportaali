<?php 
use PHPUnit\Framework\TestCase;

/**
 * @covers Template
 */
class TemplateTest extends TestCase
{

    /**
     * Testaa, että pohjaolio on määritelty ja sitä pystyy käyttämään.
     */
    public function testTemplateClassExists()
    {
        $this->mytemplate = new Template("servicelist.tpl");
        $this->assertTrue(get_class($this->mytemplate) == "Template", "Ei onnistuttu luomaan template-oliota");
    }

    /**
     * Testaa, että pohjaan pystyy syöttämään arvoja.
     */
    public function testSetTemplateValue()
    {
        $slist = new Template("src/templates/servicelist.tpl");
        $slist->Set("tableofservices", "<table></table>");
        $this->assertRegExp('/table/', $slist->Output());
    }

    /**
     * Testaa, että layout-pohjaan voi sijoittaa arvoja
     */
    public function testSetLayoutTemplateValue()
    {
        $layout = new Template("src/templates/layout.tpl");
        $layout->Set("title", "Majakkaportaali");
        $this->assertRegExp('/Majakkaportaali/', $layout->Output());
    }

    public function testSetTemplateInsideLayout()
    {
        $slist = new Template("src/templates/servicelist.tpl");
        $slist->Set("tableofservices", "<table></table>");
        
        $layout = new Template("src/templates/layout.tpl");
        $layout->Set("content", $slist->Output());

        $this->assertRegExp('/table/', $layout->Output());

    }

    /**
     *
     * Luo ulkoasupohjan, johon liittää taulukkopohjan, johon sivupohjan
     *
     */
    public function testLayOutPageHasContent(){
    
        $templatepath="src/templates";

        $srow = new Template("$templatepath/servicelistrow.tpl");
        $srow->Set("date", "11.6.2016");
        $srow->Set("theme", "Kesä on ihanaa");

        $slist = new Template("$templatepath/servicelist.tpl");
        $slist->Set("tableofservices", $srow->Output());

        $layout = new Template("$templatepath/layout.tpl");
        $layout->Set("title", "Majakkaportaali");
        $layout->Set("content", $slist->Output());

        $this->assertRegExp('/Kesä on ihanasa/', $layout->Output());

    
    }

}


?>
