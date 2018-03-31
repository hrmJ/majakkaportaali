<?php
/**
 *
 * Messunäkymän template
 *
 * @param string $type mistä sivutyypistä on kyse.
 *
 */
class DetailsPage extends Page{

    public $type = "servicedetails";

    /** 
     * @param string $path polku templates-kansioon
     * @param string $id tarkasteltavan messun id
     *
     */
    public function __construct($path, $id){
        $this->path = $path;
        $this->id = $id;
        parent::__construct();
    }

    /**
     *
     * Luo valitsimen, jolla messuja voi suodattaa vastuiden mukaan
     *
     *
     */
    public function SetResponsibleData(){
        $volunteers = $this->con->q("SELECT responsible, responsibility FROM responsibilities WHERE service_id = :id",Array("id"=>$this->id),"all");
        $tablecontent = new ServiceDetailsTable($this->path, $volunteers);
        $this->Set("table", $tablecontent->Output());
        return $this;
    }

    /**
     *
     * Luo valitsimen, jolla messuja voi suodattaa vastuiden mukaan.
     *
     */
    public function SetCommentThemeSelect(){
        $responsibilities = array_merge(Array("Kommentin aihe","----------","Yleinen","Infoasia"), 
            $this->con->select("responsibilities", "responsibility" =>  Medoo::raw('DISTINCT(responsibility)')
        $select = new Select($this->path, $responsibilities); 
        $comment_controls = new Template("{$this->path}/comment-insert-controls.tpl");
        $comment_controls->Set("commentthemeselect", "<div>{$select->OutputSelect()}</div>");
        $this->Set("comment-insert-controls", $comment_controls->Output());

        return $this;
    }

}


?>
