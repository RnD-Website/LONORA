import type { Metadata } from "next";
import JournalIndex from "./JournalIndex";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes from the LONORA studio on light, materials, method and visualisation.",
};

export default function JournalPage() {
  return <JournalIndex />;
}
