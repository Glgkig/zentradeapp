const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

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

    const audioBytes = new Uint8Array(await audioFile.arrayBuffer())
    const base64Audio = uint8ArrayToBase64(audioBytes)
    const dataUrl = `data:${audioFile.type || 'audio/webm'};base64,${base64Audio}`

    const whisperRes = await fetch('https://fal.run/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: dataUrl,
        task: 'transcribe',
      }),
    })

    if (!whisperRes.ok) {
      const errText = await whisperRes.text()
      console.error('Fal API error:', whisperRes.status, errText)
      return new Response(JSON.stringify({ error: `Fal API error: ${whisperRes.status}`, details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await whisperRes.json()

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
