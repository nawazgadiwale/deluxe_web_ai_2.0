import ComparisonEngine from "./ComparisonEngine.js";
import ComparisonValidator from "./ComparisonValidator.js";

const engine = new ComparisonEngine();
const validator = new ComparisonValidator();

export default class ComparisonService {
  async generate(state) {
    const result = await engine.generate(state);

    return validator.validate(result);
  }
}
