import type { ExpoConfig } from 'expo/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

const config: ExpoConfig = {
	name: 'ai-product-advisor',
	slug: 'ai-product-advisor',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/icon.png',
	userInterfaceStyle: 'light',
	newArchEnabled: true,
	splash: {
		image: './assets/splash-icon.png',
		resizeMode: 'contain',
		backgroundColor: '#ffffff'
	},
	ios: { supportsTablet: true },
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/adaptive-icon.png',
			backgroundColor: '#ffffff'
		},
		edgeToEdgeEnabled: true,
		predictiveBackGestureEnabled: false
	},
	web: { favicon: './assets/favicon.png' },
	scheme: 'ai-product-advisor',
	extra: {
		GEMINI_API_KEY: GEMINI_API_KEY
	}
};

export default config;
