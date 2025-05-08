import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

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

const RATE_LIMIT = {
  UNAUTHENTICATED_LIMIT: 4,
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
// Auth & Rate Limiting Module
// ==========================================

class AuthService {
  // Authenticate using Supabase session
  static async isAuthenticated(req: NextRequest): Promise<boolean> {
    try {
      // Get the auth cookie from the request
      const authCookie = req.cookies.get('sb-auth-token')?.value;
      
      if (!authCookie) {
        return false;
      }
      
      // Create a Supabase client with the auth cookie
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not configured');
        return false;
      }
      
      // Use the createClient function from @supabase/supabase-js
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${authCookie}`,
          },
        },
      });
      
      // Get the user session
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        console.error('Auth error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }
}

class RateLimitService {
  // Use Supabase to track rate limits
  static async getIpRequestCount(ip: string): Promise<number> {
    try {
      // Create Supabase client
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Get current timestamp for today
      const today = new Date().toISOString().split('T')[0];
      const key = `rate_limit:${ip}:${today}`;
      
      // Check if entry exists in KV store
      const { data, error } = await supabase
        .from('rate_limits')
        .select('count')
        .eq('key', key)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error('Error getting rate limit count:', error);
        return 0; // Default to 0 on error
      }
      
      return data?.count || 0;
    } catch (error) {
      console.error('Failed to get request count:', error);
      return 0; // Default to 0 on error
    }
  }

  static async incrementIpRequestCount(ip: string): Promise<void> {
    try {
      // Create Supabase client
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Get current timestamp for today
      const today = new Date().toISOString().split('T')[0];
      const key = `rate_limit:${ip}:${today}`;
      
      // Upsert the rate limit record
      const { error } = await supabase
        .from('rate_limits')
        .upsert(
          { 
            key, 
            count: 1,
            last_request: new Date().toISOString(),
            ip_address: ip
          },
          { 
            onConflict: 'key',
            update: { 
              count: supabase.sql('rate_limits.count + 1'),
              last_request: new Date().toISOString() 
            } 
          }
        );
      
      if (error) {
        console.error('Error incrementing rate limit count:', error);
      }
    } catch (error) {
      console.error('Failed to increment request count:', error);
    }
  }

  static async checkRateLimit(req: NextRequest): Promise<{ allowed: boolean; error?: string }> {
    try {
      const userIsAuthenticated = await AuthService.isAuthenticated(req);

      // Log authentication status
      console.log(`[RateLimit] User authenticated: ${userIsAuthenticated}`);

      // Authenticated users have higher rate limits
      if (userIsAuthenticated) {
        // You could implement tiered rate limiting here based on user subscription level
        return { allowed: true };
      }

      // Get IP address for rate limiting with fallbacks
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 
               req.headers.get('x-real-ip') || 
               req.ip || 
               'unknown';
      
      if (ip === 'unknown') {
        console.warn("Could not determine IP address for rate limiting.");
        // Allow the request to proceed, but log the warning
        return { allowed: true };
      }

      const currentCount = await this.getIpRequestCount(ip);
      
      // Log current request count
      console.log(`[RateLimit] IP: ${ip}, Count: ${currentCount}`);
      
      // Check if user has exceeded the limit
      if (currentCount >= RATE_LIMIT.UNAUTHENTICATED_LIMIT) {
        // Log rate limit exceeded
        console.warn(`[RateLimit] Rate limit exceeded for IP: ${ip}`);
        return { 
          allowed: false, 
          error: "Loving our research? Please sign in to continue & access more value." 
        };
      }

      // Increment count for the next request
      await this.incrementIpRequestCount(ip);
      return { allowed: true };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed but log the error
      return { allowed: true };
    }
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

export async function POST(request: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Process the request and interact with Deepseek API
    const result = await DeepSeekService.generateResponse(requestBody);
    
    return NextResponse.json(result, { headers: CORS_HEADERS });
    
  } catch (error: unknown) {
    console.error('Error processing request:', error);
    
    // Structured error handling with security in mind
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out' },
          { status: 504, headers: CORS_HEADERS } // Gateway Timeout
        );
      }
      
      if (error.message.includes('DeepSeek API key')) {
        // Don't expose internal error details to clients
        const safeErrorMessage = error.message.includes('API key') ?
          'Authentication error with external service' :
          'An unexpected error occurred';
          
        return NextResponse.json(
          { error: safeErrorMessage },
          { headers: CORS_HEADERS, status: 500 }
        );
      }
    }
    
    // Generic error handler
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';