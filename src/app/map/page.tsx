import { VenueMapLoader } from "@/components/VenueMapLoader";

export const metadata = {
  title: "Venue Map | Green Bowtie",
  description: "Explore wedding venues across all 50 states on an interactive map.",
};

export default function MapPage() {
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <VenueMapLoader />
    </div>
  );
}
