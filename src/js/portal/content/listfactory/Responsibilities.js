Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista vastuiden hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Responsibilities = function(){

    /**
     *
     * Lisää yhden datarivin tietokannasta
     *
     * @param raw_data tarvittavat tiedot tietokannasta
     * @param $li muokattava ja palautettava listaelementti
     *
     */
    this.AddListRow = function(raw_data, $li){
        console.log(raw_data);
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
     * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
     *
     * @param $li se listan alkio, jota ollaan poistamassa.
     *
     */
    this.GetRemoveParams = function($li){
        return {
            "responsibility" : $li.find("span").text(),
            "action" : "remove_responsibility"
        };
    }

    /**
     *
     * Lisää uuden alkion listaan.
     *
     *
     */
    this.AddEntry = function(){
    
    
    };


};


