import type { Country } from '../types/index.js';
export type CountryChunkLoader = () => Promise<{
    default: Country;
} | Country>;
export declare const countryLoaders: Record<string, CountryChunkLoader>;
export declare const countryCodes: string[];
//# sourceMappingURL=countryLoaders.generated.d.ts.map