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

	let parsed: AdvisorResponse = { recommendations: [], rawText };
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
	}
	return parsed;
}

function heuristicRecommend(userQuery: string): Recommendation[] {
	const q = userQuery.toLowerCase();
	const scored: Array<{ product: Product; score: number; reason: string }> = PRODUCT_CATALOG.map(p => {
		let score = 0;
		let reasonBits: string[] = [];
		if (q.includes('light') || q.includes('travel')) {
			score += (p.specs.weightKg as number) ? Math.max(0, 2 - (p.specs.weightKg as number)) : 0;
			if (p.category === 'Laptop') reasonBits.push('portable');
		}
		if (q.includes('battery')) {
			score += (p.specs.batteryWh as number) || (p.specs.batteryHours as number) || (p.specs.batteryDays as number) ? 1 : 0;
			reasonBits.push('good battery');
		}
		if (q.includes('camera') && p.category === 'Smartphone') {
			score += 1;
			reasonBits.push('good camera');
		}
		if (q.includes('noise') && p.category === 'Earbuds') {
			score += 1;
			reasonBits.push('noise cancelling');
		}
		return { product: p, score: score + p.rating * 0.2, reason: reasonBits.join(', ') || 'well‑reviewed' };
	});
	return scored
		.sort((a, b) => b.score - a.score)
		.slice(0, 3)
		.map(s => ({ productId: s.product.id, confidence: Math.min(1, s.score / 5), reason: s.reason }));
}
