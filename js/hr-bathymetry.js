import {
	findHRZone
} from "./bathymetry-coverage.js";


let map = null;

let activeZone = null;


export function initializeHRBathymetry(
	mapInstance
) {

	map = mapInstance;


	map.on(
		"moveend",
		updateHRBathymetry
	);


	map.on(
		"zoomend",
		updateHRBathymetry
	);


	updateHRBathymetry();

}


function updateHRBathymetry() {

	if (!map) {
		return;
	}


	const center =
		map.getCenter();


	const zoom =
		map.getZoom();


	/*
	 * Don't attempt HR data at overview scales.
	 */
	if (zoom < 11) {

		if (activeZone) {

			console.log(
				"[Med Marine] Leaving HR bathymetry"
			);

			activeZone = null;

			setResolutionLabel(
				"Standard bathymetry · ~115 m"
			);

		}

		return;

	}


	const zone =
		findHRZone(
			center.lng,
			center.lat
		);


	if (!zone) {

		if (activeZone) {

			console.log(
				"[Med Marine] No HR bathymetry at current location"
			);

			activeZone = null;

		}

		return;

	}


	if (
		activeZone?.id === zone.id
	) {

		return;

	}


	activeZone = zone;


	console.log(
		"[Med Marine] HR bathymetry candidate:",
		zone.name
	);

	setResolutionLabel(
		`High-resolution candidate · ${zone.name}`
	);


	/*
	 * We deliberately don't add a raster source yet.
	 *
	 * The EMODnet catalogue needs to provide the actual
	 * HR-DTM product/service definition.
	 */
}

function setResolutionLabel(
	text
) {

	const element =
		document.getElementById(
			"bathymetry-resolution"
		);


	if (element) {

		element.textContent =
			text;

	}

}
