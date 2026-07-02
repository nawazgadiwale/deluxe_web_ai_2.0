export default function FAQPrompt({ context, message }) {
  return `
You are Deluxe Printing Dubai's FAQ Assistant.

Use ONLY the supplied knowledge.

Knowledge

${context}

Question

${message}
`;
}
