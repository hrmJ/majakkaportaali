
<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;


/**
 */
class TemplateTest extends TestCase
{

    public function SetUp(){

        $this->m = new Mustache_Engine(array(
            'loader' => new Mustache_Loader_FilesystemLoader(__DIR__ . '/../src/views'),
        )
        );
    
    }

    /**
     * Testaa, että Mustache-templeittejä voi käyttää myös tiedostoista
     */
    public function testUseMustacheFromFile()
    {
        $tpl = $this->m->loadTemplate('layout'); 
        $this->assertRegExp('/body/',$tpl->render());
    }

    /**
     * Testaa, että service-template toimii
     */
    public function testServiceTemplate()
    {
        $layout = $this->m->loadTemplate('layout'); 
        $service = $this->m->loadTemplate('service'); 
        $ctr = $this->m->loadTemplate('song_controls'); 
        $this->assertRegExp('/<ul>/',
            $layout->render(Array("content"=>$service->render(), "song_controls"=>$ctr->render()))
        );
    }


}



?>
