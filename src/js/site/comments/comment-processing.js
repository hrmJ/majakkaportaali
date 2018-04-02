/**
*
* Sisältää javascript-koodin 
* kommenttien prosessoimista varten
*
*/

var loaderpath = "php/ajax";


/**
 *
 * Laajenna näkyviin uuden kommentin kirjoituskenttä
 *
 */
function ExpandCommentField(){
    $(this).animate({"height":"6em"}); 
    var $details = $(this).parent().parent().find(".commentdetails:eq(0)");
    $details.show();
    ScrollToCenter($details);
}



/**
 *
 * Lataa kaikki kommentit tietokannasta dokumenttiin
 * Lataa myös uuden kommentin syöttämiseen tarvittavat tiedot.
 *
 */
function LoadComments(){
    $.get("php/ajax/Loader.php", {
        action: "load_comments",
        service_id: 2
        },
        function(data){
            $(".loadedcomments").html(data);
            $(".newcomment").val("");
            $(".commentator").val("");
            $(".newcomment:eq(0)").height("3em");
            $(".comment comment-insert-controls").hide()
            $(".commentdetails").hide()
            $("select").prop('selectedIndex',0);
            $(".comment-answer-link")
                .click(CreateCommentAnswerField)
                .each(function(){
                //Muuta vastauslinkin tekstiä ketjujen osalta
                if($(this).parent().parent().find(".comment").length>0) $(this).text("Jatka viestiketjua");
            });
            //Huom! Varmistetan, ettei tallennustapahtuma tule sidotuksi kahdesti
            $(".savecomment").unbind("click",SaveComment);
            $(".savecomment").bind("click",SaveComment);
            $(".newcomment:eq(0)").click(ExpandCommentField);
    }
    );

    //Luo select-elementin, jossa kommentin aiheen voi valita
    $.getJSON("php/ajax/Loader.php", {
        action: "get_responsibilities_list",
        },
        function(data){
            var $sel = $(".commentdetails select");
            $sel.html("").append("<option>Ei aihetta</option>");
            $.each(data, function(idx, el){
                $sel.append(`<option>${el}</option>`)
            });
        }
    );
}

/**
 *
 * Tallenna syötetty kommentti
 *
 */
function SaveComment(){
    console.log("raz!");
    $container = $(this).parent().parent().parent();
    var theme = "";
    var replyto = 0;
    var id = $container.parent().attr("id");
    if(id){
        replyto = id.replace(/c_/,"");
    }
    if($container.find("select").length>0){
        theme = $container.find("select").get(0).selectedIndex>1 ? $container.find("select").val() : "";
    }
    var queryparams = {id:$("#service_id").val(),
                       theme: theme,
                       content:$container.find(".newcomment").val(),
                       commentator:$container.find(".commentator").val(),
                       replyto:replyto
                      };
    $.post(loaderpath + "/savecomment.php",queryparams).done(LoadComments);
}

/**
 *
 * Syötä tekstikenttä kommenttiin tai viestiketjuun
 * vastaamista varten.
 *
 */
function CreateCommentAnswerField(){
    $(this).parent().next().slideDown().children().show();
}


