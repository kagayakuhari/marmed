import {CONFIG} from "./config.js";

let map = null;

export function createMap() {

	map = new maplibregl.Map({

		container: "map",

		/*
		 * A minimal open map style.
		 *
		 * We use OSM raster tiles only for the background.
		 * EMODnet provides the bathymetry overlay.
		 */
		style: {
			version: 8,

			sources: {

				osm: {
					type: "raster",

					tiles: [
						"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
					],

					tileSize: 256,

					attribution:
						"© OpenStreetMap contributors"
				}

			},

			layers: [

				{
					id: "osm",
					type: "raster",
					source: "osm"
				}

			]
		},

		center: CONFIG.map.initialCenter,

		zoom: CONFIG.map.initialZoom,

		minZoom: CONFIG.map.minZoom,

		maxZoom: CONFIG.map.maxZoom,

		maxBounds: CONFIG.map.maxBounds,

		attributionControl: false
	});


	map.addControl(
		new maplibregl.NavigationControl({
			visualizePitch: false
		}),
		"bottom-right"
	);


	map.addControl(
		new maplibregl.ScaleControl({
			maxWidth: 120,
			unit: "metric"
		}),
		"bottom-left"
	);


	return map;
}


export function getMap() {
	return map;
}

