import { base44 } from "@/api/base44Client";

// Cache enriched data in localStorage
const CACHE_KEY_PREFIX = 'entity_enrichment_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const ENRICHMENT_SYSTEM_PROMPT = `You are an intelligence analyst's research assistant. When given an entity name and type, return comprehensive, factual public information in a strict JSON format.

**CRITICAL RULES:**
1. For REAL public figures, companies, vehicles (by VIN), phones, emails → use REAL public data
2. For Australian companies → ALWAYS include ABN and ACN if findable
3. For phone numbers → detect carrier, region, type (mobile/landline)
4. For addresses → geocode and identify neighborhood/suburb
5. For cryptocurrency wallets → identify blockchain, estimate activity if public
6. NEVER invent private data (SSN, private addresses, passwords, medical info)
7. For generic/fictional entities → generate plausible realistic data
8. Keep "minimal" under 25 chars, "tagline" under 40 chars
9. Hover array: 4-6 bullet points, each under 60 chars
10. Full object: 8-15 key-value pairs, comprehensive but organized

**STRICT JSON OUTPUT (no extra text):**
{
  "type": "Person|Company|Phone|Email|Address|Vehicle|CryptoWallet|Event|Location|Document",
  "minimal": "Short name for canvas",
  "tagline": "One key identifier (DOB, ABN, phone carrier, etc)",
  "hover": [
    "Key fact 1",
    "Key fact 2", 
    "Key fact 3",
    "Key fact 4"
  ],
  "full": {
    "Field Name": "Value",
    "Another Field": "Value",
    ...
  }
}

**Examples:**

Person (real public figure):
{
  "type": "Person",
  "minimal": "Elon Musk",
  "tagline": "DOB 1971-06-28",
  "hover": [
    "Full: Elon Reeve Musk",
    "Age: 54 (born Jun 28, 1971)",
    "CEO: Tesla, SpaceX, xAI",
    "Net worth: ~$250B USD",
    "Residence: Austin, Texas"
  ],
  "full": {
    "Full Name": "Elon Reeve Musk",
    "Date of Birth": "1971-06-28",
    "Place of Birth": "Pretoria, South Africa",
    "Citizenship": "USA, Canada, South Africa",
    "Primary Residence": "Austin, Texas, USA",
    "Occupation": "Entrepreneur, CEO",
    "Companies": "Tesla (CEO), SpaceX (CEO), X Corp (Owner), Neuralink, xAI",
    "Education": "University of Pennsylvania (BS Physics, BS Economics)",
    "Net Worth": "~$250 billion USD (2024)",
    "Known For": "Tesla electric vehicles, SpaceX rockets, Twitter/X acquisition"
  }
}

Australian Company (real):
{
  "type": "Company",
  "minimal": "Canva",
  "tagline": "ABN 80 158 929 938",
  "hover": [
    "Full: Canva Pty Ltd",
    "ABN: 80 158 929 938",
    "Founded: 2012, Sydney",
    "Valuation: $26B USD (2024)",
    "Employees: ~4,500"
  ],
  "full": {
    "Legal Name": "Canva Pty Ltd",
    "ABN": "80 158 929 938",
    "ACN": "158 929 938",
    "Founded": "2012",
    "Headquarters": "Sydney, NSW, Australia",
    "Industry": "Graphic Design / SaaS",
    "Founders": "Melanie Perkins, Cliff Obrecht, Cameron Adams",
    "Valuation": "$26 billion USD (2024)",
    "Employees": "~4,500",
    "Products": "Online graphic design platform",
    "Website": "canva.com"
  }
}

Phone (Australian mobile):
{
  "type": "Phone",
  "minimal": "+61 412 345 678",
  "tagline": "Telstra Mobile",
  "hover": [
    "Type: Mobile",
    "Carrier: Telstra",
    "Region: Australia (NSW)",
    "Status: Active"
  ],
  "full": {
    "Number": "+61 412 345 678",
    "Country": "Australia",
    "Type": "Mobile",
    "Carrier": "Telstra",
    "Region": "New South Wales",
    "Status": "Active (inferred)",
    "Format": "International: +61 412 345 678, Local: 0412 345 678"
  }
}

Now enrich the following entity with real, accurate, public information.`;

class EntityEnrichmentService {
  async enrichEntity(entityName, entityType, context = {}) {
    // Check cache first
    const cacheKey = this.getCacheKey(entityName, entityType);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('Using cached enrichment for:', entityName);
      return cached;
    }

    try {
      const prompt = `${ENRICHMENT_SYSTEM_PROMPT}

Entity to enrich:
- Name: ${entityName}
- Type: ${entityType}
${context.description ? `- Additional context: ${context.description}` : ''}
${Object.keys(context.attributes || {}).length > 0 ? `- Known attributes: ${JSON.stringify(context.attributes)}` : ''}

Return ONLY the JSON, no additional text.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            type: { type: "string" },
            minimal: { type: "string" },
            tagline: { type: "string" },
            hover: {
              type: "array",
              items: { type: "string" }
            },
            full: {
              type: "object",
              additionalProperties: { type: "string" }
            }
          },
          required: ["type", "minimal", "tagline", "hover", "full"]
        }
      });

      // Cache the result
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Entity enrichment failed:', error);
      // Return minimal fallback
      return {
        type: entityType,
        minimal: entityName,
        tagline: "Enrichment unavailable",
        hover: ["No additional data available"],
        full: {
          "Name": entityName,
          "Type": entityType,
          "Status": "Enrichment failed - data not available"
        }
      };
    }
  }

  getCacheKey(name, type) {
    return `${CACHE_KEY_PREFIX}${type}_${name.toLowerCase().replace(/\s+/g, '_')}`;
  }

  getFromCache(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  setCache(key, data) {
    try {
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache write error:', error);
      // If localStorage is full, clear old enrichment entries
      if (error.name === 'QuotaExceededError') {
        this.clearOldCache();
        try {
          localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (e) {
          console.error('Still cannot cache after cleanup:', e);
        }
      }
    }
  }

  clearOldCache() {
    try {
      const keys = Object.keys(localStorage);
      const enrichmentKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));
      
      // Parse and sort by timestamp
      const entries = enrichmentKeys.map(key => {
        try {
          const { timestamp } = JSON.parse(localStorage.getItem(key));
          return { key, timestamp };
        } catch {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest 25%
      const toRemove = Math.floor(entries.length * 0.25);
      entries.slice(0, toRemove).forEach(entry => {
        localStorage.removeItem(entry.key);
      });

      console.log(`Cleared ${toRemove} old cache entries`);
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  clearCache() {
    try {
      const keys = Object.keys(localStorage);
      keys.filter(k => k.startsWith(CACHE_KEY_PREFIX))
           .forEach(k => localStorage.removeItem(k));
      console.log('Enrichment cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

export const enrichmentService = new EntityEnrichmentService();
export { ENRICHMENT_SYSTEM_PROMPT };