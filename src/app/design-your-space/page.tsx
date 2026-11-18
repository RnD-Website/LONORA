import type { Metadata } from "next";
import DesignView from "./DesignView";

export const metadata: Metadata = {
  title: "Design Your Space",
  description: "Lay out your kitchen in 3D, try finishes and get an instant estimate, then send it to the LONORA studio.",
};

export default function DesignYourSpacePage() {
  return <DesignView />;
}
