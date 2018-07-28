/*
 * Päivittää tyylisäädinten arvot sen pohjalta, mitä tallennetuissa
 * tyylipohjissa tai lennosta tehdyissä muokkauksissa on asetettu.
 *
 * @param object pres esitysolio
 *
 */

UpdateControllers = function(pres){
    var segment_type = $("#layout-target_select").val();
    if(segment_type=="Koko esitys") segment_type = "body";

    //Päivitä kaikki säätimet tallennettujen tai muokattujen css-sääntöjen mukaisiin arvoihin
    $(".fontcontroller, .positioncontroller").find(".adjuster").each(function(){
        //Etsi ensin kustakin säätimestä, mitä ominaisuutta sillä säädellään
        var target =$(this).parents(".fontcontroller,.positioncontroller").attr("class").match(/(\w+)-changer-parent/i)[1];
        //Etsi myös, mitä tekstitasoa tämä säädin säätää
        var level =$(this).parents(".changer-parent").attr("class").match(/level-(\w+)/i)[1];
        var this_segment_type = (segment_type=="body" ? segment_type : "." + segment_type);
        var thislevel = (level=="body" ? this_segment_type : this_segment_type +  " " + level);

        //Määrittele ensin, onko tämä säädin käytössä
        if(!$(this).parents(".positioncontroller, .fontcontroller").hasClass("controller-not-in-use")){

            if(pres.classes.indexOf(segment_type)>-1 && level == "section"){
                //Huomioi, että section-tason säännöillä section-sana jätetään segmenttityyppikohtaisissa luokissa toistamatta
                thislevel = thislevel.replace(/section/,"").trim();
            }
            if($(this).hasClass("slider")){
                //Numeeriset säätimet---------------------------------------------
                if($(this).parents("section").hasClass("eltype-section")){
                    //Huom: section-tason elementeissä valitse aina sama *body selection* -css-sääntö
                    var newval = pres.styles.GetRule("body section").style[target].replace(/(em|vh|vw).*/,"")*1;
                }
                else{
                    var newval = pres.styles.GetRule(thislevel).style[target].replace(/(em|vh|vw).*/,"")*1;
                }
                // Jos ei saatu järkevää arvoa, käytetään oletusta
                if(isNaN(newval)){
                    newval = $(this).parents("div").find(".defaultvalue").val()*1;
                }
                $(this).slider("value",newval);
            }
            else if($(this).hasClass("spectrum")){
                //Värisäätimet---------------------------------------------
                if(["border"].indexOf(target)>-1){
                    $(this).spectrum("set",pres.styles.GetRule(thislevel).style[target].replace(/.*solid /,""));
                }
                else{
                    $(this).spectrum("set",pres.styles.GetRule(thislevel).style[target]);
                }
            }
            else if($(this).hasClass("select")){
                //Pudotusvalikot---------------------------------------------
                var selectval = pres.styles.GetRule(thislevel).style[target];
                //Poista ylimääräiset lainausmerkit
                var selectval = selectval.replace(/\"/g,"");
                if(selectval){
                    //Fontteja aseteltaessa poista pilkulla erotellut fallbackit kuten Roboto, serif
                    if(target=="fontFamily") selectval = selectval.replace(/,.*/,"");
                    $(this).val((selectval)).selectmenu("refresh");
                }
            }
        }
        else{
            //Jos halutaan palauttaa asetus auto-asentoon ja esitys on jo käynnissä
            var controllername = ($(this).parents(".fontcontroller, .positioncontroller").hasClass("fontcontroller") ? "fontchanger" : "positionchanger");
            if(pres.controls.hasOwnProperty(controllername))
                pres.controls[controllername].Change($(this),"auto");
        }
    });

}
