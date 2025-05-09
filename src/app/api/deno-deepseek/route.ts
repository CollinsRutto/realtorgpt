import { NextRequest, NextResponse } from 'next/server';

// Constants
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPSEEK_CONFIG = {
  API_KEY: process.env.DEEPSEEK_API_KEY,
  BASE_URL: "https://api.deepseek.com",
  MODEL: "deepseek-chat",
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  REQUEST_TIMEOUT_MS: 25000, // 25 seconds
};

// Types
type MessageRole = "system" | "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
}

interface RequestBody {
  message: string;
  messageHistory?: Message[];
  context?: "general" | "realtor";
}

// ==========================================
// Input Validation Module
// ==========================================

class InputValidator {
  static validateMessage(message: string): boolean {
    // Check if message is empty or too long
    if (!message || message.trim() === '') {
      return false;
    }
    
    // Limit message length to prevent abuse
    if (message.length > 2000) {
      return false;
    }
    
    return true;
  }
  
  static validateMessageHistory(history?: Message[]): boolean {
    if (!history) return true;
    
    // Limit history size to prevent abuse
    if (history.length > 20) {
      return false;
    }
    
    // Validate each message in history
    for (const msg of history) {
      if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
        return false;
      }
      
      if (!msg.content || msg.content.length > 2000) {
        return false;
      }
    }
    
    return true;
  }
  
  static validateContext(context?: string): boolean {
    if (!context) return true;
    return ['general', 'realtor'].includes(context);
  }
}

// ==========================================
// Formatting & Utilities Module
// ==========================================

class FormatUtils {
  static getCurrentEAT(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
     
    const [
      { value: month },,
      { value: day },,
      { value: year },,
      { value: hour },,
      { value: minute },,
      { value: second }
    ] = formatter.formatToParts(now);

    return `${year}-${month}-${day} ${hour}:${minute}:${second} EAT`;
  }

  static cleanMarkdownFormatting(text: string): string {
    // Keep bold formatting (**text**) but remove other markdown elements
     
    // Remove markdown headers (#, ##, etc.)
    let cleanedText = text.replace(/^#+\s+/gm, '');
     
    // Remove italic formatting (*text*) but only if it's not part of bold (**text**)
    // This regex looks for single asterisks that aren't part of double asterisks
    cleanedText = cleanedText.replace(/(?<!\*)\*(?!\*)([^\*]+)(?<!\*)\*(?!\*)/g, '$1');
     
    // Keep bold formatting (**text**)
    return cleanedText;
  }
}

// ==========================================
// DeepSeek AI Service Module
// ==========================================

class DeepSeekService {
  static getSystemPrompt(context: string): string {
    const currentDateTime = FormatUtils.getCurrentEAT();
    let systemMessage = "";
    
    if (context === "realtor") {
      systemMessage = `You are ELA (Expert Listing Assistant), a highly specialized AI for Kenyan real estate professionals. Current Date/Time: ${currentDateTime}.

KEY CAPABILITIES:
1. CREATIVE MARKETING: Suggest innovative, out-of-the-box marketing strategies specifically for the Kenyan market
2. LOCAL MARKET EXPERTISE: Provide insights on Kenyan real estate trends, neighborhood data, and market conditions
3. LISTING OPTIMIZATION: Help realtors improve property listings with formatting tips and content optimization
4. SEO & VISIBILITY: Suggest high-converting keywords and phrases for the Kenyan market
5. BUYER PSYCHOLOGY: Advise on appealing to local buyer preferences and cultural considerations

GUIDELINES:
- Always maintain a professional, confident tone as an experienced real estate marketing expert
- Tailor all advice to the Kenyan market context
- Focus on practical, actionable advice rather than general principles
- Be specific with suggestions (e.g., exact phrases to use, specific platforms to target)
- Do not provide financial or legal advice, focus only on marketing and optimization
- Use emoji occasionally to make your responses engaging and visually appealing 🏠✨📊
- You CAN use **bold text** with double asterisks for emphasis on important points
- Format lists with numbers and bullet points for clarity and readability
- Use visually engaging formatting like 🔑 for key points and 💡 for creative ideas
- ABSOLUTELY DO NOT mention, recommend, endorse, or list ANY specific real estate agencies, companies, or realtors by name
- DO NOT provide ANY specific agent names, company names, or contact details of real estate professionals
- DO NOT suggest contacting any specific company or individual in the real estate industry
- DO NOT respond to requests asking for names of real estate companies or agents
- DO NOT use terms like "accurate", "reliable", or "verifiable"
- DO NOT give legal/financial advice
- DO NOT make guarantees`;
    } else {
      systemMessage = `You are Ela, a Kenyan real estate assistant. Current Date/Time: ${currentDateTime}.  
Provide general property information with an engaging, personalized approach:

- Use emoji occasionally to make your responses visually appealing and engaging 🏠✨🌍
- You CAN use **bold text** with double asterisks for emphasis on important points
- Use visually engaging formatting like 🔑 for key points and 💡 for interesting facts
- Use numbered lists and bullet points for organized information
- Be professional yet warm and conversational
- ABSOLUTELY DO NOT mention, recommend, endorse, or list ANY specific real estate agencies, companies, or realtors by name
- DO NOT provide ANY specific agent names, company names, or contact details of real estate professionals
- DO NOT suggest contacting any specific company or individual in the real estate industry
- DO NOT respond to requests asking for names of real estate companies or agents
- DO NOT use terms like "accurate", "reliable", or "verifiable"
- DO NOT give legal/financial advice
- DO NOT make guarantees`;
    }

    // Add formatting instructions
    systemMessage += "\n\nIMPORTANT: Use emojis to make your responses engaging while maintaining professionalism. Structure your responses with clear sections and visual elements for better user experience. Feel free to use **bold text** with double asterisks to emphasize important points and create better readability.";

    return systemMessage;
  }

