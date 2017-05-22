<?php 
use PHPUnit\Framework\TestCase;

/**
 * @covers Template
 */
class TemplateTest extends TestCase
{

    /*
     *
     *
     **/
    public function testTemplateClassExists()
    {
        $mytemplate = new Template();
        $this->assertTrue(get_class($mytemplate) == "Template", "Ei onnistuttu luomaan template-oliota");
    }

}


?>
