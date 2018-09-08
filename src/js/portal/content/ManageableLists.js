Portal = Portal || {};

/**
 *
 * 
 * Hallittavien kokonaisuuksien (messujen / vastuiden jne) lisäämisestä,
 * poistamisesta ym. vastaavat listaelementit
 *
 *
 */
Portal.ManageableLists = function(){

    var current_list = undefined;


    /**
     *
     * Palauttaa aktiivisen listan
     *
     **/
    function GetCurrentList(){
        return current_list;
    }


    /**
     *
     * Factory-pattern eri muokattavia listoja edustavien olioiden luomiseksi
     *
     **/
    function ListFactory(){

    }



    /**
     *
     * Lataa listan datan tietokannasta
     *
     */
    ListFactory.prototype.LoadList = function(d){
        console.log(d);
        current_list = this;
        $("#list_editor").hide();
        var path = Utilities.GetAjaxPath("Loader.php");
        var promise = $.getJSON(path, {
            "action" : "mlist_" + this.list_type,
            "startdate" : Portal.Servicelist.GetCurrentSeason().startdate,
            "enddate" : Portal.Servicelist.GetCurrentSeason().enddate,
        }, this.PrintList.bind(this));
    }


    /**
     *
     * Tulostaa muokattavan listan
     *
     * @param data tulostettava data
     *
     */
    ListFactory.prototype.PrintList = function(data){
       $("#managelist .manageable_list").html("");
       $("#managelist .list_header").text(this.list_header);
       $("#managelist .description").hide();
       $("#managelist ." + this.list_type + "_description").show();
       var $ul = $("<ul></ul>").appendTo("#managelist .manageable_list"),
           self = this,
           $li = $(`<li>
                   <span></span><i class='fa fa-pencil'></i><i class='fa fa-trash'></i>
                   </li>`),
           $plus = $("<li class='adder_li'> <i class='fa fa-plus'></i></li>")
            .click(this.AddEntry.bind(this));
       $li.find(".fa-pencil").click(this.StartEdit.bind(this));
       $li.find(".fa-trash").click(this.RemoveEntry.bind(this));
       $.each(data, function(idx, row){
           $ul.append(self.AddListRow(row, $li.clone(true)));
       });
       $ul.append($plus);
    };



    /**
     *
     * Tallentaa yhden lista-alkion muutokset.
     *
     */
    ListFactory.prototype.SaveEdit = function(){
        var path = Utilities.GetAjaxPath("Saver.php");
        $.when($.post(path,{
            "action": "save_edited_" + this.list_type,
            "params": this.GetEditParams()
        }, this.LoadList.bind(this))).done(() => Portal.Servicelist.Initialize(true));
    };

    /**
     *
     * Tallentaa uudet lista-alkiot
     *
     */
    ListFactory.prototype.SaveAdded = function(){
        var path = Utilities.GetAjaxPath("Saver.php");
        $.when($.post(path,{
            "action": "save_added_" + this.list_type,
            "params": this.GetAddedParams()
        }, this.LoadList.bind(this))).done(() => Portal.Servicelist.Initialize(true));
    };


    /**
     *
     * Lisää muokkausikkunan tallennuspainikkeen
     *
     * @param callback mikä tallennusfunktio suoritetaan
     *
     */
    ListFactory.prototype.AddSaveButton = function(callback){
        $("<div class='below_box'><button>Tallenna</button></div>")
            .click(callback.bind(this))
            .appendTo($("#list_editor"));
    }

    /**
     *
     * Päivittää muokkausikkunan muokkaamista tai uuden lisäämistä varten
     *
     * @param e tapahtuma, joka käynnisti
     *
     */
    ListFactory.prototype.OpenBox = function(){
        $("#list_editor .edit_container").html("");
        $("#list_editor button").remove();
        $("#list_editor").fadeIn();
        Portal.Menus.AddCloseButton($("#list_editor"));
    };

    /**
     *
     * Käynnistää yhden alkion muokkauksen
     *
     * @param e tapahtuma, joka käynnisti
     *
     */
    ListFactory.prototype.StartEdit = function(e){
        this.$current_li = $(e.target).parent();
        this.OpenBox();
        $("<button>Tallenna</button>")
            .click(this.SaveEdit.bind(this))
            .appendTo("#list_editor");
        this.EditEntry();
    };

    /**
     *
     * Poistaa yhden listan alkion
     *
     * @param e tapahtuma
     *
     */
    ListFactory.prototype.RemoveEntry = function(e){
        var path = Utilities.GetAjaxPath("Saver.php");
            $li = $(e.target).parent();
        $.when($.post(path,
            this.GetRemoveParams($li),
            this.LoadList.bind(this))).done(() => Portal.Servicelist.Initialize(true));
    };


    /**
     *
     * Tuottaa yhden listaolion haluttua tyyppiä
     *
     * @param $li listaelementti, jonka pohjalta luodaan
     *
     */
    ListFactory.make = function($li){
        var list,
            list_type = $li.find(".list_type").val(),
            list_header = $li.find(".list_header").val();
        ListFactory[list_type].prototype = new ListFactory();
        list = new ListFactory[list_type]();
        list.list_type = list_type;
        list.list_header = list_header;
        GeneralStructure.Images.Attach(this);
        GeneralStructure.Headers.Attach(this);
        return list;
    };






    return {

        ListFactory,
        GetCurrentList

    }


}();