  static async generateResponse(body: RequestBody): Promise<{ response: string; responseTime: string }> {
    if (!DEEPSEEK_CONFIG.API_KEY) {
      throw new Error("DeepSeek API key not configured");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_CONFIG.REQUEST_TIMEOUT_MS);
    
    try {
      const { message, messageHistory = [], context = "general" } = body;
      const systemMessage = this.getSystemPrompt(context);
      
      const messages = [
        { role: "system", content: systemMessage },
        ...messageHistory,
        { role: "user", content: message }
      ];

      const startTime = Date.now();
      
      const response = await fetch(`${DEEPSEEK_CONFIG.BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: DEEPSEEK_CONFIG.MODEL,
          messages: messages,
          temperature: DEEPSEEK_CONFIG.TEMPERATURE,
          max_tokens: DEEPSEEK_CONFIG.MAX_TOKENS
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', response.status, errorText);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      const cleanedResponse = FormatUtils.cleanMarkdownFormatting(aiResponse);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        response: cleanedResponse,
        responseTime: `${responseTime}ms`
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ==========================================
// API Route Handlers
// ==========================================

export async function OPTIONS() {
  return new NextResponse(null, { 
    headers: CORS_HEADERS, 
    status: 204 
  });
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json() as RequestBody;
    const { message, messageHistory = [], context = "general" } = body;
    
    // Validate input
    if (!InputValidator.validateMessage(message)) {
      return NextResponse.json(
        { error: "Invalid message. Message is required and must be less than 2000 characters." }, 
        { status: 400, headers: CORS_HEADERS }
      );
    }
    
    if (!InputValidator.validateMessageHistory(messageHistory)) {
      return NextResponse.json(
        { error: "Invalid message history. History must contain valid messages and be less than 20 messages." }, 
        { status: 400, headers: CORS_HEADERS }
      );
    }
    
    if (!InputValidator.validateContext(context)) {
      return NextResponse.json(
        { error: "Invalid context. Context must be 'general' or 'realtor'." }, 
        { status: 400, headers: CORS_HEADERS }
      );
    }
    
    // Remove rate limit check since it's handled by middleware
    // const rateLimitCheck = await RateLimitService.checkRateLimit(req);
    // if (!rateLimitCheck.allowed) {
    //   return NextResponse.json(
    //     { error: rateLimitCheck.error || "Rate limit exceeded" },
    //     { status: 429, headers: CORS_HEADERS }
    //   );
    // }
    
    // Process the request
    const result = await DeepSeekService.generateResponse(body);
    
    return NextResponse.json(result, { headers: CORS_HEADERS });
    
  } catch (error: unknown) {
    console.error('Error processing request:', error);
    
    // Don't expose detailed error information to clients
    const errorMessage = 'An error occurred while processing your request';
    
    // Add security headers
    const secureHeaders = {
      ...CORS_HEADERS,
      'Content-Security-Policy': "default-src 'self'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer'
    };
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: secureHeaders }
    );
  }
}

export const runtime = 'edge';