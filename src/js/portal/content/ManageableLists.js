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
     **/
    ListFactory.prototype.PrintList = function(data){
       $("#managelist .manageable_list").html("");
       $("#managelist .list_header").text(this.list_header);
       $("#managelist .description").hide();
       $("#managelist ." + this.list_type + "_description").show();
       var $ul = $("<ul></ul>").appendTo("#managelist .manageable_list"),
           self = this,
           li_str = (`<li>
                   <span></span><i class='fa fa-pencil'></i><i class='fa fa-trash'></i>
                   </li>`);
       $.each(data, function(idx, row){
           $ul.append(self.AddListRow(row, $(li_str)));
       });
    };


    /**
     *
     * Tuottaa yhden listaolion haluttua tyyppiä
     *
     * @param $li listaelementti, jonka pohjalta luodaan
     *
     **/
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
