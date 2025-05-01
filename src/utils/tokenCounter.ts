/**
 * A simple token counter utility
 * Note: For production, consider using a more accurate tokenizer like GPT Tokenizer
 */

// Simple approximation (1 token ≈ 4 chars for English text)
export function getTokenCount(text: string): number {
  if (!text) return 0;
  
  // Simple approximation: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

// For more accurate token counting, you can use a proper tokenizer library
// Example with gpt-tokenizer:
// import { encode } from 'gpt-tokenizer';
// export function getTokenCount(text: string): number {
//   if (!text) return 0;
//   return encode(text).length;
// }