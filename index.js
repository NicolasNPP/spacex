const express = require('express');
const axios = require('axios');

const port = 3000;
const app = express();

app.get('/launches', async (req, res) => {

  try {

    // Get launch and rocket data
    const [launchesResp, rocketsResp] = await Promise.all([
      axios.get('https://api.spacexdata.com/v3/launches'),
      axios.get('https://api.spacexdata.com/v3/rockets')
    ]);

    const launches = launchesResp.data;
    const rockets = rocketsResp.data;

    // Assign rockets to for easy access
    const rocketMap = rockets.reduce((acc, rocket) => {

      acc[rocket.rocket_id] = rocket;
      return acc;
    }, {});

    // Modify launch data
    const transformedLaunches = launches.map(launch => {

      const rocket = rocketMap[launch.rocket.rocket_id];

      return {

        flight_number: launch.flight_number,
        mission_name: launch.mission_name,
        rocket: {

          rocket_id: rocket.rocket_id,
          rocket_name: rocket.rocket_name,
          description: rocket.description,
          images: rocket.flickr_images
        },
        payloads: launch.rocket.second_stage.payloads.map(payload => ({

          payload_id: payload.payload_id,
          manufacturer: payload.manufacturer,
          type: payload.payload_type
        }))
      };
    });

    res.json(transformedLaunches);

  } catch (error) {

    console.error('Error with data:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`);
});
