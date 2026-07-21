import ComparisonEngine from "./ComparisonEngine.js";
import ComparisonValidator from "./ComparisonValidator.js";

const engine = new ComparisonEngine();
const validator = new ComparisonValidator();

export default class ComparisonService {
  async generate(state) {
    /*
     * =====================================================
     * Execute Comparison
     * =====================================================
     */

    const result = await engine.execute(state);

    /*
     * =====================================================
     * Validate Response
     * =====================================================
     */

    return validator.validate(result);
  }
}