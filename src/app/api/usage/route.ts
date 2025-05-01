import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  // Get user ID from session
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get current month usage
  const { data: currentMonthUsage, error: currentMonthError } = await supabase.rpc(
    'get_current_month_usage',
    { user_uuid: userId }
  );

  if (currentMonthError) {
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }

  // Get daily usage for the past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: dailyUsage, error: dailyUsageError } = await supabase
    .from('user_usage_summary')
    .select('*')
    .eq('user_id', userId)
    .gte('day', thirtyDaysAgo.toISOString())
    .order('day', { ascending: false });

  if (dailyUsageError) {
    return NextResponse.json(
      { error: 'Failed to fetch daily usage data' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    currentMonth: currentMonthUsage[0] || {
      total_tokens: 0,
      input_tokens: 0,
      output_tokens: 0,
      request_count: 0
    },
    dailyUsage: dailyUsage || []
  });
}