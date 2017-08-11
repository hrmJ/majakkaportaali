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

    public function __construct($con, $sid, $path){
        $this->con = $con;
        $this->time = date('Y-m-d H:i:s');
        $this->service_id = $sid;
        $this->path = $path;
    }

    /**
     *
     * Tallenna kommentti tietokantaan.
     *
     */
    public function Save(){
        $this->con->q("INSERT INTO comments (service_id, comment_time, theme, commentator, content, reply_to) VALUES (:sid, :ct, :th, :ctor, :ctnt, :rpl)
                        ",Array("sid"=>$this->service_id,"ct"=>$this->time,"th"=>$this->theme,"ctor"=>$this->commentator, "ctnt"=>$this->content, "rpl"=>$this->replyto),"none");
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
        $all = $this->con->q("SELECT * FROM comments WHERE reply_to  = 0 AND service_id = :sid ORDER by comment_time DESC",Array("sid"=>$this->service_id),"all");
        $commentstring = "";
        foreach($all as $chain){
            $tpl = new Template("{$this->path}/comment.tpl");
            $tpl->Set("content",$chain["content"])->Set("theme",$chain["theme"])->Set("commentator",$chain["commentator"])->Set("id",$chain["id"])->Set("time",$chain["comment_time"]);
            $subchain = $this->con->q("SELECT * FROM comments WHERE reply_to  = :id ORDER by comment_time",Array("id"=>$chain["id"]),"all");
            //Huom: järjestä vastaukset niin, että tuorein viimeisenä;
            if(!$subchain){
                $tpl->Set("subchain","");
            }
            else{
                $subchainstring = "";
                foreach($subchain as $reply){
                    $subtpl = new Template("{$this->path}/comment.tpl");
                    $subtpl->Set("content",$reply["content"])->Set("theme",$reply["theme"]) ->Set("commentator",$reply["commentator"])->Set("id",$reply["id"])->Set("subchain","")->Set("time",$reply["comment_time"]);
                    $subchainstring .= "\n" . $subtpl->Output();
                }
                $tpl->Set("subchain",$subchainstring);
            }
            $comment_controls = new Template("{$this->path}/comment-insert-controls.tpl");
            $comment_controls->Set("commentthemeselect", "");
            $tpl->Set("comment-insert-controls",$comment_controls->Output());
            $commentstring .= "\n\n" . $tpl->Output();

        }
        return $commentstring;
    }

}



?>
