<?php
/**
 *
 * Kommenttiolio
 *
 */


/**
 *
 * Kommenttien lataamisen ja uuden kommentin lisäämisen 
 * hoitavat oliot
 *
 */
class Comment{

    /**
     *
     * @param DbCon $con tietokantayhteys
     * @param string $theme aihe, johon kommentti liittyy (jokin vastuutyyppi tai esimerkiksi 'infoasia')
     * @param string $commentator kommentin lähettäjä
     * @param string $content kommentin sisältö
     * @param datetime $time kommentin jättöaika
     * @param int $replyto jos vastaus viestiketjuun, viestiketjun ensimmäisen kommentin id
     * @param int $service_id messu, johon kommentti liittyy
     *
     */
    protected $con;
    protected $theme="";
    protected $commentator="";
    protected $time="";
    protected $content="";
    protected $replyto=NULL;

    public function __construct($con, $sid){
        $this->con = $con;
        $this->time = date('Y-m-d H:i:s');
        $this->service_id = $sid;
    }

    /**
     *
     * Tallenna kommentti tietokantaan.
     *
     */
    public function Save(){
        $this->con->q("INSERT INTO comments (service_id, comment_time, theme, commentator, content, reply_to) VALUES (:sid, :ct, :th, :ctor, :ctnt, :rpl)
                        ",Array("sid"=>2,"ct"=>$this->time,"th"=>$this->theme,"ctor"=>$this->commentator, "ctnt"=>$this->content, "rpl"=>$this->replyto),"none");
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


}

?>
