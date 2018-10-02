Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Liturgisten tekstien (isä meidän, uskontunnustus jne) hallinta
 *
 */
Portal.ManageableLists.ListFactory.LiturgicalTexts = function(){

    this.current_target_id = undefined;
    this.keys = [
            "title",
            "content",
            ];

    this.edithtml = `
                    <article>
                        <section>
                            <div class='label_parent'>
                                <div>Tekstin nimi</div>
                                <div>
                                    <input class='title' type='text' placeholder='esim. Apostolinen uskontunnustus' value=''></input>
                                </div>
                            </div>
                            <h4>Teksti</h4>
                            <p>Huom! Erota tyhjällä rivivälillä toisistaan pätkät, jotka näytetään näytöllä kerralla.</p>
                            <div>
                            <textarea placeholder='Esim. Minä uskon Jumalaan\nIsään kaikki..' class='content'></textarea>
                            </div>
                        </section>
                    </article>
                    `;




    /**
     *
     * @param raw_data tarvittavat tiedot tietokannasta
     * @param $li muokattava ja palautettava listaelementti
     *
     */
    this.AddListRow = function(raw_data, $li){
        var path = Utilities.GetAjaxPath("Loader.php");
        $li.find("span").text(raw_data.title);
        $.each(this.keys.concat(["id"]), (idx, key) => {
            if(key != "content"){
                $li.append(`<input type='hidden' class='${key}-container' 
                    value='${raw_data[key]}'></input>`);
            }
        }
        );
        return $li;
    };


    /**
     *
     * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
     *
     */
    this.PrintEditOrAdderBox = function(){
        $(this.edithtml)
            .appendTo("#list_editor .edit_container");
    };

    /**
     *
     * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
     * TODO kaikille tyypeille yhteinen lähtötilanne?
     *
     */
    this.EditEntry = function(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            id = this.$current_li.find(".id-container").val(),
            title = this.$current_li.find(".title-container").val(),
            versetext = "";
        $.getJSON(path, {
            "action" : "get_ltext_verses",
            "id" : id,
        }, (verses) => {
            $.each(verses, (idx, verse) => versetext += "\n\n" + verse.verse);
            $("#list_editor .content").val(versetext.trim());
            $("#list_editor .title").val(title);
        });
        this.PrintEditOrAdderBox();
    };

    /**
     *
     * Hakee alkion muokkauksessa muuttuneet  parametrit
     *
     */
    this.GetEditParams = function(){
        return  {
             "cols" : this.GetParams(),
             "id" : this.$current_li.find(".id-container").val(),
            }
    };



    /**
     *
     * Tallentaa lisätyn kolehtikohteen sekä mahdollisen tavoitteen
     *
     */
    this.GetAddedParams = function(){
        return this.GetParams();
    };


    /**
     *
     * Hakee muokatut / lisätyt arvot editori-ikkunasta
     *
     */
    this.GetParams = function(){
        var selector = "#list_editor .edit_container .",
            params = {},
            split_pattern = /\n{2,}/,
            vals = this.keys.map((key) => $(selector + key).val());
        $.each(this.keys,(idx,el)=>params[el] = vals[idx]);
        params.content = params.content.trim().split(split_pattern);
        return params;
    };


    /**
     *
     * Lisää uuden alkion listaan.
     *
     *
     */
    this.AddEntry = function(){
        this.OpenBox();
        this.PrintEditOrAdderBox();
        this.AddSaveButton(this.SaveAdded);
    };

    /**
     *
     * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
     *
     * @param $li se listan alkio, jota ollaan poistamassa.
     *
     */
    this.GetRemoveParams = function($li){
        var params =  {
            "action" : "remove_liturcial_text",
            "target_id" : $li.find(".target_id").val()
        };
        return params;
    }
    
};

