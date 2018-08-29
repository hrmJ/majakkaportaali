Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messukausien hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Offerings = function(){

    this.current_target_id = undefined;

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
                    </section>`;


    /**
     *
     * Lisää uuden kolehtitavoitteen nykyisen kohteen alle
     *
     * @param ev tapahtuma
     *
     */
    this.AddGoal = function(ev){
        this.current_target_id = $(ev.target).parents(".offerings_list").find(".target_id").val();
        this.OpenBox();
        $(this.newgoal_html)
            .removeClass("hidden")
            .appendTo("#list_editor .edit_container");
        this.AddAmountSlider();
        this.AddSaveButton(this.SaveAddedGoal.bind(this));
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
                "target_id" : this.current_target_id,
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
        console.log(ev);
        //var path = Utilities.GetAjaxPath("Saver.php");
        //$.post(path,{
        //    "action" : "add_offering_goal",
        //    "target_id" : "add_offering_goal",
        //});
    };

    /**
     *
     * Poistaa kolehtitavoitteen
     *
     * @param ev tapahtuma
     *
     */
    this.RemoveGoal = function(ev){
        console.log(ev);
        //var path = Utilities.GetAjaxPath("Saver.php");
        //$.post(path,{
        //    "action" : "add_offering_goal",
        //    "target_id" : "add_offering_goal",
        //});
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
                .click(this.AddGoal.bind(this)),
            $edit = $("<i class='fa fa-pencil'></i>")
                .click(this.EditGoal.bind(this)),
            $remove = $("<i class='fa fa-trash'></i>")
                .click(this.RemoveGoal.bind(this));
        $li.addClass("offerings_list");
        $li.find("span").html(`<strong>${raw_data.target.name}</strong>`);
        $li.append(`<input class='target_id' type='hidden' value=${raw_data.target.id}></input>`);
        $.each(raw_data.goals, function(idx, goal){
            $ul.append(`
                <li> ${goal.name}
                    <input type='hidden' class='goal_description' value='${goal.description}'></input>
                    <input type='hidden' class='goal_amount' value='${goal.amount}'></input>
                    <input type='hidden' class='goal_name' value='${goal.name}'></input>
                </li>
                `);
            $ul.find("li").append($edit).append($remove);
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
    }
    
};

