import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract chatbot ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatbotId = pathParts[pathParts.length - 1];

    if (!chatbotId || chatbotId === 'chat') {
      return new Response(JSON.stringify({ error: 'Chatbot ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Look up chatbot configuration
    const { data: chatbotConfig, error: dbError } = await supabase
      .from('chatbot_configs')
      .select('webhook_url, name')
      .eq('id', chatbotId)
      .single();

    if (dbError || !chatbotConfig) {
      console.error('Chatbot not found:', chatbotId, dbError);
      return new Response(JSON.stringify({ error: 'Chatbot not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!chatbotConfig.webhook_url) {
      console.error('No webhook URL configured for chatbot:', chatbotId);
      return new Response(JSON.stringify({ error: 'Chatbot not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the request body
    const requestBody = await req.json();
    
    // Add chatbot metadata to the request
    const enhancedPayload = {
      ...requestBody,
      chatbotId,
      chatbotName: chatbotConfig.name,
      timestamp: new Date().toISOString()
    };

    console.log('Routing message for chatbot:', chatbotId, 'to webhook:', chatbotConfig.webhook_url);

    // Forward request to n8n webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const webhookResponse = await fetch(chatbotConfig.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!webhookResponse.ok) {
        console.error('Webhook responded with error:', webhookResponse.status, webhookResponse.statusText);
        return new Response(JSON.stringify({ 
          error: 'Webhook service unavailable',
          details: `HTTP ${webhookResponse.status}` 
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const webhookData = await webhookResponse.json();
      
      console.log('Successfully routed message for chatbot:', chatbotId);
      
      return new Response(JSON.stringify(webhookData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('Webhook timeout for chatbot:', chatbotId);
        return new Response(JSON.stringify({ error: 'Webhook timeout' }), {
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.error('Error calling webhook for chatbot:', chatbotId, error);
      return new Response(JSON.stringify({ 
        error: 'Failed to reach webhook service',
        details: error.message 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in chat routing function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});