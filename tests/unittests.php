<?php 
use PHPUnit\Framework\TestCase;

/**
 * @covers Template
 */
class TemplateTest extends TestCase
{

    public function testTemplateClassExists()
    {
        $this->mytemplate = new Template("indexlayout.php");
        $this->assertTrue(get_class($this->mytemplate) == "Template", "Ei onnistuttu luomaan template-oliota");
    }


}


?>
