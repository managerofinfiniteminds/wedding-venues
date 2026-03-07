import { Pool } from "pg";

const LOCAL_URL = "postgresql://waynekool@localhost:5432/wedding_venues";
const NEON_URL = "postgresql://neondb_owner:npg_o3XHSjZF9Pcd@ep-rough-sea-ai8thyl8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const SLUGS = [
  "annenberg-community-beach-house-santa-monica","black-oak-mountain-vineyards-cool",
  "bridgeport-ranch-barns-terrace-bridgeport","cayucos-creek-barn-cayucos",
  "cielo-estate-winery-shingle-springs","crystal-hermitage-gardens-nevada-city",
  "david-girard-vineyards-placerville","fairview-crystal-springs-ceremony-site-burlingame",
  "farallon-event-center-lynwood","filoli-historic-house-world-class-garden-woodside",
  "gold-hill-gardens-newcastle","greystone-mansion-gardens-the-doheny-estate-beverly-hills",
  "harmony-ridge-lodge-nevada-city","hastings-house-garden-weddings-half-moon-bay",
  "la-celebrations-banquet-halls-los-angeles","miners-foundry-cultural-center-nevada-city",
  "monserate-winery-fallbrook","monte-verde-inn-foresthill","nevada-city-winery-nevada-city",
  "newcastle-wedding-gardens-newcastle","oceano-hotel-spa-half-moon-bay-harbor-half-moon-bay",
  "river-garden-weddings-events-vista","rough-ready-vineyards-rough-and-ready",
  "sacred-oak-vineyard-cherry-valley","saureel-vineyards-placerville",
  "schrammsberg-estate-nevada-city","secret-garden-at-rancho-santa-fe-rancho-santa-fe",
  "smith-farm-weddings-events-susanville","the-barn-at-harrow-cellars-sonoma",
  "the-barn-at-unity-ranch-valley-springs","the-barn-event-center-by-amador-cellars-plymouth",
  "the-garden-weddings-events-escondido","the-hacienda-santa-ana","the-roth-estate-nevada-city",
  "the-vineyards-simi-valley","trentadue-winery-geyserville","twenty-mile-house-graeagle",
  "waterfall-lodge-and-retreat-ben-lomond","wente-vineyards-livermore"
];

const local = new Pool({ connectionString: LOCAL_URL });
const neon = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const ph = SLUGS.map((_,i) => `$${i+1}`).join(",");
  const { rows } = await local.query(
    `SELECT slug,description,"venueType","styleTags","priceTier","baseRentalMin","baseRentalMax","minGuests","maxGuests","seatedMax","hasBridalSuite","hasGroomSuite","hasOutdoorSpace","hasIndoorSpace","onSiteCoordinator","cateringKitchen","barSetup","tablesChairsIncluded","linensIncluded","avIncluded","lightingIncluded","adaCompliant","nearbyLodging","pipelineProcessedAt" FROM "Venue" WHERE slug IN (${ph})`,
    SLUGS
  );
  console.log(`\n🌿 Syncing enrichment for ${rows.length} venues\n`);

  let updated = 0, notFound = 0;
  for (const v of rows) {
    const r = await neon.query(`
      UPDATE "Venue" SET
        description=$1,"venueType"=$2,"styleTags"=$3,"priceTier"=$4,
        "baseRentalMin"=$5,"baseRentalMax"=$6,"minGuests"=$7,"maxGuests"=$8,"seatedMax"=$9,
        "hasBridalSuite"=$10,"hasGroomSuite"=$11,"hasOutdoorSpace"=$12,"hasIndoorSpace"=$13,
        "onSiteCoordinator"=$14,"cateringKitchen"=$15,"barSetup"=$16,
        "tablesChairsIncluded"=$17,"linensIncluded"=$18,"avIncluded"=$19,
        "lightingIncluded"=$20,"adaCompliant"=$21,"nearbyLodging"=$22,"pipelineProcessedAt"=$23
      WHERE slug=$24 RETURNING id`,
      [v.description,v.venueType,v.styleTags,v.priceTier,v.baseRentalMin,v.baseRentalMax,
       v.minGuests,v.maxGuests,v.seatedMax,v.hasBridalSuite,v.hasGroomSuite,v.hasOutdoorSpace,
       v.hasIndoorSpace,v.onSiteCoordinator,v.cateringKitchen,v.barSetup,v.tablesChairsIncluded,
       v.linensIncluded,v.avIncluded,v.lightingIncluded,v.adaCompliant,v.nearbyLodging,
       v.pipelineProcessedAt,v.slug]
    );
    if (r.rowCount && r.rowCount > 0) { updated++; console.log(`  ✅ ${v.slug}`); }
    else { notFound++; console.log(`  ⚠️  not in Neon: ${v.slug}`); }
  }

  console.log(`\nUpdated: ${updated} | Not in Neon: ${notFound}`);
  await local.end(); await neon.end();
}
main().catch(e => { console.error(e); process.exit(1); });
