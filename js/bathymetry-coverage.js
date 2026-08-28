let coverage = null;


export async function loadBathymetryCoverage() {

	const response = await fetch(
		"./data/bathymetry/hr-coverage.json",
		{
			cache: "no-cache"
		}
	);


	if (!response.ok) {

		throw new Error(
			`Could not load bathymetry coverage: ${response.status}`
		);

	}


	coverage = await response.json();

	console.log(
		"[Med Marine] HR bathymetry coverage loaded:",
		coverage
	);


	return coverage;
}


export function findHRZone(
	longitude,
	latitude
) {

	if (!coverage?.areas) {
		return null;
	}


	return coverage.areas.find(
		area => {

			const [
				west,
				south,
				east,
				north
			] = area.bounds;


			return (
				longitude >= west &&
				longitude <= east &&
				latitude >= south &&
				latitude <= north
			);

		}
	) || null;
}

