import type { Country } from '../types';
export type CountryChunkLoader = () => Promise<{
    default: Country;
} | Country>;
export declare const countryLoaders: Record<string, CountryChunkLoader>;
export declare const countryCodes: string[];
//# sourceMappingURL=countryLoaders.generated.d.ts.map