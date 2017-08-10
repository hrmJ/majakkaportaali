/**
*
* Sisältää javascript-koodin messudetaljisivua varten.
*
*/
$(document).ready(function(){
    if($("body").hasClass("servicedetails")){
        //Kommentit
        $(".commentdetails").hide();
        $("#newcomment").click(function(){
            $(this).animate({"height":"6em"}); 
            $(".commentdetails").show();
            ScrollToCenter($(".commentdetails"));
        });
        $(".comment-answer-link")
            .click(function(){console.log("lkj");})
            .each(function(){
            //Muuta vastauslinkin tekstiä ketjujen osalta
            if($(this).parent().parent().find(".comment").length>0) $(this).text("Jatka viestiketjua");
        })
    }
});
