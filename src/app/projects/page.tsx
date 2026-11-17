import type { Metadata } from "next";
import ProjectsIndex from "./ProjectsIndex";

export const metadata: Metadata = {
  title: "Work",
  description: "Residential and commercial interiors by LONORA, each explorable in live 3D.",
};

export default function ProjectsPage() {
  return <ProjectsIndex />;
}
