import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type FeatureChipProps = {
        label: string;
};

function FeatureChipBase({ label }: FeatureChipProps) {
        return (
                <View style={styles.chip}>
                        <Text style={styles.text}>{label}</Text>
                </View>
        );
}

export const FeatureChip = memo(FeatureChipBase);

const styles = StyleSheet.create({
        chip: {
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: '#eef2ff'
        },
        text: {
                fontSize: 12,
                color: '#3730a3',
                fontWeight: '600'
        }
});
