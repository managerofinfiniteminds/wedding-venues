/**
 * assign-regions.ts
 * Uses AI to assign unmapped cities to the nearest CA wedding region.
 * Updates REGIONS in page.tsx with the new mappings.
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not set");

const REGION_NAMES = [
  "San Francisco",
  "East Bay",
  "Peninsula & South Bay",
  "Napa Valley",
  "Sonoma County",
  "Santa Cruz",
  "Monterey & Carmel",
  "Santa Barbara",
  "San Luis Obispo",
  "Los Angeles",
  "Orange County",
  "Inland Empire",
  "San Diego",
  "Palm Springs & Desert",
  "Sacramento",
  "Gold Country",
  "Lake Tahoe",
  "Central Valley",
  "Shasta & Northern CA",
  "Mendocino Coast",
  "Lake County & North Bay",
  "Other", // truly doesn't fit anywhere
];

const OTHER_CITIES = ["Vallejo","St. Helena","Tehachapi","Delano","Sanger","Plymouth","Los Angeles County","Lake Arrowhead","Jamul","West Sacramento","Big Bear Lake","Vacaville","Hollister","Los Banos","Milpitas","Fairfield","Winters","Clovis","Julian","Idyllwild-Pine Cove","Oakdale","Santa Margarita","Mount Shasta","Dixon","Cottonwood","Camino","King City","Murphys","Kingsburg","Agua Dulce","Exeter","Mammoth Lakes","Oakhurst","Ferndale","Groveland","Dinuba","Reedley","Benicia","Santa Paula","Westlake Village","Oak Glen","Marina del Rey","Susanville","Avalon","Rancho Palos Verdes","Somis","McCloud","Somerset","San Miguel","Crescent City","Taft","Tehama","Paso Robles","Carmel-by-the-Sea","Weed","Yreka","Fort Jones","Etna","Happy Camp","Orleans","Willow Creek","Hoopa","Weaverville","Lewiston","Douglas City","Hayfork","Hyampom","Ruth","Mad River","Bridgeville","Fortuna","Loleta","Ferndale","Scotia","Rio Dell","Garberville","Shelter Cove","Whitethorn","Piercy","Leggett","Laytonville","Covelo","Dos Rios","Longvale","Branscomb","Westport","Rockport","Elk","Albion","Little River","Mendocino","Caspar","Fort Bragg","Cleone","MacKerricher","Inglenook","Cuffeys Cove","Anchor Bay","Gualala","Point Arena","Manchester","Boonville","Philo","Navarro","Comptche","Redwood Valley","Potter Valley","Hopland","Talmage","Ukiah","Calpella","Redwood Valley","Willits","Laytonville","Leggett","Longvale","Covelo","Dos Rios","Branscomb","Westport","Elk","Glen Blair","Cobb","Middletown","Hidden Valley Lake","Lower Lake","Clearlake Oaks","Nice","Lakeport","Upper Lake","Lucerne","Kelseyville","Finley","Clearlake","Clearlake Highlands","Clearlake Oaks","Spring Valley","Angwin","Pope Valley","Deer Park","Rutherford","Oakville","Yountville","American Canyon","Napa","Sonoma","El Verano","Fetters Hot Springs","Boyes Hot Springs","Agua Caliente","Kenwood","Glen Ellen","Eldridge","Vineburg","Schellville","Petaluma","Two Rock","Valley Ford","Bodega Bay","Bodega","Tomales","Marshall","Inverness","Point Reyes Station","Olema","Bolinas","Stinson Beach","Muir Beach","Mill Valley","Sausalito","Tiburon","Belvedere","Corte Madera","Larkspur","Kentfield","Ross","San Anselmo","Fairfax","San Geronimo","Woodacre","Forest Knolls","Lagunitas","Samuel","Nicasio","Novato","Petaluma","Santa Rosa","Healdsburg","Geyserville","Cloverdale","Ukiah","Willits","Laytonville","Leggett","Garberville","Shelter Cove","Fortuna","Eureka","Arcata","McKinleyville","Trinidad","Orick","Klamath","Crescent City","Hiouchi","Gasquet","Fort Dick","Smith River","Brookings","Gold Beach","Port Orford","Bandon","Coos Bay","North Bend","Reedsport","Florence","Yachats","Waldport","Newport","Lincoln City","Depoe Bay","Otis","Neskowin","Pacific City","Cloverdale","Hebo","Tillamook","Garibaldi","Rockaway Beach","Manzanita","Nehalem","Wheeler","Mohler","Seaside","Astoria"];

async function classifyBatch(cities: string[]): Promise<Record<string, string>> {
  const prompt = `You are a California geography expert. Assign each California city/town to its nearest California wedding destination region.

Available regions:
${REGION_NAMES.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Use "Other" only if the city truly doesn't fit any region (e.g., it's outside California or too remote).

Cities to classify:
${cities.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Reply with ONLY lines in this format:
1. Region Name
2. Region Name
(etc.)`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  const text = data.choices[0].message.content;

  const result: Record<string, string> = {};
  const lines = text.split("\n").filter(l => l.trim());
  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s*(.+)$/);
    if (match) {
      const idx = parseInt(match[1]) - 1;
      const region = match[2].trim();
      if (cities[idx] && REGION_NAMES.includes(region)) {
        result[cities[idx]] = region;
      }
    }
  }
  return result;
}

async function main() {
  // Deduplicate
  const cities = [...new Set(OTHER_CITIES)].filter(Boolean);
  console.log(`\n🗺  Classifying ${cities.length} cities into regions...\n`);

  const allMappings: Record<string, string[]> = {};
  REGION_NAMES.forEach(r => allMappings[r] = []);

  const BATCH = 50;
  for (let i = 0; i < cities.length; i += BATCH) {
    const batch = cities.slice(i, i + BATCH);
    const results = await classifyBatch(batch);
    for (const [city, region] of Object.entries(results)) {
      if (!allMappings[region]) allMappings[region] = [];
      allMappings[region].push(city);
    }
    process.stdout.write(`  ${Math.min(i + BATCH, cities.length)}/${cities.length} classified\r`);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n\n📋 Results by region:");
  for (const [region, newCities] of Object.entries(allMappings)) {
    if (newCities.length > 0) {
      console.log(`\n  ${region} (+${newCities.length}):`);
      newCities.forEach(c => console.log(`    + ${c}`));
    }
  }

  // Save output for manual review / applying to page.tsx
  const outPath = path.join(__dirname, "region-mappings.json");
  fs.writeFileSync(outPath, JSON.stringify(allMappings, null, 2));
  console.log(`\n✅ Saved to ${outPath}`);
  console.log(`\nNext: Apply these to REGIONS in src/app/venues/page.tsx`);
}

main().catch(console.error);
