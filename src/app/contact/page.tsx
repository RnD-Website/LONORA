import type { Metadata } from "next";
import ContactView from "./ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with LONORA. Tell us about your space and we will reply within two working days.",
};

export default function ContactPage() {
  return <ContactView />;
}
