import { NextRequest, NextResponse } from 'next/server';

// --- Placeholder Imports (Replace with your actual KV/Auth libraries) ---
// import { kv } from "@vercel/kv"; // Example for Vercel KV
// import { checkAuth } from "@/lib/auth"; // Example auth check function
// -----------------------------------------------------------------------

// DeepSeek API integration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = "https://api.deepseek.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Placeholder Functions (Implement with your KV store and Auth logic) ---

// Placeholder: Replace with your actual authentication check
async function isAuthenticated(req: NextRequest): Promise<boolean> {
  // Example: Check for an Authorization header or session cookie
  // const token = req.headers.get('Authorization')?.split(' ')[1];
  // return !!token && await verifyToken(token); // Replace with actual verification
  console.warn("Using placeholder isAuthenticated function");
  return false; // Default to not authenticated for this example
}

// Placeholder: Get request count for an IP from your KV store
async function getIpRequestCount(ip: string): Promise<number> {
  console.warn("Using placeholder getIpRequestCount function");
  // Example with Vercel KV:
  // const count = await kv.get<number>(`rate_limit_${ip}`);
  // return count ?? 0;
  // Replace with actual KV store logic
  return 0; // Default count
}

// Placeholder: Increment request count for an IP in your KV store
async function incrementIpRequestCount(ip: string): Promise<void> {
  console.warn("Using placeholder incrementIpRequestCount function");
  // Example with Vercel KV (set expiration, e.g., 24 hours):
  // const key = `rate_limit_${ip}`;
  // await kv.incr(key);
  // await kv.expire(key, 60 * 60 * 24); // Expire after 24 hours
  // Replace with actual KV store logic
}

// --- End Placeholder Functions ---


function getCurrentEAT() {
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

// Function to preserve bold formatting while removing other markdown
function cleanMarkdownFormatting(text: string): string {
  // Keep bold formatting (**text**) but remove other markdown elements
   
  // Remove markdown headers (#, ##, etc.)
  let cleanedText = text.replace(/^#+\s+/gm, '');
   
  // Remove italic formatting (*text*) but only if it's not part of bold (**text**)
  // This regex looks for single asterisks that aren't part of double asterisks
  cleanedText = cleanedText.replace(/(?<!\*)\*(?!\*)([^\*]+)(?<!\*)\*(?!\*)/g, '$1');
   
  // Keep bold formatting (**text**)
   
  return cleanedText;
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    headers: corsHeaders, 
    status: 204 
  });
}

export async function POST(req: NextRequest) {
  // --- Rate Limiting Logic ---
  const userIsAuthenticated = await isAuthenticated(req);

  if (!userIsAuthenticated) {
    // Get IP address (Note: 'x-forwarded-for' is common in edge environments)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || 'unknown';

    if (ip !== 'unknown') {
      const currentCount = await getIpRequestCount(ip);
      const usageLimit = 4; // Allow 4 requests for unauthenticated users

      if (currentCount >= usageLimit) {
        return NextResponse.json(
          { error: "Loving our research? Please sign in to continue & access more value." },
          { status: 429, headers: corsHeaders } // 429 Too Many Requests
        );
      }
      // Increment count for the next request (do this *before* processing)
      await incrementIpRequestCount(ip);
    } else {
      // Handle cases where IP is not determinable, maybe block or allow?
      console.warn("Could not determine IP address for rate limiting.");
      // Optionally, return an error if IP is required for limiting
      // return NextResponse.json({ error: "Could not identify request source." }, { status: 400 });
    }
  }
  // --- End Rate Limiting Logic ---


  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: "DeepSeek API key not configured" },
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
    
    const { message, messageHistory = [], context = "general" } = await req.json();
    const currentDateTime = getCurrentEAT();

    // Define the system message based on context
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
- DO NOT make guarantees

Instead, provide general market information, property features, and real estate concepts in an engaging way.
Direct legal requests to qualified lawyers. Politely decline all requests for specific service provider details.
Focus on market trends and property details without recommending specific service providers.`;
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
- DO NOT make guarantees

Instead, provide general market information, property features, and real estate concepts in an engaging way.
Direct legal requests to qualified lawyers. Politely decline all requests for specific service provider details.
Focus on market trends and property details without recommending specific service providers.`;
    }

    // Add explicit instructions to use emojis and bolding
    systemMessage += "\n\nIMPORTANT: Use emojis to make your responses engaging while maintaining professionalism. Structure your responses with clear sections and visual elements for better user experience. Feel free to use **bold text** with double asterisks to emphasize important points and create better readability.";

    const messages = [
      { role: "system", content: systemMessage },
      ...messageHistory,
      { role: "user", content: message }
    ];

    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status}` },
        { headers: corsHeaders, status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const cleanedResponse = cleanMarkdownFormatting(aiResponse);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return NextResponse.json(
      { 
        response: cleanedResponse,
        responseTime: `${responseTime}ms`
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out' },
        { status: 504, headers: corsHeaders }
      );
    }
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { headers: corsHeaders, status: 500 }
    );
  }
}

export const runtime = 'edge';

// REMOVE THE FOLLOWING CODE:
/*
export async function POST(request: Request) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
    
    const body = await request.json();
    
    // Process request with timeout
    const result = await processDeepSeekRequest(body, { signal: controller.signal });
    
    clearTimeout(timeoutId);
    return NextResponse.json(result);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out' },
        { status: 504 } // Gateway Timeout
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function processDeepSeekRequest(body: any, options?: { signal?: AbortSignal }) {
  // ... existing implementation ...
}
*/