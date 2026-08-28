import {createMap} from "./map.js";

import {
	initializeBathymetry,
	getDepth
} from "./bathymetry.js";

import {
	initializeControls
} from "./controls.js";


const map = createMap();


map.on("load", async () => {

	/*
	 * Add bathymetry.
	 */
	initializeBathymetry(map);


	/*
	 * Add UI controls.
	 */
	initializeControls(map);


	/*
	 * Map click → depth query.
	 */
	map.on("click", async event => {

		const {
			lat,
			lng
		} = event.lngLat;


		showDepthPanel(
			lat,
			lng
		);


		showLoading(true);


		try {

			const depth =
				await getDepth(lat, lng);


			showDepthResult(
				depth,
				lat,
				lng
			);

		} catch (error) {

			console.error(error);

			showDepthError(
				lat,
				lng
			);

		} finally {

			showLoading(false);

		}

	});


	/*
	 * Change cursor when hovering over the map.
	 */
	map.on("mouseenter", () => {

		map.getCanvas().style.cursor = "crosshair";

	});


	map.on("mouseleave", () => {

		map.getCanvas().style.cursor = "";

	});

});


function showDepthPanel(lat, lng) {

	document
		.getElementById("depth-panel")
		.classList.remove("hidden");


	document
		.getElementById("depth-lat")
		.textContent =
		lat.toFixed(5);


	document
		.getElementById("depth-lon")
		.textContent =
		lng.toFixed(5);


	document
		.getElementById("depth-value")
		.textContent =
		"…";


	document
		.getElementById("depth-status")
		.textContent =
		"Querying EMODnet Bathymetry…";

}


function showDepthResult(
	depth,
	lat,
	lng
) {

	const value =
		Number(depth);


	if (!Number.isFinite(value)) {

		showDepthError(lat, lng);

		return;

	}


	/*
	 * Bathymetry convention:
	 *
	 * EMODnet depths are represented as bathymetric
	 * elevations/depths depending on the API product.
	 *
	 * For the user-facing display we want:
	 *
	 * positive = metres below sea level.
	 */
	const depthMetres =
		Math.abs(value);


	document
		.getElementById("depth-value")
		.textContent =
		`${depthMetres.toFixed(1)} m`;


	document
		.getElementById("depth-status")
		.textContent =
		"EMODnet Bathymetry — modelled/compiled depth. Not an official navigational chart.";

}


function showDepthError(lat, lng) {

	document
		.getElementById("depth-value")
		.textContent =
		"Unavailable";


	document
		.getElementById("depth-status")
		.textContent =
		"Depth could not be retrieved for this location.";

}


function showLoading(show) {

	document
		.getElementById("loading")
		.classList.toggle(
			"hidden",
			!show
		);

}

