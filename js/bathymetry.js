import {CONFIG} from "./config.js";

let map = null;


/*
 * Initialize EMODnet Bathymetry.
 *
 * We use the EMODnet WMS service here rather than the WMTS
 * service because the multi-colour bathymetry layer is not
 * available in EMODnet's Web Mercator WMTS tileset.
 *
 * MapLibre supplies {bbox-epsg-3857} for every raster tile.
 *
 * IMPORTANT:
 *
 * Do NOT construct this URL with URLSearchParams.
 * URLSearchParams would encode the {bbox-epsg-3857} token and
 * prevent MapLibre from replacing it with the tile bbox.
 */
export function initializeBathymetry(mapInstance) {

	map = mapInstance;


	const status =
		document.getElementById(
			"bathymetry-status"
		);


	/*
	 * EMODnet WMS raster source.
	 */
	map.addSource(
		"emodnet-bathymetry",
		{

			type: "raster",

			tiles: [

				"https://ows.emodnet-bathymetry.eu/wms" +

				"?service=WMS" +
				"&version=1.1.1" +
				"&request=GetMap" +

				"&layers=mean_multicolour" +
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
				"Bathymetry © EMODnet Bathymetry"

		}
	);


	/*
	 * Add bathymetry above the basemap.
	 */
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


	console.log(
		"[Med Marine] EMODnet WMS bathymetry layer added"
	);


	/*
	 * Listen specifically for errors from this source.
	 */
	map.on(
		"error",
		event => {

			const message =
				event?.error?.message || "";


			if (
				message.includes(
					"ows.emodnet-bathymetry.eu"
				)
			) {

				console.error(
					"[Med Marine] EMODnet WMS error:",
					event.error
				);


				if (status) {

					status.textContent =
						"Bathymetry service error";

				}

			}

		}
	);


	/*
	 * Mark the layer as enabled.
	 */
	setBathymetryVisibility(true);


	/*
	 * We don't hide the status immediately.
	 * Wait for the first successful render.
	 */
	let firstRender = true;


	map.once(
		"idle",
		() => {

			if (!firstRender) {
				return;
			}

			firstRender = false;


			if (status) {

				status.textContent =
					"Bathymetry loaded";

				setTimeout(
					() => {

						status.classList.add(
							"hidden"
						);

					},
					1500
				);

			}

		}
	);

}


/*
 * Show / hide bathymetry.
 */
export function setBathymetryVisibility(
	visible
) {

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
 * Get depth at a point.
 *
 * Current EMODnet REST API:
 *
 *   /depth/point?geom=POINT(lon lat)
 *
 * The WKT coordinate order is longitude, latitude.
 */
export async function getDepth(
	latitude,
	longitude
) {

	const point =
		`POINT(${longitude} ${latitude})`;


	const url =
		`${CONFIG.bathymetry.rest}` +
		`depth/point?geom=` +
		encodeURIComponent(point);


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
