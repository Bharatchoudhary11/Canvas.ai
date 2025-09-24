export type Product = {
	id: string;
	title: string;
	category: string;
	brand: string;
	priceUSD: number;
	features: string[];
	specs: Record<string, string | number>;
	rating: number; // 0-5
	thumbnail?: string;
	url?: string;
};

export const PRODUCT_CATALOG: Product[] = [
	{
		id: 'laptop-ultra-13',
		title: 'AeroBook Ultra 13',
		category: 'Laptop',
		brand: 'AeroTech',
		priceUSD: 1199,
		features: ['lightweight', 'long battery life', 'backlit keyboard', 'Wi‑Fi 6'],
		specs: { weightKg: 1.1, screenInches: 13.3, batteryWh: 60, ramGB: 16, storageGB: 512 },
		rating: 4.6,
		thumbnail: 'https://picsum.photos/seed/aerobook/200',
		url: 'https://example.com/aerobook-ultra-13'
	},
	{
		id: 'laptop-travel-14',
		title: 'Voyager 14 Travel',
		category: 'Laptop',
		brand: 'Voyage',
		priceUSD: 899,
		features: ['portable', 'fast charge', 'fingerprint reader'],
		specs: { weightKg: 1.25, screenInches: 14, batteryWh: 50, ramGB: 8, storageGB: 256 },
		rating: 4.3,
		thumbnail: 'https://picsum.photos/seed/voyager14/200',
		url: 'https://example.com/voyager-14-travel'
	},
	{
		id: 'laptop-pro-16',
		title: 'Creator Pro 16',
		category: 'Laptop',
		brand: 'CreateX',
		priceUSD: 1999,
		features: ['discrete GPU', 'color-accurate display', 'Thunderbolt 4'],
		specs: { weightKg: 2.1, screenInches: 16, batteryWh: 80, ramGB: 32, storageGB: 1024 },
		rating: 4.8,
		thumbnail: 'https://picsum.photos/seed/creatorpro16/200',
		url: 'https://example.com/creator-pro-16'
	},
	{
		id: 'buds-noise-cancel',
		title: 'QuietBuds 2',
		category: 'Earbuds',
		brand: 'Silencio',
		priceUSD: 179,
		features: ['ANC', 'wireless charging', 'multipoint'],
		specs: { batteryHours: 8, waterResistance: 'IPX4' },
		rating: 4.5,
		thumbnail: 'https://picsum.photos/seed/quietbuds/200',
		url: 'https://example.com/quietbuds-2'
	},
	{
		id: 'phone-compact',
		title: 'Pixelate Mini',
		category: 'Smartphone',
		brand: 'Photon',
		priceUSD: 599,
		features: ['compact', 'great camera', 'clean OS'],
		specs: { screenInches: 5.9, batteryMah: 4300, storageGB: 128, ramGB: 8 },
		rating: 4.4,
		thumbnail: 'https://picsum.photos/seed/pixelatemini/200',
		url: 'https://example.com/pixelate-mini'
	},
	{
		id: 'watch-fitness',
		title: 'FitTrack S',
		category: 'Smartwatch',
		brand: 'Tracko',
		priceUSD: 229,
		features: ['GPS', 'sleep tracking', 'waterproof'],
		specs: { batteryDays: 5, waterResistance: '5ATM' },
		rating: 4.2,
		thumbnail: 'https://picsum.photos/seed/fittracks/200',
		url: 'https://example.com/fittrack-s'
	}
];
