import RoutingEngine from "./RoutingEngine.js";
import RoutingValidator from "./RoutingValidator.js";

const engine = new RoutingEngine();
const validator = new RoutingValidator();

export default class RoutingService {
  async route(state) {
    try {
      const routing = await engine.route(state);

      return validator.validate(routing);
    } catch (error) {
      console.error("Routing Error:", error);

      return validator.validate({
        capability: "recommendation",
        confidence: 0,
        source: "FALLBACK",
      });
    }
  }
}
