import { NextRequest, NextResponse } from 'next/server';
import { applyProfileFilter } from './profileMiddleware';

/**
 * Higher-order function to wrap API handlers with profile-based content filtering
 */
export function withContentFilter(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Call the original handler
      const result = await handler(request, ...args);
      
      // If the result contains data that should be filtered
      if (result.data && Array.isArray(result.data)) {
        const filtered = await applyProfileFilter(request, result.data);
        result.data = filtered.filtered;
        
        // Add metadata about filtering
        const filterObj = filtered.filter as any;
        result.meta = {
          ...result.meta,
          contentFiltered: filtered.blocked.length > 0,
          blockedCount: filtered.blocked.length,
          activeProfile: filtered.profile?.name || 'Unknown',
          filterApplied: filterObj
        };
      }

      return result;
    } catch (error) {
      console.error('Content filter middleware error:', error);
      throw error;
    }
  };
}

/**
 * Apply content filtering to search results
 */
export async function filterSearchResults(
  request: NextRequest,
  results: any[]
) {
  const filtered = await applyProfileFilter(request, results);
  return {
    filtered: filtered.filtered,
    blocked: filtered.blocked,
    filter: filtered.filter
  };
}

/**
 * Check if specific content should be blocked
 */
export async function shouldBlockContent(
  request: NextRequest,
  content: any
): Promise<{ blocked: boolean; reasons: string[] }> {
  try {
    const filtered = await applyProfileFilter(request, [content]);
    const blockedItem = filtered.blocked.find((item: any) => item.id === content.id);
    
    if (blockedItem) {
      const filterReasons = (filtered.filter as any)?.reasons || [];
      return {
        blocked: true,
        reasons: filterReasons.length > 0 ? [filterReasons[0] || 'Content not allowed'] : ['Content not allowed']
      };
    }
    
    return { blocked: false, reasons: [] };
  } catch (error) {
    console.error('Content block check error:', error);
    return { blocked: false, reasons: [] };
  }
}
