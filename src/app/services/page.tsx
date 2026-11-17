import type { Metadata } from "next";
import ServicesView from "./ServicesView";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Interior design, residential and commercial interiors, space planning, furniture selection, 3D visualisation and renovation.",
};

export default function ServicesPage() {
  return <ServicesView />;
}
