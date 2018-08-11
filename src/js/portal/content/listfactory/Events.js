Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Events = function(){


        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            var text = `${raw_data.name} ${raw_data.startdate} - ${raw_data.enddate}`;
            $li.find("span").text(text);
            return $li;
        }


        /**
         *
         * Lisää uuden alkion listaan.
         *
         *
         */
        this.AddEntry = function(){
        
        
        };

        /**
         *
         * Poistaa yhden listan alkion
         *
         */
        this.RemoveEntry = function(){
            console.log("REmoving");
        };
    
};

