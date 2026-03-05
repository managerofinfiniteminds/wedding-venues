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
      "East Bay": ["Oakland", "Berkeley", "Walnut Creek", "Concord", "Pleasanton", "Livermore", "Dublin", "San Ramon", "Danville", "Alamo", "Lafayette", "Orinda", "Fremont", "Hayward", "Newark", "Union City", "Alameda", "Emeryville", "Albany", "El Cerrito", "Richmond", "Pinole", "Hercules", "Martinez", "Brentwood (East Bay)", "Antioch", "Pittsburg", "Oakley", "Benicia"],
      "Peninsula & South Bay": ["San Mateo", "Burlingame", "Hillsborough", "Redwood City", "Menlo Park", "Palo Alto", "Los Altos", "Mountain View", "Sunnyvale", "Santa Clara", "San Jose", "Saratoga", "Los Gatos", "Campbell", "Morgan Hill", "Gilroy", "Half Moon Bay", "Pacifica", "Woodside", "Portola Valley", "Atherton", "Foster City", "Belmont", "San Carlos", "Millbrae", "San Bruno", "South San Francisco", "Daly City", "Milpitas"],
      "Napa Valley": ["Napa", "Yountville", "Oakville", "Rutherford", "St Helena", "St. Helena", "Calistoga", "American Canyon", "Pope Valley", "Angwin", "Vallejo", "Vacaville", "Fairfield", "Deer Park"],
      "Sonoma County": ["Sonoma", "Santa Rosa", "Healdsburg", "Petaluma", "Sebastopol", "Windsor", "Geyserville", "Cloverdale", "Glen Ellen", "Kenwood", "Guerneville", "Forestville", "Graton", "Occidental", "Rohnert Park", "Cotati", "Boyes Hot Springs", "El Verano", "Fetters Hot Springs", "Agua Caliente", "Eldridge", "Vineburg", "Schellville", "Two Rock", "Valley Ford", "Bodega Bay", "Bodega", "Tomales"],
      "Santa Cruz": ["Santa Cruz", "Aptos", "Capitola", "Scotts Valley", "Soquel", "Felton", "Boulder Creek", "Ben Lomond", "Watsonville", "Corralitos", "La Selva Beach"],
      "Monterey & Carmel": ["Monterey", "Carmel", "Carmel-by-the-Sea", "Pacific Grove", "Pebble Beach", "Big Sur", "Carmel Valley", "Seaside", "Marina", "Salinas", "Castroville", "Moss Landing", "Hollister", "King City"],
      "Santa Barbara": ["Santa Barbara", "Montecito", "Goleta", "Carpinteria", "Summerland", "Hope Ranch", "Santa Ynez", "Solvang", "Buellton", "Los Olivos", "Ballard", "Lompoc", "Santa Maria", "Ojai", "Ventura", "Oxnard", "Camarillo", "Moorpark", "Thousand Oaks", "Santa Paula", "Somis"],
      "San Luis Obispo": ["San Luis Obispo", "Paso Robles", "Pismo Beach", "Arroyo Grande", "Grover Beach", "Morro Bay", "Cambria", "Templeton", "Atascadero", "Nipomo", "Santa Margarita", "San Miguel"],
      "Los Angeles": ["Los Angeles", "Beverly Hills", "West Hollywood", "Santa Monica", "Malibu", "Culver City", "Brentwood", "Pacific Palisades", "Bel Air", "Hollywood", "Silver Lake", "Echo Park", "Downtown Los Angeles", "Arts District", "Pasadena", "Arcadia", "Monrovia", "Burbank", "Glendale", "Studio City", "Sherman Oaks", "Encino", "Tarzana", "Woodland Hills", "Calabasas", "Agoura Hills", "Long Beach", "San Pedro", "Torrance", "Redondo Beach", "Hermosa Beach", "Manhattan Beach", "El Segundo", "Hawthorne", "Inglewood", "Gardena", "Carson", "Lakewood", "Whittier", "Santa Clarita", "Valencia", "Simi Valley", "Chatsworth", "Northridge", "Granada Hills", "Van Nuys", "Altadena", "La Canada Flintridge", "Agua Dulce", "Westlake Village", "Marina del Rey", "Avalon", "Rancho Palos Verdes"],
      "Orange County": ["Anaheim", "Irvine", "Fullerton", "Santa Ana", "Orange", "Huntington Beach", "Newport Beach", "Laguna Beach", "Dana Point", "San Clemente", "Laguna Niguel", "Mission Viejo", "Lake Forest", "Aliso Viejo", "Rancho Santa Margarita", "Coto de Caza", "San Juan Capistrano", "Costa Mesa", "Tustin", "Garden Grove", "Brea", "Placentia", "Yorba Linda", "Seal Beach", "Los Alamitos", "Cypress", "La Palma"],
      "Inland Empire": ["Riverside", "San Bernardino", "Rancho Cucamonga", "Ontario", "Fontana", "Rialto", "Colton", "Redlands", "Loma Linda", "Yucaipa", "Beaumont", "Banning", "Hemet", "San Jacinto", "Perris", "Moreno Valley", "Murrieta", "Wildomar", "Lake Elsinore", "Canyon Lake", "Menifee", "Chino", "Chino Hills", "Corona", "Norco", "Pomona", "Claremont", "La Verne", "San Dimas", "Glendora", "Upland", "Montclair", "Apple Valley", "Victorville", "Hesperia", "Palmdale", "Lancaster", "Lake Arrowhead", "Big Bear Lake", "Idyllwild-Pine Cove", "Oak Glen"],
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
    live: true,
    description: "Historic antebellum estates, Gulf Coast beaches, and Southern hospitality.",
    regions: {
      "Greater Birmingham": ["Birmingham", "Hoover", "Vestavia Hills", "Mountain Brook", "Homewood", "Alabaster", "Helena", "Pelham", "Trussville", "Moody", "Gardendale", "Bessemer"],
      "Gulf Coast": ["Mobile", "Gulf Shores", "Orange Beach", "Fairhope", "Daphne", "Spanish Fort", "Foley", "Bay Minette", "Saraland", "Chickasaw"],
      "Tennessee Valley": ["Huntsville", "Decatur", "Florence", "Athens", "Madison", "Muscle Shoals", "Sheffield", "Cullman", "Scottsboro", "Fort Payne"],
      "Black Belt & Central AL": ["Montgomery", "Tuscaloosa", "Selma", "Prattville", "Auburn", "Opelika", "Dothan", "Anniston", "Gadsden", "Talladega"],
    },
  },
  alaska: {
    name: "Alaska",
    abbr: "AK",
    slug: "alaska",
    live: true,
    description: "Glacier views, midnight sun, and breathtaking wilderness settings.",
    regions: {
      "Anchorage & Mat-Su": ["Anchorage", "Wasilla", "Palmer", "Eagle River", "Chugiak", "Girdwood", "Birchwood", "Big Lake", "Houston"],
      "Fairbanks & Interior": ["Fairbanks", "North Pole", "Ester", "Nenana", "Delta Junction", "Tok"],
      "Southeast (Inside Passage)": ["Juneau", "Sitka", "Ketchikan", "Skagway", "Haines", "Wrangell", "Petersburg", "Glacier Bay"],
      "Kenai Peninsula": ["Kenai", "Soldotna", "Homer", "Seward", "Kodiak", "Sterling", "Nikiski"],
    },
  },
  arizona: {
    name: "Arizona",
    abbr: "AZ",
    slug: "arizona",
    live: true,
    description: "Desert sunsets, Sedona red rocks, and Scottsdale luxury resorts.",
    regions: {
      "Phoenix Metro": ["Phoenix", "Scottsdale", "Tempe", "Mesa", "Chandler", "Gilbert", "Peoria", "Glendale", "Surprise", "Goodyear", "Avondale", "Queen Creek"],
      "Sedona & Verde Valley": ["Sedona", "Cottonwood", "Jerome", "Camp Verde", "Clarkdale", "Village of Oak Creek", "Cornville"],
      "Tucson & Southern AZ": ["Tucson", "Oro Valley", "Marana", "Sahuarita", "Green Valley", "Sierra Vista", "Bisbee", "Tombstone", "Douglas", "Sonoita"],
      "Flagstaff & Northern AZ": ["Flagstaff", "Williams", "Prescott", "Prescott Valley", "Chino Valley", "Kingman", "Lake Havasu City", "Page", "Show Low"],
    },
  },
  arkansas: {
    name: "Arkansas",
    abbr: "AR",
    slug: "arkansas",
    live: true,
    description: "Ozark Mountain lodges, natural hot springs, and river valley charm.",
    regions: {
      "Little Rock Metro": ["Little Rock", "North Little Rock", "Conway", "Benton", "Bryant", "Cabot", "Sherwood", "Maumelle", "Jacksonville", "Searcy"],
      "Ozark Mountains": ["Fayetteville", "Springdale", "Rogers", "Bentonville", "Eureka Springs", "Harrison", "Mountain Home", "Berryville", "Hardy", "Jasper"],
      "River Valley": ["Fort Smith", "Van Buren", "Russellville", "Clarksville", "Dardanelle", "Ozark", "Paris"],
      "Hot Springs & Central Highlands": ["Hot Springs", "Hot Springs Village", "Malvern", "Arkadelphia", "Mena", "Murfreesboro", "Mount Ida"],
      "Delta & Southeast AR": ["Jonesboro", "Texarkana", "Pine Bluff", "El Dorado", "Magnolia", "Camden", "Monticello", "Helena", "Paragould", "Batesville"],
    },
  },
  colorado: {
    name: "Colorado",
    abbr: "CO",
    slug: "colorado",
    live: true,
    description: "Mountain lodges, ski resort grandeur, and Rocky Mountain panoramas.",
    regions: {
      "Denver Metro": ["Denver", "Aurora", "Lakewood", "Thornton", "Westminster", "Arvada", "Centennial", "Parker", "Littleton", "Englewood", "Commerce City", "Brighton"],
      "Boulder & Front Range": ["Boulder", "Longmont", "Fort Collins", "Loveland", "Greeley", "Broomfield", "Erie", "Lafayette", "Louisville", "Niwot"],
      "Colorado Springs": ["Colorado Springs", "Pueblo", "Manitou Springs", "Woodland Park", "Monument", "Castle Rock", "Fountain"],
      "Aspen & Roaring Fork": ["Aspen", "Snowmass Village", "Basalt", "Carbondale", "Glenwood Springs", "Marble", "Redstone"],
      "Vail & Summit County": ["Vail", "Breckenridge", "Keystone", "Dillon", "Frisco", "Silverthorne", "Copper Mountain", "Leadville", "Steamboat Springs"],
      "Western Slope": ["Grand Junction", "Montrose", "Delta", "Durango", "Telluride", "Cortez", "Ouray", "Ridgway", "Crested Butte", "Gunnison"],
    },
  },
  connecticut: {
    name: "Connecticut",
    abbr: "CT",
    slug: "connecticut",
    live: true,
    description: "New England charm, vineyard estates, and historic coastal venues.",
    regions: {
      "Greater Hartford": ["Hartford", "West Hartford", "Glastonbury", "South Windsor", "Simsbury", "Avon", "Farmington", "Windsor", "East Hartford", "Manchester", "Newington", "Wethersfield"],
      "Litchfield Hills": ["Litchfield", "Washington", "New Milford", "Woodbury", "Bethlehem", "Kent", "Cornwall", "Salisbury", "Norfolk", "Torrington", "Bantam"],
      "New Haven & Shoreline": ["New Haven", "Milford", "Branford", "Guilford", "Madison", "Clinton", "Westbrook", "Old Saybrook", "Essex", "Chester", "Lyme", "East Haddam"],
      "Fairfield County": ["Greenwich", "Stamford", "Westport", "Darien", "New Canaan", "Fairfield", "Ridgefield", "Wilton", "Weston", "Norwalk", "Bridgeport"],
    },
  },
  delaware: {
    name: "Delaware",
    abbr: "DE",
    slug: "delaware",
    live: true,
    description: "Coastal elegance, colonial history, and intimate garden estates.",
    regions: {
      "Wilmington & Northern DE": ["Wilmington", "Newark", "Bear", "New Castle", "Hockessin", "Pike Creek", "Elsmere", "Claymont", "Middletown", "Odessa"],
      "Dover & Central DE": ["Dover", "Smyrna", "Camden", "Harrington", "Milford", "Georgetown", "Bridgeville"],
      "Rehoboth & Beaches": ["Rehoboth Beach", "Dewey Beach", "Bethany Beach", "Fenwick Island", "Lewes", "Milton", "Millsboro", "Ocean View", "Dagsboro"],
    },
  },
  florida: {
    name: "Florida",
    abbr: "FL",
    slug: "florida",
    live: true,
    description: "Beachfront villas, tropical gardens, and art deco elegance.",
    regions: {
      "Miami & South Florida": ["Miami", "Miami Beach", "Coral Gables", "Coconut Grove", "Brickell", "Fort Lauderdale", "Boca Raton", "Delray Beach", "West Palm Beach", "Palm Beach", "Hollywood", "Aventura", "Doral", "Hialeah", "Homestead"],
      "Florida Keys": ["Key West", "Key Largo", "Islamorada", "Marathon", "Big Pine Key", "Tavernier"],
      "Orlando & Central FL": ["Orlando", "Winter Park", "Celebration", "Kissimmee", "Windermere", "Lake Mary", "Sanford", "Mount Dora", "Clermont", "Daytona Beach", "New Smyrna Beach", "DeLand"],
      "Tampa Bay": ["Tampa", "St. Petersburg", "Clearwater", "Sarasota", "Bradenton", "Dunedin", "Tarpon Springs", "Anna Maria Island", "Siesta Key", "Longboat Key", "Venice"],
      "Jacksonville & Northeast FL": ["Jacksonville", "St. Augustine", "Amelia Island", "Fernandina Beach", "Palm Valley", "Ponte Vedra Beach", "Orange Park", "Fleming Island"],
      "Panhandle & Gulf Coast": ["Pensacola", "Destin", "Fort Walton Beach", "Panama City Beach", "30A Seaside", "Rosemary Beach", "Grayton Beach", "Tallahassee", "Apalachicola"],
    },
  },
  georgia: {
    name: "Georgia",
    abbr: "GA",
    slug: "georgia",
    live: true,
    description: "Southern charm, Savannah gardens, and Atlanta rooftop glamour.",
    regions: {
      "Atlanta Metro": ["Atlanta", "Buckhead", "Midtown", "Decatur", "Marietta", "Alpharetta", "Roswell", "Sandy Springs", "Duluth", "Norcross", "Smyrna", "Kennesaw", "Peachtree City", "Newnan", "Canton", "Cumming", "Gainesville", "Athens"],
      "Savannah & Coastal GA": ["Savannah", "Tybee Island", "Hilton Head", "Brunswick", "Jekyll Island", "St. Simons Island", "Sea Island", "Golden Isles", "Statesboro", "Hinesville"],
      "Blue Ridge Mountains": ["Blue Ridge", "Dahlonega", "Helen", "Young Harris", "Hiawassee", "Blairsville", "Ellijay", "Chatsworth", "Toccoa", "Clayton"],
      "Augusta & Central GA": ["Augusta", "Evans", "Martinez", "Macon", "Warner Robins", "Columbus", "Valdosta", "Albany", "Thomasville", "Perry"],
    },
  },
  hawaii: {
    name: "Hawaii",
    abbr: "HI",
    slug: "hawaii",
    live: true,
    description: "Oceanfront ceremonies, tropical blooms, and island luxury resorts.",
    regions: {
      "Oahu": ["Honolulu", "Waikiki", "Kailua", "Kaneohe", "Pearl City", "Aiea", "Ewa Beach", "Mililani", "North Shore", "Waianae", "Haleiwa"],
      "Maui": ["Lahaina", "Kaanapali", "Wailea", "Kihei", "Makawao", "Paia", "Hana", "Kapalua", "Wailuku", "Kahului"],
      "Big Island": ["Kona", "Kohala Coast", "Hilo", "Waimea", "Volcano", "Waikoloa", "Captain Cook", "Naalehu", "Pahoa"],
      "Kauai": ["Princeville", "Hanalei", "Poipu", "Lihue", "Kapaa", "Kilauea", "Waimea Canyon", "Koloa", "Hanapepe"],
    },
  },
  idaho: {
    name: "Idaho",
    abbr: "ID",
    slug: "idaho",
    live: true,
    description: "Sun Valley mountain lodges, Snake River Plains, and rustic barn venues.",
    regions: {
      "Boise & Treasure Valley": ["Boise", "Nampa", "Meridian", "Caldwell", "Eagle", "Kuna", "Middleton", "Star", "Garden City", "Emmett"],
      "Sun Valley & Wood River": ["Sun Valley", "Ketchum", "Hailey", "Bellevue", "Carey", "Fairfield", "Shoshone"],
      "Coeur d'Alene & North Idaho": ["Coeur d'Alene", "Sandpoint", "Post Falls", "Rathdrum", "Hayden", "Spirit Lake", "Priest Lake", "Bonners Ferry", "Moscow", "Pullman"],
      "Eastern Idaho": ["Idaho Falls", "Pocatello", "Twin Falls", "Rexburg", "Blackfoot", "Burley", "American Falls", "Driggs", "Victor", "Island Park"],
    },
  },
  illinois: {
    name: "Illinois",
    abbr: "IL",
    slug: "illinois",
    live: true,
    description: "Chicago skyline rooftops, vineyard estates, and prairie garden venues.",
    regions: {
      "Chicago & North Shore": ["Chicago", "Evanston", "Wilmette", "Winnetka", "Kenilworth", "Glencoe", "Highland Park", "Lake Forest", "Waukegan", "Northbrook", "Glenview", "Skokie"],
      "Chicago West & South Suburbs": ["Naperville", "Aurora", "Joliet", "Bolingbrook", "Schaumburg", "Elgin", "Oak Park", "Hinsdale", "Elmhurst", "Wheaton", "Downers Grove", "Orland Park", "Tinley Park", "Oak Lawn"],
      "Galena & Northwest IL": ["Galena", "Rockford", "Freeport", "Dixon", "Rock Island", "Moline", "East Moline", "Sterling", "Mount Carroll"],
      "Bloomington & Central IL": ["Bloomington", "Normal", "Peoria", "Springfield", "Champaign", "Urbana", "Decatur", "Danville", "Kankakee"],
      "Southern IL": ["Carbondale", "Marion", "Belleville", "Collinsville", "O'Fallon", "Alton", "Edwardsville", "Shiloh", "Mt. Vernon", "Benton"],
    },
  },
  indiana: {
    name: "Indiana",
    abbr: "IN",
    slug: "indiana",
    live: true,
    description: "Historic estates, barn venues, and elegant ballrooms across the Midwest.",
    regions: {
      "Indianapolis Metro": ["Indianapolis", "Carmel", "Fishers", "Westfield", "Zionsville", "Greenwood", "Avon", "Plainfield", "Noblesville", "Anderson", "Muncie", "Terre Haute"],
      "South Bend & Lake Michigan": ["South Bend", "Mishawaka", "Elkhart", "Goshen", "Gary", "Hammond", "Valparaiso", "Merrillville", "Michigan City", "Chesterton", "Portage"],
      "Fort Wayne & Northeast IN": ["Fort Wayne", "Auburn", "Angola", "Kendallville", "Wabash", "Peru", "Logansport", "Kokomo", "Marion"],
      "Bloomington & Southern IN": ["Bloomington", "Columbus", "Seymour", "Bedford", "Jasper", "Vincennes", "Evansville", "Newburgh", "Nashville", "Salem"],
    },
  },
  iowa: {
    name: "Iowa",
    abbr: "IA",
    slug: "iowa",
    live: true,
    description: "Rolling farmland, barn venues, and charming small-town elegance.",
    regions: {
      "Des Moines & Central IA": ["Des Moines", "West Des Moines", "Ankeny", "Urbandale", "Johnston", "Waukee", "Clive", "Altoona", "Norwalk", "Indianola", "Ames", "Nevada"],
      "Iowa City & Eastern IA": ["Iowa City", "Coralville", "North Liberty", "Cedar Rapids", "Marion", "Davenport", "Bettendorf", "Muscatine", "Fairfield", "Burlington"],
      "Cedar Rapids & Northeast IA": ["Waterloo", "Cedar Falls", "Dubuque", "Dyersville", "Decorah", "Manchester", "Independence", "Marshalltown"],
      "Sioux City & Western IA": ["Sioux City", "Council Bluffs", "Spencer", "Storm Lake", "Fort Dodge", "Mason City", "Clear Lake", "Carroll"],
    },
  },
  kansas: {
    name: "Kansas",
    abbr: "KS",
    slug: "kansas",
    live: true,
    description: "Prairie sunsets, rustic barn venues, and Wichita urban event spaces.",
    regions: {
      "Wichita & South Central": ["Wichita", "Derby", "Andover", "Haysville", "Goddard", "Maize", "Augusta", "El Dorado", "Newton", "Hutchinson", "McPherson"],
      "Kansas City Metro": ["Kansas City", "Overland Park", "Olathe", "Shawnee", "Lenexa", "Lawrence", "Leawood", "Gardner", "Leavenworth", "Basehor"],
      "Manhattan & Flint Hills": ["Manhattan", "Salina", "Emporia", "Junction City", "Abilene", "Council Grove", "Herington"],
      "Western Kansas": ["Dodge City", "Garden City", "Liberal", "Hays", "Great Bend", "Pratt", "Colby", "Goodland"],
    },
  },
  kentucky: {
    name: "Kentucky",
    abbr: "KY",
    slug: "kentucky",
    live: true,
    description: "Bluegrass horse farms, bourbon distilleries, and Southern manor estates.",
    regions: {
      "Lexington & Bluegrass": ["Lexington", "Georgetown", "Paris", "Nicholasville", "Harrodsburg", "Danville", "Richmond", "Berea", "Winchester", "Frankfort"],
      "Louisville Metro": ["Louisville", "Jeffersontown", "Shively", "St. Matthews", "Anchorage", "Prospect", "Shelbyville", "La Grange", "Bardstown"],
      "Bourbon Trail": ["Loretto", "Clermont", "Lawrenceburg", "Bloomfield", "Springfield", "Lebanon", "New Haven", "Midway", "Taylorsville"],
      "Eastern Appalachia": ["Pikeville", "Prestonsburg", "Hazard", "Corbin", "London", "Middlesboro", "Harlan", "Whitesburg", "Paintsville"],
      "Western KY": ["Bowling Green", "Owensboro", "Henderson", "Hopkinsville", "Murray", "Paducah", "Madisonville", "Elizabethtown", "Campbellsville"],
    },
  },
  louisiana: {
    name: "Louisiana",
    abbr: "LA",
    slug: "louisiana",
    live: true,
    description: "New Orleans jazz venues, plantation estates, and bayou waterfront charm.",
    regions: {
      "New Orleans & Metro": ["New Orleans", "Metairie", "Kenner", "Slidell", "Covington", "Mandeville", "Madisonville", "Abita Springs", "Gretna", "Harvey", "Marrero"],
      "Baton Rouge & River Parishes": ["Baton Rouge", "Denham Springs", "Gonzales", "Prairieville", "Zachary", "St. Francisville", "White Castle", "Plaquemine", "Donaldsonville", "Houma", "Thibodaux"],
      "Cajun Country & Lafayette": ["Lafayette", "Breaux Bridge", "Henderson", "New Iberia", "Abbeville", "Opelousas", "Crowley", "Eunice", "Scott", "Broussard", "Youngsville"],
      "Shreveport & Northern LA": ["Shreveport", "Bossier City", "Natchitoches", "Monroe", "Ruston", "Alexandria", "Pineville", "Minden", "Bastrop"],
    },
  },
  maine: {
    name: "Maine",
    abbr: "ME",
    slug: "maine",
    live: true,
    description: "Rocky coastlines, lighthouse settings, and New England farmhouse charm.",
    regions: {
      "Portland & Southern Coast": ["Portland", "Cape Elizabeth", "Scarborough", "South Portland", "Old Orchard Beach", "Kennebunkport", "Kennebunk", "Ogunquit", "York", "Kittery", "Biddeford", "Saco", "Falmouth", "Cumberland"],
      "Midcoast & Camden": ["Camden", "Rockland", "Rockport", "Belfast", "Boothbay Harbor", "Damariscotta", "Bath", "Brunswick", "Freeport", "Harpswell", "Wiscasset"],
      "Acadia & Downeast": ["Bar Harbor", "Mount Desert Island", "Southwest Harbor", "Northeast Harbor", "Ellsworth", "Blue Hill", "Castine", "Stonington", "Lubec", "Eastport", "Machias"],
      "Lakes & Mountains": ["Bridgton", "Naples", "Bethel", "Norway", "Rangeley", "Kingfield", "Farmington", "Greenville", "Moosehead Lake", "Jackman"],
      "Kennebec Valley": ["Augusta", "Waterville", "Gardiner", "Hallowell", "Winthrop", "Skowhegan", "Madison", "Bingham"],
    },
  },
  maryland: {
    name: "Maryland",
    abbr: "MD",
    slug: "maryland",
    live: true,
    description: "Chesapeake Bay waterfront venues, DC-area elegance, and historic estates.",
    regions: {
      "Baltimore Metro": ["Baltimore", "Towson", "Timonium", "Hunt Valley", "Columbia", "Ellicott City", "Catonsville", "Parkville", "Bel Air", "Lutherville", "Pikesville", "Owings Mills", "Reisterstown"],
      "DC Suburbs & Montgomery County": ["Bethesda", "Chevy Chase", "Silver Spring", "Rockville", "Gaithersburg", "Potomac", "North Bethesda", "Germantown", "Frederick", "College Park", "Greenbelt", "Bowie", "Upper Marlboro", "Annapolis"],
      "Eastern Shore & Chesapeake": ["Ocean City", "St. Michaels", "Easton", "Cambridge", "Chestertown", "Salisbury", "Berlin", "Snow Hill", "Princess Anne", "Crisfield"],
      "Western Maryland": ["Hagerstown", "Cumberland", "Thurmont", "Boonsboro", "Smithsburg", "Deep Creek Lake", "McHenry", "Oakland"],
    },
  },
  massachusetts: {
    name: "Massachusetts",
    abbr: "MA",
    slug: "massachusetts",
    live: true,
    description: "Cape Cod beach venues, Boston harbor elegance, and vineyard island settings.",
    regions: {
      "Boston & Metro": ["Boston", "Cambridge", "Brookline", "Newton", "Quincy", "Somerville", "Waltham", "Woburn", "Burlington", "Lexington", "Concord", "Lincoln", "Wellesley", "Needham", "Dedham", "Milton", "Cohasset"],
      "North Shore & Merrimack Valley": ["Salem", "Marblehead", "Gloucester", "Rockport", "Newburyport", "Ipswich", "Essex", "Manchester-by-the-Sea", "Beverly", "Danvers", "Lowell", "Lawrence", "Haverhill", "Andover"],
      "Cape Cod & Islands": ["Hyannis", "Chatham", "Barnstable", "Falmouth", "Sandwich", "Dennis", "Yarmouth", "Brewster", "Orleans", "Eastham", "Wellfleet", "Provincetown", "Nantucket", "Edgartown", "Oak Bluffs", "Vineyard Haven", "West Tisbury", "Chilmark"],
      "Berkshires": ["Lenox", "Stockbridge", "Great Barrington", "Pittsfield", "Lee", "Williamstown", "North Adams", "Adams", "Becket", "Tyringham"],
      "Pioneer Valley": ["Springfield", "Northampton", "Amherst", "Holyoke", "Chicopee", "Westfield", "Greenfield", "South Hadley", "Easthampton", "Deerfield", "Shelburne Falls"],
    },
  },
  michigan: {
    name: "Michigan",
    abbr: "MI",
    slug: "michigan",
    live: true,
    description: "Great Lakes waterfront venues, Traverse City wine country, and lakeside lodges.",
    regions: {
      "Detroit Metro": ["Detroit", "Ann Arbor", "Dearborn", "Troy", "Sterling Heights", "Warren", "Livonia", "Farmington Hills", "West Bloomfield", "Bloomfield Hills", "Royal Oak", "Birmingham", "Pontiac", "Rochester Hills", "Novi", "Southfield", "Ypsilanti"],
      "Grand Rapids & West MI": ["Grand Rapids", "Holland", "Kalamazoo", "Portage", "Battle Creek", "Muskegon", "Grand Haven", "Saugatuck", "Douglas", "South Haven", "St. Joseph", "Benton Harbor", "Zeeland", "Hudsonville"],
      "Traverse City & Northwest": ["Traverse City", "Petoskey", "Harbor Springs", "Charlevoix", "Boyne City", "Elk Rapids", "Suttons Bay", "Leland", "Glen Arbor", "Empire", "Frankfort", "Beulah", "Interlochen"],
      "Upper Peninsula": ["Marquette", "Sault Ste. Marie", "Escanaba", "Ironwood", "Iron Mountain", "Houghton", "Hancock", "Munising", "Newberry", "St. Ignace", "Mackinac Island"],
      "Mid-Michigan": ["Lansing", "East Lansing", "Flint", "Saginaw", "Bay City", "Midland", "Alpena", "Mount Pleasant", "Big Rapids", "Cadillac"],
    },
  },
  minnesota: {
    name: "Minnesota",
    abbr: "MN",
    slug: "minnesota",
    live: true,
    description: "10,000 lakes waterfront venues, Twin Cities urban spaces, and forest lodges.",
    regions: {
      "Twin Cities Metro": ["Minneapolis", "St. Paul", "Bloomington", "Plymouth", "Eagan", "Eden Prairie", "Minnetonka", "Maple Grove", "Woodbury", "Burnsville", "Edina", "St. Louis Park", "Lakeville", "Prior Lake", "Shakopee", "Stillwater", "Wayzata", "Excelsior"],
      "North Shore & Boundary Waters": ["Duluth", "Two Harbors", "Lutsen", "Grand Marais", "Ely", "Grand Portage", "Silver Bay", "Finland", "Tofte"],
      "Rochester & Southeast MN": ["Rochester", "Winona", "Red Wing", "Hastings", "Faribault", "Northfield", "Owatonna", "Austin", "Albert Lea", "Lanesboro"],
      "St. Cloud & Central MN": ["St. Cloud", "Sartell", "Waite Park", "Alexandria", "Brainerd", "Baxter", "Detroit Lakes", "Willmar", "Hutchinson", "Litchfield"],
      "Lakes Country": ["Walker", "Bemidji", "Park Rapids", "Crosslake", "Nisswa", "Pequot Lakes", "Nevis", "Hackensack", "Pine River"],
    },
  },
  mississippi: {
    name: "Mississippi",
    abbr: "MS",
    slug: "mississippi",
    live: true,
    description: "Antebellum plantation estates, Gulf Coast resorts, and river delta charm.",
    regions: {
      "Jackson Metro": ["Jackson", "Ridgeland", "Madison", "Brandon", "Pearl", "Flowood", "Clinton", "Byram", "Rankin County", "Vicksburg"],
      "Gulf Coast": ["Biloxi", "Gulfport", "Ocean Springs", "Pass Christian", "Long Beach", "Bay St. Louis", "Waveland", "Pascagoula", "Gautier", "Moss Point"],
      "Delta": ["Greenville", "Clarksdale", "Greenwood", "Cleveland", "Indianola", "Yazoo City", "Tunica", "Leland"],
      "Natchez & Southwest MS": ["Natchez", "Hattiesburg", "Laurel", "McComb", "Brookhaven", "Columbia", "Petal"],
      "North MS": ["Oxford", "Tupelo", "Corinth", "Starkville", "Columbus", "Aberdeen", "New Albany", "Pontotoc", "Booneville"],
    },
  },
  missouri: {
    name: "Missouri",
    abbr: "MO",
    slug: "missouri",
    live: true,
    description: "Ozark Mountain venues, St. Louis rooftop elegance, and vineyard estates.",
    regions: {
      "St. Louis Metro": ["St. Louis", "Clayton", "Kirkwood", "Webster Groves", "Ladue", "Chesterfield", "Ballwin", "Creve Coeur", "Maryland Heights", "O'Fallon", "St. Charles", "Florissant", "Fenton"],
      "Kansas City Metro": ["Kansas City", "Lee's Summit", "Independence", "Blue Springs", "Overland Park", "Shawnee", "Lenexa", "Olathe", "Belton", "Grain Valley", "Liberty", "Kearney"],
      "Ozarks": ["Branson", "Springfield", "Lake of the Ozarks", "Camdenton", "Osage Beach", "Nixa", "Ozark", "Joplin", "Rolla", "Hermann", "Washington"],
      "Columbia & Mid-Missouri": ["Columbia", "Jefferson City", "Fulton", "Mexico", "Hannibal", "Kirksville", "Sedalia", "Warrensburg"],
    },
  },
  montana: {
    name: "Montana",
    abbr: "MT",
    slug: "montana",
    live: true,
    description: "Big Sky wilderness lodges, Glacier National Park settings, and ranch venues.",
    regions: {
      "Bozeman & Gallatin Valley": ["Bozeman", "Big Sky", "Livingston", "Belgrade", "Manhattan", "Three Forks", "West Yellowstone", "Gardiner", "Ennis"],
      "Glacier & Flathead Valley": ["Kalispell", "Whitefish", "Columbia Falls", "Bigfork", "Polson", "Ronan", "Lakeside", "Somers", "West Glacier"],
      "Missoula & Western MT": ["Missoula", "Hamilton", "Stevensville", "Ravalli County", "Lolo", "Seeley Lake", "Conner", "Victor"],
      "Billings & Eastern MT": ["Billings", "Red Lodge", "Hardin", "Miles City", "Glendive", "Havre", "Great Falls", "Lewistown"],
      "Helena & Central MT": ["Helena", "Butte", "Anaconda", "Deer Lodge", "Townsend", "White Sulphur Springs"],
    },
  },
  nebraska: {
    name: "Nebraska",
    abbr: "NE",
    slug: "nebraska",
    live: true,
    description: "Prairie ranches, Omaha urban venues, and Sandhills lake retreats.",
    regions: {
      "Omaha Metro": ["Omaha", "Bellevue", "Papillion", "La Vista", "Gretna", "Ralston", "Boys Town", "Millard", "Elkhorn", "Council Bluffs"],
      "Lincoln & Southeast NE": ["Lincoln", "Beatrice", "Seward", "York", "Crete", "Nebraska City", "Plattsmouth", "Milford", "Ashland", "Waverly"],
      "Platte River & Central NE": ["Grand Island", "Kearney", "Hastings", "Columbus", "Fremont", "Norfolk", "Schuyler", "David City"],
      "Sandhills & Western NE": ["North Platte", "Ogallala", "Valentine", "Alliance", "Scottsbluff", "Gering", "Chadron", "Ainsworth"],
    },
  },
  nevada: {
    name: "Nevada",
    abbr: "NV",
    slug: "nevada",
    live: true,
    description: "Las Vegas luxury, Lake Tahoe mountain elegance, and desert starlight settings.",
    regions: {
      "Las Vegas & Southern NV": ["Las Vegas", "Henderson", "North Las Vegas", "Summerlin", "Boulder City", "Mesquite", "Pahrump", "Jean", "Enterprise"],
      "Reno & Northern NV": ["Reno", "Sparks", "Carson City", "Fernley", "Fallon", "Elko", "Winnemucca", "Battle Mountain"],
      "Lake Tahoe NV": ["Stateline", "Incline Village", "Crystal Bay", "Zephyr Cove", "Glenbrook", "Tahoe Village"],
    },
  },
  "new-hampshire": {
    name: "New Hampshire",
    abbr: "NH",
    slug: "new-hampshire",
    live: true,
    description: "White Mountain lodges, covered bridge settings, and lakefront New England charm.",
    regions: {
      "White Mountains": ["North Conway", "Jackson", "Bartlett", "Lincoln", "Woodstock", "Franconia", "Bethlehem", "Jefferson", "Whitefield", "Lancaster", "Berlin"],
      "Lakes Region": ["Laconia", "Meredith", "Wolfeboro", "Center Harbor", "Alton Bay", "Gilford", "Belmont", "Ossipee", "Holderness", "Squam Lake"],
      "Seacoast": ["Portsmouth", "Hampton", "Hampton Beach", "Dover", "Exeter", "Durham", "Newmarket", "Stratham", "Rye", "New Castle", "Greenland"],
      "Dartmouth & Upper Valley": ["Hanover", "Lebanon", "Claremont", "Newport", "New London", "Sunapee", "Plymouth", "Concord", "Manchester", "Nashua"],
    },
  },
  "new-jersey": {
    name: "New Jersey",
    abbr: "NJ",
    slug: "new-jersey",
    live: true,
    description: "Shore elegance, vineyard estates, and NYC-adjacent luxury venues.",
    regions: {
      "NYC Suburbs & Bergen County": ["Hoboken", "Jersey City", "Fort Lee", "Englewood", "Teaneck", "Paramus", "Ridgewood", "Hackensack", "Montclair", "Livingston", "Short Hills", "Florham Park", "Morristown", "Madison", "Chatham"],
      "Shore & Jersey Shore": ["Spring Lake", "Avon-by-the-Sea", "Belmar", "Asbury Park", "Long Branch", "Cape May", "Ocean City", "Avalon", "Stone Harbor", "Sea Isle City", "Wildwood", "Bay Head", "Point Pleasant Beach", "Manasquan"],
      "Princeton & Central NJ": ["Princeton", "Lawrenceville", "New Brunswick", "Somerset", "Bridgewater", "Flemington", "Lambertville", "New Hope", "Hillsborough", "Basking Ridge", "Bernardsville", "Far Hills"],
      "Delaware Valley & South Jersey": ["Cherry Hill", "Haddonfield", "Moorestown", "Medford", "Mount Holly", "Burlington", "Bordentown", "Hammonton", "Vineland", "Millville", "Bridgeton"],
    },
  },
  "new-mexico": {
    name: "New Mexico",
    abbr: "NM",
    slug: "new-mexico",
    live: true,
    description: "Adobe haciendas, Taos mountain venues, and Santa Fe artistic elegance.",
    regions: {
      "Santa Fe & Northern NM": ["Santa Fe", "Tesuque", "Pojoaque", "Chimayo", "Truchas", "Taos", "Ranchos de Taos", "El Prado", "Angel Fire", "Red River", "Mora", "Las Vegas"],
      "Albuquerque Metro": ["Albuquerque", "Rio Rancho", "Corrales", "Bernalillo", "Los Ranchos", "Tijeras", "Edgewood", "Placitas", "Los Lunas", "Belen"],
      "White Sands & Southern NM": ["Las Cruces", "Alamogordo", "Ruidoso", "Cloudcroft", "Roswell", "Carlsbad", "Artesia", "Hobbs", "Lovington", "Deming", "Silver City", "Truth or Consequences"],
    },
  },
  "new-york": {
    name: "New York",
    abbr: "NY",
    slug: "new-york",
    live: true,
    description: "Hudson Valley estates, Hamptons luxury, and NYC skyline glamour.",
    regions: {
      "New York City": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Long Island City", "Astoria", "Williamsburg", "DUMBO", "Tribeca", "Midtown", "Upper East Side", "Upper West Side"],
      "Hudson Valley": ["Rhinebeck", "Hudson", "Catskill", "Kingston", "Poughkeepsie", "Hyde Park", "Millbrook", "Pine Plains", "Cold Spring", "Garrison", "Beacon", "Newburgh", "New Paltz", "Woodstock", "Saugerties", "Tivoli"],
      "Catskills": ["Stone Ridge", "Accord", "Kerhonkson", "Livingston Manor", "Callicoon", "Roscoe", "Narrowsburg", "Jeffersonville", "Fleischmanns", "Roxbury", "Delhi", "Catskill Village"],
      "Hamptons & Long Island": ["Southampton", "East Hampton", "Sag Harbor", "Bridgehampton", "Montauk", "Shelter Island", "Westhampton Beach", "Great Neck", "Oyster Bay", "Cold Spring Harbor", "Glen Cove", "Huntington", "Stony Brook"],
      "Finger Lakes": ["Ithaca", "Watkins Glen", "Seneca Falls", "Geneva", "Canandaigua", "Hammondsport", "Penn Yan", "Ovid", "Lodi", "Hector", "Trumansburg", "Skaneateles", "Auburn"],
      "Adirondacks & Upstate": ["Lake Placid", "Saranac Lake", "Lake George", "Bolton Landing", "Warrensburg", "Chestertown", "Schroon Lake", "Blue Mountain Lake", "Old Forge", "Tupper Lake"],
    },
  },
  "north-carolina": {
    name: "North Carolina",
    abbr: "NC",
    slug: "north-carolina",
    live: true,
    description: "Blue Ridge Mountain escapes, vineyard estates, and coastal elegance.",
    regions: {
      "Asheville & Blue Ridge": ["Asheville", "Weaverville", "Black Mountain", "Swannanoa", "Brevard", "Hendersonville", "Flat Rock", "Chimney Rock", "Lake Lure", "Waynesville", "Sylva", "Blowing Rock", "Boone", "Banner Elk", "Valle Crucis", "Linville"],
      "Charlotte Metro": ["Charlotte", "Matthews", "Ballantyne", "Lake Norman", "Cornelius", "Davidson", "Huntersville", "Mooresville", "Concord", "Kannapolis", "Monroe", "Gastonia", "Rock Hill", "Belmont", "Weddington"],
      "Raleigh & Research Triangle": ["Raleigh", "Durham", "Chapel Hill", "Cary", "Apex", "Holly Springs", "Morrisville", "Wake Forest", "Fuquay-Varina", "Pittsboro", "Hillsborough", "Mebane", "Burlington", "Greensboro", "Winston-Salem", "High Point"],
      "Outer Banks & Crystal Coast": ["Nags Head", "Kill Devil Hills", "Duck", "Corolla", "Ocracoke", "Beaufort", "Morehead City", "Atlantic Beach", "Emerald Isle", "Cape Carteret", "New Bern"],
      "Wilmington & Cape Fear": ["Wilmington", "Wrightsville Beach", "Carolina Beach", "Southport", "Oak Island", "Sunset Beach", "Ocean Isle Beach", "Leland", "Castle Hayne"],
    },
  },
  "north-dakota": {
    name: "North Dakota",
    abbr: "ND",
    slug: "north-dakota",
    live: true,
    description: "Badlands vistas, prairie ranch venues, and Fargo urban event spaces.",
    regions: {
      "Fargo & Red River Valley": ["Fargo", "West Fargo", "Moorhead", "Casselton", "Mapleton", "Harwood", "Grand Forks", "East Grand Forks", "Grafton"],
      "Bismarck & South-Central": ["Bismarck", "Mandan", "Lincoln", "Beulah", "Hazen", "Dickinson", "Jamestown", "Valley City"],
      "Badlands & Western ND": ["Medora", "Watford City", "Williston", "Minot", "Rugby", "Devils Lake", "Bottineau"],
    },
  },
  ohio: {
    name: "Ohio",
    abbr: "OH",
    slug: "ohio",
    live: true,
    description: "Hocking Hills forest venues, vineyard estates, and Great Lakes waterfront settings.",
    regions: {
      "Cleveland & Northeast OH": ["Cleveland", "Shaker Heights", "Beachwood", "Solon", "Chagrin Falls", "Chardon", "Hudson", "Aurora", "Akron", "Cuyahoga Falls", "Medina", "Wooster", "Youngstown", "Warren", "Canton", "Massillon"],
      "Columbus Metro": ["Columbus", "Dublin", "Westerville", "New Albany", "Gahanna", "Bexley", "Upper Arlington", "Worthington", "Powell", "Delaware", "Lancaster", "Zanesville", "Newark"],
      "Cincinnati & Southwest OH": ["Cincinnati", "Mason", "Blue Ash", "Hyde Park", "Anderson Township", "Montgomery", "Loveland", "Milford", "Lebanon", "Oxford", "Dayton", "Kettering", "Centerville", "Miamisburg"],
      "Hocking Hills & Southeast OH": ["Logan", "Hocking Hills", "Nelsonville", "Athens", "McConnelsville", "Pomeroy", "Marietta", "Chillicothe", "Circleville", "Jackson"],
    },
  },
  oklahoma: {
    name: "Oklahoma",
    abbr: "OK",
    slug: "oklahoma",
    live: true,
    description: "Ranch venues, Tulsa art deco spaces, and Southern plains sunsets.",
    regions: {
      "Oklahoma City Metro": ["Oklahoma City", "Edmond", "Yukon", "Mustang", "Moore", "Norman", "Midwest City", "Del City", "Choctaw", "Guthrie", "El Reno", "Lawton"],
      "Tulsa & Green Country": ["Tulsa", "Broken Arrow", "Owasso", "Jenks", "Bixby", "Claremore", "Sand Springs", "Pryor", "Wagoner", "Tahlequah", "Vinita", "Miami"],
      "Lake Country & Eastern OK": ["Eufaula", "McAlester", "Stilwell", "Sallisaw", "Muskogee", "Okmulgee", "Henryetta", "Ardmore", "Sulphur", "Ada", "Tishomingo"],
    },
  },
  oregon: {
    name: "Oregon",
    abbr: "OR",
    slug: "oregon",
    live: true,
    description: "Wine country estates, coastal bluffs, and old-growth forest settings.",
    regions: {
      "Portland Metro": ["Portland", "Lake Oswego", "Beaverton", "Hillsboro", "Gresham", "Tigard", "Tualatin", "Sherwood", "West Linn", "Oregon City", "Wilsonville", "Happy Valley", "Camas"],
      "Willamette Valley Wine Country": ["Salem", "McMinnville", "Newberg", "Dundee", "Yamhill", "Dayton", "Carlton", "Gaston", "Forest Grove", "Corvallis", "Albany", "Eugene", "Springfield"],
      "Oregon Coast": ["Cannon Beach", "Seaside", "Astoria", "Tillamook", "Lincoln City", "Newport", "Florence", "Coos Bay", "Bandon", "Gold Beach", "Brookings"],
      "Bend & Central Oregon": ["Bend", "Redmond", "Sisters", "Sunriver", "La Pine", "Prineville", "Madras"],
      "Southern Oregon": ["Medford", "Ashland", "Jacksonville", "Talent", "Central Point", "Grants Pass", "Cave Junction", "Roseburg", "Klamath Falls", "Crater Lake"],
    },
  },
  pennsylvania: {
    name: "Pennsylvania",
    abbr: "PA",
    slug: "pennsylvania",
    live: true,
    description: "Barn venues, Pocono Mountains, Philadelphia historic spaces, and vineyard estates.",
    regions: {
      "Philadelphia Metro": ["Philadelphia", "Malvern", "Wayne", "Newtown Square", "Devon", "Berwyn", "Paoli", "West Chester", "Kennett Square", "Chadds Ford", "Media", "Radnor", "Bryn Mawr", "Haverford", "Villanova", "Collegeville", "King of Prussia", "Phoenixville", "Doylestown", "New Hope", "Lambertville"],
      "Lancaster & Pennsylvania Dutch Country": ["Lancaster", "Lititz", "Ephrata", "Bird-in-Hand", "Intercourse", "Strasburg", "Millersville", "Manheim", "Mount Joy", "Columbia", "Marietta"],
      "Pocono Mountains": ["Stroudsburg", "East Stroudsburg", "Jim Thorpe", "Hawley", "Lake Harmony", "Tannersville", "Mount Pocono", "Pocono Summit", "Delaware Water Gap", "Milford"],
      "Lehigh Valley": ["Allentown", "Bethlehem", "Easton", "Nazareth", "Emmaus", "Macungie", "Coopersburg", "Slatington", "Hellertown"],
      "Pittsburgh Metro": ["Pittsburgh", "Sewickley", "Fox Chapel", "Oakmont", "Murrysville", "Wexford", "Marshall Township", "Cranberry Township", "Peters Township", "McMurray", "Canonsburg", "Washington"],
    },
  },
  "rhode-island": {
    name: "Rhode Island",
    abbr: "RI",
    slug: "rhode-island",
    live: true,
    description: "Newport mansion elegance, coastal charm, and New England vineyard settings.",
    regions: {
      "Newport": ["Newport", "Middletown", "Portsmouth", "Tiverton", "Little Compton", "Jamestown"],
      "Providence & Metro": ["Providence", "Cranston", "Warwick", "East Providence", "North Providence", "Cumberland", "Pawtucket", "Johnston", "Lincoln", "Smithfield", "North Smithfield"],
      "South County & Beaches": ["Narragansett", "South Kingstown", "Westerly", "Watch Hill", "Charlestown", "Wakefield", "Richmond", "Hopkinton", "Exeter"],
    },
  },
  "south-carolina": {
    name: "South Carolina",
    abbr: "SC",
    slug: "south-carolina",
    live: true,
    description: "Charleston plantation charm, Lowcountry marshes, and beach resort venues.",
    regions: {
      "Charleston & Lowcountry": ["Charleston", "Mount Pleasant", "Sullivan's Island", "Isle of Palms", "Folly Beach", "Kiawah Island", "Seabrook Island", "Johns Island", "James Island", "Summerville", "Ladson", "North Charleston", "Edisto Island", "Beaufort", "Hilton Head Island", "Bluffton", "Daufuskie Island"],
      "Myrtle Beach & Grand Strand": ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Pawleys Island", "Litchfield Beach", "Murrels Inlet", "Georgetown", "Conway"],
      "Greenville & Upstate": ["Greenville", "Spartanburg", "Anderson", "Greer", "Simpsonville", "Mauldin", "Taylors", "Travelers Rest", "Clemson", "Pendleton", "Seneca"],
      "Columbia & Midlands": ["Columbia", "Lexington", "Irmo", "Forest Acres", "Cayce", "West Columbia", "Aiken", "Chapin", "Camden", "Orangeburg", "Sumter"],
    },
  },
  "south-dakota": {
    name: "South Dakota",
    abbr: "SD",
    slug: "south-dakota",
    live: true,
    description: "Badlands vistas, Black Hills ranch venues, and prairie elegance.",
    regions: {
      "Rapid City & Black Hills": ["Rapid City", "Spearfish", "Deadwood", "Lead", "Hot Springs", "Custer", "Hill City", "Keystone", "Sturgis", "Belle Fourche"],
      "Sioux Falls & Eastern SD": ["Sioux Falls", "Brandon", "Tea", "Dell Rapids", "Mitchell", "Aberdeen", "Watertown", "Huron", "Brookings", "Madison"],
      "Badlands & Prairie": ["Wall", "Interior", "Philip", "Pierre", "Mobridge", "Murdo", "Winner"],
    },
  },
  tennessee: {
    name: "Tennessee",
    abbr: "TN",
    slug: "tennessee",
    live: true,
    description: "Nashville music city magic, Smoky Mountain lodges, and plantation estates.",
    regions: {
      "Nashville Metro": ["Nashville", "Brentwood", "Franklin", "Nolensville", "Murfreesboro", "Spring Hill", "Smyrna", "Gallatin", "Hendersonville", "Mount Juliet", "Lebanon", "Clarksville", "Columbia", "Shelbyville"],
      "Smoky Mountains & Knoxville": ["Gatlinburg", "Pigeon Forge", "Sevierville", "Knoxville", "Maryville", "Alcoa", "Oak Ridge", "Loudon", "Lenoir City", "Townsend", "Cosby", "Wears Valley"],
      "Chattanooga & Southeast TN": ["Chattanooga", "Signal Mountain", "Lookout Mountain", "Ooltewah", "Collegedale", "Cleveland", "Athens", "Dayton", "Dunlap"],
      "Memphis & West TN": ["Memphis", "Germantown", "Collierville", "Bartlett", "Cordova", "Millington", "Jackson", "Bolivar", "Savannah", "Paris", "Union City"],
    },
  },
  texas: {
    name: "Texas",
    abbr: "TX",
    slug: "texas",
    live: true,
    description: "Hill Country charm, Gulf Coast breezes, and big city sophistication.",
    regions: {
      "Austin & Hill Country": ["Austin", "Bee Cave", "Lakeway", "Round Rock", "Cedar Park", "Georgetown", "Pflugerville", "Kyle", "Buda", "Dripping Springs", "Wimberley", "Fredericksburg", "Kerrville", "Boerne", "Bandera", "Marble Falls", "Horseshoe Bay", "Johnson City", "Llano"],
      "Dallas-Fort Worth": ["Dallas", "Fort Worth", "Plano", "McKinney", "Frisco", "Allen", "Southlake", "Colleyville", "Flower Mound", "Trophy Club", "Grapevine", "Irving", "Arlington", "Grand Prairie", "Denton", "Waxahachie", "Corsicana"],
      "Houston Metro": ["Houston", "The Woodlands", "Sugar Land", "Katy", "Pearland", "League City", "Friendswood", "Galveston", "Seabrook", "Clear Lake", "Cypress", "Spring", "Tomball", "Conroe", "Kingwood"],
      "San Antonio & South TX": ["San Antonio", "New Braunfels", "San Marcos", "Seguin", "Schertz", "Converse", "Helotes", "Bulverde", "Comfort", "Canyon Lake", "Laredo", "McAllen", "Harlingen", "Corpus Christi", "Rockport"],
      "Gulf Coast": ["Port Aransas", "South Padre Island", "Aransas Pass", "Victoria", "Bay City", "Freeport", "Beaumont", "Port Arthur"],
      "Big Bend & West TX": ["El Paso", "Marfa", "Alpine", "Fort Davis", "Terlingua", "Midland", "Odessa", "Abilene", "San Angelo", "Lubbock", "Amarillo"],
    },
  },
  utah: {
    name: "Utah",
    abbr: "UT",
    slug: "utah",
    live: true,
    description: "Red rock canyon settings, mountain lodge venues, and Salt Lake City elegance.",
    regions: {
      "Salt Lake City Metro": ["Salt Lake City", "Murray", "South Jordan", "Sandy", "Draper", "Riverton", "Herriman", "West Jordan", "Taylorsville", "Millcreek", "Cottonwood Heights", "Holladay"],
      "Park City & Summit County": ["Park City", "Deer Valley", "Snyderville", "Heber City", "Midway", "Francis", "Kamas", "Oakley", "Coalville"],
      "Provo & Utah Valley": ["Provo", "Orem", "Springville", "Spanish Fork", "Payson", "Pleasant Grove", "Lindon", "American Fork", "Lehi", "Saratoga Springs"],
      "Ogden & Northern Utah": ["Ogden", "North Ogden", "Roy", "Clearfield", "Layton", "Kaysville", "Farmington", "Logan", "Providence", "Hyde Park"],
      "Moab & Canyon Country": ["Moab", "Blanding", "Monticello", "Green River", "Castle Dale", "Price"],
      "Zion & Southern Utah": ["St. George", "Washington", "Hurricane", "Springdale", "Kanab", "Cedar City", "Panguitch", "Bryce Canyon", "Escalante"],
    },
  },
  vermont: {
    name: "Vermont",
    abbr: "VT",
    slug: "vermont",
    live: true,
    description: "Fall foliage barn venues, ski lodge elegance, and New England farm settings.",
    regions: {
      "Burlington & Champlain Valley": ["Burlington", "South Burlington", "Shelburne", "Williston", "Colchester", "Essex", "Winooski", "Hinesburg", "Middlebury", "Vergennes", "Bristol", "St. Albans"],
      "Stowe & Northeast Kingdom": ["Stowe", "Morrisville", "Johnson", "Hyde Park", "Hardwick", "Craftsbury", "Greensboro", "Newport", "Derby", "Island Pond", "St. Johnsbury", "Lyndonville"],
      "Woodstock & Upper Valley": ["Woodstock", "Quechee", "Hartford", "White River Junction", "Norwich", "Thetford", "Sharon", "Chelsea", "Bethel", "Royalton", "South Royalton"],
      "Manchester & Southern VT": ["Manchester", "Manchester Center", "Dorset", "Danby", "Pawlet", "Weston", "Chester", "Grafton", "Townshend", "Brattleboro", "Wilmington", "Dover", "Newfane", "Putney", "Bellows Falls", "Ludlow", "Okemo"],
    },
  },
  virginia: {
    name: "Virginia",
    abbr: "VA",
    slug: "virginia",
    live: true,
    description: "Blue Ridge vineyards, historic plantations, and DC-area elegance.",
    regions: {
      "Northern Virginia & DC Suburbs": ["McLean", "Great Falls", "Vienna", "Falls Church", "Arlington", "Alexandria", "Reston", "Herndon", "Chantilly", "Fairfax", "Burke", "Springfield", "Leesburg", "Ashburn", "Middleburg", "Waterford", "Purcellville"],
      "Shenandoah Valley & Blue Ridge": ["Front Royal", "Luray", "Woodstock", "Strasburg", "Winchester", "Harrisonburg", "Staunton", "Lexington", "Buena Vista", "Natural Bridge", "Warm Springs", "Hot Springs"],
      "Charlottesville & Wine Country": ["Charlottesville", "Crozet", "Gordonsville", "Orange", "Culpeper", "Warrenton", "Delaplane", "Flint Hill", "Washington VA", "Sperryville", "Afton"],
      "Richmond Metro": ["Richmond", "Short Pump", "Glen Allen", "Chesterfield", "Midlothian", "Bon Air", "Chester", "Mechanicsville", "Ashland", "Fredericksburg", "Spotsylvania", "Stafford", "Colonial Williamsburg", "Newport News"],
      "Virginia Beach & Coastal": ["Virginia Beach", "Norfolk", "Chesapeake", "Suffolk", "Portsmouth", "Yorktown", "Cape Charles", "Onancock", "Chincoteague", "Smithfield"],
    },
  },
  washington: {
    name: "Washington",
    abbr: "WA",
    slug: "washington",
    live: true,
    description: "Pacific Northwest forests, vineyard valleys, and waterfront venues.",
    regions: {
      "Seattle Metro": ["Seattle", "Bellevue", "Redmond", "Kirkland", "Renton", "Issaquah", "Sammamish", "Bothell", "Woodinville", "Kenmore", "Shoreline", "Mercer Island", "Federal Way", "Auburn", "Tacoma", "Gig Harbor", "Olympia"],
      "Snoqualmie & Cascade Mountains": ["Snoqualmie", "North Bend", "Leavenworth", "Cashmere", "Skykomish", "Index", "Sultan", "Monroe", "Duvall", "Carnation"],
      "Eastern Washington & Wine Country": ["Spokane", "Coeur d'Alene", "Walla Walla", "Yakima", "Ellensburg", "Kennewick", "Richland", "Pasco", "Moses Lake", "Chelan", "Manson", "Wenatchee"],
      "Olympic Peninsula": ["Port Townsend", "Port Angeles", "Sequim", "Forks", "Ocean Shores", "Westport", "Quinault", "Kalaloch", "La Push"],
      "San Juan Islands & Bellingham": ["Bellingham", "Anacortes", "Friday Harbor", "Eastsound", "Lopez Island", "Whidbey Island", "Oak Harbor", "Coupeville", "Langley", "La Conner", "Mount Vernon", "Burlington"],
    },
  },
  "west-virginia": {
    name: "West Virginia",
    abbr: "WV",
    slug: "west-virginia",
    live: true,
    description: "Mountain state lodges, whitewater river settings, and rustic barn elegance.",
    regions: {
      "Eastern Panhandle & Shenandoah": ["Martinsburg", "Charles Town", "Shepherdstown", "Harpers Ferry", "Berkley Springs", "Romney", "Petersburg"],
      "New River Gorge & Fayetteville": ["Fayetteville", "Oak Hill", "Beckley", "Hinton", "Summersville", "Gauley Bridge", "Ansted"],
      "Greenbrier & Lewisburg": ["Lewisburg", "Ronceverte", "White Sulphur Springs", "Alderson", "Rainelle", "Marlinton", "Hillsboro"],
      "Charleston & Capital Region": ["Charleston", "Huntington", "Teays Valley", "Hurricane", "Nitro", "St. Albans", "South Charleston", "Parkersburg", "Clarksburg", "Morgantown", "Weston", "Elkins"],
    },
  },
  wisconsin: {
    name: "Wisconsin",
    abbr: "WI",
    slug: "wisconsin",
    live: true,
    description: "Door County vineyard settings, Great Lakes waterfront, and lakeside lodge venues.",
    regions: {
      "Milwaukee Metro": ["Milwaukee", "Waukesha", "Brookfield", "New Berlin", "Wauwatosa", "Menomonee Falls", "Germantown", "West Bend", "Mequon", "Grafton", "Port Washington", "Racine", "Kenosha", "Cedarburg", "Oconomowoc", "Delafield"],
      "Madison & South-Central WI": ["Madison", "Middleton", "Sun Prairie", "Fitchburg", "Verona", "Waunakee", "Stoughton", "Janesville", "Beloit", "Monroe", "Mineral Point", "Spring Green", "Baraboo", "Wisconsin Dells"],
      "Door County": ["Sturgeon Bay", "Egg Harbor", "Fish Creek", "Ephraim", "Sister Bay", "Ellison Bay", "Washington Island", "Baileys Harbor", "Jacksonport", "Brussels"],
      "Fox Valley & Green Bay": ["Green Bay", "Appleton", "Neenah", "Menasha", "Oshkosh", "Fond du Lac", "Sheboygan", "Manitowoc", "Two Rivers", "Kaukauna"],
      "Northwoods & Lake Country": ["Minocqua", "Eagle River", "Rhinelander", "Hayward", "Rice Lake", "Eau Claire", "La Crosse", "Tomah", "Stevens Point", "Wausau"],
    },
  },
  wyoming: {
    name: "Wyoming",
    abbr: "WY",
    slug: "wyoming",
    live: true,
    description: "Grand Teton mountain backdrops, Yellowstone country, and dude ranch elegance.",
    regions: {
      "Jackson Hole & Grand Tetons": ["Jackson", "Teton Village", "Wilson", "Moose", "Moran", "Kelly", "Alta"],
      "Yellowstone & Cody": ["Cody", "Powell", "Lovell", "Worland", "Thermopolis", "Meeteetse", "Dubois"],
      "Cheyenne & Southeast WY": ["Cheyenne", "Laramie", "Torrington", "Wheatland", "Guernsey", "Douglas"],
      "Casper & Central WY": ["Casper", "Evansville", "Mills", "Bar Nunn", "Rawlins", "Rock Springs", "Green River", "Lander", "Riverton"],
    },
  },
  "puerto-rico": {
    name: "Puerto Rico",
    abbr: "PR",
    slug: "puerto-rico",
    live: false,
    description: "Caribbean beach ceremonies, historic Old San Juan haciendas, and tropical luxury resorts.",
    regions: {
      "San Juan & Metro": ["San Juan", "Santurce", "Condado", "Miramar", "Bayamón", "Guaynabo", "Carolina", "Trujillo Alto", "Caguas"],
      "Ponce & South Coast": ["Ponce", "Juana Díaz", "Coamo", "Santa Isabel", "Guayama", "Arroyo", "Salinas"],
      "Rincón & West Coast": ["Rincón", "Aguadilla", "Mayagüez", "Cabo Rojo", "Lajas", "San Germán", "Hormigueros"],
      "El Yunque & East Coast": ["Fajardo", "Luquillo", "Río Grande", "Ceiba", "Humacao", "Naguabo", "Vieques", "Culebra"],
    },
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
