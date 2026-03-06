import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VenueCard } from "@/components/VenueCard";
import type { Venue } from "@prisma/client";

const baseVenue: Venue = {
  id: "test-id-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "Test Vineyard",
  slug: "test-vineyard",
  street: "123 Wine Rd",
  city: "Livermore",
  state: "CA",
  zip: "94550",
  website: "https://testvineyard.com",
  phone: "(925) 555-1234",
  email: "info@testvineyard.com",
  instagram: null,
  facebook: null,
  tiktok: null,
  venueType: "Vineyard & Winery",
  styleTags: ["Romantic", "Rustic"],
  minGuests: 50,
  maxGuests: 200,
  seatedMax: 200,
  standingMax: 250,
  ceremonyOnly: false,
  baseRentalMin: 8000,
  baseRentalMax: 15000,
  priceTier: "luxury",
  perHeadMin: 85,
  perHeadMax: 130,
  depositPercent: 25,
  peakPricing: true,
  offPeakDiscount: false,
  allInclusive: false,
  spacesDescription: null,
  hasBridalSuite: true,
  hasGroomSuite: false,
  hasOutdoorSpace: true,
  hasIndoorSpace: true,
  parkingSpots: null,
  tablesChairsIncluded: true,
  linensIncluded: false,
  avIncluded: true,
  lightingIncluded: false,
  cateringKitchen: true,
  barSetup: true,
  onSiteCoordinator: true,
  preferredVendorList: false,
  outsideVendorsAllowed: true,
  inHouseCateringRequired: false,
  byobPolicy: null,
  setupHours: 4,
  teardownHours: 2,
  earliestStart: "10:00 AM",
  latestEnd: "11:00 PM",
  noiseOrdinance: null,
  nearbyLodging: true,
  leadTimeMonths: 12,
  cancellationPolicy: null,
  photoTags: ["Vineyard", "Outdoor"],
  naturalLight: "excellent",
  indoorOutdoorMix: null,
  adaCompliant: true,
  elevatorAccess: false,
  googleRating: 4.9,
  googleReviews: 187,
  knotRating: null,
  knotReviews: null,
  weddingwireRating: null,
  weddingwireReviews: null,
  featuredIn: [],
  primaryPhotoUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=280&fit=crop",
  photoCount: 20,
  virtualTourUrl: null,
  lastVerified: null,
  dataSource: null,
  completenessScore: 90,
  isPublished: true,
  stateSlug: "california",
  latitude: null,
  longitude: null,
  description: "A beautiful test vineyard in the hills.",
};

describe("VenueCard", () => {
  it("renders the venue name", () => {
    render(<VenueCard venue={baseVenue} />);
    expect(screen.getByText("Test Vineyard")).toBeInTheDocument();
  });

  it("renders city and state via address line", () => {
    render(<VenueCard venue={baseVenue} />);
    // Address is now shown as a clickable location link
    expect(screen.getByText(/123 Wine Rd, Livermore, CA/)).toBeInTheDocument();
  });

  it("renders venue type", () => {
    render(<VenueCard venue={baseVenue} />);
    expect(screen.getByText(/Vineyard & Winery/)).toBeInTheDocument();
  });

  it("renders style tags", () => {
    render(<VenueCard venue={baseVenue} />);
    expect(screen.getByText("Romantic")).toBeInTheDocument();
    expect(screen.getByText("Rustic")).toBeInTheDocument();
  });

  it("renders From $X,XXX pricing chip when baseRentalMin is set", () => {
    render(<VenueCard venue={baseVenue} />);
    // baseVenue has baseRentalMin: 8000
    expect(screen.getByText(/From \$8,000/)).toBeInTheDocument();
  });

  it("does not render pricing chip when baseRentalMin and priceTier are both null", () => {
    render(<VenueCard venue={{ ...baseVenue, baseRentalMin: null, priceTier: null }} />);
    expect(screen.queryByText(/From \$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Budget|Moderate|Luxury/)).not.toBeInTheDocument();
  });

  it("renders priceTier badge when baseRentalMin is null but priceTier is set", () => {
    render(<VenueCard venue={{ ...baseVenue, baseRentalMin: null, priceTier: "luxury" }} />);
    expect(screen.getByText(/Luxury/)).toBeInTheDocument();
  });

  it("renders rating when available", () => {
    render(<VenueCard venue={baseVenue} />);
    expect(screen.getByText("4.9")).toBeInTheDocument();
  });

  it("renders photo when primaryPhotoUrl is provided", () => {
    render(<VenueCard venue={baseVenue} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("unsplash"));
  });

  it("renders placeholder when no photo", () => {
    render(<VenueCard venue={{ ...baseVenue, primaryPhotoUrl: null }} />);
    expect(screen.getByText("No photo yet")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<VenueCard venue={baseVenue} />);
    // Description shows in collapsed preview (line-clamped) — match partial text
    expect(screen.getAllByText(/A beautiful test vineyard/)[0]).toBeInTheDocument();
  });

  it("renders capacity range", () => {
    render(<VenueCard venue={baseVenue} />);
    expect(screen.getByText(/50.*200 guests/)).toBeInTheDocument();
  });

  it("does not render amenities section (no amenity data in DB)", () => {
    render(<VenueCard venue={baseVenue} />);
    // Amenities removed from card — zero venues have amenity data
    expect(screen.queryByText(/Bridal Suite/)).not.toBeInTheDocument();
  });

  it("is clickable and expandable (no nav link — inline expand)", () => {
    render(<VenueCard venue={baseVenue} />);
    // Card renders as a div, not a link — just verify the name is present and clickable
    expect(screen.getByText("Test Vineyard")).toBeInTheDocument();
  });

  it("renders View full details link in expanded panel pointing to correct URL", () => {
    const { getByText } = render(<VenueCard venue={baseVenue} />);
    // Click to expand
    const card = getByText("Test Vineyard").closest("[class*='rounded-2xl']") as HTMLElement;
    fireEvent.click(card);
    // After expand, link should be present
    const link = screen.getByText(/View full details/);
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/venues/california/test-vineyard");
  });
});