<?php /**
 *
 * Kommenttluokka
 *
 */


namespace Portal\content;

use Medoo\Medoo;
use PDO;


/**
 *
 * Kommenttien lataamisen ja uuden kommentin lisäämisen 
 * hoitavat oliot
 *
 */
class Comment{

    /**
     *
     * @param Medoo $con tietokantayhteys
     * @param Mustache $template_engine Mustache-template engine
     * @param string $theme aihe, johon kommentti liittyy (jokin vastuutyyppi tai esimerkiksi 'infoasia')
     * @param string $commentator kommentin lähettäjä
     * @param string $content kommentin sisältö
     * @param datetime $time kommentin jättöaika
     * @param int $replyto jos vastaus viestiketjuun, viestiketjun ensimmäisen kommentin id
     * @param int $service_id messu, johon kommentti liittyy
     *
     */
    protected $con;
    public $template_engine;
    protected $theme="";
    protected $commentator="";
    protected $time="";
    protected $content="";
    protected $replyto=NULL;

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con, $sid, $m){
        $this->con = $con;
        $this->time = date('Y-m-d H:i:s');
        $this->service_id = $sid;
        $this->template_engine = $m;
    }

    /**
     *
     * Tallenna kommentti tietokantaan.
     *
     */
    public function Save(){
        $this->con->insert("comments",[
            "service_id" => $this->service_id,
            "comment_time" => $this->time,
            "theme" => $this->theme,
            "commentator" => $this->commentator,
            "content" => $this->content,
            "reply_to" => $this->replyto
        ]);
    }

    /**
     *
     * Syötä kommentin aihe
     *
     * @param string $theme 
     *
     */
    public function SetTheme($theme){
        $this->theme = $theme;
        return $this;
    }

    /**
     *
     * Syötä sen ketjun ensimmäisen viestin id, johon vastataan.
     *
     * @param string $content 
     *
     */
    public function SetReplyTo($replyto){
        $this->replyto = $replyto;
        return $this;
    }


    /**
     *
     * Syötä kommentin lähettäjä
     *
     * @param string $content 
     *
     */
    public function SetContent($content){
        $this->content = $content;
        return $this;
    }

    /**
     *
     * Syötä kommentin lähettäjä
     *
     * @param string $commentator 
     *
     */
    public function SetCommentator($commentator){
        $this->commentator = $commentator;
        return $this;
    }

    /**
     *
     * Lataa kaikki vanhat kommentit tietokannasta
     *
     * @param string $commentator 
     *
     */
    public function LoadAll(){
        //Järjestä ketjut niin, että tuorein ekana
        $all =  $this->con->select("comments","*",[
            'reply_to' => 0,
            'service_id' => $this->service_id,
            'ORDER' => [ 'comment_time' => 'DESC' ]
        ]);

        $commentstring = "";
        foreach($all as $chain){
            //Kootaan kaikki 
            $tpl = $this->template_engine->loadTemplate('comment'); 
            $subchain = $this->con->select("comments", "*",[
                'reply_to' => $chain["id"],
                'ORDER' => ['comment_time' => 'DESC']
            ]);
            //Huom: järjestä vastaukset niin, että tuorein viimeisenä
            if(!$subchain){
                $subchainstring = "";
                foreach($subchain as $reply){
                    $subtpl = $this->template_engine->loadTemplate('comment'); 
                    $subchainstring .= "\n{$subtpl->render($reply)}";
                }
            }
            $commentstring .= $tpl->render(array_merge($chain,
                Array("subchain" => $subchainstring)));

        }
        return $commentstring;
    }



}



?>
