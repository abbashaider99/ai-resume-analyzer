import type { LoaderFunctionArgs } from "react-router";

// Utility: fetch with timeout and basic UA
async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function extractPrice(html: string): string | null {
  // Try to find currency amounts like $9.99 or $9
  const priceRegex = /\$\s?\d{1,4}(?:[.,]\d{2})?/g;
  const matches = html.match(priceRegex);
  if (!matches || matches.length === 0) return null;
  // Heuristic: pick the smallest positive price (likely first-year promo)
  let minVal = Number.POSITIVE_INFINITY;
  let minStr: string | null = null;
  for (const m of matches) {
    const num = parseFloat(m.replace(/[\$,]/g, ""));
    if (!isNaN(num) && num > 0 && num < minVal) {
      minVal = num;
      minStr = `$${num.toFixed(num % 1 === 0 ? 0 : 2)}`;
    }
  }
  return minStr;
}

function extractOffer(html: string): string | null {
  const offerRegex = /(\d{1,2}%\s*off|save\s*\$?\d+|discount|special offer|promo)/i;
  const m = html.match(offerRegex);
  return m ? m[0] : null;
}

type Offer = {
  provider: "Hostinger" | "Namecheap" | "GoDaddy";
  url: string;
  price: string | null;
  offer: string | null;
  freebies: string[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain");
  if (!domain) {
    return new Response(JSON.stringify({ error: "domain required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const providers: Offer[] = [
    {
      provider: "Hostinger",
      url: `https://www.hostinger.com/domain-name-results?domain=${encodeURIComponent(domain)}&REFERRALCODE=1TEAMTECH21&from=domain-name-search`,
      price: null,
      offer: null,
      freebies: ["WHOIS Privacy", "SSL Support", "1-Click DNS"],
    },
    {
      provider: "Namecheap",
      url: `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
      price: null,
      offer: null,
      freebies: ["WHOIS Privacy", "Email Forwarding"],
    },
    {
      provider: "GoDaddy",
      url: `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${encodeURIComponent(domain)}`,
      price: null,
      offer: null,
      freebies: ["Fast DNS", "Support"],
    },
  ];

  await Promise.all(
    providers.map(async (p) => {
      try {
        const res = await fetchWithTimeout(p.url);
        if (!res.ok) return;
        const html = await res.text();
        p.price = extractPrice(html);
        p.offer = extractOffer(html);
      } catch (e) {
        // keep nulls
      }
    })
  );

  return new Response(
    JSON.stringify({
      domain,
      updatedAt: new Date().toISOString(),
      offers: providers,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
