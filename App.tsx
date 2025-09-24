import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getRecommendations, AdvisorResponse } from './services/ai';
import { PRODUCT_CATALOG, Product } from './data/productCatalog';

export default function App() {
	const [query, setQuery] = useState('I need a lightweight laptop for travel with a long battery life');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<AdvisorResponse | null>(null);

	const productsById = useMemo(() => {
		const map: Record<string, Product> = {};
		for (const p of PRODUCT_CATALOG) map[p.id] = p;
		return map;
	}, []);

	const onSubmit = useCallback(async () => {
		if (!query.trim()) return;
		Keyboard.dismiss();
		setLoading(true);
		setError(null);
		setResult(null);
		try {
			const res = await getRecommendations(query.trim());
			setResult(res);
		} catch (e: any) {
			setError(e?.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	}, [query]);

	return (
		<SafeAreaView style={styles.safe}>
			<StatusBar style="dark" />
			<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
				<Text style={styles.title}>AI Product Advisor</Text>
				<Text style={styles.subtitle}>Describe your needs in natural language.</Text>

				<View style={styles.inputRow}>
					<TextInput
						style={styles.input}
						value={query}
						onChangeText={setQuery}
						placeholder="e.g., A compact phone with great camera under $700"
						multiline
						returnKeyType="send"
						onSubmitEditing={onSubmit}
					/>
					<Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onSubmit} disabled={loading}>
						<Text style={styles.buttonText}>{loading ? '...' : 'Ask'}</Text>
					</Pressable>
				</View>

				{loading && (
					<View style={styles.loading}>
						<ActivityIndicator />
						<Text style={styles.loadingText}>Thinking...</Text>
					</View>
				)}

				{error && (
					<View style={styles.errorBox}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				{result && result.recommendations.length > 0 && (
					<FlatList
						data={result.recommendations}
						keyExtractor={(r) => r.productId}
						contentContainerStyle={styles.listContent}
						renderItem={({ item }) => {
							const p = productsById[item.productId];
							if (!p) return null;
							return (
								<View style={styles.card}>
									{p.thumbnail ? <Image source={{ uri: p.thumbnail }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbPlaceholder]} />}
									<View style={styles.cardBody}>
										<Text style={styles.cardTitle}>{p.title}</Text>
										<Text style={styles.cardMeta}>{p.brand} • {p.category} • ${p.priceUSD}</Text>
										<Text style={styles.cardReason}>{item.reason}</Text>
										<Text style={styles.cardConfidence}>Confidence: {(item.confidence * 100).toFixed(0)}%</Text>
									</View>
								</View>
							);
						}}
					/>
				)}

				{result && result.recommendations.length === 0 && (
					<View style={styles.empty}>
						<Text style={styles.emptyText}>No recommendations yet. Try refining your query.</Text>
					</View>
				)}
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#f7f7f8' },
	container: { flex: 1, padding: 16, gap: 12 },
	title: { fontSize: 24, fontWeight: '700', color: '#111' },
	subtitle: { fontSize: 14, color: '#555' },
	inputRow: { flexDirection: 'row', gap: 8 },
	input: { flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
	button: { height: 48, paddingHorizontal: 16, backgroundColor: '#111', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
	buttonPressed: { opacity: 0.7 },
	buttonText: { color: '#fff', fontWeight: '700' },
	loading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 },
	loadingText: { color: '#555' },
	errorBox: { backgroundColor: '#fee2e2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 12, padding: 12 },
	errorText: { color: '#991b1b' },
	listContent: { paddingVertical: 8, gap: 12 },
	card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderColor: '#eee', borderWidth: 1, overflow: 'hidden' },
	thumb: { width: 92, height: 92 },
	thumbPlaceholder: { backgroundColor: '#eee' },
	cardBody: { flex: 1, padding: 12, gap: 4 },
	cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
	cardMeta: { fontSize: 12, color: '#666' },
	cardReason: { fontSize: 14, color: '#333' },
	cardConfidence: { fontSize: 12, color: '#777' },
	empty: { padding: 16, alignItems: 'center' },
	emptyText: { color: '#555' }
});
