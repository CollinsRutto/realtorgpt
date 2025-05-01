import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { getTokenCount } from '@/utils/tokenCounter';

// Paths that should be metered
const METERED_PATHS = ['/api/chat', '/api/query'];

export async function middleware(request: NextRequest) {
  // Only meter specific API paths
  if (!METERED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get user ID from session
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Clone the request to read the body
  const requestClone = request.clone();
  let body;
  
  try {
    body = await requestClone.json();
  } catch (error) {
    body = {};
  }

  // Get the input text to count tokens
  const inputText = body.query || body.messages?.map((m: any) => m.content).join(' ') || '';
  const inputTokenCount = getTokenCount(inputText);

  // Store the request start time
  const requestStartTime = Date.now();

  // Process the request
  const response = await NextResponse.next();

  // Clone the response to read its body
  const responseClone = response.clone();
  let responseBody;
  
  try {
    responseBody = await responseClone.json();
  } catch (error) {
    responseBody = {};
  }

  // Get the response text to count tokens
  const outputText = responseBody.response || responseBody.content || '';
  const outputTokenCount = getTokenCount(outputText);

  // Calculate request duration
  const requestDuration = Date.now() - requestStartTime;

  // Log usage to database
  await supabase.from('usage_metrics').insert({
    user_id: userId,
    endpoint: request.nextUrl.pathname,
    input_tokens: inputTokenCount,
    output_tokens: outputTokenCount,
    total_tokens: inputTokenCount + outputTokenCount,
    duration_ms: requestDuration,
    timestamp: new Date().toISOString(),
  });

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};