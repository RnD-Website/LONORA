import Journey from "@/components/home/Journey";
import { VideoReveal } from "@/components/home/VideoReveal";
import { WorkShowcase } from "@/components/home/WorkShowcase";
import {
  JournalTeaser,
  Manifesto,
  ProcessTimeline,
  ServicesList,
} from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Journey />
      <Manifesto />
      <WorkShowcase />
      <ServicesList />
      <ProcessTimeline />
      <VideoReveal />
      <JournalTeaser />
    </>
  );
}
