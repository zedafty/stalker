<!-- SHEET WORKER -->
<script type="text/worker">

////////////////////////////////////////////////////////////////////////////////
//
//                                   EVENTS
//
////////////////////////////////////////////////////////////////////////////////

	on("sheet:opened", (e) => {
		stalker.checkVersion();
		stalker.updateGender();
		stalker.updateCharacterType();
		stalker.setupTranslations();
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Controls
	//////////////////////////////////////////////////////////////////////////////

	on("change:ask_rollmodifier", (e) => {
		let v = e.newValue == "0" ? "" : "?{@{modifier_tra}|0}";
		setAttrs({"rollmodifier" : v}, {silent: true});
	});

	on("change:rollmodifier", (e) => {
		let b = e.newValue == "0" ? "0" : "1";
		setAttrs({"ask_rollmodifier" : b}, {silent: true});
	});

	on("change:ask_rollwhisper", (e) => {
		let v = e.newValue == "0" ? "" : "/w gm";
		setAttrs({"rollwhisper" : v}, {silent: true});
	});

	on("change:rollwhisper", (e) => {
		let b = e.previousValue == "/w gm" && e.newValue != "?{@{whisper_to_gm}|@{dialog_yes},/w gm |@{dialog_no},}" ? "0" : "1";
		setAttrs({"ask_rollwhisper" : b}, {silent: true});
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
	// * Character
	//////////////////////////////////////////////////////////////////////////////

	on("change:char_gender", () => {
		stalker.updateGender();
	});

	on("change:xp change:xp_spent", () => {
		stalker.updateExperience();
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Abilities
	//////////////////////////////////////////////////////////////////////////////

	on("change:strength_base change:endurance_base change:agility_base change:accuracy_base change:reflexes_base change:knowledge_base change:perception_base change:will_base change:empathy_base change:persuasion_base change:psychology_base change:health_base change:strength_aug change:endurance_aug change:agility_aug change:accuracy_aug change:reflexes_aug change:knowledge_aug change:perception_aug change:will_aug change:empathy_aug change:persuasion_aug change:psychology_aug change:selfcontrol_aug change:health_aug change:strength_mod change:endurance_mod change:agility_mod change:accuracy_mod change:reflexes_mod change:knowledge_mod change:perception_mod change:will_mod change:empathy_mod change:persuasion_mod change:psychology_mod change:selfcontrol_mod change:health_mod", (e) => {
		let s = e.sourceAttribute.split("_");
		stalker.updateAbilities(false, s[0], s[1], e.previousValue);
	});

	on("change:strength_use change:endurance_use change:agility_use change:accuracy_use change:reflexes_use change:knowledge_use change:perception_use change:will_use change:empathy_use change:persuasion_use change:psychology_use change:selfcontrol_use change:health_use", (e) => {
		stalker.checkAbilities(e.sourceAttribute.split("_")[0]);
	});

	on("change:selfcontrol_strl", (e) => {
		stalker.checkAbilities("selfcontrol");
	});

	on("clicked:use_strength clicked:use_endurance clicked:use_agility clicked:use_accuracy clicked:use_reflexes clicked:use_knowledge clicked:use_perception clicked:use_will clicked:use_empathy clicked:use_persuasion clicked:use_psychology clicked:use_selfcontrol clicked:use_health", (e) => {
		let k = e.triggerName.substr(12);
		stalker.checkAbilities(k, true);
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Vitals
	//////////////////////////////////////////////////////////////////////////////

	on("change:hp change:hp_aug change:hp_aug change:hp_mod", () => {
		let k = "hp";
		let a = ["health", k, k + "_base", k + "_aug", k + "_mod", k + "_max"];
		getAttrs(a, (v) => {
			setAttrs(stalker.updateHitPoints(v), {silent: true});
		});
	});

	on("change:hydration change:repletion change:exhaustion change:radiation", (e) => {
		stalker.clampAttribute(e.sourceAttribute, stalker.evalFormula(e.newValue), 0, 100);
	});

	on("change:weighing_load_mod", () => {
		let k = "weighing_load";
		let a = ["strength", k, k + "_base", k + "_mod", k + "_max"];
		getAttrs(a, (v) => {
			setAttrs(stalker.updateWeighingLoad(v), {silent: true});
		});
	});

	on("change:bleeding_number change:bleeding_duration change:stunned_number change:stunned_duration change:deafened_number change:deafened_duration change:blinded_number change:blinded_duration change:repeating_conditions:cond_number change:repeating_conditions:cond_duration", (e) => {
		let s = e.sourceAttribute.endsWith("number") ? "num" : "dur";
		stalker.clampAttribute(e.sourceAttribute, e.newValue, null, null, "cond_" + s);
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Specialities
	//////////////////////////////////////////////////////////////////////////////

	on("change:repeating_specialities:spec_ability change:spec_ability_wpn1 change:spec_ability_wpn2 change:spec_ability_wpn3 change:spec_ability_wpn4 change:spec_ability_wpn5 change:spec_ability_wpn6 change:spec_ability_wpn7 change:spec_ability_wpn8 change:spec_ability_wpn9", (e) => {
		stalker.updateSpeciality(e.sourceAttribute, e.newValue);
	});

	on("change:spec_name_wpn1 change:spec_ability_wpn1 change:spec_rank_wpn1 change:spec_name_wpn2 change:spec_ability_wpn2 change:spec_rank_wpn2 change:spec_name_wpn3 change:spec_ability_wpn3 change:spec_rank_wpn3 change:spec_name_wpn4 change:spec_ability_wpn4 change:spec_rank_wpn4 change:spec_name_wpn5 change:spec_ability_wpn5 change:spec_rank_wpn5 change:spec_name_wpn6 change:spec_ability_wpn6 change:spec_rank_wpn6 change:spec_name_wpn7 change:spec_ability_wpn7 change:spec_rank_wpn7 change:spec_name_wpn8 change:spec_ability_wpn8 change:spec_rank_wpn8 change:spec_name_wpn9 change:spec_ability_wpn9 change:spec_rank_wpn9", (e) => {
		stalker.updateWeapons(null, null, e.sourceAttribute.slice(-1));
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Armament
	//////////////////////////////////////////////////////////////////////////////

	on("change:repeating_weapons:weapon_weight change:repeating_weapons:weapon_weight_2 change:repeating_weapons:weapon_weight_3 change:repeating_weapons:weapon_weight_4 change:repeating_weapons:weapon_weight_5 change:repeating_weapons:weapon_weight_level change:repeating_suits:suit_weight change:repeating_suits:suit_weight_2 change:repeating_suits:suit_weight_3 change:repeating_suits:suit_weight_4 change:repeating_suits:suit_weight_5 change:repeating_suits:suit_weight_level", (e) => {
		stalker.updateArmamentWeight(e.sourceAttribute.split("_")[1], e.sourceAttribute);
	});

	on("remove:repeating_weapons remove:repeating_suits", (e) => {
		stalker.recalcWeight();
	});

	on("change:repeating_weapons:weapon_name change:repeating_weapons:weapon_spec change:repeating_weapons:weapon_accuracy change:repeating_weapons:weapon_accuracy_2 change:repeating_weapons:weapon_accuracy_3 change:repeating_weapons:weapon_accuracy_4 change:repeating_weapons:weapon_accuracy_5 change:repeating_weapons:weapon_accuracy_level change:repeating_weapons:weapon_damage change:repeating_weapons:weapon_damage_2 change:repeating_weapons:weapon_damage_3 change:repeating_weapons:weapon_damage_4 change:repeating_weapons:weapon_damage_5 change:repeating_weapons:weapon_damage_level change:repeating_weapons:weapon_status change:repeating_weapons:weapon_status_2 change:repeating_weapons:weapon_status_3 change:repeating_weapons:weapon_status_4 change:repeating_weapons:weapon_status_5 change:repeating_weapons:weapon_status_level change:repeating_weapons:weapon_type change:repeating_weapons:weapon_rate_1 change:repeating_weapons:weapon_rate_2 change:repeating_weapons:weapon_rate_2_val change:repeating_weapons:weapon_rate_3 change:repeating_weapons:weapon_rate_3_val", (e) => {
		let s = undefined;
		let k = e.sourceAttribute.substr(46).replace(/_(\d+|level)$/, "");
		if (k == "accuracy" || k == "damage") s = typeof e.newValue !== "undefined" ? stalker.formatFormula(e.newValue) : "0"; // force format +ndn+s
		if (k != "damage" && k != "damage_level") stalker.updateWeapons(e.sourceAttribute, s, null, (k == "status" ? e.sourceAttribute : false));
		else stalker.updateWeaponDamage(e.sourceAttribute, s, e.newValue); // damage
	});

	on("change:repeating_weapons:weapon_range change:repeating_weapons:weapon_range_2 change:repeating_weapons:weapon_range_3 change:repeating_weapons:weapon_range_4 change:repeating_weapons:weapon_range_5 change:repeating_weapons:weapon_range_level change:repeating_weapons:weapon_thrown change:repeating_weapons:weapon_thrown_2 change:repeating_weapons:weapon_thrown_3 change:repeating_weapons:weapon_thrown_4 change:repeating_weapons:weapon_thrown_5 change:repeating_weapons:weapon_thrown_level change:repeating_weapons:weapon_type", (e) => {
		let s = e.sourceAttribute;
		let q = s.substr(46).split("_")[0];
		let k = s.substr(18,20);
		if (q == "range") {
			stalker.checkWeaponRange(s, k, e.previousValue);
		} else if (q == "thrown") {
			stalker.updateWeaponRange(k, s, e.newValue);
		} else if (q == "type") {
			if (["thrown", "explosive"].includes(e.newValue)) {
				let u = {};
				u[`repeating_weapons_${k}_weapon_range_level`] = "1";
				setAttrs(u, {silent: true}, () => {
					stalker.updateWeaponRange(k, s, null, true);
				});
			} else if (e.newValue == "firearm") {
				stalker.updateWeaponRange(k, s, null, true);
			}
		}
	});

	on("change:repeating_weapons:weapon_ammo_type change:repeating_weapons:weapon_ammo_type_2 change:repeating_weapons:weapon_ammo_type_3 change:repeating_weapons:weapon_ammo_type_4 change:repeating_weapons:weapon_ammo_type_5 change:repeating_weapons:weapon_ammo_type_level", (e) => {
		stalker.updateWeaponAmmoType(e.sourceAttribute, e.newValue);
	});

	on("change:repeating_weapons:weapon_ammo_max change:repeating_weapons:weapon_ammo_max_2 change:repeating_weapons:weapon_ammo_max_3 change:repeating_weapons:weapon_ammo_max_4 change:repeating_weapons:weapon_ammo_max_5 change:repeating_weapons:weapon_ammo_max_level", (e) => {
		let s = e.sourceAttribute;
		stalker.updateWeaponAmmo(s, s.endsWith("level"));
	});

	on("change:repeating_weapons:weapon_ammo_val change:repeating_weapons:weapon_type", (e) => {
		stalker.checkWeaponAmmo(e.sourceAttribute.substr(18,20));
	});

	on("change:repeating_weapons:weapon_type", (e) => {
		let k = e.sourceAttribute.substr(0,38);
		let a = [k + "_weapon_type"];
		getAttrs(a, (v) => {
			let u = {};
			u[k + "_weapon_roll_button"] = ["explosive", "trap"].includes(v[k + "_weapon_type"]) ? "@{weapon_roll_dmg}" : "@{weapon_roll}";
			setAttrs(u, {silent: true});
		});
	});

	on("change:repeating_weapons:weapon_mag change:repeating_weapons:weapon_penetration change:repeating_weapons:weapon_penetration_2 change:repeating_weapons:weapon_penetration_3 change:repeating_weapons:weapon_penetration_4 change:repeating_weapons:weapon_penetration_5 change:repeating_weapons:weapon_penetration_level", (e) => {
		stalker.checkWeaponField(e.sourceAttribute.substr(18,20), e.sourceAttribute.substr(46), e.newValue);
	});

	on("change:repeating_suits:suit_dmg", (e) => {
		let k = e.sourceAttribute.substr(0,36);
		let q = e.newValue;
		stalker.updateSuitDamage(k, q);
	});

	on("change:repeating_suits:suit_blow change:repeating_suits:suit_blow_2 change:repeating_suits:suit_blow_3 change:repeating_suits:suit_blow_4 change:repeating_suits:suit_blow_5 change:repeating_suits:suit_blow_level change:repeating_suits:suit_cut change:repeating_suits:suit_cut_2 change:repeating_suits:suit_cut_3 change:repeating_suits:suit_cut_4 change:repeating_suits:suit_cut_5 change:repeating_suits:suit_cut_level change:repeating_suits:suit_bullet change:repeating_suits:suit_bullet_2 change:repeating_suits:suit_bullet_3 change:repeating_suits:suit_bullet_4 change:repeating_suits:suit_bullet_5 change:repeating_suits:suit_bullet_level change:repeating_suits:suit_burn change:repeating_suits:suit_burn_2 change:repeating_suits:suit_burn_3 change:repeating_suits:suit_burn_4 change:repeating_suits:suit_burn_5 change:repeating_suits:suit_burn_level change:repeating_suits:suit_shock change:repeating_suits:suit_shock_2 change:repeating_suits:suit_shock_3 change:repeating_suits:suit_shock_4 change:repeating_suits:suit_shock_5 change:repeating_suits:suit_shock_level change:repeating_suits:suit_chemical change:repeating_suits:suit_chemical_2 change:repeating_suits:suit_chemical_3 change:repeating_suits:suit_chemical_4 change:repeating_suits:suit_chemical_5 change:repeating_suits:suit_chemical_level change:repeating_suits:suit_blast change:repeating_suits:suit_blast_2 change:repeating_suits:suit_blast_3 change:repeating_suits:suit_blast_4 change:repeating_suits:suit_blast_5 change:repeating_suits:suit_blast_level change:repeating_suits:suit_radiation change:repeating_suits:suit_radiation_2 change:repeating_suits:suit_radiation_3 change:repeating_suits:suit_radiation_4 change:repeating_suits:suit_radiation_5 change:repeating_suits:suit_radiation_level change:repeating_suits:suit_head change:repeating_suits:suit_head_2 change:repeating_suits:suit_head_3 change:repeating_suits:suit_head_4 change:repeating_suits:suit_head_5 change:repeating_suits:suit_head_level change:repeating_suits:suit_torso change:repeating_suits:suit_torso_2 change:repeating_suits:suit_torso_3 change:repeating_suits:suit_torso_4 change:repeating_suits:suit_torso_5 change:repeating_suits:suit_torso_level change:repeating_suits:suit_arms change:repeating_suits:suit_arms_2 change:repeating_suits:suit_arms_3 change:repeating_suits:suit_arms_4 change:repeating_suits:suit_arms_5 change:repeating_suits:suit_arms_level change:repeating_suits:suit_legs change:repeating_suits:suit_legs_2 change:repeating_suits:suit_legs_3 change:repeating_suits:suit_legs_4 change:repeating_suits:suit_legs_5 change:repeating_suits:suit_legs_level", (e) => {
		let u = {};
		let b = e.sourceAttribute.endsWith("level");
		let p = e.sourceAttribute.replace(/_\d$/, "").replace(/_level/, "");
		let q = p.substr(42);
		let k = e.sourceAttribute.substr(0,36);
		let c = ["head", "arms", "torso", "legs"].includes(q);
		let a, s;
		if (b) { // level
			a = [`${k}_suit_${q}`, `${k}_suit_${q}_2`, `${k}_suit_${q}_3`, `${k}_suit_${q}_4`, `${k}_suit_${q}_5`, `${k}_suit_${q}_level`];
			if (c) { // location
				getAttrs(a, (v) => {
					s = stalker.getArmamentLevelValue(v, `${k}_suit_${q}`);
					u[`${k}_suit_${q}_str`] = s;
					u[`${k}_suit_${q}_val`] = stalker.parseFormula(s);
					setAttrs(u, {silent: true});
				});
			} else { // damage
				getAttrs(a, (v) => {
					u[`${k}_suit_${q}_val`] = stalker.getArmamentLevelValue(v, `${k}_suit_${q}`);
					setAttrs(u, {silent: true}, () => {
						stalker.updateSuitDamage(k, q, true);
					});
				});
			}
		} else { // value
			s = typeof e.newValue !== "undefined" ? stalker.formatFormula(e.newValue) : "0";
			u[e.sourceAttribute] = s;
			getAttrs([`${k}_suit_${q}_level`], (v) => {
				if (c) {
					let t = v[`${k}_suit_${q}_level`] == "1" ? "" : "_" + v[`${k}_suit_${q}_level`];
					if (e.sourceAttribute == `${k}_suit_${q}` + t) {
						u[p + "_str"] = s; // location
						u[p + "_val"] = stalker.parseFormula(s); // location
					}
				} else stalker.updateSuitDamage(k, q, true, true); // damage
				setAttrs(u, {silent: true});
			});
		}
	});

	on("change:repeating_suits:suit_psi change:repeating_suits:suit_psi_2 change:repeating_suits:suit_psi_3 change:repeating_suits:suit_psi_4 change:repeating_suits:suit_psi_5 change:repeating_suits:suit_psi_level change:repeating_suits:suit_pocket change:repeating_suits:suit_pocket_2 change:repeating_suits:suit_pocket_3 change:repeating_suits:suit_pocket_4 change:repeating_suits:suit_pocket_5 change:repeating_suits:suit_pocket_level change:repeating_suits:suit_status change:repeating_suits:suit_status_2 change:repeating_suits:suit_status_3 change:repeating_suits:suit_status_4 change:repeating_suits:suit_status_5 change:repeating_suits:suit_status_level", (e) => {
		stalker.checkSuitField(e.sourceAttribute, e.newValue);
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Money
	//////////////////////////////////////////////////////////////////////////////

	on("clicked:gain_money clicked:lose_money", (e) => {
		let k = e.triggerName.substr(8).slice(0, -6);
		stalker.updateMoney(k);
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Inventories
	//////////////////////////////////////////////////////////////////////////////

	on("change:repeating_equipment:item_number change:repeating_equipment:item_weight change:repeating_backpack:item_number change:repeating_backpack:item_weight change:repeating_vehicle:item_number change:repeating_vehicle:item_weight change:repeating_den:item_number change:repeating_den:item_weight", (e) => {
		let s = e.sourceAttribute.split("_")[1];
		let k = e.sourceAttribute.substr(0, 37 + s.length); // repeating_xxxxxxxx_-xxxxxxxxxxxxxxxxxxx_item_
		stalker.updateInventoryWeight(s, k);
	});

	on("clicked:repeating_equipment:backpack clicked:repeating_equipment:vehicle clicked:repeating_equipment:den", (e) => {
		let s = e.sourceAttribute.substr(41);
		let k = e.sourceAttribute.substr(0,40);
		stalker.transferItem(s, k);
	});

	on("clicked:repeating_backpack:equipment clicked:repeating_backpack:vehicle clicked:repeating_backpack:den", (e) => {
		let s = e.sourceAttribute.substr(40);
		let k = e.sourceAttribute.substr(0,39);
		stalker.transferItem(s, k);
	});

	on("clicked:repeating_vehicle:equipment clicked:repeating_vehicle:backpack clicked:repeating_vehicle:den", (e) => {
		let s = e.sourceAttribute.substr(39);
		let k = e.sourceAttribute.substr(0,38);
		stalker.transferItem(s, k);
	});

	on("clicked:repeating_den:equipment clicked:repeating_den:backpack clicked:repeating_den:vehicle", (e) => {
		let s = e.sourceAttribute.substr(35);
		let k = e.sourceAttribute.substr(0,34);
		stalker.transferItem(s, k);
	});

	on("remove:repeating_equipment remove:repeating_backpack remove:repeating_vehicle remove:repeating_den", (e) => {
		let k = e.sourceAttribute;
		let s = k.split("_")[1];
		let w = e.removedInfo[k + "_item_weight_total"];
		stalker.refreshInventoryWeight(s, k, w);
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Settings
	//////////////////////////////////////////////////////////////////////////////

	on("clicked:collapse", () => {
		let a = ["antecedents", "titles", "specialities", "weapons", "suits", "artefacts", "equipment", "backpack", "vehicle", "den"];
		let b = stalker.Stat.abilities, i, u = {};
		for (k in b) u["options_flag_" + b[k]] = "0";
		for (i = 1; i < 10; i++) u["options_flag_specswpn" + i] = "0";
		u["options_toggle_abilities"] = 0;
		u["options_counter_abilities"] = 0;
		u["options_toggle_specswpn"] = 0;
		u["options_counter_specswpn"] = 0;
		u["options_flag_xp"] = 0;
		u["options_flag_hp"] = 0;
		u["options_flag_weighing_load"] = 0;
		setAttrs(u, {silent: true});
		for (k in a) stalker.resetOptionsToggles(a[k]);
	});

	on("clicked:rest", () => {
		stalker.restCharacter();
	});

	on("clicked:recalc", () => {
		stalker.recalcCharacterSheet();
	});

	on("change:sheet_type", (e) => {
		stalker.updateCharacterType(e.newValue);
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Options
	//////////////////////////////////////////////////////////////////////////////

	on("change:opt_strelok", (e) => {
		stalker.updateSpecialities();
		stalker.checkAbilities();
	});

	on("change:opt_iron_skin", (e) => {
		let a = ["opt_iron_skin", "health", ... stalker.Stat.resistances];
		getAttrs(a, (v) => {
			setAttrs(stalker.updateResistances(v, e.newValue), {silent: true}, () => {
				stalker.updateSuitDamages();
			});
		});
	});

	//////////////////////////////////////////////////////////////////////////////
	// * Options Toggles and Flags
	//////////////////////////////////////////////////////////////////////////////

	on("change:options_toggle_abilities", (e) => {
		let a = stalker.Stat.abilities, b = false, k, u = {};
		if (e.newValue == "1") b = true;
		for (k in a) u["options_flag_" + a[k]] = b ? "1" : "0";
		u["options_counter_abilities"] = b ? 13 : 0;
		setAttrs(u, {silent: true});
	});

	on("change:options_flag_strength change:options_flag_endurance change:options_flag_agility change:options_flag_accuracy change:options_flag_reflexes change:options_flag_knowledge change:options_flag_perception change:options_flag_will change:options_flag_empathy change:options_flag_persuasion change:options_flag_psychology change:options_flag_selfcontrol change:options_flag_health", (e) => {
		getAttrs(["options_counter_abilities"], (v) => {
			let u = {};
			let n = parseInt(v["options_counter_abilities"]) + (e.newValue == "0" ? -1 : 1);
			u["options_counter_abilities"] = n;
			if (e.newValue == "1") u["options_toggle_abilities"] = "1";
			else if (n == 0) u["options_toggle_abilities"] = "0";
			setAttrs(u, {silent: true});
		});
	});

	on("change:options_toggle_specswpn", (e) => {
		let b = false, u = {};
		if (e.newValue == "1") b = true;
		for (i = 1; i < 10; i++) u["options_flag_specswpn" + i] = b ? "1" : "0";
		u["options_counter_specswpn"] = b ? 9 : 0;
		setAttrs(u, {silent: true});
	});

	on("change:options_flag_specswpn1 change:options_flag_specswpn2 change:options_flag_specswpn3 change:options_flag_specswpn4 change:options_flag_specswpn5 change:options_flag_specswpn6 change:options_flag_specswpn7 change:options_flag_specswpn8 change:options_flag_specswpn9", (e) => {
		getAttrs(["options_counter_specswpn"], (v) => {
			let u = {};
			let n = parseInt(v["options_counter_specswpn"]) + (e.newValue == "0" ? -1 : 1);
			u["options_counter_specswpn"] = n;
			if (e.newValue == "1") u["options_toggle_specswpn"] = "1";
			else if (n == 0) u["options_toggle_specswpn"] = "0";
			setAttrs(u, {silent: true});
		});
	});

	on("change:options_toggle_antecedents change:options_toggle_titles change:options_toggle_specialities change:options_toggle_weapons change:options_toggle_suits change:options_toggle_artefacts change:options_toggle_equipment change:options_toggle_backpack change:options_toggle_vehicle change:options_toggle_den", (e) => {
		let k = e.sourceAttribute.split("_")[2];
		let s = "repeating_" + k;
		let b = false;
		if (e.newValue == "1") b = true;
		getSectionIDs(s, (sec) => {
			let a = [];
			_.each(sec, (id) => {a.push(`${s}_${id}_options_flag_${k}`)});
			getAttrs(a, (v) => {
				let u = {};
				_.each(sec, (id) => {u[`${s}_${id}_options_flag_${k}`] = b ? "1" : "0"});
				u["options_counter_" + k] = b ? a.length : 0;
				setAttrs(u, {silent: true});
			});
		});
	});

	on("change:repeating_antecedents:options_flag_antecedents change:repeating_titles:options_flag_titles change:repeating_specialities:options_flag_specialities change:repeating_weapons:options_flag_weapons change:repeating_suits:options_flag_suits change:repeating_artefacts:options_flag_artefacts change:repeating_equipment:options_flag_equipment change:repeating_backpack:options_flag_backpack change:repeating_vehicle:options_flag_vehicle change:repeating_den:options_flag_den", (e) => {
		let k = e.sourceAttribute.split("_")[1];
		getAttrs(["options_counter_" + k], (v) => {
			let u = {};
			let n = parseInt(v["options_counter_" + k]) + (e.newValue == "0" ? -1 : 1);
			u["options_counter_" + k] = n;
			if (e.newValue == "1") u["options_toggle_" + k] = "1";
			else if (n == 0) u["options_toggle_" + k] = "0";
			setAttrs(u, {silent: true});
		});
	});

////////////////////////////////////////////////////////////////////////////////
//
//                                   MODULE
//
////////////////////////////////////////////////////////////////////////////////

	var stalker = (function() {

		////////////////////////////////////////////////////////////////////////////
		// * Variables
		////////////////////////////////////////////////////////////////////////////

		const Glob = { // Global
			"version" : 2.11
		};

		const Stat = { // Static
			"abilities" : ["strength", "endurance", "agility", "accuracy", "reflexes", "knowledge", "perception", "will", "empathy", "persuasion", "psychology", "selfcontrol", "health"],
			"resistances" : ["resistance_burn", "resistance_shock", "resistance_blow", "resistance_cut", "resistance_radiation", "resistance_chemical"],
			"weighing_load" : ["weighing_load", "weighing_load_base", "weighing_load_mod", "weighing_load_max", "strength"]
		};

		const Roll = {
			"rollbase" : {
				"pc" : "@{rollwhisper} &{template:stalker} {{pc_name=@{character_name}}}",
				"mutant" : "@{rollwhisper} &{template:stalker} {{mutant_name=@{character_name}}}",
				"tainted" : "@{rollwhisper} &{template:stalker} {{tainted_name=@{character_name}}}"
			},
			"speciality" : `@{rollbase} {{header=@{spec_name_____}}} {{showability=[[1]]}} {{r_ability=^{@{spec_ability_____}}}} {{r_ability_name=}} {{draw_ability=}} {{showrank=[[@{spec_rank_____}]]}} {{r_rank=+@{spec_rank_____}}} {{showleadership=[[@{leadership}]]}} {{r_leadership=+@{leadership}}} {{showselfcontrol=[[@{selfcontrol_ctrl}]]}} {{r_selfcontrol=+@{selfcontrol_die}d10}} {{draw_selfcontrol=[}](@{draw_selfcontrol})}} {{showmodifier=[[@{rollmodifier}]]}} {{r_modifier=+@{rollmodifier}}} {{roll=[[0d10 [@{ability_tra}] + @{spec_rank_____} [@{rank_tra}] + @{leadership} [@{leadership_tra}] + [[@{selfcontrol_ctrl} * @{selfcontrol_die}]]d10 [@{selfcontrol_tra}] + @{rollmodifier} [@{modifier_tra}]]]}}`,
			"weapon" : `@{rollbase} {{header=@{weapon_name}}} {{no_weapon_speciality=[[1]]}}`
		};

		const MinMax = {
			"attr" : [0, 10], // default attribute
			"abi_base" : [0, 10],
			"abi_val" : [0, 10],
			"abi_aug" : [0, 10],
			"abi_mod" : [-10, 10],
			"hp_mod" : [-25, 50],
			"cond_num" : [0, 99],
			"cond_dur" : [0, 999],
			"wgt_load_mod" : [-120, 240],
			"wpn_thrown" : [1, 100],
			"wpn_range" : [0, 9999],
			"wpn_ammo" : [0, 9999],
			"wpn_mag" : [0, 50],
			"wpn_penetration" : [0, 25],
			"wpn_rate_2" : [1, 9],
			"wpn_rate_3" : [1, 99],
			"wpn_status" : [-25, 25],
			"wpn_weight" : [0, 100],
			"sui_psi" : [0, 50],
			"sui_pocket" : [0, 10],
			"sui_status" : [-50, 50],
			"sui_weight" : [0, 250],
			"money" : [0, 999999],
			"xp" : [0, 999]
		};

		////////////////////////////////////////////////////////////////////////////
		// * Utilities
		////////////////////////////////////////////////////////////////////////////

		const getMin = function(k) { // k = minmax key
			return MinMax[k][0];
		};

		const getMax = function(k) { // k = minmax key
			return MinMax[k][1];
		};

		const formatNumber = function(n, b) { // n = number, b = zero padding ; returns string
			let s = b ? ",0" : "";
			if (Number.isNaN(n) || n === undefined) n = 0;
			if (Number.isSafeInteger(n)) return n + s;
			else {
				let r = n.toString().split(".");
				if (r[1] !== undefined) return r[0] + "," + r[1].substr(0, 2);
				else return r[0] + s;
			}
		};

		const parseNumber = function(s) { // s = string ; returns number
			if (Number.isNaN(s) || s === undefined) s = 0;
			else if (typeof s === "string") return parseFloat(s.replace(",", "."));
			return s;
		};

		const clampInt = function(n, min, max) { // n = value, min = minimum, max = maximum ; returns number
			n = parseInt(n) || 0;
			if (min != null && max != null) {
				n = Math.min(Math.max(n, min), max);
			} else if (min != null) {
				n = Math.max(n, min)
			} else if (max != null) {
				n = Math.min(n, max);
			} return n;
		};

		const evalFormula = function(s) { // s = string ; returns number
			let reg = /^([\+\-]?\d+)\s*([\+\-]?\d+)?\s*([\+\-]?\d+)?\s*([\+\-]?\d+)?$/i;
			return reg.test(s) ? eval(s) : "0";
		};

		const parseFormula = function(s) { // s = string ; returns string
			return (typeof s !== "undefined" ? s.replaceAll("×", "*") : "0");
		};

		const formatFormula = function(s) { // s = string ; returns string
			let reg = /^([\+\-]?\d+)?\(?([\+\-]?\d+|[\+\-]?\d+d\d+|[\+\-]?\d+[\+\-]\d+|[\+\-]?\d+d\d+[\+\-]\d+)\)?([×x\*][\+\-]?\d+)?([\+\-]?\d+)?$/i;
			s = s.trim();
			return reg.test(s) ? s.replace(/[Xx\*]/, "×") : "0";
		};

		////////////////////////////////////////////////////////////////////////////
		// * Attributes
		////////////////////////////////////////////////////////////////////////////

		const clampAttribute = function(k, n, min, max, s) { // k = attribute key, n = attribute value, min = integer, max = integer, s = min-max string
			if (s == null) s = "attr";
			if (min == null) min = getMin(s);
			if (max == null) max = getMax(s);
			let u = {};
			u[k] = clampInt(n, min, max);
			setAttrs(u, {silent: true});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Character
		////////////////////////////////////////////////////////////////////////////

		const updateGender = function() {
			getAttrs(["char_gender"], (v) => {
				let u = {};
				let k = v["char_gender"];
				u["overburdened"] = getTranslationByKey("overburdened_" + k);
				u["bleeding_name"] = getTranslationByKey("bleeding_" + k);
				u["stunned_name"] = getTranslationByKey("stunned_" + k);
				u["deafened_name"] = getTranslationByKey("deafened_" + k);
				u["blinded_name"] = getTranslationByKey("blinded_" + k);
				u["hit_head_str"] = getTranslationByKey("hit_head_" + k);
				u["hit_arms_str"] = getTranslationByKey("hit_arms_" + k);
				u["hit_torso_str"] = getTranslationByKey("hit_torso_" + k);
				u["hit_legs_str"] = getTranslationByKey("hit_legs_" + k);
				u["opt_strelok_hint"] = getTranslationByKey("opt_strelok_hint_" + k);
				setAttrs(u, {silent: true});
			});
		};

		const checkExperience = function(n) { // n = experience value
			let k = "rookie";
			if (n >= 450) k = "master";
			else if (n >= 150) k = "veteran";
			else if (n >= 50) k = "stalker";
			setAttrs({"char_rank" : getTranslationByKey(k)}, {silent: true});
		};

		const updateExperience = function() {
			getAttrs(["xp", "xp_spent", "xp_rest"], (v) => {
				let u = {};
				u["xp"] = clampInt(v["xp"], getMin("xp"), getMax("xp"));
				u["xp_spent"] = clampInt(v["xp_spent"], 0, u["xp"]);
				u["xp_rest"] = u["xp"] - u["xp_spent"];
				setAttrs(u, {silent: true});
				checkExperience(u["xp"]);
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Abilities
		////////////////////////////////////////////////////////////////////////////

		const updateSelfControl = function(v, renew) { // v = value list, renew = boolean ; returns update list
			let u = {}, k = "selfcontrol";
			let n = Math.floor((parseInt(v["endurance"]) + parseInt(v["will"])) / 2);
			let m = Math.min(n + parseInt(v[k + "_mod"]) + parseInt(v[k + "_aug"]), 10);
			u[k + "_base"] = n;
			u[k] = m;
			if (renew || parseInt(v[k + "_use"]) > m) u[k + "_use"] = m; // reset usable value
			return u;
		};

		const updateHitPoints = function(v) { // v = value list ; returns update list
			let u = {}, k = "hp";
			let c = typeof v[k] === "string" ? evalFormula(v[k].trim()) : v[k];
			let n = parseInt(v["health"]) * 5;
			let d = clampInt(v[k + "_mod"], getMin(k + "_mod"), getMax(k + "_mod"));
			let m = Math.max(n + d, 0);
			u[k] = c > m ? m : Math.max(c, 0);
			u[k + "_base"] = n;
			u[k + "_mod"] = d;
			u[k + "_max"] = m;
			u[k + "_percent"] = Math.max(Math.min(Math.floor(u[k] / m * 100), 100), 0);
			u[k + "_warning"] = u[k + "_percent"] == 0 ? "2" : u[k + "_percent"] <= 10 ? "1" : "0";
			return u;
		};

		const updateWeighingLoad = function(v, w) { // v = value list, w = weighing load ; returns update list
			let u = {}, k = "weighing_load";
			let n = parseInt(v["strength"]) * 12;
			let d = clampInt(v[k + "_mod"], getMin("wgt_load_mod"), getMax("wgt_load_mod"));
			let m = Math.max(n + d, 0);
			if (w === undefined) w = parseInt(v[k]);
			u[k + "_base"] = n;
			u[k + "_mod"] = d;
			u[k + "_max"] = m;
			u[k + "_percent"] = Math.max(Math.min(Math.floor(parseNumber(w) / m * 100), 100), 0);
			u[k + "_warning"] = u[k + "_percent"] == 100 ? "2" : u[k + "_percent"] >= 90 ? "1" : "0";
			return u;
		};

		const updateResistances = function(v) { // v = value list ; returns update list
			let u = {};
			let i = parseInt(v["health"]);
			let n = Math.floor(i / 2);
			let m = Math.floor(i / 4);
			let x = v["opt_iron_skin"] == "1" ? 5 : 0;
			u["resistance_burn"] = m + x;
			u["resistance_shock"] = m + x;
			u["resistance_blow"] = n + x;
			u["resistance_cut"] = n + x;
			u["resistance_radiation"] = m + x;
			u["resistance_chemical"] = m + x;
			return u;
		};

		const updateAbilities = function(renew, key, suf, prv, recalc, callback) { // renew = boolean, key = attribute key, suf = attribute suffix, prv = previous value, recalc = boolean flag, callback = function
			let l = ["hp", "weighing_load"];
			let f = key == undefined;
			let a = f ? Stat.abilities.concat(l) : [key];
			let b = ["abilities_total"], k, i, s;
			prv = prv != undefined ? parseInt(prv) : 0;
			if (key == "strength") a = a.concat(["weighing_load"]);
			else if (key == "endurance") a = a.concat(["will", "selfcontrol"]);
			else if (key == "will") a = a.concat(["endurance", "selfcontrol"]);
			else if (key == "health") a = a.concat(["hp", "opt_iron_skin"]);
			for (k in a) {
				s = l.includes(a[k]) ? "_max" : "_use";
				b.push(a[k]);
				b.push(a[k] + "_base");
				b.push(a[k] + "_aug");
				b.push(a[k] + "_mod");
				b.push(a[k] + s);
			}
			getAttrs(b, (v) => {
				let u = {}, base, aug, mod, val;
				let m = f ? 0 : parseInt(v["abilities_total"]);
				for (k in a) {
					if (l.includes(a[k])) continue;
					i = a[k] == "selfcontrol" ? 1 : 2;
					base = clampInt(v[a[k] + "_base"], getMin("abi_base"), getMax("abi_base"));
					aug = clampInt(v[a[k] + "_aug"], getMin("abi_aug"), getMax("abi_aug"));
					mod = clampInt(v[a[k] + "_mod"], getMin("abi_mod"), getMax("abi_mod"));
					val = clampInt(base + aug + mod, getMin("abi_val"), getMax("abi_val"));
					u[a[k]] = val; // calculate value
					u[a[k] + "_base"] = base; // clamp base value
					u[a[k] + "_aug"] = aug; // clamp aug value
					u[a[k] + "_mod"] = mod; // clamp mod value
					if (renew || parseInt(v[a[k] + "_use"]) > val * i) u[a[k] + "_use"] = val * i; // reset usable value
					if (f && a[k] != "selfcontrol") m += a[k] == "selfcontrol" ? aug : base + aug;
					else if (a[k] == key) {
						if (suf == "base") m += (base - prv);
						else if (suf == "aug") m += (aug - prv);
					}
				}
				if (a.includes("strength") && !recalc) u = Object.assign(u, updateWeighingLoad(Object.assign(v, u)));
				if (a.includes("endurance") || a.includes("will")) u = Object.assign(u, updateSelfControl(u, renew));
				if (a.includes("health")) u = Object.assign(u, updateHitPoints(Object.assign(v, u)));
				if (a.includes("health")) u = Object.assign(u, updateResistances(Object.assign(u)));
				if (renew) u["selfcontrol_toggle"] = "1"; // reset self-control toggle
				u["abilities_total"] = m;
				setAttrs(u, {silent: true}, function() {
					if (a.includes("strength")) updateWeaponRange();
					if (typeof callback == "function") callback();
				});
			});
		};

		const checkAbilities = function(k, f, callback) { // k = ability name, f = spend ability flag, callback = function
			let l = ["opt_strelok"];
			let a = l.concat(k == undefined ? Stat.abilities : [k]);
			let b = [];
			for (k in a) {
				b.push(a[k]);
				b.push(a[k] + "_use");
			}
			getAttrs(b, (v) => {
				let u = {};
				let c = v["opt_strelok"] == "1" ? true : false;
				let n;
				for (k in a) {
					if (Stat.abilities.includes(a[k])) {
						n = parseInt(v[a[k] + "_use"]);
						if (f) { // spend ability
							n = Math.max(n - (c ? 2 : 1), 0);
							u[a[k] + "_use"] = n;
						}
						if (n == 0) {
							if (a[k] == "selfcontrol") {
								u["selfcontrol_toggle"] = 0;
								u["selfcontrol_ctrl"] = 0;
							}
							u[a[k] + "_die"] = 0;
						} else {
							if (a[k] == "selfcontrol") u["selfcontrol_toggle"] = 1;
							u[a[k] + "_die"] = Math.min((c ? 2 : 1), (f ? u[a[k] + "_use"] : parseInt(v[a[k] + "_use"])));
						}
					}
				}
				setAttrs(u, {silent: true}, () => {
					if (typeof callback == "function") callback();
				});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Vitals
		////////////////////////////////////////////////////////////////////////////

		const resetVitals = function(callback) {
			let a = ["hp", "hp_base", "hp_mod", "hp_max", "health"];
			getAttrs(a, (v) => {
				let u = {};
				let n = parseInt(v["hp"]) + parseInt(v["health"]);
				let m = parseInt(v["hp_max"]);
				u["hp"] = clampInt(n, 0, m);
				u = Object.assign(u, updateHitPoints(Object.assign(v, u)));
				setAttrs(u, {silent: true}, () => {
					if (callback) callback();
				});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Specialities
		////////////////////////////////////////////////////////////////////////////

		const updateSpeciality = function(key, abi, a, b, raz) { // key = speciality key, abi = ability name, a = prefix array, b = attributes array, raz = reinitialize roll string
			if (key != null) {
				key = key.startsWith("repeating_") ? key.slice(0, -7) + "roll" : key.replace("ability", "roll");
				a = [key];
				b = [key];
			}
			getAttrs(["opt_strelok", ...b], (v) => {
				let u = {};
				let c = v["opt_strelok"] == "1" ? true : false;
				let n = c ? 2 : 1;
				let r1 = r2 = r3 = r4 = r5 = "";
				let k, s, q, p, r;
				_.each(a, (o) => {
					if (key == null) {
						k = o.startsWith("repeating_") ? o + "_spec_ability" : "spec_ability_" + o;
						s = o.startsWith("repeating_") ? o + "_spec_roll" : "spec_roll_" + o;
						q = v[k];
					} else {
						s = key;
						q = abi;
					}
					if (q !== "null") {
						r1 = "[[@{" + q + "_use}]]";
						r2 = "[}](@{draw_" + q + "})";
						r3 = "[+@{" + q + "_die}d10](@{show_" + q + "})";
						r4 = q;
						r5 = "@{" + q + "_die}d10";
					} else { // reset variables
						r1 = "";
						r2 = "";
						r3 = "";
						r4 = "";
						r5 = "0d10";
					}
					if (raz) {
						p = o.startsWith("repeating_") ? "" : "_" + o;
						r = Roll.speciality.replaceAll("_____", p);
					} else r = v[s];
					u[s] = r.replace(/\{\{showability=[^ ]+/, "{{showability=" + r1 + "}}");
					u[s] = u[s].replace(/\{\{draw_ability=[^ ]+/, "{{draw_ability=" + r2 + "}}");
					u[s] = u[s].replace(/\{\{r_ability=[^ ]+/, "{{r_ability=" + r3 + "}}");
					u[s] = u[s].replace(/\{\{r_ability_name=[^ ]+/, "{{r_ability_name=" + r4 + "}}");
					u[s] = u[s].replace(/\{\{roll=\[\[(\d+|@\{\w+\})d10/, "{{roll=[[" + r5);
				});
				setAttrs(u, {silent: true}, function() {
					if (key == null) updateWeapons();
				});
			});
		};

		const updateSpecialities = function(raz) { // raz = reinitialize roll string
			let a = [], b = [];
			let r = "repeating_specialities";
			let i = 1;
			getSectionIDs(r, (sec) => {
				_.each(sec, (id) => {
					a.push(`${r}_${id}`);
					b.push(`${r}_${id}_spec_ability`);
					b.push(`${r}_${id}_spec_roll`);
				});
				for (i; i <= 9; i++) {
					a.push(`wpn${i}`);
					b.push(`spec_ability_wpn${i}`);
					b.push(`spec_roll_wpn${i}`);
				}
				updateSpeciality(null, null, a, b, raz);
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Armament
		////////////////////////////////////////////////////////////////////////////

		const getArmamentLevelIndex = function(v, k) { // v = attributes list, k = attribute key
			let n = v[k + "_level"];
			return (n != "1" ? n : "");
		};

		const getArmamentLevelString = function(v, k) { // v = attributes list, k = attribute key
			let n = getArmamentLevelIndex(v, k);
			return (n != "" ? k + "_" + n : k);
		};

		const getArmamentLevelValue = function(v, k) { // v = attributes list, k = attribute key
			let n = getArmamentLevelIndex(v, k);
			return (n != "" ? v[k + "_" + n] : v[k]);
		};

		const updateArmamentWeight = function(s, k, c) { // s = section, k = row key, c = section flag
			let r = "repeating_" + s;
			let a = [s + "_weight", ...Stat.weighing_load];
			let t = s.substr(0, s.length-1);
			let b = k.endsWith("level");
			let i = s == "weapons" ? k.substr(18,20) : k.substr(16,20); // suits
			let id = i + "_" + t;
			a = a.concat([`${r}_${id}_weight_val`, `${r}_${id}_weight`, `${r}_${id}_weight_2`, `${r}_${id}_weight_3`, `${r}_${id}_weight_4`, `${r}_${id}_weight_5`, `${r}_${id}_weight_level`]);
			getAttrs(a, (v) => {
				let u = {};
				let n, m, w;
				n = b ? getArmamentLevelValue(v, `${r}_${id}_weight`) : formatNumber(v[k]);
				n = Math.min(Math.max(parseNumber(n), 0), (t == "weapon" ? getMax("wpn_weight") : getMax("sui_weight")));
				if (b || (k.endsWith("weight") ? "1" : k.slice(-1)) == v[`${r}_${id}_weight_level`]) {
					m = parseNumber(v[`${r}_${id}_weight_val`]);
					w = formatNumber(Math.max(parseNumber(v["weighing_load"]) + n - m), 0);
					u[`${r}_${id}_weight_val`] = n;
					u[s + "_weight"] = formatNumber(Math.max(parseNumber(v[s + "_weight"]) + n - m, 0));
					u["weighing_load"] = w;
					u = Object.assign(u, updateWeighingLoad(v, w));
				}
				if (!b) u[k] = formatNumber(n);
				setAttrs(u, {silent: true});
			});
		};

		const updateWeapon = function(k, n, v, q, id, us) { // k = source attribute, n = accuracy value, v = attributes list, q = weapon specialization name, id = repeating speciality id, us = update status
			let r = "repeating_weapons";
			getAttrs([v[`${r}_${id}_weapon_spec`], q], (w) => {
				let t, s, o, c, i, u = {};
				if (k != null && !k.endsWith("level") && k.substr(46).split("_")[0] == "accuracy") u[k] = n; // set accuracy
				if (k == null || n == undefined || k.endsWith("level") || k != getArmamentLevelString(v, `${r}_${id}_weapon_accuracy`)) n = getArmamentLevelValue(v, `${r}_${id}_weapon_accuracy`); // get accuracy
				t = clampInt(getArmamentLevelValue(v, `${r}_${id}_weapon_status`), getMin("wpn_status"), getMax("wpn_status"));
				s = "[[" + parseFormula(n) + " [" + getTranslationByKey("weapon_accuracy") + "]" + (t < 0 ? " " + t + " [" + getTranslationByKey("weapon_status") + "]": ""); // negative weapon status decrease accuracy
				o = v[`${r}_${id}_weapon_spec`] == "null" ? s + "]]" : w[v[`${r}_${id}_weapon_spec`]].replace(/\{\{roll=\[\[/, "{{roll=" + s + " + ");
				s = w[q] !== undefined ? " {{r_speciality=" + w[q] + "}}" : "";
				o = o.replace(/\{\{header=[^ ]+/, "{{header=" + v[`${r}_${id}_weapon_name`] + "}}" + s);
				o += " {{wpn_acc=+" + n + "}}";
				if (v[`${r}_${id}_weapon_range_val`] != "0") o += " {{wpn_rng=" + v[`${r}_${id}_weapon_range_val`] + "}}";
				if (t != 0) o += " {{wpn_stt=" + (t > 0 ? "+" + t : t) + "}} {{wpn_stt_r=[[" + t + "]]}}";
				if (v[`${r}_${id}_weapon_type`] != "melee") u[`${r}_${id}_weapon_bleed`] = "0";
				if (v[`${r}_${id}_weapon_type`] == "firearm") {
					c = "";
					if (v[`${r}_${id}_weapon_rate_1`] == "1") c = getTranslationByKey("weapon_rate_1");
					if (v[`${r}_${id}_weapon_rate_2`] == "1") {
						c += (c != "" ? "\n" : "") + getTranslationByKey("weapon_rate_2");
						i = clampInt(v[`${r}_${id}_weapon_rate_2_val`], getMin("wpn_rate_2"), getMax("wpn_rate_2"));
						if (i > 1) c += " (×" + i + ")";
						u[`${r}_${id}_weapon_rate_2_val`] = i;
					}
					if (v[`${r}_${id}_weapon_rate_3`] == "1") {
						c += (c != "" ? "\n" : "") + getTranslationByKey("weapon_rate_3");
						i = clampInt(v[`${r}_${id}_weapon_rate_3_val`], getMin("wpn_rate_3"), getMax("wpn_rate_3"));
						if (i > 1) c += " (×" + i + ")";
						u[`${r}_${id}_weapon_rate_3_val`] = i;
					}
					if (c != "") o += " {{wpn_rate=" + c + "}}";
				}
				o += " {{roll_dmg_btn=[t](~_x_weapon_roll_dmg)}}";
				o += " {{roll_loc_btn=[[](~@{character_id}|location)}}";
				if (us) u[us] = clampInt(v[us], getMin("wpn_status"), getMax("wpn_status"));
				u[`${r}_${id}_weapon_spec_str`] = w[q] !== undefined && w[q] !== "" ? w[q] : "—";
				u[`${r}_${id}_weapon_roll`] = o;
				setAttrs(u, {silent: true});
			});
		};

		const updateWeapons = function(k, n, i, us) { // k = source attribute, n = accuracy value, i = weapon speciality index, us = update status
			let r = "repeating_weapons";
			let a = [], u = {};
			let b, m, q;
			getSectionIDs(r, (sec) => {
				_.each(sec, (id) => {
					a.push(`${r}_${id}_weapon_spec`);
					a.push(`${r}_${id}_weapon_name`);
					a.push(`${r}_${id}_weapon_accuracy`);
					a.push(`${r}_${id}_weapon_accuracy_2`);
					a.push(`${r}_${id}_weapon_accuracy_3`);
					a.push(`${r}_${id}_weapon_accuracy_4`);
					a.push(`${r}_${id}_weapon_accuracy_5`);
					a.push(`${r}_${id}_weapon_accuracy_level`);
					a.push(`${r}_${id}_weapon_range_val`);
					a.push(`${r}_${id}_weapon_status`);
					a.push(`${r}_${id}_weapon_status_2`);
					a.push(`${r}_${id}_weapon_status_3`);
					a.push(`${r}_${id}_weapon_status_4`);
					a.push(`${r}_${id}_weapon_status_5`);
					a.push(`${r}_${id}_weapon_status_level`);
					a.push(`${r}_${id}_weapon_type`);
					a.push(`${r}_${id}_weapon_rate_1`);
					a.push(`${r}_${id}_weapon_rate_2`);
					a.push(`${r}_${id}_weapon_rate_2_val`);
					a.push(`${r}_${id}_weapon_rate_3`);
					a.push(`${r}_${id}_weapon_rate_3_val`);
				});
				getAttrs(a, (v) => {
					_.each(sec, (id) => { // weapons
						b = k != null && k.substr(18,20) == id;
						if (b || k == null) {
							if (v[`${r}_${id}_weapon_spec`] != "null") {
								m = parseInt(v[`${r}_${id}_weapon_spec`].slice(-1));
								if (i == null || i == m) {
									q = "spec_name_wpn" + m;
									updateWeapon(k, n, v, q, id, us);
								} else {
									// console.log("Index out of bounds for " + v[`${r}_${id}_weapon_name`]); // DEBUG
								}
							} else {
								// console.log("No spec for " + v[`${r}_${id}_weapon_name`]); // DEBUG
								u[`${r}_${id}_weapon_roll`] = Roll.weapon;
								u[`${r}_${id}_weapon_spec_str`] = "—";
							}
						} else {
							// console.log("Wrong id for " + v[`${a}_${id}_weapon_name`]); // DEBUG
						}
					});
					setAttrs(u, {silent: true});
				});
			});
		};

		const updateWeaponDamage = function(k, f, n) { // k = source attribute, s = damage formula, n = attribue new value
			let u = {};
			let t = k.substr(0,52);
			if (k.endsWith("level")) {
				n = n == "1" ? "" : "_" + n;
				k = k.replace("_level", n);
				getAttrs([k], (v) => {
					u[t + "_val"] = "[[" + stalker.parseFormula(v[k]) + "]]";
					setAttrs(u, {silent: true});
				});
			} else {
				u[k] = f;
				getAttrs([t + "_level"], (v) => {
					if (t + "_" + v[t + "_level"] == k) {
						u[t + "_val"] = "[[" + stalker.parseFormula(f) + "]]";
						setAttrs(u, {silent: true});
					}
				});
				setAttrs(u, {silent: true});
			}
		};

		const resetWeaponDamage = function() {
			let r = "repeating_weapons";
			let a = [], u = {};
			getSectionIDs(r, (sec) => {
				_.each(sec, (id) => {
					a.push(`${r}_${id}_weapon_damage`);
					a.push(`${r}_${id}_weapon_damage_2`);
					a.push(`${r}_${id}_weapon_damage_3`);
					a.push(`${r}_${id}_weapon_damage_4`);
					a.push(`${r}_${id}_weapon_damage_5`);
					a.push(`${r}_${id}_weapon_damage_level`);
				});
				getAttrs(a, (v) => {
					_.each(sec, (id) => {
						u[`${r}_${id}_weapon_damage_val`] = "[[" + parseFormula(v[getArmamentLevelString(v, `${r}_${id}_weapon_damage`)]) + "]]";
					});
					setAttrs(u, {silent: true});
				});
			});
		};

		const updateWeaponRange = function(k, s, i, z) { // k = repeating weapon id, s = source attribute, i = new value, z = reset to zero flag
			let r = "repeating_weapons";
			let a = ["strength"], u = {};
			let b, c, n, m, j, g;
			getSectionIDs(r, (sec) => {
				_.each(sec, (id) => {
					a.push(`${r}_${id}_weapon_type`);
					a.push(`${r}_${id}_weapon_range`);
					a.push(`${r}_${id}_weapon_range_old`);
					a.push(`${r}_${id}_weapon_thrown`);
					a.push(`${r}_${id}_weapon_thrown_2`);
					a.push(`${r}_${id}_weapon_thrown_3`);
					a.push(`${r}_${id}_weapon_thrown_4`);
					a.push(`${r}_${id}_weapon_thrown_5`);
					a.push(`${r}_${id}_weapon_thrown_level`);
				});
				getAttrs(a, (v) => {
					_.each(sec, (id) => {
						s = s === undefined ? `${r}_${id}_weapon_thrown_level` : s;
						b = k != null && k == id;
						c = s.endsWith("level");
						if (b || k == null) {
							g = ["thrown", "explosive"].includes(v[`${r}_${id}_weapon_type`]);
							if (g) {
								n = c || s.endsWith("type") ? getArmamentLevelValue(v, `${r}_${id}_weapon_thrown`) : i;
								n = clampInt(n, getMin("wpn_thrown"), getMax("wpn_thrown"));
								m = (parseInt(v[`strength`]) || 0) * n;
								if (!c && !s.endsWith("type")) u[s] = n;
								if (z) u[`${r}_${id}_weapon_range_old`] = v[`${r}_${id}_weapon_range`];
							} else if (z) u[`${r}_${id}_weapon_range`] = v[`${r}_${id}_weapon_range_old`];
							let w = v[`${r}_${id}_weapon_thrown_level`] == "1" ? "" : "_" + v[`${r}_${id}_weapon_thrown_level`];
							if (c || s == `${r}_${id}_weapon_thrown` + w || (s.endsWith("type") && g)) {
								u[`${r}_${id}_weapon_range_val`] = m;
								u[`${r}_${id}_weapon_range`] = m;
							}
						}
					});
					setAttrs(u, {silent: true}, () => {
						updateWeapons(s);
					});
				});
			});
		};

		const checkWeaponRange = function(s, k, p) { // s = source attribute, k = weapon id, p = range previous value
			let r = "repeating_weapons";
			let a = [`${r}_${k}_weapon_type`, `${r}_${k}_weapon_range`, `${r}_${k}_weapon_range_1`, `${r}_${k}_weapon_range_2`, `${r}_${k}_weapon_range_3`, `${r}_${k}_weapon_range_4`, `${r}_${k}_weapon_range_5`, `${r}_${k}_weapon_range_level`], u = {};
			let b, t, n, i;
			getAttrs(a, (v) => {
				b = ["thrown", "explosive"].includes(v[`${r}_${k}_weapon_type`]);
				t = v[`${r}_${k}_weapon_range_level`];
				t = t == "1" ? "" : "_" + t;
				n = v[`${r}_${k}_weapon_range${t}`];
				if (!s.endsWith("level")) {
					i = b ? p : clampInt(v[s], getMin("wpn_range"), getMax("wpn_range"));
					u[s] = i;
					if (!b && `${r}_${k}_weapon_range${t}` == s) n = i;
				}
				u[`${r}_${k}_weapon_range_val`] = n;
				setAttrs(u, {silent: true}, () => {
					updateWeapons(s);
				});
			});
		};

		const updateWeaponAmmoType = function(s, n) { // s = source attribute, n = new value
			let r = "repeating_weapons";
			let k = s.substr(18,20);
			let b = s.endsWith("level");
			let a = [`${r}_${k}_weapon_ammo_type`, `${r}_${k}_weapon_ammo_type_2`, `${r}_${k}_weapon_ammo_type_3`, `${r}_${k}_weapon_ammo_type_4`, `${r}_${k}_weapon_ammo_type_5`, `${r}_${k}_weapon_ammo_type_level`], u = {};
			getAttrs(a, (v) => {
				if (b) n = v[`${r}_${k}_weapon_ammo_type${n == "1" ? "" : "_" + n}`];
				if (b || s == `${r}_${k}_weapon_ammo_type_` + v[`${r}_${k}_weapon_ammo_type_level`]) u[`${r}_${k}_weapon_ammo_type_val`] = n;
				setAttrs(u, {silent: true});
			});
		};

		const updateWeaponAmmo = function(s, b, n) { // s = source attribute, b = level selector, s = new value
			let k = s.substr(18,20);
			let r = "repeating_weapons";
			let a = [`${r}_${k}_weapon_ammo_max`, `${r}_${k}_weapon_ammo_max_2`, `${r}_${k}_weapon_ammo_max_3`, `${r}_${k}_weapon_ammo_max_4`, `${r}_${k}_weapon_ammo_max_5`, `${r}_${k}_weapon_ammo_max_level`], u = {};
			getAttrs(a, (v) => {
				let t = getArmamentLevelString(v, `${r}_${k}_weapon_ammo_max`);
				n = b ? parseInt(v[t]) : clampInt(v[s], getMin("wpn_ammo"), getMax("wpn_ammo"));
				if (!b) u[s] = n;
				if (b || s == t) u[`${r}_${k}_weapon_ammo_max_val`] = n;
				setAttrs(u, {silent: true}, () => {
					checkWeaponAmmo(k);
				});
			});
		};

		const checkWeaponAmmo = function(k) { // k = repeating weapon id
			let r = "repeating_weapons";
			let a = [`${r}_${k}_weapon_ammo_val`, `${r}_${k}_weapon_ammo_max_val`, `${r}_${k}_weapon_type`], u = {};
			let n;
			getAttrs(a, (v) => {
				n = v[`${r}_${k}_weapon_type`] == "firearm" ? parseInt(v[`${r}_${k}_weapon_ammo_max_val`]) : getMax("wpn_ammo");
				u[`${r}_${k}_weapon_ammo_val`] = clampInt(v[`${r}_${k}_weapon_ammo_val`], getMin("wpn_ammo"), n);
				setAttrs(u, {silent: true});
			});
		};

		const checkWeaponField = function(k, s, n) { // k = repeating weapon id, s = repeating weapon suffix, n = new value
			let u = {};
			let p = s.split("_")[0], i;
			if (s.endsWith("level")) {
				i = n == "1" ? "" : "_" + n;
				getAttrs([`repeating_weapons_${k}_weapon_${p}${i}`], v => {
					u[`repeating_weapons_${k}_weapon_${p}_val`] = v[`repeating_weapons_${k}_weapon_${p}${i}`];
					setAttrs(u, {silent: true});
				});
			} else {
				n = clampInt(n, getMin("wpn_" + p), getMax("wpn_" + p));
				u[`repeating_weapons_${k}_weapon_${s}`] = n;
				if (p != "mag") {
					let t = `repeating_weapons_${k}_weapon_${p}_level`;
					getAttrs([t], v => {
						i = v[t] == "1" ? "" : "_" + v[t];
						if (s == p + i) u[`repeating_weapons_${k}_weapon_${p}_val`] = n;
						setAttrs(u, {silent: true});
					});
				} else setAttrs(u, {silent: true});
			}
		};

		const updateSuitDamage = function(k, q, b, z) { // k = repeating suit id, q = damage type string, b = check selected damage type, z = parse string
			getAttrs([`${k}_suit_dmg`, `${k}_suit_${q}`, `${k}_suit_${q}_2`, `${k}_suit_${q}_3`, `${k}_suit_${q}_4`, `${k}_suit_${q}_5`, `${k}_suit_${q}_level`, `resistance_${q}`], (v) => {
				if (!b || v[`${k}_suit_dmg`] == q) {
					let u = {}, n, m;
					n = getArmamentLevelValue(v, `${k}_suit_${q}`);
					if (z) n = formatFormula(n);
					if (getArmamentLevelIndex(v, `${k}_suit_${q}`) != "") {
						m = v[`${k}_suit_${q}`];
						if (z) m = formatFormula(m);
						n = m + "+" + n;
					}
					u[`${k}_suit_dmg_str`] = n;
					u[`${k}_suit_dmg_val`] = parseFormula(n) + " [" + getTranslationByKey("suit_protection") + "]";
					if (v[`resistance_${q}`] !== undefined) u[`${k}_suit_dmg_val`] += " + " + v[`resistance_${q}`] + " [" + getTranslationByKey("resistance") + "]";
					setAttrs(u, {silent: true});
				}
			});
		};

		const updateSuitDamages = function() {
			let s = "repeating_suits";
			getSectionIDs(s, (sec) => {
				_.each(sec, (id) => {
					getAttrs([`${s}_${id}_suit_dmg`], (v) => {
						updateSuitDamage(`${s}_${id}`, v[`${s}_${id}_suit_dmg`]);
					});
				});
			});
		};

		const checkSuitField = function(s, n) { // s = source attribute, n = new value
			let k = s.substr(16,20); // id
			let t = s.substr(42).split("_")[0]; // suffix
			let r = "repeating_suits", i, u = {};
			let a = [`${r}_${k}_suit_${t}`, `${r}_${k}_suit_${t}_2`, `${r}_${k}_suit_${t}_3`, `${r}_${k}_suit_${t}_4`, `${r}_${k}_suit_${t}_5`, `${r}_${k}_suit_${t}_level`];
			getAttrs(a, (v) => {
				n = clampInt(n, getMin("sui_" + t), getMax("sui_" + t));
				i = s.endsWith("level") ? getArmamentLevelValue(v, `${r}_${k}_suit_${t}`) : n;
				if (s.endsWith("level") || s == getArmamentLevelString(v, `${r}_${k}_suit_${t}`)) u[`${r}_${k}_suit_${t}_val`] = i;
				if (!s.endsWith("level")) u[s] = n;
				setAttrs(u, {silent: true});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Inventories
		////////////////////////////////////////////////////////////////////////////

		const updateInventoryWeight = function(s, k) { // s = section name, k = item id
			let a = [k + "number", k + "weight", k + "weight_total", s + "_weight"];
			let b = s == "equipment" || s == "backpack";
			if (b) a = a.concat(Stat.weighing_load);
			getAttrs(a, (v) => {
				let u = {};
				let n = parseNumber(v[k + "number"]) * parseNumber(v[k + "weight"]);
				let m = parseNumber(v[k + "weight_total"]);
				if (b) {
					let w = formatNumber(Math.max(parseNumber(v["weighing_load"]) + (n - m), 0));
					u["weighing_load"] = w;
					u = Object.assign(u, updateWeighingLoad(v, w));
				}
				u[k + "weight_total"] = formatNumber(n);
				u[s + "_weight"] = formatNumber(Math.max(parseNumber(v[s + "_weight"]) + (n - m), 0));
				setAttrs(u, {silent: true});
			});
		};

		const refreshInventoryWeight = function(s, k, w) { // s = section name, k = item id, weight of removed item
			w = parseNumber(w);
			let a = [s + "_weight"];
			let b = s == "equipment" || s == "backpack";
			if (b) a = a.concat(Stat.weighing_load);
			getAttrs(a, (v) => {
				let u = {};
				if (b) {
					let n = formatNumber(Math.max(parseNumber(v["weighing_load"]) - w, 0));
					u["weighing_load"] = n;
					u = Object.assign(u, updateWeighingLoad(v, n));
				}
				u[s + "_weight"] = formatNumber(Math.max(parseNumber(v[s + "_weight"]) - w, 0));
				setAttrs(u, {silent: true});
			});
		};

		const transferWeight = function(s1, s2, w) { // s1 = source section name, s2 = section name, w = weight of transfered item
			let a = [s1 + "_weight", s2 + "_weight"];
			let b1 = (s1 == "vehicle" || s1 == "den") && (s2 == "equipment" || s2 == "backpack" ); // weight in
			let b2 = (s1 == "equipment" || s1 == "backpack" ) && (s2 == "vehicle" || s2 == "den"); // weight out
			let b = b1 || b2;
			if (b) a = a.concat(Stat.weighing_load);
			getAttrs(a, (v) => {
				let u = {};
				if (b) {
					let n = formatNumber(Math.max(parseNumber(v["weighing_load"]) + (w * (b2 ? -1 : 1))), 0);
					u["weighing_load"] = n;
					u = Object.assign(u, updateWeighingLoad(v, n));
				}
				u[s1 + "_weight"] = formatNumber(Math.max(parseNumber(v[s1 + "_weight"]) - w), 0);
				u[s2 + "_weight"] = formatNumber(Math.max(parseNumber(v[s2 + "_weight"]) + w), 0);
				setAttrs(u, {silent: true});
			});
		};

		const transferItem = function(s, k) { // s = section name, k = item id
			let a = [`${k}_item_name`, `${k}_item_number`, `${k}_item_weight`, `${k}_item_weight_total`, `${k}_item_desc`];
			getAttrs(a, (v) => {
				let u = {};
				let n = generateRowID();
				let w = parseNumber(v[`${k}_item_weight_total`]);
				u[`repeating_${s}_${n}_item_name`] = v[`${k}_item_name`];
				u[`repeating_${s}_${n}_item_number`] = v[`${k}_item_number`];
				u[`repeating_${s}_${n}_item_weight`] = v[`${k}_item_weight`];
				u[`repeating_${s}_${n}_item_weight_total`] = v[`${k}_item_weight_total`];
				u[`repeating_${s}_${n}_item_desc`] = v[`${k}_item_desc`];
				removeRepeatingRow(`${k}`);
				setAttrs(u, {silent: true}, () => {
					transferWeight(k.split("_")[1], s, w);
				});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Weight
		////////////////////////////////////////////////////////////////////////////

		const recalcWeight = function(callback) {
			let a = "repeating_weapons";
			let b = "repeating_suits";
			let c = "repeating_equipment";
			let d = "repeating_backpack";
			getSectionIDs(a, (sec_a) => {
				getSectionIDs(b, (sec_b) => {
					getSectionIDs(c, (sec_c) => {
						getSectionIDs(d, (sec_d) => {
							let o = [...Stat.weighing_load];
							_.each(sec_a, (id) => {
								o.push(`${a}_${id}_weapon_weight_val`);
							});
							_.each(sec_b, (id) => {
								o.push(`${b}_${id}_suit_weight_val`);
							});
							_.each(sec_c, (id) => {
								o.push(
									`${c}_${id}_item_number`,
									`${c}_${id}_item_weight`
								);
							});
							_.each(sec_d, (id) => {
								o.push(
									`${d}_${id}_item_number`,
									`${d}_${id}_item_weight`
								);
							});
							getAttrs(o, (v) => {
								let u = {};
								let n = tot_a = tot_b = tot_c = tot_d = 0;
								_.each(sec_a, (id) => { // weapons
									tot_a += Math.max(parseNumber(v[`${a}_${id}_weapon_weight_val`]), 0);
								});
								_.each(sec_b, (id) => { // suits
									tot_b += Math.max(parseNumber(v[`${b}_${id}_suit_weight_val`]), 0);
								});
								_.each(sec_c, (id) => { // equipment
									n = Math.max(parseNumber(v[`${c}_${id}_item_number`]) * parseNumber(v[`${c}_${id}_item_weight`]), 0);
									tot_c += n;
									u[`${c}_${id}_item_weight_total`] = formatNumber(n, true);
								});
								_.each(sec_d, (id) => { // backpack
									n = Math.max(parseNumber(v[`${d}_${id}_item_number`]) * parseNumber(v[`${d}_${id}_item_weight`]), 0);
									tot_d += n;
									u[`${d}_${id}_item_weight_total`] = formatNumber(n, true);
								});
								u["weapons_weight"] = formatNumber(tot_a);
								u["suits_weight"] = formatNumber(tot_b);
								u["equipment_weight"] = formatNumber(tot_c);
								u["backpack_weight"] = formatNumber(tot_d);
								u["weighing_load"] = formatNumber(tot_a + tot_b + tot_c + tot_d);
								u = Object.assign(u, updateWeighingLoad(v, u["weighing_load"]));
								setAttrs(u, {silent: true}, () => {
									if (callback) callback();
								});
							});
						});
					});
				});
			});
		};

		const recalcStashWeight = function() {
			let a = "repeating_vehicle";
			let b = "repeating_den";
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
						_.each(sec_a, (id) => { // vehicle
							n = Math.max(parseNumber(v[`${a}_${id}_item_number`]) * parseNumber(v[`${a}_${id}_item_weight`]), 0);
							tot_a += n;
							u[`${a}_${id}_item_weight_total`] = formatNumber(n, true);
						});
						_.each(sec_b, (id) => { // den
							n = Math.max(parseNumber(v[`${b}_${id}_item_number`]) * parseNumber(v[`${b}_${id}_item_weight`]), 0);
							tot_b += n;
							u[`${b}_${id}_item_weight_total`] = formatNumber(n, true);
						});
						u["vehicle_weight"] = formatNumber(tot_a);
						u["den_weight"] = formatNumber(tot_b);
						setAttrs(u, {silent: true});
					});
				});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Money
		////////////////////////////////////////////////////////////////////////////

		const updateMoney = function(k) { // k = trigger key
			let i = k == "lose" ? -1 : 1;
			getAttrs(["money", "money_" + k], (v) => {
				let u = {};
				u["money"] = clampInt(parseInt(v["money"]) + (parseInt(v["money_" + k]) * i), getMin("money"), getMax("money"));
				u["money_" + k] = "0";
				setAttrs(u, {silent: true});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Settings
		////////////////////////////////////////////////////////////////////////////

		const restCharacter = function() {
			console.log("Resting..."); // DEBUG
			resetVitals(() => {
				updateAbilities(true, null, null, null, false, () => {
					checkAbilities(null, null, () => {
						console.log("Resting finished!"); // DEBUG
					});
				});
			});
		};

		const recalcCharacterSheet = function(callback) {
			console.log("Recalculating..."); // DEBUG
			updateAbilities(false, null, null, null, true);
			updateSpecialities(true);
			updateWeapons();
			resetWeaponDamage();
			updateSuitDamages();
			recalcStashWeight();
			recalcWeight(() => {
				if (callback) callback();
				console.log("Recalculating finished!"); // DEBUG
			});
		};

		const updateCharacterSheet = function() {
			console.log("Checking updates..."); // DEBUG
			recalcCharacterSheet(checkVersion);
		};

		const updateCharacterType = function(n) { // n = new value
			let u = {};
			getAttrs(["sheet_type"], (v) => {
				n = n === undefined ? v["sheet_type"] : n;
				u["rollbase"] = Roll.rollbase[n];
				u["antecedents_str"] = getTranslationByKey(n == "pc" ? "antecedents" : "traits");
				setAttrs(u, {silent: true});
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Options Toggles and Flags
		////////////////////////////////////////////////////////////////////////////

		const resetOptionsToggles = function(k) { // k = repeating section key
			getSectionIDs(k, sec => {
				let a = [];
				_.each(sec, id => {a.push(`repeating_${k}_${id}_options_flag_${k}`)});
				getAttrs(a, (v) => {
					let u = {};
					_.each(sec, id => {u[`repeating_${k}_${id}_options_flag_${k}`] = "0"});
					u["options_toggle_" + k] = 0;
					u["options_counter_" + k] = 0;
					setAttrs(u, {silent: true});
				});
			});
		};

		const setupTranslations = function() {
			let u = {};
			u["whisper_to_gm_tra"] = getTranslationByKey("whisper_to_gm");
			u["dialog_yes_tra"] = getTranslationByKey("yes");
			u["dialog_no_tra"] = getTranslationByKey("no");
			u["rank_tra"] = getTranslationByKey("rank");
			u["ability_tra"] = getTranslationByKey("ability");
			u["leadership_tra"] = getTranslationByKey("leadership");
			u["selfcontrol_tra"] = getTranslationByKey("selfcontrol");
			u["modifier_tra"] = getTranslationByKey("modifier");
			u["suit_location_tra"] = getTranslationByKey("suit_location");
			u["suit_status_tra"] = getTranslationByKey("suit_status");
			setAttrs(u, {silent: true});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Versioning
		////////////////////////////////////////////////////////////////////////////

		const dumpAttributes = function(callback) {
			let a = ["Surnom", "Age", "Taille", "Cheveux", "Yeux", "Faction", "Antecedent", "Titre", "historique", "PV", "PVmax", "fatigue", "nourriture", "soif", "Poids", "poidsMax"];
			let b = ["char_fname", "char_age", "char_size", "char_hair", "char_eyes", "char_faction", "antecedent", "title", "biography", "hp", "hp_max", "hydration", "repletion", "exhaustion", "weighing_load", "weighing_load_max"];
			getAttrs(a, (v) => {
				let u = {}, i, n;
				for (i = 0; i < a.length; i++) {
					if (v[a[i]] !== undefined) {
						if (["Antecedent", "Titre"].includes(a[i])) {
							n = generateRowID();
							u[`repeating_${b[i]}s_${n}_${b[i]}`] = v[a[i]];
						} else {
						 u[b[i]] = v[a[i]];
						}
					}
					// u[a[i]] = "DEL";
				}
				setAttrs(u, {silent: true}, () => {
					if (callback) callback();
				});
			});
		};

		const dumpAbilities = function(callback) {
			let a = [];
			let b = ["force", "endurance", "agilite", "precision", "reflexe", "connassance", "perception", "volonte", "empathie", "persuasion", "psychologie", "sandfroid", "sante"];
			let c = ["strength", "endurance", "agility", "accuracy", "reflexes", "knowledge", "perception", "will", "empathy", "persuasion", "psychology", "selfcontrol", "health"];
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
						u[q] = m;
						u[q + "_base"] = m;
						u[q + "_use"] = n;
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
					// u[k] = "DEL";
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
						// Weapons
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
						n[1] = generateRowID(); // Weapons
						n[2] = generateRowID(); // Equipment
						// 2. Record old values
						if (v[`${s}_{id}_Nom`] != "") u[`repeating_specialities_${n[0]}_spec_name`] = v[`${s}_${id}_Nom`];
						if (v[`${s}_${id}_Rang`] != "") u[`repeating_specialities_${n[0]}_spec_rank`] = v[`${s}_${id}_Rang`];
						if (v[`${s}_${id}_Dé`] != "") u[`repeating_specialities_${n[0]}_spec_die`] = v[`${s}_${id}_Dé`];
						if (v[`${s}_${id}_NomArme`] !== undefined) u[`repeating_weapons_${n[1]}_weapon_name`] = v[`${s}_${id}_NomArme`];
						if (v[`${s}_${id}_Degats`] !== undefined) u[`repeating_weapons_${n[1]}_weapon_damage`] = v[`${s}_${id}_Degats`];
						if (v[`${s}_${id}_Precition`] !== undefined) u[`repeating_weapons_${n[1]}_weapon_accuracy`] = v[`${s}_${id}_Precition`];
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
							if (q !== undefined) u[`repeating_${h.new.sec}_${n}_${h.new.fld[i]}`] = ["Nombre", "Durée", "Poids"].indexOf(o) >= 0 ? formatNumber(parseNumber(q)) : q;
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
							dumpAbilities(checkVersion);
						});
					});
				});
			});
		};

		const checkVersion = function() {
			getAttrs(["version", "char_rank"], (v) => {
				if (v["version"] === undefined) {
					console.info("S.T.A.L.K.E.R. Sheet's Is Now Being Initialized..."); // DEBUG
					dumpCharacterSheet();
					setAttrs({"version" : 0.0}, {silent: true});
				} else if (parseFloat(v["version"]) < Glob.version) {
					console.info("S.T.A.L.K.E.R. Sheet Is Now Updated to v" + Glob.version); // DEBUG
					if (typeof v["char_rank"] === undefined) stalker.checkExperience(v["xp"]);
					updateCharacterSheet();
					setAttrs({"version" : Glob.version}, {silent: true});
				} else {
					console.info("S.T.A.L.K.E.R. Sheet v" + Glob.version + " Loaded!"); // DEBUG
				}
			});
		};

		////////////////////////////////////////////////////////////////////////////
		// * Output Methods
		////////////////////////////////////////////////////////////////////////////

		return {
			Glob: Glob,
			Stat: Stat,
			Roll: Roll,
			MinMax: MinMax,
			evalFormula: evalFormula,
			parseFormula: parseFormula,
			formatFormula: formatFormula,
			clampAttribute: clampAttribute,
			updateGender: updateGender,
			checkExperience: checkExperience,
			updateExperience: updateExperience,
			updateResistances: updateResistances,
			updateAbilities: updateAbilities,
			checkAbilities: checkAbilities,
			updateHitPoints: updateHitPoints,
			updateWeighingLoad: updateWeighingLoad,
			updateSpeciality: updateSpeciality,
			updateSpecialities: updateSpecialities,
			getArmamentLevelString: getArmamentLevelString,
			getArmamentLevelValue: getArmamentLevelValue,
			updateArmamentWeight: updateArmamentWeight,
			updateWeapons: updateWeapons,
			updateWeaponDamage: updateWeaponDamage,
			updateWeaponRange: updateWeaponRange,
			checkWeaponRange: checkWeaponRange,
			updateWeaponAmmoType: updateWeaponAmmoType,
			updateWeaponAmmo: updateWeaponAmmo,
			checkWeaponAmmo: checkWeaponAmmo,
			checkWeaponField: checkWeaponField,
			updateSuitDamage: updateSuitDamage,
			updateSuitDamages: updateSuitDamages,
			checkSuitField: checkSuitField,
			updateInventoryWeight: updateInventoryWeight,
			refreshInventoryWeight: refreshInventoryWeight,
			transferItem: transferItem,
			recalcWeight: recalcWeight,
			updateMoney: updateMoney,
			restCharacter: restCharacter,
			recalcCharacterSheet: recalcCharacterSheet,
			updateCharacterSheet: updateCharacterSheet,
			updateCharacterType: updateCharacterType,
			resetOptionsToggles: resetOptionsToggles,
			setupTranslations: setupTranslations,
			checkVersion: checkVersion
		};

	})();

</script>
