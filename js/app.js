import {createMap} from "./map.js";

import {
	initializeBathymetry,
	getDepth
} from "./bathymetry.js";

import {
	initializeControls
} from "./controls.js";


console.log("[Med Marine] Starting application");


let map;


try {

	/*
	 * Create map
	 */
	map = createMap();

	console.log("[Med Marine] Map object created");


} catch (error) {

	console.error(
		"[Med Marine] Map initialization failed:",
		error
	);

	throw error;

}


/*
 * Map loaded
 */
map.on("load", async () => {

	console.log(
		"[Med Marine] Map loaded"
	);


	/*
	 * Bathymetry
	 */
	try {

		initializeBathymetry(map);

		console.log(
			"[Med Marine] Bathymetry initialized"
		);

	} catch (error) {

		console.error(
			"[Med Marine] Bathymetry initialization failed:",
			error
		);

	}


	/*
	 * Controls
	 */
	try {

		initializeControls(map);

		console.log(
			"[Med Marine] Controls initialized"
		);

	} catch (error) {

		console.error(
			"[Med Marine] Controls initialization failed:",
			error
		);

	}


	/*
	 * Map click → depth
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

			console.log(
				"[Med Marine] Querying depth:",
				lat,
				lng
			);


			const depth =
				await getDepth(lat, lng);


			showDepthResult(
				depth,
				lat,
				lng
			);


		} catch (error) {

			console.error(
				"[Med Marine] Depth query failed:",
				error
			);


			showDepthError(
				lat,
				lng
			);


		} finally {

			showLoading(false);

		}

	});


	/*
	 * Crosshair cursor
	 */
	map.on("mouseenter", () => {

		map.getCanvas().style.cursor =
			"crosshair";

	});


	map.on("mouseleave", () => {

		map.getCanvas().style.cursor =
			"";

	});

});


function showDepthPanel(lat, lng) {

	const panel =
		document.getElementById("depth-panel");

	const latitude =
		document.getElementById("depth-lat");

	const longitude =
		document.getElementById("depth-lon");

	const value =
		document.getElementById("depth-value");

	const status =
		document.getElementById("depth-status");


	if (panel) {
		panel.classList.remove("hidden");
	}

	if (latitude) {
		latitude.textContent =
			lat.toFixed(5);
	}

	if (longitude) {
		longitude.textContent =
			lng.toFixed(5);
	}

	if (value) {
		value.textContent = "…";
	}

	if (status) {
		status.textContent =
			"Querying EMODnet Bathymetry…";
	}

}


function showDepthResult(
	depth,
	lat,
	lng
) {

	const value =
		Number(depth);


	if (!Number.isFinite(value)) {

		showDepthError(
			lat,
			lng
		);

		return;

	}


	const depthMetres =
		Math.abs(value);


	const depthElement =
		document.getElementById("depth-value");

	const statusElement =
		document.getElementById("depth-status");


	if (depthElement) {

		depthElement.textContent =
			`${depthMetres.toFixed(1)} m`;

	}


	if (statusElement) {

		statusElement.textContent =
			"EMODnet Bathymetry. Not an official navigational chart.";

	}

}


function showDepthError(lat, lng) {

	const value =
		document.getElementById("depth-value");

	const status =
		document.getElementById("depth-status");


	if (value) {
		value.textContent =
			"Unavailable";
	}


	if (status) {

		status.textContent =
			"Depth could not be retrieved for this location.";

	}

}


function showLoading(show) {

	const loading =
		document.getElementById("loading");


	if (loading) {

		loading.classList.toggle(
			"hidden",
			!show
		);

	}

}

