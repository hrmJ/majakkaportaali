<?php 
use PHPUnit\Framework\TestCase;

/**
 * @covers Template
 */
class TemplateTest extends TestCase
{

    /**
     * Onko luokka olemassa
     */
    public function testTemplateClassExists()
    {
        $mytemplate = new Template();
        $this->assertTrue(get_class($mytemplate) == "Template", "Ei onnistuttu luomaan template-oliota");
    }

}


?>
