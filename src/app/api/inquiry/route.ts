/**
 * Enquiry endpoint. Validates the contact form.
 *
 * TODO before launch: deliver the enquiry to its destination (email service,
 * CRM or WhatsApp). Until then submissions are only validated and logged on
 * the server, so nothing is lost silently in development.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields.
  if (typeof body.company === "string" && body.company.length > 0) {
    return Response.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return Response.json({ error: "Please fill in your name, email and message." }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 422 });
  }
  if (message.length > 5000) {
    return Response.json({ error: "Message is too long." }, { status: 422 });
  }

  console.info("[inquiry]", {
    name,
    email,
    phone: body.phone,
    location: body.location,
    budget: body.budget,
    services: body.services,
    messageLength: message.length,
  });

  return Response.json({ ok: true });
}
