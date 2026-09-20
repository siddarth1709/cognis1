import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ repo: string }> }
) {
  try {
    const { repo } = await params;
    const repoDecoded = decodeURIComponent(repo);

    // Score calculation or mock baseline
    const score = 85;
    const isHigh = score >= 80;
    const statusColor = isHigh ? "#9AA68A" : "#D8663D";
    const bgGradientStart = "#0E0E0B";
    const bgGradientEnd = "#1A1A14";

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="40" viewBox="0 0 280 40">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradientStart}"/>
      <stop offset="100%" stop-color="${bgGradientEnd}"/>
    </linearGradient>
  </defs>
  <rect width="280" height="40" rx="4" fill="url(#bg)" stroke="#2C2C22" stroke-width="1"/>
  <circle cx="20" cy="20" r="4" fill="${statusColor}">
    <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
  </circle>
  <text x="32" y="24" fill="#8C887B" font-family="monospace" font-size="10" letter-spacing="1">COGNIS CONSISTENCY</text>
  <text x="195" y="24" fill="${statusColor}" font-family="monospace" font-size="12" font-weight="bold">${score}%</text>
  <text x="235" y="24" fill="#66655E" font-family="monospace" font-size="9">VERIFIED</text>
</svg>
`.trim();

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate badge" },
      { status: 500 }
    );
  }
}
