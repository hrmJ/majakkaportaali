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
    ListFactory.prototype.LoadList = function(list_header, list_type){
        var path = Utilities.GetAjaxPath("Loader.php");
        var promise = $.getJSON(path, {
            "action" : "mlist_" + this.list_type,
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
                   </li>`);
       $li.find(".fa-pencil").click(this.StartEdit.bind(this));
       $li.find(".fa-trash").click(this.RemoveEntry.bind(this));
       $.each(data, function(idx, row){
           $ul.append(self.AddListRow(row, $li.clone(true)));
       });
    };


    /**
     *
     * Poistaa yhden listan alkion
     *
     */
    ListFactory.prototype.RemoveEntry = function(){
        console.log("REmoving");
    };

    /**
     *
     * Tallentaa yhden lista-alkion muutokset.
     *
     */
    ListFactory.prototype.SaveEdit = function(){
        var path = Utilities.GetAjaxPath("Saver.php"),
            msg = new Utilities.Message("Tiedot tallennettu.", $("#managelist"));
        console.log(this.GetEditParams());
        $.post(path,{
            "action": "save_edited_" + this.list_type,
            "params": this.GetEditParams()
        }, () =>{
            console.log("wooopppiiippp");
            this.SetEditParams();
            $("#list_editor").hide();
            //msg.Show(3000);
        });
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
        $("#list_editor .edit_container").html("");
        $("#list_editor button").remove();
        $("<button>Tallenna</button>")
            .click(this.SaveEdit.bind(this))
            .appendTo("#list_editor");
        $("#list_editor").fadeIn();
        this.EditEntry();
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
        return list;
    };

    /**
     *
     * Lista vastuiden hallitsemiseen 
     *
     */
    ListFactory.Responsibilities = function(){
    
        /**
         *
         * Lisää yhden datarivin tietokannasta
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            $li.find("span").text(raw_data);
            return $li;
        }


        /**
         *
         * Hakee tarvittavat tallennettavat parametrit
         *
         */
        this.GetEditParams = function(){
            var data = {
                old_responsibility: this.old_responsibility,
                new_responsibility: $("#list_editor .new_responsibility").val(),
                description: $("#list_editor .description").val()
            };
            this.new_responsibility = data.new_responsibility;

            return data;
        }

        /**
         *
         * Päivittää parametrit muokkauksen jälkeen
         *
         */
        this.SetEditParams = function(){
            this.$current_li.find("span").text(this.new_responsibility);
        }


        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            var path = Utilities.GetAjaxPath("Loader.php"),
                responsibility = this.$current_li.find("span").text();
            //Tallenna vastuun entinen nimi ennen muokkausta
            this.old_responsibility = responsibility;

            $.getJSON(path, {
                "action": "get_responsibility_meta",
                "responsibility": responsibility
                },
                (data) => {
                    console.log(data);
                    $(`
                        <div class='label_parent'>
                            <div>Vastuun nimi</div>
                            <div>
                                <input class='new_responsibility' type='text' value='${responsibility}'></input>
                            </div>
                        </div>
                        <div class='label_parent'>
                            <div>Vastuun kuvaus</div>
                            <div>
                            <textarea placeholder='Lyhyt selitys siitä, mitä tähän vastuuseen kuuluu'
                                class='description'>${data.description || ''}</textarea>
                            </div>
                        </div>

                    `).appendTo("#list_editor .edit_container");
                
                }
            );
        };

        /**
         *
         * Lisää uuden alkion listaan.
         *
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.AddEntry = function(){
        
        
        };
    
    };


    /**
     *
     * Lista  messujen hallitsemiseen 
     *
     */
    ListFactory.Services = function(){

        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            $li.find("span").text(raw_data.theme);
            return $li;
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
        
        
        };

        /**
         *
         * Lisää uuden alkion listaan.
         *
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.AddEntry = function(){
        
        
        };

    
    };



    /**
     *
     * Lista tapahtumien hallitsemiseen 
     *
     */
    ListFactory.Events = function(){
    
    
    };


    /**
     *
     * Lista  messukausien hallitsemiseen 
     *
     */
    ListFactory.Seasons = function(){
    
    
    };



    return {

        ListFactory,

    }


}();
