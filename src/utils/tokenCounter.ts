/**
 * Token counter utility using gpt-tokenizer for accurate token counting
 */

import { encode } from 'gpt-tokenizer';

/**
 * Get an accurate token count using the gpt-tokenizer library
 * @param text The text to count tokens for
 * @returns The number of tokens in the text
 */
export function getTokenCount(text: string): number {
  if (!text) return 0;
  
  try {
    // Use the accurate tokenizer
    return encode(text).length;
  } catch (error) {
    // Fallback to simple approximation if tokenizer fails
    console.warn('Tokenizer failed, using approximation instead:', error);
    return Math.ceil(text.length / 4);
  }
}