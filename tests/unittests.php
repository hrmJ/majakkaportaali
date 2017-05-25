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
     *
     * Testaa, että pohjaan pystyy syöttämään arvoja.
     *
     */
    public function testSetTemplateValue()
    {
        $this->mytemplate = new Template("src/templates/servicelist.tpl");
        $bookmark = "tableofservices";
        $content = "<table></table>";
        $this->mytemplate->Set($bookmark,$content);
        $output = $this->mytemplate->Output();
        $this->assertRegExp('/table/', $output);
        
    }

}


?>
