export const CONFIG = {

	map: {

		// Center of Spain
		initialCenter: [
			-3.7,
			40.2
		],

		// Good initial view of mainland Spain
		initialZoom: 5.5,

		minZoom: 5,
		maxZoom: 18,

		/*
		 * Approximate geographic operating area.
		 *
		 * This deliberately includes offshore waters because
		 * this is a marine application.
		 */
		maxBounds: [
			[
				-11.5,
				33.5
			],
			[
				5.5,
				44.8
			]
		]
	},

	bathymetry: {

		/*
		 * EMODnet's current bathymetry service.
		 *
		 * We deliberately keep the endpoint configurable because
		 * EMODnet can add/change available layers and styles.
		 *
		 * The actual layer URL is constructed in bathymetry.js.
		 */

		wmts:
			"https://tiles.emodnet-bathymetry.eu/",

		wms: "https://ows.emodnet-bathymetry.eu/wms",

		wmtsCapabilities:
			"https://tiles.emodnet-bathymetry.eu/wmts/1.0.0/WMTSCapabilities.xml",

		rest:
			"https://rest.emodnet-bathymetry.eu/"
	},

	app: {
		depthUnit: "m"
	}

};

