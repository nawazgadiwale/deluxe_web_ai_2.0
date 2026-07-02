export default class QueryNormalizer {
    constructor(options = {}) {
        this.synonyms = options.synonyms ?? this.defaultSynonyms();

        this.businessTypes = options.businessTypes ?? [
            "restaurant",
            "hotel",
            "clinic",
            "hospital",
            "school",
            "college",
            "gym",
            "retail",
            "corporate",
            "real estate",
            "travel",
            "beauty salon",
            "construction"
        ];
    }

    normalize(query = "") {
        const originalQuery = query;

        let normalizedQuery = query
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        normalizedQuery = this.replaceSynonyms(normalizedQuery);

        const quantity = this.extractQuantity(normalizedQuery);

        const businessType =
            this.extractBusinessType(normalizedQuery);

        const keywords =
            this.extractKeywords(normalizedQuery);

        return {
            originalQuery,

            normalizedQuery,

            keywords,

            entities: {
                quantity,
                businessType
            },

            filters: {
                businessType
            }
        };
    }

    replaceSynonyms(text) {
        let normalized = text;

        for (const [key, value] of Object.entries(this.synonyms)) {
            normalized = normalized.replaceAll(key, value);
        }

        return normalized;
    }

    extractQuantity(text) {
        const match = text.match(/\b\d+\b/);

        return match ? Number(match[0]) : null;
    }

    extractBusinessType(text) {
        return (
            this.businessTypes.find(type =>
                text.includes(type)
            ) ?? null
        );
    }

    extractKeywords(text) {
        const stopWords = new Set([
            "i",
            "me",
            "my",
            "need",
            "want",
            "please",
            "for",
            "of",
            "to",
            "the",
            "a",
            "an",
            "and",
            "with",
            "in",
            "on",
            "is",
            "are"
        ]);

        return text
            .split(" ")
            .filter(word =>
                word.length > 2 &&
                !stopWords.has(word)
            );
    }

    defaultSynonyms() {
        return {
            "visiting card": "business card",
            "visiting cards": "business cards",
            "name card": "business card",
            "name cards": "business cards",
            "brochure booklet": "brochure",
            "leaflet": "flyer",
            "pamphlet": "flyer"
        };
    }
}