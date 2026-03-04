# Venue by Vow

A wedding venue directory for the Tri-Valley area (Livermore, Pleasanton, Dublin, San Ramon, Danville, CA).

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Fonts | Playfair Display + Inter |

## Local Setup

### 1. Install PostgreSQL (if not already installed)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 2. Create the database
```bash
createdb wedding_venues
```

### 3. Install dependencies
```bash
npm install
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env — set your DATABASE_URL
# Default: postgresql://localhost:5432/wedding_venues
```

### 5. Run migrations
```bash
npx prisma migrate dev --name init
```

### 6. Seed the database
```bash
npx prisma db seed
```

### 7. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage with hero + city search
│   ├── venues/
│   │   ├── page.tsx          # Search results + filter sidebar
│   │   └── [slug]/
│   │       └── page.tsx      # Venue detail page
│   └── globals.css
├── components/
│   └── VenueCard.tsx         # Horizontal list card
└── lib/
    ├── prisma.ts             # Prisma client singleton
    └── seed-data.ts          # Initial venue data
prisma/
├── schema.prisma             # Full venue data model
└── seed.ts                   # Seed script
```

## Adding Venues

The quickest way is to add to `src/lib/seed-data.ts` and re-run `npx prisma db seed`.

For a production admin UI, that's the next phase.

## Filtering

Filters are URL-based (no client state). You can bookmark or share any filtered search:
```
/venues?city=Livermore&city=Pleasanton&style=Romantic&minPrice=5000
```

## Roadmap

- [ ] Admin UI to add/edit venues
- [ ] User accounts + saved favorites
- [ ] Real availability calendar integration
- [ ] Photo upload (Supabase Storage or Cloudflare R2)
- [ ] Venue inquiry form with email notification
- [ ] Deploy to Cloudflare Pages
- [ ] Expand beyond Tri-Valley

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and component testing.

To run the full test suite once:
```bash
npm test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

To generate a coverage report:
```bash
npm run test:coverage
```
The report will be available in the `coverage/` directory.
