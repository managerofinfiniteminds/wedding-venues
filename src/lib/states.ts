// src/lib/states.ts
// ============================================================
// SINGLE SOURCE OF TRUTH FOR STATE CONFIGURATION
// ============================================================
// To add a new state: add an entry below, set live: true when
// venue data has been loaded. Do NOT hardcode state/region data
// anywhere else in the codebase — always import from here.
// ============================================================

export interface StateConfig {
  name: string;           // "California"
  abbr: string;           // "CA"
  slug: string;           // "california" — must match the object key
  live: boolean;          // true = has venue data; false = coming soon
  description: string;    // short tagline for hub card
  regions: Record<string, string[]>; // region name → city names (empty for coming-soon states)
}

export const STATES: Record<string, StateConfig> = {

  // ── LIVE ────────────────────────────────────────────────────
  california: {
    name: "California",
    abbr: "CA",
    slug: "california",
    live: true,
    description: "Wine country, coastal cliffs, desert sunsets — California has it all.",
    regions: {
      "San Francisco": ["San Francisco", "Sausalito", "Tiburon", "Mill Valley", "San Rafael", "Novato", "Marin", "Muir Beach", "Stinson Beach", "Belvedere", "Corte Madera", "Larkspur", "Kentfield", "Ross", "San Anselmo", "Fairfax", "San Geronimo", "Woodacre", "Forest Knolls", "Lagunitas"],
      "East Bay": ["Oakland", "Berkeley", "Walnut Creek", "Concord", "Pleasanton", "Livermore", "Dublin", "San Ramon", "Danville", "Alamo", "Lafayette", "Orinda", "Fremont", "Hayward", "Newark", "Union City", "Alameda", "Emeryville", "Albany", "El Cerrito", "Richmond", "Pinole", "Hercules", "Martinez", "Brentwood", "Antioch", "Pittsburg", "Oakley", "Benicia"],
      "Peninsula & South Bay": ["San Mateo", "Burlingame", "Hillsborough", "Redwood City", "Menlo Park", "Palo Alto", "Los Altos", "Mountain View", "Sunnyvale", "Santa Clara", "San Jose", "Saratoga", "Los Gatos", "Campbell", "Morgan Hill", "Gilroy", "Half Moon Bay", "Pacifica", "Woodside", "Portola Valley", "Atherton", "Foster City", "Belmont", "San Carlos", "Millbrae", "San Bruno", "South San Francisco", "Daly City", "Milpitas"],
      "Napa Valley": ["Napa", "Yountville", "Oakville", "Rutherford", "St Helena", "St. Helena", "Calistoga", "American Canyon", "Pope Valley", "Angwin", "Vallejo", "Vacaville", "Fairfield", "Deer Park"],
      "Sonoma County": ["Sonoma", "Santa Rosa", "Healdsburg", "Petaluma", "Sebastopol", "Windsor", "Geyserville", "Cloverdale", "Glen Ellen", "Kenwood", "Guerneville", "Forestville", "Graton", "Occidental", "Rohnert Park", "Cotati", "Boyes Hot Springs", "El Verano", "Fetters Hot Springs", "Agua Caliente", "Eldridge", "Vineburg", "Schellville", "Two Rock", "Valley Ford", "Bodega Bay", "Bodega", "Tomales"],
      "Santa Cruz": ["Santa Cruz", "Aptos", "Capitola", "Scotts Valley", "Soquel", "Felton", "Boulder Creek", "Ben Lomond", "Watsonville", "Corralitos", "La Selva Beach"],
      "Monterey & Carmel": ["Monterey", "Carmel", "Carmel-by-the-Sea", "Pacific Grove", "Pebble Beach", "Big Sur", "Carmel Valley", "Seaside", "Marina", "Salinas", "Castroville", "Moss Landing", "Hollister", "King City"],
      "Santa Barbara": ["Santa Barbara", "Montecito", "Goleta", "Carpinteria", "Summerland", "Hope Ranch", "Santa Ynez", "Solvang", "Buellton", "Los Olivos", "Ballard", "Lompoc", "Santa Maria", "Ojai", "Ventura", "Oxnard", "Camarillo", "Moorpark", "Thousand Oaks", "Santa Paula", "Somis"],
      "San Luis Obispo": ["San Luis Obispo", "Paso Robles", "Pismo Beach", "Arroyo Grande", "Grover Beach", "Morro Bay", "Cambria", "Templeton", "Atascadero", "Nipomo", "Santa Margarita", "San Miguel"],
      "Los Angeles": ["Los Angeles", "Beverly Hills", "West Hollywood", "Santa Monica", "Malibu", "Culver City", "Brentwood", "Pacific Palisades", "Bel Air", "Hollywood", "Silver Lake", "Echo Park", "Downtown Los Angeles", "Arts District", "Pasadena", "Arcadia", "Monrovia", "Burbank", "Glendale", "Studio City", "Sherman Oaks", "Encino", "Tarzana", "Woodland Hills", "Calabasas", "Agoura Hills", "Long Beach", "San Pedro", "Torrance", "Redondo Beach", "Hermosa Beach", "Manhattan Beach", "El Segundo", "Hawthorne", "Inglewood", "Gardena", "Carson", "Lakewood", "Whittier", "Santa Clarita", "Valencia", "Simi Valley", "Chatsworth", "Northridge", "Granada Hills", "Van Nuys", "Altadena", "La Canada Flintridge", "Agua Dulce", "Westlake Village", "Marina del Rey", "Avalon", "Rancho Palos Verdes"],
      "Orange County": ["Anaheim", "Irvine", "Fullerton", "Santa Ana", "Orange", "Huntington Beach", "Newport Beach", "Laguna Beach", "Dana Point", "San Clemente", "Laguna Niguel", "Mission Viejo", "Lake Forest", "Aliso Viejo", "Rancho Santa Margarita", "Coto de Caza", "San Juan Capistrano", "Costa Mesa", "Tustin", "Garden Grove", "Brea", "Placentia", "Yorba Linda", "Seal Beach", "Los Alamitos", "Cypress", "La Palma"],
      "Inland Empire": ["Riverside", "San Bernardino", "Rancho Cucamonga", "Ontario", "Fontana", "Rialto", "Colton", "Redlands", "Loma Linda", "Yucaipa", "Beaumont", "Banning", "Hemet", "San Jacinto", "Perris", "Moreno Valley", "Murrieta", "Temecula", "Wildomar", "Lake Elsinore", "Canyon Lake", "Menifee", "Chino", "Chino Hills", "Corona", "Norco", "Pomona", "Claremont", "La Verne", "San Dimas", "Glendora", "Upland", "Montclair", "Apple Valley", "Victorville", "Hesperia", "Palmdale", "Lancaster", "Lake Arrowhead", "Big Bear Lake", "Idyllwild-Pine Cove", "Oak Glen"],
      "San Diego": ["San Diego", "La Jolla", "Del Mar", "Coronado", "Chula Vista", "Escondido", "Carlsbad", "Encinitas", "Solana Beach", "Oceanside", "Temecula", "Fallbrook", "Rancho Santa Fe", "El Cajon", "Santee", "La Mesa", "Poway", "San Marcos", "Vista", "Bonsall", "Valley Center", "Ramona", "Alpine", "Lakeside", "National City", "Imperial Beach", "Jamul", "Julian"],
      "Palm Springs & Desert": ["Palm Springs", "Palm Desert", "Rancho Mirage", "La Quinta", "Cathedral City", "Desert Hot Springs", "Indian Wells", "Indio", "Coachella", "Thermal", "Joshua Tree", "Yucca Valley", "Twentynine Palms", "Borrego Springs"],
      "Sacramento": ["Sacramento", "Folsom", "El Dorado Hills", "Roseville", "Granite Bay", "Davis", "Woodland", "Elk Grove", "Rancho Cordova", "Citrus Heights", "Rocklin", "Lincoln", "Loomis", "Orangevale", "Fair Oaks", "Galt", "West Sacramento", "Winters", "Dixon"],
      "Gold Country": ["Auburn", "Grass Valley", "Nevada City", "Placerville", "Cameron Park", "Shingle Springs", "Georgetown", "Coloma", "Lotus", "Garden Valley", "Sonora", "Jamestown", "Angels Camp", "Jackson", "Sutter Creek", "Amador City", "Ione", "Plymouth", "Camino", "Murphys", "Groveland", "Somerset"],
      "Lake Tahoe": ["South Lake Tahoe", "Tahoe City", "Truckee", "Olympic Valley", "Kings Beach", "Carnelian Bay", "Homewood", "Meeks Bay", "Incline Village", "Stateline"],
      "Central Valley": ["Fresno", "Bakersfield", "Stockton", "Modesto", "Visalia", "Madera", "Porterville", "Tulare", "Hanford", "Lodi", "Turlock", "Merced", "Tracy", "Manteca", "Tehachapi", "Delano", "Sanger", "Los Banos", "Clovis", "Oakdale", "Kingsburg", "Exeter", "Oakhurst", "Dinuba", "Reedley", "Taft"],
      "Shasta & Northern CA": ["Redding", "Chico", "Red Bluff", "Oroville", "Yuba City", "Marysville", "Anderson", "Corning", "Colusa", "Willows", "Orland", "Mount Shasta", "Cottonwood", "Susanville", "McCloud", "Crescent City", "Eureka", "Arcata", "McKinleyville", "Trinidad"],
      "Mendocino Coast": ["Mendocino", "Fort Bragg", "Elk", "Albion", "Little River", "Philo", "Boonville", "Gualala", "Point Arena", "Anchor Bay", "Hopland", "Ukiah", "Willits"],
      "Lake County & North Bay": ["Lakeport", "Clearlake", "Kelseyville", "Middletown", "Cobb", "Upper Lake", "Nice", "Lucerne", "Hidden Valley Lake", "Lower Lake", "Clearlake Oaks", "Finley"],
    },
  },

  // ── COMING SOON — alphabetical ───────────────────────────────
  alabama: {
    name: "Alabama",
    abbr: "AL",
    slug: "alabama",
    live: false,
    description: "Historic antebellum estates, Gulf Coast beaches, and Southern hospitality.",
    regions: {},
  },
  alaska: {
    name: "Alaska",
    abbr: "AK",
    slug: "alaska",
    live: false,
    description: "Glacier views, midnight sun, and breathtaking wilderness settings.",
    regions: {},
  },
  arizona: {
    name: "Arizona",
    abbr: "AZ",
    slug: "arizona",
    live: false,
    description: "Desert sunsets, Sedona red rocks, and Scottsdale luxury resorts.",
    regions: {},
  },
  arkansas: {
    name: "Arkansas",
    abbr: "AR",
    slug: "arkansas",
    live: false,
    description: "Ozark Mountain lodges, natural hot springs, and river valley charm.",
    regions: {},
  },
  colorado: {
    name: "Colorado",
    abbr: "CO",
    slug: "colorado",
    live: false,
    description: "Mountain lodges, ski resort grandeur, and Rocky Mountain panoramas.",
    regions: {},
  },
  connecticut: {
    name: "Connecticut",
    abbr: "CT",
    slug: "connecticut",
    live: false,
    description: "New England charm, vineyard estates, and historic coastal venues.",
    regions: {},
  },
  delaware: {
    name: "Delaware",
    abbr: "DE",
    slug: "delaware",
    live: false,
    description: "Coastal elegance, colonial history, and intimate garden estates.",
    regions: {},
  },
  florida: {
    name: "Florida",
    abbr: "FL",
    slug: "florida",
    live: true,
    description: "Beachfront villas, tropical gardens, and art deco elegance.",
    regions: {},
  },
  georgia: {
    name: "Georgia",
    abbr: "GA",
    slug: "georgia",
    live: false,
    description: "Southern charm, Savannah gardens, and Atlanta rooftop glamour.",
    regions: {},
  },
  hawaii: {
    name: "Hawaii",
    abbr: "HI",
    slug: "hawaii",
    live: false,
    description: "Oceanfront ceremonies, tropical blooms, and island luxury resorts.",
    regions: {},
  },
  idaho: {
    name: "Idaho",
    abbr: "ID",
    slug: "idaho",
    live: false,
    description: "Sun Valley mountain lodges, Snake River Plains, and rustic barn venues.",
    regions: {},
  },
  illinois: {
    name: "Illinois",
    abbr: "IL",
    slug: "illinois",
    live: false,
    description: "Chicago skyline rooftops, vineyard estates, and prairie garden venues.",
    regions: {},
  },
  indiana: {
    name: "Indiana",
    abbr: "IN",
    slug: "indiana",
    live: false,
    description: "Historic estates, barn venues, and elegant ballrooms across the Midwest.",
    regions: {},
  },
  iowa: {
    name: "Iowa",
    abbr: "IA",
    slug: "iowa",
    live: false,
    description: "Rolling farmland, barn venues, and charming small-town elegance.",
    regions: {},
  },
  kansas: {
    name: "Kansas",
    abbr: "KS",
    slug: "kansas",
    live: false,
    description: "Prairie sunsets, rustic barn venues, and Wichita urban event spaces.",
    regions: {},
  },
  kentucky: {
    name: "Kentucky",
    abbr: "KY",
    slug: "kentucky",
    live: false,
    description: "Bluegrass horse farms, bourbon distilleries, and Southern manor estates.",
    regions: {},
  },
  louisiana: {
    name: "Louisiana",
    abbr: "LA",
    slug: "louisiana",
    live: false,
    description: "New Orleans jazz venues, plantation estates, and bayou waterfront charm.",
    regions: {},
  },
  maine: {
    name: "Maine",
    abbr: "ME",
    slug: "maine",
    live: false,
    description: "Rocky coastlines, lighthouse settings, and New England farmhouse charm.",
    regions: {},
  },
  maryland: {
    name: "Maryland",
    abbr: "MD",
    slug: "maryland",
    live: false,
    description: "Chesapeake Bay waterfront venues, DC-area elegance, and historic estates.",
    regions: {},
  },
  massachusetts: {
    name: "Massachusetts",
    abbr: "MA",
    slug: "massachusetts",
    live: false,
    description: "Cape Cod beach venues, Boston harbor elegance, and vineyard island settings.",
    regions: {},
  },
  michigan: {
    name: "Michigan",
    abbr: "MI",
    slug: "michigan",
    live: false,
    description: "Great Lakes waterfront venues, Traverse City wine country, and lakeside lodges.",
    regions: {},
  },
  minnesota: {
    name: "Minnesota",
    abbr: "MN",
    slug: "minnesota",
    live: false,
    description: "10,000 lakes waterfront venues, Twin Cities urban spaces, and forest lodges.",
    regions: {},
  },
  mississippi: {
    name: "Mississippi",
    abbr: "MS",
    slug: "mississippi",
    live: false,
    description: "Antebellum plantation estates, Gulf Coast resorts, and river delta charm.",
    regions: {},
  },
  missouri: {
    name: "Missouri",
    abbr: "MO",
    slug: "missouri",
    live: false,
    description: "Ozark Mountain venues, St. Louis rooftop elegance, and vineyard estates.",
    regions: {},
  },
  montana: {
    name: "Montana",
    abbr: "MT",
    slug: "montana",
    live: false,
    description: "Big Sky wilderness lodges, Glacier National Park settings, and ranch venues.",
    regions: {},
  },
  nebraska: {
    name: "Nebraska",
    abbr: "NE",
    slug: "nebraska",
    live: false,
    description: "Prairie ranches, Omaha urban venues, and Sandhills lake retreats.",
    regions: {},
  },
  nevada: {
    name: "Nevada",
    abbr: "NV",
    slug: "nevada",
    live: false,
    description: "Las Vegas luxury, Lake Tahoe mountain elegance, and desert starlight settings.",
    regions: {},
  },
  "new-hampshire": {
    name: "New Hampshire",
    abbr: "NH",
    slug: "new-hampshire",
    live: false,
    description: "White Mountain lodges, covered bridge settings, and lakefront New England charm.",
    regions: {},
  },
  "new-jersey": {
    name: "New Jersey",
    abbr: "NJ",
    slug: "new-jersey",
    live: false,
    description: "Shore elegance, vineyard estates, and NYC-adjacent luxury venues.",
    regions: {},
  },
  "new-mexico": {
    name: "New Mexico",
    abbr: "NM",
    slug: "new-mexico",
    live: false,
    description: "Adobe haciendas, Taos mountain venues, and Santa Fe artistic elegance.",
    regions: {},
  },
  "new-york": {
    name: "New York",
    abbr: "NY",
    slug: "new-york",
    live: true,
    description: "Hudson Valley estates, Hamptons luxury, and NYC skyline glamour.",
    regions: {},
  },
  "north-carolina": {
    name: "North Carolina",
    abbr: "NC",
    slug: "north-carolina",
    live: false,
    description: "Blue Ridge Mountain escapes, vineyard estates, and coastal elegance.",
    regions: {},
  },
  "north-dakota": {
    name: "North Dakota",
    abbr: "ND",
    slug: "north-dakota",
    live: false,
    description: "Badlands vistas, prairie ranch venues, and Fargo urban event spaces.",
    regions: {},
  },
  ohio: {
    name: "Ohio",
    abbr: "OH",
    slug: "ohio",
    live: false,
    description: "Hocking Hills forest venues, vineyard estates, and Great Lakes waterfront settings.",
    regions: {},
  },
  oklahoma: {
    name: "Oklahoma",
    abbr: "OK",
    slug: "oklahoma",
    live: false,
    description: "Ranch venues, Tulsa art deco spaces, and Southern plains sunsets.",
    regions: {},
  },
  oregon: {
    name: "Oregon",
    abbr: "OR",
    slug: "oregon",
    live: false,
    description: "Wine country estates, coastal bluffs, and old-growth forest settings.",
    regions: {},
  },
  pennsylvania: {
    name: "Pennsylvania",
    abbr: "PA",
    slug: "pennsylvania",
    live: false,
    description: "Barn venues, Pocono Mountains, Philadelphia historic spaces, and vineyard estates.",
    regions: {},
  },
  "rhode-island": {
    name: "Rhode Island",
    abbr: "RI",
    slug: "rhode-island",
    live: false,
    description: "Newport mansion elegance, coastal charm, and New England vineyard settings.",
    regions: {},
  },
  "south-carolina": {
    name: "South Carolina",
    abbr: "SC",
    slug: "south-carolina",
    live: false,
    description: "Charleston plantation charm, Lowcountry marshes, and beach resort venues.",
    regions: {},
  },
  "south-dakota": {
    name: "South Dakota",
    abbr: "SD",
    slug: "south-dakota",
    live: false,
    description: "Badlands vistas, Black Hills ranch venues, and prairie elegance.",
    regions: {},
  },
  tennessee: {
    name: "Tennessee",
    abbr: "TN",
    slug: "tennessee",
    live: false,
    description: "Nashville music city magic, Smoky Mountain lodges, and plantation estates.",
    regions: {},
  },
  texas: {
    name: "Texas",
    abbr: "TX",
    slug: "texas",
    live: false,
    description: "Hill Country charm, Gulf Coast breezes, and big city sophistication.",
    regions: {},
  },
  utah: {
    name: "Utah",
    abbr: "UT",
    slug: "utah",
    live: false,
    description: "Red rock canyon settings, mountain lodge venues, and Salt Lake City elegance.",
    regions: {},
  },
  vermont: {
    name: "Vermont",
    abbr: "VT",
    slug: "vermont",
    live: false,
    description: "Fall foliage barn venues, ski lodge elegance, and New England farm settings.",
    regions: {},
  },
  virginia: {
    name: "Virginia",
    abbr: "VA",
    slug: "virginia",
    live: false,
    description: "Blue Ridge vineyards, historic plantations, and DC-area elegance.",
    regions: {},
  },
  washington: {
    name: "Washington",
    abbr: "WA",
    slug: "washington",
    live: false,
    description: "Pacific Northwest forests, vineyard valleys, and waterfront venues.",
    regions: {},
  },
  "west-virginia": {
    name: "West Virginia",
    abbr: "WV",
    slug: "west-virginia",
    live: false,
    description: "Mountain state lodges, whitewater river settings, and rustic barn elegance.",
    regions: {},
  },
  wisconsin: {
    name: "Wisconsin",
    abbr: "WI",
    slug: "wisconsin",
    live: false,
    description: "Door County vineyard settings, Great Lakes waterfront, and lakeside lodge venues.",
    regions: {},
  },
  wyoming: {
    name: "Wyoming",
    abbr: "WY",
    slug: "wyoming",
    live: false,
    description: "Grand Teton mountain backdrops, Yellowstone country, and dude ranch elegance.",
    regions: {},
  },
  "puerto-rico": {
    name: "Puerto Rico",
    abbr: "PR",
    slug: "puerto-rico",
    live: false,
    description: "Caribbean beach ceremonies, historic Old San Juan haciendas, and tropical luxury resorts.",
    regions: {},
  },
};

// ── Helpers ──────────────────────────────────────────────────

/** Look up a state config by slug. Returns undefined for unknown slugs. */
export function getState(slug: string): StateConfig | undefined {
  return STATES[slug];
}

/** All states with live venue data. */
export function getLiveStates(): StateConfig[] {
  return Object.values(STATES).filter((s) => s.live);
}

/** All states not yet live (coming soon). */
export function getComingSoonStates(): StateConfig[] {
  return Object.values(STATES).filter((s) => !s.live);
}

/** Flat list of all cities for a given state slug. Empty array for coming-soon states. */
export function getStateCities(stateSlug: string): string[] {
  return Object.values(STATES[stateSlug]?.regions ?? {}).flat();
}

/** All region names for a state. */
export function getStateRegions(stateSlug: string): string[] {
  return Object.keys(STATES[stateSlug]?.regions ?? {});
}
