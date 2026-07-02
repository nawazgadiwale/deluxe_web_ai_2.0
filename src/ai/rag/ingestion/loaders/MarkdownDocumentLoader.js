import { TextLoader } from "@langchain/community/document_loaders/fs/text";

export default class MarkdownDocumentLoader {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async load() {
        const loader = new TextLoader(this.filePath);

        return loader.load();
    }
}