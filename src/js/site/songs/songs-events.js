/**
 *
 * Interaktio ja layout-muokkaus laululistasivulle.
 *
 */


$(document).ready (function(){
    if($("body").hasClass("songs")){
        $(".songinput").autocomplete(autocompsongtitle);
        $(".songinput, select").on("change paste keyup",CheckIfLyricsExist);
        //Tarkista jo syötetyistä lauluista, onko niitä tietokannassa
        $(".songinput, select").each(function(){CheckIfLyricsExist($(this),$(this).val())});
        $(".lyricsindicator").click(ShowLyricsWindow);
        $(".sideroller").hide();
        $(".menu").menu({position: { my: "bottom", at: "right-5 top+5" }});
        $("#editwordslink").click(EditLyrics);
        $("#closewordeditlink").click(CloseWordEdit);
        $(".multisongs [type='button']").click(AddMultisongsRow);
        //Tavuta laulutyypit soft-hypheneilla.
        $(".data-left").each(function(){ $(this).html($(this).html().replace(/([^ ])(laul)/,"$1&shy;$2").replace(/ (\d+)/,"&nbsp;$1"))});

        //Sanojen katseluikkuna
        var slv = new SongListView();
        $(".songlistview-toggle").click(function(){slv.Toggle()});
        $("#alpha-select li").click(function(){slv.LoadData($(this))});
        //Rajoitetuille lauluvalinnoille modattu jquery ui -selectmenu
        $("select").select_withtext();

        //Laulujen tallennus
        $("[value='Tallenna']").click(function(event){
            event.preventDefault();
            var id = window.location.search.replace(/.*service_id=(\d+)/,"$1")*1;
            //Tyhjennä ensin kaikki tähän messuun liittyvä informaatio ennen kuin 
            $.post("php/loaders/save_service_song.php",{"cleansongs":"yes","service_id":id},function(data){console.log(data)});
            //Tallenna sitten yksittäin jokainen laulu
            $(".slot-parent").each(function(){ 
                $(this).find(".songinput").each(function(idx,el){
                    console.log(idx);
                    $.post("php/loaders/save_service_song.php",{
                        "service_id":id,
                        "songtype":$(el).parents(".songslot").find("div:eq(0)").text().trim(),
                        "multisong_position":idx+1,
                        "song_title":$(el).val()},function(data){ console.log(data); });
                })
            });
        })

    }
});

