import Journey from "@/components/home/Journey";
import { VideoReveal } from "@/components/home/VideoReveal";
import {
  JournalTeaser,
  Manifesto,
  ProcessTimeline,
  ServicesList,
  WorkRail,
} from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Journey />
      <Manifesto />
      <WorkRail />
      <ServicesList />
      <ProcessTimeline />
      <VideoReveal />
      <JournalTeaser />
    </>
  );
}
