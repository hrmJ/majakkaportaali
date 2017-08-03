$(document).ready(function(){
    if($("body").hasClass("servicelist")){
        //Siirtyminen messudetaljinäkymään
        $(".datarow").click(function(){
            if($("#respfilter").val()=="Yleisnäkymä") window.location="servicedetails.php?id=" + this.id.replace(/[^_]+_/,"");
        });
        //Suodattaminen vastuun mukaan
        $("#respfilter") .change(function(){
            if(!this.value.match(/----/)) window.location="servicelist.php?filterby=" + this.value;
        });

        //Lisää jaottelu kuukausien mukaan
        var months = ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'];
        $(".servicedate").each(function(){
            var thismonth = months[$(this).text().split(".")[1] *1-1];
            if($(document).find("h2:contains("+ thismonth + ")").length==0) $(this).parents(".datarow").before("<h2>"+ thismonth + "</h2>");
        });
    }
});
