
/**
 *
 * Sisäänkirjautumisskriptien käynnistämiseen backend-puolelta käynnistettävät 
 * ei-salaiset frontend-koodit
 *
 *
 */

Portal = Portal || {};

Portal.LoginForm = function(){

    var ajaxpath = Utilities.GetAjaxPath("Saver.php");


    /**
     *
     * Lähettää pyynnön serverille varsinaisen kirjautumislogiikan
     * käynnistämiseksi
     *
     */
    function TestCredentials(){
        $.post(ajaxpath, {
            "action" : "login",
            "username": $("[name='username']").val(),
            "password": $("[name='password']").val(),
        }, (d)=>console.log(d));
    }


    /**
     *
     * Alustaa kirjautumistoiminnallisuuden
     *
     */
    function Initialize (){
        console.log("Alustetaan kirjautumislomake");
        $(".loginbutton").click(TestCredentials);
    }



    return {

        Initialize
    
    }

}()
