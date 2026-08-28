import {CONFIG} from "./config.js";

let map = null;


/*
 * Initialize bathymetry visual layer.
 */
export function initializeBathymetry(mapInstance) {

	map = mapInstance;

	/*
	 * EMODnet WMS:
	 *
	 * We use EPSG:3857 because MapLibre renders in Web Mercator.
	 *
	 * The example layer documented by EMODnet is:
	 *
	 * emodnet:mean_multicolour
	 */
	map.addSource("emodnet-bathymetry", {

		type: "raster",

		tiles: [
			buildWmsTileUrl()
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
			"raster-opacity": 0.78,
			"raster-fade-duration": 200
		}

	});


	/*
	 * Start with the bathymetry visible.
	 */
	setBathymetryVisibility(true);
}


/*
 * Construct a tiled WMS request.
 *
 * MapLibre replaces:
 *
 * {bbox-epsg-3857}
 *
 * with the current tile bounding box.
 */
function buildWmsTileUrl() {

	const params = new URLSearchParams({

		service: "WMS",

		request: "GetMap",

		version: "1.1.1",

		layers: "emodnet:mean_multicolour",

		styles: "",

		format: "image/png",

		transparent: "true",

		width: "256",

		height: "256",

		srs: "EPSG:3857",

		tiled: "true",

		bbox: "{bbox-epsg-3857}"
	});


	return `${CONFIG.bathymetry.wms}?${params.toString()}`;
}


/*
 * Show / hide the bathymetry layer.
 */
export function setBathymetryVisibility(visible) {

	if (!map || !map.getLayer("bathymetry")) {
		return;
	}

	map.setLayoutProperty(
		"bathymetry",
		"visibility",
		visible ? "visible" : "none"
	);
}


/*
 * Query a depth from EMODnet.
 *
 * IMPORTANT:
 *
 * EMODnet's REST API has several service operations and
 * versions. We keep this function isolated so that the
 * exact request format can be adjusted without touching
 * the map.
 */
export async function getDepth(latitude, longitude) {

	/*
	 * First attempt:
	 *
	 * EMODnet's public REST service exposes depth extraction.
	 *
	 * The service API should be treated as an external contract.
	 * If the operation changes, this is the only function
	 * that needs changing.
	 */

	const url =
		`${CONFIG.bathymetry.rest}` +
		`?lat=${encodeURIComponent(latitude)}` +
		`&lon=${encodeURIComponent(longitude)}`;


	const response = await fetch(url, {
		headers: {
			"Accept": "application/json"
		}
	});


	if (!response.ok) {
		throw new Error(
			`EMODnet depth request failed: ${response.status}`
		);
	}


	const text = await response.text();

	return parseDepthResponse(text);
}


/*
 * Parse possible EMODnet responses.
 *
 * Keeping parsing separate makes the application resilient
 * if the REST response is XML/text rather than JSON.
 */
function parseDepthResponse(text) {

	/*
	 * JSON response
	 */
	try {

		const json = JSON.parse(text);

		if (typeof json === "number") {
			return json;
		}

		if (typeof json.depth === "number") {
			return json.depth;
		}

		if (
			json.data &&
			typeof json.data.depth === "number"
		) {
			return json.data.depth;
		}

	} catch {
		/*
		 * Not JSON.
		 */
	}


	/*
	 * Try extracting a numeric depth from a simple response.
	 *
	 * This is deliberately conservative.
	 */
	const match = text.match(
		/(?:depth|z|value)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i
	);


	if (match) {
		return Number(match[1]);
	}


	throw new Error(
		"Could not interpret the EMODnet depth response."
	);
}

