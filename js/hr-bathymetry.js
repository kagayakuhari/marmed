import {CONFIG} from "./config.js";


let map = null;

let hrEnabled = false;


/*
 * EMODnet High Resolution Bathymetry
 *
 * Actual live WMS layer:
 *
 *   emodnet:hr_bathymetry_area
 *
 * EMODnet's HR layer is a multi-resolution collection of
 * higher-resolution DTMs for selected areas.
 */
export function initializeHRBathymetry(
	mapInstance
) {

	map = mapInstance;


	/*
	 * Add the HR WMS source.
	 *
	 * IMPORTANT:
	 *
	 * Keep {bbox-epsg-3857} literal.
	 * MapLibre replaces it for every tile.
	 *
	 * Do NOT put this through URLSearchParams.
	 */
	map.addSource(
		"emodnet-hr-bathymetry",
		{

			type: "raster",

			tiles: [

				CONFIG.bathymetry.wms +

				"?service=WMS" +
				"&version=1.1.1" +
				"&request=GetMap" +

				"&layers=emodnet:hr_bathymetry_area" +
				"&styles=" +

				"&format=image/png" +
				"&transparent=true" +

				"&width=256" +
				"&height=256" +

				"&srs=EPSG:3857" +

				"&bbox={bbox-epsg-3857}"

			],

			tileSize: 256,

			attribution:
				"High-resolution bathymetry © EMODnet Bathymetry"

		}
	);


	/*
	 * Put HR above the standard bathymetry.
	 *
	 * At zoom < 11 the layer does not request tiles.
	 */
	map.addLayer({

		id: "hr-bathymetry",

		type: "raster",

		source: "emodnet-hr-bathymetry",

		minzoom: 10,

		maxzoom: 19,

		paint: {

			"raster-opacity": 1.0,

			"raster-fade-duration": 150,

			"raster-resampling": "linear"

		}

	});


	/*
	 * The layer is now controlled by MapLibre's minzoom.
	 */
	hrEnabled = true;


	console.log(
		"[Med Marine] EMODnet HR bathymetry added"
	);


	updateResolutionIndicator();
}


/*
 * Update our UI indicator.
 */
function updateResolutionIndicator() {

	if (!map) {
		return;
	}


	const element =
		document.getElementById(
			"bathymetry-resolution"
		);


	if (!element) {
		return;
	}


	const zoom =
		map.getZoom();


	if (zoom < 11) {

		element.textContent =
			"Standard bathymetry · ~115 m";

		return;

	}


	element.textContent =
		"High-resolution bathymetry · EMODnet";
}


/*
 * Keep the resolution indicator synchronized.
 */
export function initializeHRBathymetryEvents() {

	if (!map) {
		return;
	}


	map.on(
		"zoom",
		updateResolutionIndicator
	);

}
