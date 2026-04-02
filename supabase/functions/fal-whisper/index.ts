const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const FAL_KEY = Deno.env.get('FAL_KEY')
    if (!FAL_KEY) {
      return new Response(JSON.stringify({ error: 'FAL_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { audio_url } = await req.json()
    if (!audio_url || !audio_url.startsWith('data:audio/')) {
      return new Response(JSON.stringify({ error: 'Invalid or missing audio_url. Must be a data:audio/... Data URL.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Calling Whisper with data URL length:', audio_url.length)

    const whisperRes = await fetch('https://fal.run/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audio_url,
        task: 'transcribe',
        language: 'he',
        chunk_level: 'segment',
      }),
    })

    const whisperText = await whisperRes.text()
    console.log('Whisper status:', whisperRes.status)
    console.log('Whisper body:', whisperText.substring(0, 500))

    if (!whisperRes.ok) {
      return new Response(JSON.stringify({ error: `Whisper API error ${whisperRes.status}`, details: whisperText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = JSON.parse(whisperText)
    const transcribedText = result.text || ''
    console.log('Transcribed:', transcribedText)

    return new Response(JSON.stringify({ text: transcribedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
