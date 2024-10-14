const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const { reject } = require('lodash');

const fetchGeoJSONData = async (location) => {
  const apiKey = 'GOOGLE_API_KEY_HERE'
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location.street},${location.city},${location.state}&key=${apiKey}`

  return new Promise(async (resolve) => {
    try {
      console.log(`🌎 Start Fetching GeoJSONData for ${url}`)
      const response = await axios.get(url);
      console.log(`✅ ${''} Done Fetching GeoJSONData for ${url}`)
      resolve(JSON.stringify(response.data.results[0].geometry.location))
    } catch (err) {
      reject(err)
      console.log(`🛑 Error Fetching GeoJSON Data for ${url}`)
    }

  })
}

const createObjFromCSV = () => {
  return new Promise((resolve, reject) => {
    const locations = [];
      
    fs.createReadStream('./store-list.csv')
    .on('error' , reject)
    .pipe(csv())
    .on('data', (row) => {
      locations.push(row);
    })
    .on('end', () => {
      resolve(locations);
    });
  })
}

(async () => {
  const locationsWithGeoJSON = [];
  const locations = await createObjFromCSV();
  for (const locationIndex in locations) {
    const currentLocation = locations[locationIndex];

    locationsWithGeoJSON.push({
      ...currentLocation,
      geo_location: await fetchGeoJSONData(currentLocation)
    })
  }
  fs.writeFileSync('store-list.json', JSON.stringify(locationsWithGeoJSON));
})();