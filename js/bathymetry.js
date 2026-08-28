import {CONFIG} from "./config.js";

let map = null;


/*
 * EMODnet Bathymetry WMTS
 *
 * We use the Web Mercator tileset because MapLibre itself
 * renders the map in EPSG:3857.
 *
 * Available EMODnet layer:
 *
 *   mean_multicolour
 *
 * The current EMODnet WMTS service documents this layer
 * under the web_mercator tileset.
 */
export function initializeBathymetry(mapInstance) {

	map = mapInstance;

	const status =
		document.getElementById(
			"bathymetry-status"
		);


	map.addSource("emodnet-bathymetry", {

		type: "raster",

		tiles: [
			"https://tiles.emodnet-bathymetry.eu/" +
			"web_mercator/" +
			"{z}/{y}/{x}/" +
			"mean_multicolour.png"
		],

		tileSize: 256,

		attribution:
			"Bathymetry © EMODnet Bathymetry"

	});


	map.addLayer({

		id: "bathymetry",

		type: "raster",

		source: "emodnet-bathymetry",

		paint: {

			"raster-opacity": 0.82,

			"raster-fade-duration": 200,

			"raster-resampling": "linear"

		}

	});


	map.on(
		"idle",
		() => {

			if (status) {

				status.textContent =
					"Bathymetry loaded";

				setTimeout(() => {

					status.classList.add(
						"hidden"
					);

				}, 1500);

			}

		}
	);


	map.on(
		"error",
		event => {

			console.error(
				"[Med Marine] Map error:",
				event.error || event
			);

			if (status) {

				status.textContent =
					"Bathymetry tile error";

			}

		}
	);


	setBathymetryVisibility(true);
}

/*
 * Show / hide bathymetry.
 */
export function setBathymetryVisibility(visible) {

	if (
		!map ||
		!map.getLayer("bathymetry")
	) {

		console.warn(
			"[Med Marine] Bathymetry layer not available"
		);

		return;
	}


	map.setLayoutProperty(
		"bathymetry",
		"visibility",
		visible
			? "visible"
			: "none"
	);

}


/*
 * Query one EMODnet DTM grid cell.
 *
 * EMODnet's current REST API documents:
 *
 *   /depth_sample?geom=POINT(longitude latitude)
 *
 * IMPORTANT:
 *
 * WKT uses:
 *
 *   longitude latitude
 *
 * NOT:
 *
 *   latitude longitude
 */
export async function getDepth(
	latitude,
	longitude
) {

	const point =
		`POINT(${longitude} ${latitude})`;


	const url =
		`${CONFIG.bathymetry.rest}` +
		`depth_sample?geom=${encodeURIComponent(point)}`;


	console.log(
		"[Med Marine] Depth request:",
		url
	);


	const response =
		await fetch(url, {

			method: "GET",

			headers: {
				"Accept": "application/json"
			}

		});


	if (!response.ok) {

		throw new Error(
			`EMODnet depth request failed: ${response.status}`
		);

	}


	const data =
		await response.json();


	console.log(
		"[Med Marine] Depth response:",
		data
	);


	/*
	 * EMODnet returns:
	 *
	 * {
	 *   min: ...,
	 *   max: ...,
	 *   avg: ...,
	 *   ...
	 * }
	 *
	 * We use avg as the displayed DTM depth.
	 */
	if (
		data &&
		typeof data.avg === "number"
	) {

		return data.avg;

	}


	throw new Error(
		"EMODnet returned no average depth."
	);

}
