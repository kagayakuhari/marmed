export const CONFIG = {

	map: {
		initialCenter: [10.0, 39.0],
		initialZoom: 5.0,

		minZoom: 3,
		maxZoom: 18,

		maxBounds: [
			[-12, 27],
			[45, 50]
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

