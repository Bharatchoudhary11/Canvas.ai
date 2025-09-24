import { useCallback, useState } from 'react';
import { getRecommendations, AdvisorResponse } from '../services/ai';

const DEFAULT_QUERY = 'I need a lightweight laptop for travel with a long battery life';

export function useAdvisor(initialQuery: string = DEFAULT_QUERY) {
        const [query, setQuery] = useState(initialQuery);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [result, setResult] = useState<AdvisorResponse | null>(null);

        const submit = useCallback(async () => {
                const trimmed = query.trim();
                if (!trimmed || loading) return;

                setLoading(true);
                setError(null);

                try {
                        const response = await getRecommendations(trimmed);
                        setResult(response);
                } catch (err: any) {
                        setError(err?.message ?? 'Something went wrong.');
                } finally {
                        setLoading(false);
                }
        }, [loading, query]);

        return {
                query,
                setQuery,
                loading,
                error,
                result,
                submit,
                setResult,
                setError
        };
}
