/**
 * Debug endpoint to check ESRI configuration
 * GET /api/debug/esri-config
 * 
 * This helps diagnose why ESRI might not be working
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isESRIConfigured, getESRIAuthMethod, getOAuthToken } from '../_lib/esri';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Check what environment variables are set (without exposing values)
  const hasApiKey = !!process.env.ESRI_API_KEY;
  const hasClientId = !!process.env.ESRI_CLIENT_ID;
  const hasClientSecret = !!process.env.ESRI_CLIENT_SECRET;
  
  // Check the configured method
  const isConfigured = isESRIConfigured();
  const authMethod = getESRIAuthMethod();
  
  // Check for common issues
  const issues: string[] = [];
  
  if (!isConfigured) {
    issues.push('No ESRI credentials configured');
    if (!hasApiKey) issues.push('ESRI_API_KEY not set');
    if (!hasClientId) issues.push('ESRI_CLIENT_ID not set');
    if (!hasClientSecret) issues.push('ESRI_CLIENT_SECRET not set');
  }
  
  if (hasClientId && !hasClientSecret) {
    issues.push('ESRI_CLIENT_ID is set but ESRI_CLIENT_SECRET is missing');
  }
  
  if (hasClientSecret && !hasClientId) {
    issues.push('ESRI_CLIENT_SECRET is set but ESRI_CLIENT_ID is missing');
  }

  // Try to get an OAuth token if using OAuth
  let oauthTestResult: { success: boolean; error?: string; tokenPreview?: string } | null = null;
  
  if (authMethod === 'oauth') {
    try {
      const token = await getOAuthToken();
      oauthTestResult = {
        success: true,
        tokenPreview: token.substring(0, 10) + '...' + token.substring(token.length - 5),
      };
    } catch (error) {
      oauthTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      issues.push(`OAuth token fetch failed: ${oauthTestResult.error}`);
    }
  }
  
  return res.status(200).json({
    isConfigured,
    authMethod,
    credentials: {
      hasApiKey,
      hasClientId,
      hasClientSecret,
      // Show partial values for debugging (first 4 chars only)
      apiKeyPreview: hasApiKey ? process.env.ESRI_API_KEY?.substring(0, 4) + '...' : null,
      clientIdPreview: hasClientId ? process.env.ESRI_CLIENT_ID?.substring(0, 4) + '...' : null,
    },
    oauthTest: oauthTestResult,
    issues: issues.length > 0 ? issues : null,
    recommendation: !isConfigured 
      ? 'Add ESRI_API_KEY or both ESRI_CLIENT_ID + ESRI_CLIENT_SECRET to Vercel environment variables'
      : issues.length > 0
        ? 'Check the issues listed above'
        : 'ESRI is properly configured!',
  });
}

