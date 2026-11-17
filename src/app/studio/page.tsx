import type { Metadata } from "next";
import StudioView from "./StudioView";

export const metadata: Metadata = {
  title: "About Us",
  description: "LONORA is an interior architecture studio. Our story, our principles and the people behind the work.",
};

export default function StudioPage() {
  return <StudioView />;
}
