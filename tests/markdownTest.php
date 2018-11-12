<?php 

require 'vendor/autoload.php';
 
use PHPUnit\Framework\TestCase;
use Michelf\Markdown;

/**
 *
 *
 */
class markdownTest extends TestCase
{


    public function testBasic(){
    
        // Simple validation (max file size 2MB and only two allowed mime types)
        $mytext = "# Otsikko\n\n - lista 1\n-lista 2\n-lista3";
        $my_html = Markdown::defaultTransform($mytext);
        $this->assertRegExp("/<h1>/", $my_html);
        $this->assertRegExp("/<ul>/", $my_html);
    }

}
