<!-- SHEET WORKERS -->
<script type="text/worker">

////////////////////////////////////////////////////////////////////////////////
//
//                                   EVENTS
//
////////////////////////////////////////////////////////////////////////////////

	on("sheet:opened", (e) => {
		// stalker.checkVersion(); // TEMP
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Modifiers
	//////////////////////////////////////////////////////////////////////////////

	on("change:leadership", (e) => {
		stalker.clampAttribute(e.sourceAttribute, e.newValue);
	});

	on("clicked:leadership_reset", () => {
		setAttrs({"leadership": 0}, {silent: true});
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Abilities
	//////////////////////////////////////////////////////////////////////////////

	on("change:health_max change:strength_max change:endurance_max change:agility_max change:reflexes_max change:accuracy_max change:perception_max change:knowledge_max change:will_max change:empathy_max change:persuasion_max change:psychology_max change:selfcontrol_max", (e) => {
		let s = e.sourceAttribute;
		let k = s.substr(0, s.length - 4);
		stalker.updateAbility(k);
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Settings
	//////////////////////////////////////////////////////////////////////////////

	on("clicked:rest", () => {
		stalker.restCharacter();
	});

	on("clicked:recalc", () => {
		stalker.recalcCharacterSheet();
	});

	on("clicked:update", () => {
		stalker.updateCharacterSheet();
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Inventories
	//////////////////////////////////////////////////////////////////////////////

	on("change:repeating_equipment:item_number change:repeating_equipment:item_weight change:repeating_backpack:item_number change:repeating_backpack:item_weight", (e) => {
		let val = parseFloat(e.previousValue);
		let sec = e.sourceAttribute.includes("equipment") ? "equipment" : "backpack";
		let len = 37 + sec.length; // repeating__-xxxxxxxxxxxxxxxxxxx_item_
		let key = e.sourceAttribute.substr(len); // numer / weight
		let k = e.sourceAttribute.substr(0, len); // repeating_xxxxxxxx_-xxxxxxxxxxxxxxxxxxx_item_
		stalker.updateInventory(val, sec, key, k);
	});

////////////////////////////////////////////////////////////////////////////////
//
//                                   MODULE
//
////////////////////////////////////////////////////////////////////////////////

	var stalker = (function () {

		const glob = { // Global variables
			"version" : 2.0
		};

		////////////////////////////////////////////////////////////////////////////
		// * Utilities
		////////////////////////////////////////////////////////////////////////////

		const formatNumber = function(n) { // n = number
			if (Number.isSafeInteger(n)) return n + ",0";
			else {
				let r = n.toString().split(".");
				if (r[1] !== undefined) return r[0] + "," + r[1].substr(0, 1);
				else return r[0] + ",0";
			}
		};

		const parseNumber = function(s) { // s = string
			if (typeof s === "string") return parseFloat(s.replace(",", "."));
			return s;
		};

		////////////////////////////////////////////////////////////////////////////
		// * Modifiers
		////////////////////////////////////////////////////////////////////////////

		const clampAttribute = function(k, n, min, max) { // k = attribute key, n = attribute value, min = integer, max = integer
			if (min === undefined) min = 0;
			if (max === undefined) max = 10;
			let u = {};
			u[k] = Math.min(Math.max(parseInt(n), min), max);
			setAttrs(u, {silent: true});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Abilities
		////////////////////////////////////////////////////////////////////////////

		const updateSelfControl = function(v) { // v = value list ; returns update list
			let u = {}, n = 0;
			n = Math.floor((parseInt(v["endurance_max"]) + parseInt(v["will_max"])) / 2);
			return {"selfcontrol_max" : n};
		};

		const updateAbility = function(k, a) { // k = ability key, a = attribute list
			if (a === undefined) a = [k, k + "_max", k + "_use"];
			if (k == "endurance" || k == "will") a = a.concat(["endurance_max", "will_max"]);
			getAttrs(a, (v) => {
				let u = Object.assign({}, v);
				let n = Math.min(Math.max(parseInt(v[k + "_max"]), 1), 10);
				u[k + "_max"] = n; // force max
				u[k + "_use"] = n; // set max usable
				if (parseInt(v[k]) > n * 2) u[k] = n * 2; // reset usable
				if (k == "endurance" || k == "will") u = Object.assign(u, updateSelfControl(u));
				else if (k == "strength") u["weighing_load_max"] = n * 12;
				setAttrs(u, {silent: true});
			});
		};

		const updateAbilities = function(renew) { // renew = boolean
			let a = ["health", "strength", "endurance", "agility", "reflexes", "accuracy", "perception", "knowledge", "will", "empathy", "persuasion", "psychology", "selfcontrol"], b = [], k;
			for (k in a) {
				b.push(a[k]);
				b.push(a[k] + "_max");
				b.push(a[k] + "_use");
			}
			getAttrs(b, (v) => {
				let u = Object.assign({}, v), n;
				for (k in a) {
					n = Math.min(Math.max(parseInt(v[a[k] + "_max"]), 1), 10);
					if (a[k] == "selfcontrol") {
						if (renew) u[a[k]] = n;
						else continue;
					} else {
						u[a[k] + "_max"] = n; // force max
						u[a[k] + "_use"] = n; // set max usable
						if (renew || parseInt(v[a[k]]) > n * 2) u[a[k]] = n * 2; // reset usable
						if (a[k] == "endurance" || a[k] == "will") u = Object.assign(u, updateSelfControl(u));
						else if (a[k] == "strength") u["weighing_load_max"] = n * 12;
					}
				}
				setAttrs(u, {silent: true});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Vitals
		////////////////////////////////////////////////////////////////////////////

		const resetVitals = function() {
			let a = ["hp_max", "radiation", "exhaustion"];
			getAttrs(a, (v) => {
				let u = {};
				u["hp"] = parseInt(v["hp_max"]);
				u["radiation"] = Math.max(parseInt(v["radiation"]) - 10, 0);
				u["exhaustion"] = Math.max(parseInt(v["exhaustion"]) - 50, 0);
				setAttrs(u, {silent: true});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Inventories
		////////////////////////////////////////////////////////////////////////////

		const updateInventory = function(val, sec, key, k) { // val = previous value, sec = section, key = attribute key, k = row key
			let a = [k + "number", k + "weight", k + "weight_total", sec + "_weight"];
			getAttrs(a, (v) => {
				let u = {};
				let num = parseFloat(v[k + "number"]);
				let wgt = parseFloat(v[k + "weight"]);
				let tot = num * wgt;
				let old = (key == "number" ? wgt : num) * val;
				u[k + "weight_total"] = formatNumber(tot);
				u[sec + "_weight"] = formatNumber(Math.max(parseNumber(v[sec + "_weight"]) + tot - old, 0));
				setAttrs(u, {silent: true});
			});
		};

		const recalcInventories = function() {
			let a = "repeating_equipment";
			let b = "repeating_backpack";
			getSectionIDs(a, (sec_a) => {
				getSectionIDs(b, (sec_b) => {
					let o = [];
					_.each(sec_a, (id) => {
						o.push(
							`${a}_${id}_item_number`,
							`${a}_${id}_item_weight`
						);
					});
					_.each(sec_b, (id) => {
						o.push(
							`${b}_${id}_item_number`,
							`${b}_${id}_item_weight`
						);
					});
					getAttrs(o, (v) => {
						let u = {};
						let n = tot_a = tot_b = 0;
						_.each(sec_a, (id) => {
							n = Math.max(parseFloat(v[`${a}_${id}_item_number`]) * parseFloat(v[`${a}_${id}_item_weight`]), 0);
							u[`${a}_${id}_item_weight_total`] = n;
							tot_a += n;
						});
						_.each(sec_b, (id) => {
							n = Math.max(parseFloat(v[`${b}_${id}_item_number`]) * parseFloat(v[`${b}_${id}_item_weight`]), 0);
							u[`${b}_${id}_item_weight_total`] = n;
							tot_b += n;
						});
						u["equipment_weight"] = formatNumber(tot_a);
						u["backpack_weight"] = formatNumber(tot_b);
						setAttrs(u, {silent: true});
					});
				});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Settings
		////////////////////////////////////////////////////////////////////////////

		const restCharacter = function(k) {
			console.log("Rest..."); // DEBUG
			updateAbilities(true);
			resetVitals();
		};

		const recalcCharacterSheet = function(k) {
			console.log("Recalculate..."); // DEBUG
			updateAbilities();
			recalcInventories();
		};

		const updateCharacterSheet = function() {
			console.log("Update..."); // DEBUG
			//checkVersion();
			dumpCharacterSheet(); // TEMP
		};

		////////////////////////////////////////////////////////////////////////////
		// * Versioning
		////////////////////////////////////////////////////////////////////////////

		const dumpAttributes = function(callback) {
			let a = ["Surnom", "Age", "Taille", "Cheveux", "Yeux", "Faction", "Antecedent", "Titre", "historique", "PV", "PVmax", "fatigue", "nourriture", "soif", "Poids", "poidsMax"];
			let b = ["char_fname", "char_age", "char_size", "char_hair", "char_eyes", "char_faction", "antecedent1", "title1", "biography", "hp", "hp_max", "exhaustion", "starvation", "thirst", "weighing_load", "weighing_load_max"];
			getAttrs(a, (v) => {
				let u = {}, i;
				for (i = 0; i < a.length; i++) {
					if (v[a[i]] !== undefined) u[b[i]] = v[a[i]];
					u[a[i]] = "DEL";
				}
				setAttrs(u, {silent: true}, () => {
					if (callback) callback();
				});
			});
		};

		const dumpAbilities = function(callback) {
			let a = [];
			let b = ["force", "endurance", "sante", "agilite", "reflexe", "precision", "perception", "connassance", "volonte", "empathie", "persuasion", "psychologie", "sandfroid"];
			let c = ["strength", "endurance", "health", "agility", "reflexes", "accuracy", "perception", "knowledge", "will", "empathy", "persuasion", "psychology", "selfcontrol"];
			let i, j = 0;
			for (j = 0; j < b.length; j++) {
				for (i = 1; i <= 10; i++) {
					a.push(b[j] + "-" + i);
					a.push(b[j] + "-" + i + "-1");
				}
			}
			getAttrs(a, (v) => {
				let n = m = 0;
				let k, p, q = c[0], s, u = {};
				for (k in v) {
					p = k.split("-");
					s = c[b.indexOf(p[0])];
					if (q != s) {
						u[q] = n;
						u[q + "_max"] = m;
						n = 0; // reset
						m = 0; // reset
					}
					if (!Number.isNaN(parseInt(v[k]))) {
						if (p[2] === undefined) { // cur
							n += parseInt(v[k]);
						} else { // max
							m += parseInt(v[k]);
						}
					}
					u[k] = "DEL";
					q = s;
				}
				setAttrs(u, {silent: true}, () => {
					if (callback) callback();
				});
			});
		};

		const dumpRepeatingItems = function(callback) {
			let s = "repeating_Specialite";
			getSectionIDs(s, (sec) => {
				let a = [];
				_.each(sec, (id) => {
					a.push(
						// Specialities
						`${s}_${id}_Nom`,
						`${s}_${id}_Rang`,
						`${s}_${id}_Dé`,
						// Armament
						`${s}_${id}_NomArme`,
						`${s}_${id}_Degats`,
						`${s}_${id}_Precition`,
						// Equipment
						`${s}_${id}_NomObjet`,
						`${s}_${id}_Nombre`,
						`${s}_${id}_Poids`
					);
				});
				getAttrs(a, (v) => {
					let u = {};
					_.each(sec, (id) => {
						// 1. Generate new Row Ids
						let n = [];
						n[0] = generateRowID(); // Specialities
						n[1] = generateRowID(); // Armament
						n[2] = generateRowID(); // Equipment
						// 2. Record old values
						if (v[`${s}_{id}_Nom`] != "") u[`repeating_specialities_${n[0]}_spec_name`] = v[`${s}_${id}_Nom`];
						if (v[`${s}_${id}_Rang`] != "") u[`repeating_specialities_${n[0]}_spec_rank`] = v[`${s}_${id}_Rang`];
						if (v[`${s}_${id}_Dé`] != "") u[`repeating_specialities_${n[0]}_spec_die`] = v[`${s}_${id}_Dé`];
						if (v[`${s}_${id}_NomArme`] !== undefined) u[`repeating_armament_${n[1]}_weapon_name`] = v[`${s}_${id}_NomArme`];
						if (v[`${s}_${id}_Degats`] !== undefined) u[`repeating_armament_${n[1]}_weapon_damage`] = v[`${s}_${id}_Degats`];
						if (v[`${s}_${id}_Precition`] !== undefined) u[`repeating_armament_${n[1]}_weapon_accuracy`] = v[`${s}_${id}_Precition`];
						if (v[`${s}_${id}_NomObjet`] !== undefined) u[`repeating_equipment_${n[2]}_item_name`] = v[`${s}_${id}_NomObjet`];
						if (v[`${s}_${id}_Nombre`] !== undefined) u[`repeating_equipment_${n[2]}_item_number`] = parseNumber(v[`${s}_${id}_Nombre`]);
						if (v[`${s}_${id}_Poids`] !== undefined) u[`repeating_equipment_${n[2]}_item_weight`] = parseNumber(v[`${s}_${id}_Poids`]);
						// 3. Erase old values
						removeRepeatingRow(`${s}_${id}`);
					});
					// 4. Set new values
					setAttrs(u, {silent: true}, () => {
						if (callback) callback();
					});
				});
			});
		};

		const dumpRepeatingSection = function(h, callback) { // h = JavaScript object
			getSectionIDs(`repeating_${h.old.sec}`, (sec) => {
				// Define current section fields
				let a = [];
				_.each(sec, (id) => {
					h.old.fld.forEach(function(o) {
						a.push(`repeating_${h.old.sec}_${id}_${o}`);
					});
				});
				// Update current section fields
				getAttrs(a, (v) => {
					let u = {};
					_.each(sec, (id) => {
						// 1. Generate new Row Id
						let n = generateRowID(), q;
						// 2. Record old values
						h.old.fld.forEach(function(o, i) {
							q = v[`repeating_${h.old.sec}_${id}_${o}`];
							if (q !== undefined) u[`repeating_${h.new.sec}_${n}_${h.new.fld[i]}`] = ["Nombre", "Durée", "Poids"].indexOf(o) >= 0 ? parseNumber(q) : q;
						});
						// 3. Erase old values
						removeRepeatingRow(`repeating_${h.old.sec}_${id}`);
					});
					// 4. Set new values
					setAttrs(u, {silent: true}, () => {
						if (callback) callback();
					});
				});
			});
		};

		const dumpCharacterSheet = function(callback) {
			let a = {"old" : {"sec" : "Objet", "fld" : ["Nom", "Nombre", "Durée"]}, "new" : {"sec" : "conditions", "fld" : ["cond_name", "cond_number", "cond_duration"]}}; // Conditions
			let b = {"old" : {"sec" : "sacados", "fld" : ["NomObjet", "Nombre", "Poids"]}, "new" : {"sec" : "backpack", "fld" : ["item_name", "item_number", "item_weight"]}}; // Backpack
			dumpRepeatingItems(() => {
				dumpRepeatingSection(a, () => {
					dumpRepeatingSection(b, () => {
						dumpAttributes(() => {
							dumpAbilities(recalcCharacterSheet);
						});
					});
				});
			});
		};

		const checkVersion = function() {
			getAttrs(["version"], (v) => {
				if (v["version"] === undefined) {
					console.info("S.T.A.L.K.E.R. Sheet's Is Now Dumped to v" + glob.version); // DEBUG
					dumpCharacterSheet();
					setAttrs({"version" : glob.version}, {silent: true});
				} else if (parseFloat(v["version"]) < glob.version) {
					console.info("S.T.A.L.K.E.R. Sheet Is Now Updated to v" + glob.version); // DEBUG
					updateCharacterSheet();
					setAttrs({"version" : glob.version}, {silent: true});
				} else {
					console.info("S.T.A.L.K.E.R. Sheet v" + glob.version + " Loaded!"); // DEBUG
				}
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Output Methods
		////////////////////////////////////////////////////////////////////////////

		return {
			checkVersion: checkVersion,
			clampAttribute: clampAttribute,
			updateAbility: updateAbility,
			updateSelfControl: updateSelfControl,
			updateInventory: updateInventory,
			restCharacter: restCharacter,
			recalcCharacterSheet: recalcCharacterSheet,
			updateCharacterSheet: updateCharacterSheet
		};

	})();

</script>
