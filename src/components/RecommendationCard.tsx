import { memo, useCallback } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Recommendation } from '../services/ai';
import { Product } from '../catalog';
import { FeatureChip } from './FeatureChip';

type RecommendationCardProps = {
        product: Product;
        recommendation: Recommendation;
};

function RecommendationCardBase({ product, recommendation }: RecommendationCardProps) {
        const confidencePct = Math.round(recommendation.confidence * 100);

        const handlePress = useCallback(async () => {
                if (!product.url) return;
                try {
                        await Linking.openURL(product.url);
                } catch (err) {
                        console.warn('Failed to open URL', err);
                }
        }, [product.url]);

        return (
                <Pressable
                        style={({ pressed }) => [styles.card, !product.url && styles.cardDisabled, pressed && styles.cardPressed]}
                        onPress={product.url ? handlePress : undefined}
                        disabled={!product.url}
                >
                        {product.thumbnail ? (
                                <Image source={{ uri: product.thumbnail }} style={styles.thumbnail} />
                        ) : (
                                <View style={[styles.thumbnail, styles.placeholder]} />
                        )}
                        <View style={styles.body}>
                                <View style={styles.headerRow}>
                                        <Text style={styles.title}>{product.title}</Text>
                                        <Text style={styles.price}>${product.priceUSD}</Text>
                                </View>
                                <Text style={styles.meta}>
                                        {product.brand} • {product.category}
                                </Text>
                                <Text style={styles.reason}>{recommendation.reason}</Text>
                                <View style={styles.confidenceWrapper}>
                                        <View style={styles.confidenceBar}>
                                                <View style={[styles.confidenceFill, { width: `${confidencePct}%` }]} />
                                        </View>
                                        <Text style={styles.confidenceText}>Confidence {confidencePct}%</Text>
                                </View>
                                <View style={styles.featuresRow}>
                                        {product.features.slice(0, 4).map(feature => (
                                                <FeatureChip key={feature} label={feature} />
                                        ))}
                                </View>
                        </View>
                </Pressable>
        );
}

export const RecommendationCard = memo(RecommendationCardBase);

const styles = StyleSheet.create({
        card: {
                flexDirection: 'row',
                backgroundColor: '#fff',
                borderRadius: 16,
                borderColor: '#e5e7eb',
                borderWidth: 1,
                overflow: 'hidden'
        },
        cardDisabled: {
                opacity: 0.95
        },
        cardPressed: {
                opacity: 0.92
        },
        thumbnail: {
                width: 112,
                height: 112
        },
        placeholder: {
                backgroundColor: '#f1f5f9'
        },
        body: {
                flex: 1,
                padding: 14,
                gap: 6
        },
        headerRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
        },
        title: {
                fontSize: 16,
                fontWeight: '700',
                color: '#111827',
                flex: 1,
                paddingRight: 12
        },
        price: {
                fontSize: 15,
                fontWeight: '600',
                color: '#2563eb'
        },
        meta: {
                fontSize: 12,
                color: '#6b7280'
        },
        reason: {
                fontSize: 14,
                color: '#1f2937'
        },
        confidenceWrapper: {
                gap: 4
        },
        confidenceBar: {
                height: 6,
                borderRadius: 999,
                backgroundColor: '#e5e7eb',
                overflow: 'hidden'
        },
        confidenceFill: {
                height: '100%',
                borderRadius: 999,
                backgroundColor: '#34d399'
        },
        confidenceText: {
                fontSize: 12,
                color: '#047857',
                fontWeight: '600'
        },
        featuresRow: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6
        }
});
