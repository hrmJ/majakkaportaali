Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Offerings = function(){

    this.current_target_id = undefined;
    this.goal_param_names = [
                "goal_name",
                "goal_description",
                "goal_amount",
                "goal_id",
                "is_default_goal"
            ];

    this.edithtml = `
                    <article>
                        <section>
                            <div class='label_parent'>
                                <div>Kolehtikohteen nimi</div>
                                <div>
                                    <input class='target_name' type='text' value=''></input>
                                </div>
                            </div>
                            <div class='label_parent'>
                                <div>kohteen kuvaus</div>
                                <div>
                                <textarea placeholder='esim. "Lastenkoti X maassa Y on perustettu vuonna... Se on..."' class='target_description'></textarea>
                                </div>
                            </div>
                        </section>
                        <h4 class='closed'>Lisää ensimmäinen tavoite kohteeseen</h4>
                    </article>
                    `;

    this.newgoal_html = `
                    <section class='hidden newgoal_settings'>
                        <div class='label_parent'>
                                <div>Tavoitteen nimi</div>
                                <div>
                                    <input class='goal_name' type='text' value=''></input>
                                </div>
                        </div>
                        <div class='label_parent'>
                                <div>Määrä (<span class='amount_num'>0</span> €)</div>
                                <div class='goal_amount'></div>
                        </div>
                        <div class='label_parent'>
                                <div>Tavoitteen kuvaus</div>
                                <div>
                                    <textarea class='goal_description' placeholder='esimerkiksi "vuoden ruoka ja vaatteet kymmenelle lastenkodin lapselle"'></textarea>
                                </div>
                        </div> 
                        <div class='some-margin'>
                            <input class='is_default_goal' type='checkbox'></input> Oletuskohde? 
                        </div>
                    </section>`;


    /**
     *
     * Avaa kolehtitavoitteen muokkaimen joko muokkausta tai uuden lisäämistä varten
     *
     * @param ev tapahtuma
     *
     */
    this.OpenGoalEditor = function(ev){
        if(ev){
            var $li = $(ev.target).parent();
            this.current_li = {};
            $.each(this.goal_param_names, (idx, el) => {
                this.current_li[el] = $li.find("." + el).val()
            });
            this.current_li.target_id = $li.parents("li").find(".target_id").val();
        };
        this.OpenBox();
        $(this.newgoal_html)
            .removeClass("hidden")
            .appendTo("#list_editor .edit_container");
        this.AddAmountSlider();
    };

    /**
     *
     * Lisää uuden kolehtitavoitteen nykyisen kohteen alle
     *
     * @param ev tapahtuma
     *
     */
    this.AddGoal = function(ev){
        this.OpenGoalEditor(ev);
        this.AddSaveButton(this.SaveAddedGoal.bind(this));
    }

    /**
     *
     * Tallentaa muokatun kolehtitavoitteen
     *
     */
    this.SaveEditedGoal = function(ev){
        var path = Utilities.GetAjaxPath("Saver.php"),
            params ={
                "action" : "edit_offering_goal",
                "goal_id" : this.current_li.goal_id,
                "goal_params": this.GetGoalParams()
            };
        $.post(path, params, this.LoadList.bind(this));
    };


    /**
     *
     * Tallentaa lisätyn kolehtitavoitteen
     *
     */
    this.SaveAddedGoal = function(ev){
        var path = Utilities.GetAjaxPath("Saver.php"),
            params ={
                "action" : "add_offering_goal",
                "target_id" : this.current_li.target_id,
                "goals": [this.GetGoalParams()]
            };
        console.log(params);
        $.post(path, params, this.LoadList.bind(this));
    };


    /**
     *
     * Muokkaa kolehtitavoitetta
     *
     * @param ev tapahtuma
     *
     */
    this.EditGoal = function(ev){
        this.OpenGoalEditor(ev);
        $.each(this.goal_param_names, (idx, el) => {
            if(el == "goal_amount"){
                $("#list_editor").find("." + el).slider("value", this.current_li[el]);
                $("#list_editor").find(".amount_num").text(this.current_li[el]);
            }
            else if (el == "is_default_goal"){
                if(this.current_li[el]*1){
                    $("#list_editor").find("." + el).get(0).checked = true;
                }
            }
            else{
                $("#list_editor").find("." + el).val(this.current_li[el]);
            }
        });
        this.AddSaveButton(this.SaveEditedGoal.bind(this));
    };

    /**
     *
     * Poistaa kolehtitavoitteen
     *
     * @param ev tapahtuma
     *
     */
    this.RemoveGoal = function(ev){
        var path = Utilities.GetAjaxPath("Saver.php"),
            goal_id = $(ev.target).parent().find(".goal_id").val();
        $.post(path,{
            "action" : "remove_offering_goal",
            "goal_id" : goal_id
        }, this.LoadList.bind(this));
    };


    /**
     *
     * @param raw_data tarvittavat tiedot tietokannasta
     * @param $li muokattava ja palautettava listaelementti
     *
     */
    this.AddListRow = function(raw_data, $li){
        var $ul = $("<ul class='mlist_subclass'></ul>"),
            $plus = $("<li class='adder_li'>Uusi tavoite</li>")
                .click(this.AddGoal.bind(this));
        $li.addClass("offerings_list");
        $li.find("span").html(`<strong>${raw_data.target.name}</strong>`);
        $li.append(`<input class='target_id' type='hidden' value=${raw_data.target.id}></input>`);
        $.each(raw_data.goals, (idx, goal) => {
            var $subli = $(`<li> ${goal.name}
                        <input type='hidden' class='goal_description' value='${goal.description}'></input>
                        <input type='hidden' class='goal_amount' value='${goal.amount}'></input>
                        <input type='hidden' class='goal_name' value='${goal.name}'></input>
                        <input type='hidden' class='goal_id' value='${goal.id}'></input>
                        <input type='hidden' class='is_default_goal' value='${goal.is_default}'></input>
                        </li>`);
            $("<i class='fa fa-pencil'></i>")
                .click(this.EditGoal.bind(this))
                .appendTo($subli);
            $("<i class='fa fa-trash'></i>")
                .click(this.RemoveGoal.bind(this))
                .appendTo($subli);
            $subli.appendTo($ul);
        });
        $ul.append($plus).appendTo($li);
        //$li.append(
        //    (`<input type='hidden' class='id_container' value='${raw_data.id}'></input>
        //       <input type='hidden' class='description_container' value='${raw_data.description}'></input>
        //        `)
        //);
        return $li;
    };


    /**
     *
     * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
     *
     */
    this.PrintEditOrAdderBox = function(){
        this.OpenBox();
        $(this.edithtml)
            .append(this.newgoal_html)
            .appendTo("#list_editor .edit_container");
    };

    /**
     *
     * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
     * TODO kaikille tyypeille yhteinen lähtötilanne?
     *
     */
    this.EditEntry = function(){
        var path = Utilities.GetAjaxPath("Loader.php");
        this.PrintEditOrAdderBox();
        //$.getJSON(path, {
        //    "action" : "get_"
        //});
    };

    /**
     *
     * Hakee alkion muokkauksessa muuttuneet  parametrit
     *
     */
    this.GetEditParams = function(){
    };


    /**
     *
     * Palauttaa lisättävän tai muokattavan tavoitteen parametrit
     *
     */
    this.GetGoalParams = function(){
    
        return {
            name: $("#list_editor .goal_name").val(),
            description: $("#list_editor .goal_description").val(),
            amount: $("#list_editor .amount_num").text()*1,
            is_default: $("#list_editor .is_default_goal").get(0).checked*1
        };
    }

    /**
     *
     * Tallentaa lisätyn kolehtikohteen sekä mahdollisen tavoitteen
     *
     */
    this.GetAddedParams = function(){
        var goals = [];

        if($("#list_editor .goal_name").val()){
            goals = [ this.GetGoalParams() ];
        }

        return {
            target_name: $("#list_editor .target_name").val(),
            target_description: $("#list_editor .target_description").val(),
            goals: goals,
        }
    };


    /**
     *
     * Lisää jquery-ui:n liukusäätimen kolehtimäärään
     *
     */
    this.AddAmountSlider = function(){
        $(".goal_amount").slider(
            {
                min: 0,
                max: 20000,
                step: 100,
                slide: (ev, ui) => $("#list_editor .amount_num").text(ui.value)
            }
        );
    };

    /**
     *
     * Lisää uuden alkion listaan.
     *
     *
     */
    this.AddEntry = function(){
        this.PrintEditOrAdderBox();
        this.AddAmountSlider();
        $("#list_editor .edit_container h4").click(Portal.Menus.InitializeFoldMenu);
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
            "action" : "remove_offering_target",
            "target_id" : $li.find(".target_id").val()
        };
        return params;
    }
    
};

