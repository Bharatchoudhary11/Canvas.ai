import { useCallback, useMemo } from 'react';
import {
        ActivityIndicator,
        FlatList,
        Keyboard,
        KeyboardAvoidingView,
        Platform,
        Pressable,
        SafeAreaView,
        StyleSheet,
        Text,
        TextInput,
        View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAdvisor } from './hooks/useAdvisor';
import { PRODUCT_CATALOG, Product } from './catalog';
import { RecommendationCard } from './components/RecommendationCard';

export function AdvisorScreen() {
        const { query, setQuery, loading, error, result, submit } = useAdvisor();

        const productsById = useMemo(() => {
                const map: Record<string, Product> = {};
                for (const product of PRODUCT_CATALOG) {
                        map[product.id] = product;
                }
                return map;
        }, []);

        const recommendations = result?.recommendations ?? [];

        const handleSubmit = useCallback(() => {
                if (!query.trim()) return;
                Keyboard.dismiss();
                submit();
        }, [query, submit]);

        return (
                <SafeAreaView style={styles.safeArea}>
                        <StatusBar style="dark" />
                        <KeyboardAvoidingView
                                style={styles.container}
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
                        >
                                <View style={styles.header}>
                                        <Text style={styles.title}>AI Product Advisor</Text>
                                        <Text style={styles.subtitle}>Tell us what you need and we will match the best products for you.</Text>
                                </View>

                                <View style={styles.queryCard}>
                                        <TextInput
                                                style={styles.input}
                                                value={query}
                                                onChangeText={setQuery}
                                                placeholder="e.g., A compact phone with a stellar camera under $700"
                                                multiline
                                                returnKeyType="send"
                                                onSubmitEditing={handleSubmit}
                                                editable={!loading}
                                        />
                                        <Pressable
                                                style={({ pressed }) => [styles.submitButton, (pressed || loading) && styles.submitButtonPressed]}
                                                onPress={handleSubmit}
                                                disabled={loading}
                                        >
                                                <Text style={styles.submitText}>{loading ? 'Thinking…' : 'Ask Advisor'}</Text>
                                        </Pressable>
                                </View>

                                {loading && (
                                        <View style={styles.loadingRow}>
                                                <ActivityIndicator color="#2563eb" />
                                                <Text style={styles.loadingText}>Consulting Gemini about your request…</Text>
                                        </View>
                                )}

                                {error && !loading && (
                                        <View style={styles.errorBox}>
                                                <Text style={styles.errorTitle}>We hit a snag</Text>
                                                <Text style={styles.errorText}>{error}</Text>
                                        </View>
                                )}

                                <FlatList
                                        data={recommendations}
                                        keyExtractor={item => item.productId}
                                        style={styles.list}
                                        contentContainerStyle={[styles.listContent, recommendations.length === 0 && styles.listContentEmpty]}
                                        renderItem={({ item }) => {
                                                const product = productsById[item.productId];
                                                if (!product) return null;
                                                return <RecommendationCard product={product} recommendation={item} />;
                                        }}
                                        ListEmptyComponent={
                                                !loading ? (
                                                        <View style={styles.emptyState}>
                                                                <Text style={styles.emptyTitle}>Describe your perfect product</Text>
                                                                <Text style={styles.emptySubtitle}>
                                                                        Share what matters most—budget, features, or lifestyle. We will combine the catalog with
                                                                        Gemini to shortlist the best options.
                                                                </Text>
                                                        </View>
                                                ) : null
                                        }
                                        ListHeaderComponent={
                                                result?.model ? (
                                                        <View style={styles.modelPill}>
                                                                <Text style={styles.modelPillText}>Powered by {result.model}</Text>
                                                        </View>
                                                ) : null
                                        }
                                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                                        showsVerticalScrollIndicator={false}
                                />
                        </KeyboardAvoidingView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        safeArea: {
                flex: 1,
                backgroundColor: '#f5f5f7'
        },
        container: {
                flex: 1,
                paddingHorizontal: 18,
                paddingTop: 16,
                paddingBottom: 12
        },
        header: {
                gap: 6,
                marginBottom: 12
        },
        title: {
                fontSize: 26,
                fontWeight: '800',
                color: '#111827'
        },
        subtitle: {
                fontSize: 15,
                color: '#4b5563',
                lineHeight: 20
        },
        queryCard: {
                backgroundColor: '#ffffff',
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                marginBottom: 10,
                gap: 12
        },
        input: {
                minHeight: 72,
                maxHeight: 140,
                fontSize: 16,
                color: '#111827'
        },
        submitButton: {
                backgroundColor: '#2563eb',
                borderRadius: 999,
                alignSelf: 'flex-end',
                paddingHorizontal: 20,
                paddingVertical: 10
        },
        submitButtonPressed: {
                opacity: 0.8
        },
        submitText: {
                color: '#ffffff',
                fontWeight: '600',
                fontSize: 16
        },
        loadingRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginVertical: 10
        },
        loadingText: {
                color: '#2563eb',
                fontSize: 15,
                fontWeight: '500'
        },
        errorBox: {
                backgroundColor: '#fee2e2',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#fecaca',
                marginBottom: 12,
                gap: 6
        },
        errorTitle: {
                fontWeight: '700',
                color: '#b91c1c'
        },
        errorText: {
                color: '#7f1d1d'
        },
        list: {
                flex: 1
        },
        listContent: {
                paddingBottom: 60
        },
        listContentEmpty: {
                flexGrow: 1,
                justifyContent: 'center'
        },
        emptyState: {
                backgroundColor: '#eef2ff',
                borderRadius: 18,
                padding: 20,
                gap: 8
        },
        emptyTitle: {
                fontSize: 20,
                fontWeight: '700',
                color: '#312e81'
        },
        emptySubtitle: {
                fontSize: 15,
                color: '#4338ca',
                lineHeight: 20
        },
        modelPill: {
                alignSelf: 'center',
                backgroundColor: '#ecfdf5',
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 999,
                marginBottom: 12
        },
        modelPillText: {
                color: '#047857',
                fontWeight: '600'
        },
        separator: {
                height: 16
        }
});

export default AdvisorScreen;
