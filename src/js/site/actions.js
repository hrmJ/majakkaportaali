/**
 *
 * Lisää toiminnallisuuden sivulle: lataa sisällön,
 * liittää eventit... Eri tavalla riippuen siitä, mikä osasivu ladattuna.
 *
 *
 */
$(function(){
    if ($("body").hasClass("servicedetails")){
        Service.Initialize();
    }
});
