import Constants from 'expo-constants';
import { PRODUCT_CATALOG, Product } from '../data/productCatalog';

export type Recommendation = {
	productId: string;
	confidence: number; // 0..1
	reason: string;
};

export type AdvisorResponse = {
	recommendations: Recommendation[];
	model?: string;
	rawText?: string;
};

function getApiKey(): string {
	// Prefer public env for web/native dev builds
	const fromEnv = (process.env as any)?.EXPO_PUBLIC_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY;
	const fromConfig = (Constants.expoConfig?.extra as any)?.GEMINI_API_KEY || (Constants.manifest as any)?.extra?.GEMINI_API_KEY;
	const key = fromEnv || fromConfig;
	if (!key) {
		throw new Error('Missing GEMINI_API_KEY in env (EXPO_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY).');
	}
	return String(key);
}

const SYSTEM_PROMPT = `You are an AI Product Advisor. Given a user query and a JSON catalog, select 1-3 best products. Respond ONLY as strict JSON matching this TypeScript type:
{
  "recommendations": Array<{
    "productId": string, // must match an id in the catalog
    "confidence": number, // 0..1
    "reason": string // concise rationale tailored to the user's needs
  }>
}`;

export async function getRecommendations(userQuery: string): Promise<AdvisorResponse> {
        const apiKey = getApiKey();
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(apiKey);

        const payload = {
		contents: [
			{
				role: 'user',
				parts: [
					{ text: SYSTEM_PROMPT },
					{ text: `User query: ${userQuery}` },
					{ text: `Catalog JSON:` },
					{ text: JSON.stringify(PRODUCT_CATALOG) }
				]
			}
		],
		generationConfig: {
			temperature: 0.2,
			maxOutputTokens: 512,
			responseMimeType: 'application/json'
		}
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
        if (!res.ok) {
                const text = await res.text();
                throw new Error(`Gemini API error: ${res.status} ${text}`);
        }
        const data = await res.json();
        const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        let parsed: AdvisorResponse = {
                recommendations: [],
                rawText,
                model: typeof data?.modelVersion === 'string' ? data.modelVersion : undefined
        };
        if (rawText) {
                try {
                        const json = JSON.parse(rawText);
                        if (Array.isArray(json?.recommendations)) {
				parsed.recommendations = json.recommendations
					.filter((r: any) => typeof r?.productId === 'string' && typeof r?.confidence === 'number' && typeof r?.reason === 'string')
					.map((r: any) => ({ productId: r.productId, confidence: Math.max(0, Math.min(1, r.confidence)), reason: r.reason }));
			}
		} catch {}
	}

        // Fallback heuristic if model returns unexpected format
        if (parsed.recommendations.length === 0) {
                const fallback = heuristicRecommend(userQuery);
                parsed.recommendations = fallback;
                parsed.model = parsed.model ? `${parsed.model} + heuristic assist` : 'Heuristic recommender';
        }
        if (!parsed.model) {
                parsed.model = 'Gemini 1.5 Flash';
        }
        return parsed;
}

function heuristicRecommend(userQuery: string): Recommendation[] {
        const q = userQuery.toLowerCase();
        const budget = extractBudget(userQuery);
        const requestedCategories = detectRequestedCategories(q);
        const wantsPerformance = /(gaming|video editing|render|heavy duty|powerful|creator|graphics)/i.test(userQuery);
        const wantsPortability = /(lightweight|travel|portable|compact)/i.test(userQuery);
        const wantsFitness = /(fitness|running|workout|health|sleep tracking)/i.test(userQuery);

        const scored: Array<{ product: Product; score: number; reason: string[] }> = PRODUCT_CATALOG.map(p => {
                let score = 0;
                const reasonBits: string[] = [];

                if (requestedCategories.size > 0) {
                        if (requestedCategories.has(p.category.toLowerCase())) {
                                score += 1.5;
                                reasonBits.push(`matches ${p.category.toLowerCase()} request`);
                        } else {
                                score -= 1;
                        }
                }

                if (budget) {
                        if (p.priceUSD <= budget) {
                                score += 1;
                                reasonBits.push(`within $${budget} budget`);
                        } else {
                                score -= 1;
                        }
                }

                if (wantsPortability) {
                        const weight = typeof p.specs.weightKg === 'number' ? (p.specs.weightKg as number) : undefined;
                        if (weight && weight < 1.5) {
                                score += 1.2;
                                reasonBits.push('ultra portable');
                        }
                }

                if (q.includes('battery')) {
                        const hasBatterySpec = Boolean((p.specs as any).batteryWh || (p.specs as any).batteryHours || (p.specs as any).batteryDays || (p.specs as any).batteryMah);
                        if (hasBatterySpec) {
                                score += 1;
                                reasonBits.push('strong battery life');
                        }
                }

                if (q.includes('camera') && p.category === 'Smartphone') {
                        score += 1;
                        reasonBits.push('flagship camera system');
                }

                if (q.includes('noise') && p.category === 'Earbuds') {
                        score += 1;
                        reasonBits.push('active noise cancellation');
                }

                if (wantsPerformance && p.category === 'Laptop') {
                        const hasHighRam = typeof p.specs.ramGB === 'number' && (p.specs.ramGB as number) >= 16;
                        const hasGpuFeature = p.features.some(f => /gpu|graphics/i.test(f));
                        if (hasHighRam) {
                                score += 0.8;
                                reasonBits.push('high RAM for performance');
                        }
                        if (hasGpuFeature) {
                                score += 0.8;
                                reasonBits.push('dedicated graphics');
                        }
                }

                if (wantsFitness && p.category === 'Smartwatch') {
                        score += 1;
                        reasonBits.push('fitness tracking ready');
                }

                return {
                        product: p,
                        score: score + p.rating * 0.25,
                        reason: reasonBits.length ? reasonBits : ['well-reviewed']
                };
        });
        return scored
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map(s => ({
                        productId: s.product.id,
                        confidence: Math.min(1, s.score / 5),
                        reason: s.reason.join(', ')
                }));
}

function extractBudget(query: string): number | null {
        const normalized = query.replace(/,/g, '');
        const match = normalized.match(/(?:under|below|less than|budget|around|about)\s*\$?\s*(\d{2,5})/i) || normalized.match(/\$\s*(\d{2,5})/);
        if (!match) return null;
        const value = parseInt(match[1], 10);
        return Number.isFinite(value) ? value : null;
}

function detectRequestedCategories(query: string): Set<string> {
        const mapping: Array<{ pattern: RegExp; category: string }> = [
                { pattern: /(laptop|notebook|ultrabook)/, category: 'laptop' },
                { pattern: /(phone|smartphone|mobile)/, category: 'smartphone' },
                { pattern: /(earbud|earphone|headphone)/, category: 'earbuds' },
                { pattern: /(watch|smartwatch)/, category: 'smartwatch' }
        ];
        const set = new Set<string>();
        for (const { pattern, category } of mapping) {
                if (pattern.test(query)) {
                        set.add(category);
                }
        }
        return set;
}
