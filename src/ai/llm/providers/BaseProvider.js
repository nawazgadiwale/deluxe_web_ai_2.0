export default class BaseProvider {
    async invoke() {
        throw new Error("invoke() must be implemented.");
    }

    async invokeStructured() {
        throw new Error("invokeStructured() must be implemented.");
    }

    async stream() {
        throw new Error("stream() must be implemented.");
    }
}