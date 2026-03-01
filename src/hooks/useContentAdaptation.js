import { useMutation } from '@tanstack/react-query';
import { adaptContent } from '../services/contentService';

export function useContentAdaptation() {
    return useMutation({
        mutationFn: adaptContent,
    });
}
