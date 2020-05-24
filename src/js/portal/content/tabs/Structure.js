/**
 *
 * Messun rakenteen säätely
 *
 **/
Portal.Service.TabFactory.Structure = function() {
	this.setBaseService = function(baseId) {
		var self = this;
		$.post(
			"php/ajax/Saver.php",
			{
				action: "set_base_service",
				service_id: Portal.Service.GetServiceId(),
				target_id: baseId
			},
			function() {
				var msg = new Utilities.Message(
					"Muutokset tallennettu",
					$("section.comments:eq(0)")
				);
				self.Initialize();
			}
		);
	};

	/**
	 *
	 * Lisää valintaelementin, jolla voi vaihtaa nykyistä messua
	 *
	 */
	this.addBaseServiceList = function() {
		var self = this;
		var list = new Portal.Servicelist.List(),
			$sel = $("<select><option>Käytä pohjana messua</option></select>");
		list.LoadServices(d => {
			console.info(d);
			$sel
				.append(d.map(s => `<option value='${s.id}'>${s.servicedate}</option>`))
				.appendTo($("#pick_base_service").html(""));
			$sel.selectmenu();
			$sel.on("selectmenuchange", function(eel) {
				self.setBaseService($(this).val());
			});
		});
	};

	/**
	 *
	 * Avaa välilehden ja lataa / päivittää sisällön
	 *
	 */
	this.Initialize = function() {
		console.log("Initializing the structure tab");
		this.GetStructure(this.SetStructure);
		this.AddSaveButton();
		this.addBaseServiceList();
	};

	/**
	 *
	 * Syöttää tietokannasta haetun rakennedatan html:ään
	 *
	 **/
	this.SetStructure = function(html) {
		var pres = Portal.Service.GetControlledByPresentation();
		$("#service_specific_structure").html(html);
		GeneralStructure.SetServiceid(Portal.Service.GetServiceId());
		GeneralStructure.Initialize(".structural-element-add");
		if (pres) {
			GeneralStructure.SetControlledByPresentation(pres);
		}
	};

	/**
	 *
	 * Hakee messu-spesifin rakenteen (laulut, osiot, yms) tietokannasta
	 *
	 * @param callaback ajax-vastauksen käsittelevä funktio
	 *
	 **/
	this.GetStructure = function(callback) {
		$.get(
			"php/ajax/Loader.php",
			{
				action: "load_slots",
				service_id: Portal.Service.GetServiceId()
			},
			callback.bind(this)
		);
	};

	/**
	 *
	 *
	 **/
	this.SaveTabData = function() {
		console.log("structure");
	};

	/**
	 *
	 * Kerää kaiken välilehden sisältämän datan joko tallentamista
	 * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
	 *
	 **/
	this.GetTabData = function() {
		//var data = [];
		//this.$div.find(".editable_data_list li").each(function(){
		//    data.push({
		//        responsibility: $(this).find("div:eq(0)").text(),
		//        responsible: $(this).find("input[type='text']").val()
		//    });
		//});
		//return data;
	};
};
