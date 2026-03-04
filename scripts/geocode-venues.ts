
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeVenues() {
  console.log('Starting geocoding process...');

  const venuesToGeocode = await prisma.venue.findMany({
    where: { isPublished: true, latitude: null },
  });

  console.log(`Found ${venuesToGeocode.length} venues to geocode.`);

  let foundCount = 0;
  for (const [index, venue] of venuesToGeocode.entries()) {
    const { id, name, street, city, state } = venue;
    
    // First attempt: with street address
    let query = street ? `${street}, ${city}, ${state}` : `${name}, ${city}, CA`;
    let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'GreenBowtie/1.0' } });
      const data = await response.json() as any[];

      let result = data?.[0];

      // Second attempt: just name and city if street fails
      if (!result && street) {
        console.log(`[${index + 1}/${venuesToGeocode.length}] Retrying with name for: ${name}`);
        await sleep(1100);
        query = `${name}, ${city}, CA`;
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const nameResponse = await fetch(url, { headers: { 'User-Agent': 'GreenBowtie/1.0' } });
        const nameData = await nameResponse.json() as any[];
        result = nameData?.[0];
      }

      if (result) {
        const { lat, lon } = result;
        await prisma.venue.update({
          where: { id },
          data: { latitude: parseFloat(lat), longitude: parseFloat(lon) },
        });
        console.log(`[${index + 1}/${venuesToGeocode.length}] ${name} — found: ${lat}, ${lon}`);
        foundCount++;
      } else {
        console.log(`[${index + 1}/${venuesToGeocode.length}] ${name} — NOT FOUND`);
      }
    } catch (error) {
      console.error(`Error geocoding ${name}:`, error);
    }

    await sleep(1100); // Rate limit
  }

  console.log(`
Geocoding complete!
Total venues attempted: ${venuesToGeocode.length}
Successfully geocoded: ${foundCount}
`);
}

geocodeVenues()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
