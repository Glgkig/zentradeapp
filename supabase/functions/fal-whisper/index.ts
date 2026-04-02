import { corsHeaders } from '@supabase/supabase-js/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const FAL_KEY = Deno.env.get('FAL_KEY')
    if (!FAL_KEY) {
      return new Response(JSON.stringify({ error: 'FAL_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Upload audio to fal storage
    const uploadRes = await fetch('https://fal.run/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: `data:${audioFile.type};base64,${btoa(String.fromCharCode(...new Uint8Array(await audioFile.arrayBuffer())))}`,
        task: 'transcribe',
      }),
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Fal API error:', uploadRes.status, errText)
      return new Response(JSON.stringify({ error: `Fal API error: ${uploadRes.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await uploadRes.json()

    return new Response(JSON.stringify({ text: result.text || '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
