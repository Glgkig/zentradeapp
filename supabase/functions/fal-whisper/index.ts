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
      return new Response(JSON.stringify({ error: 'FAL_KEY is not configured in secrets' }), {
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

    // Step 1: Upload audio to fal storage to get a URL
    const audioBytes = new Uint8Array(await audioFile.arrayBuffer())
    
    const uploadRes = await fetch('https://fal.ai/api/storage/upload', {
      method: 'PUT',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': audioFile.type || 'audio/webm',
      },
      body: audioBytes,
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Fal storage upload error:', uploadRes.status, errText)
      return new Response(JSON.stringify({ error: `Storage upload failed: ${uploadRes.status}`, details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const uploadData = await uploadRes.json()
    const audioUrl = uploadData.url
    console.log('Audio uploaded to fal storage:', audioUrl)

    // Step 2: Call whisper with the uploaded URL
    const whisperRes = await fetch('https://fal.run/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        task: 'transcribe',
        language: 'he',
        chunk_level: 'segment',
      }),
    })

    const whisperText = await whisperRes.text()
    console.log('Whisper response status:', whisperRes.status)
    console.log('Whisper response body:', whisperText)

    if (!whisperRes.ok) {
      return new Response(JSON.stringify({ error: `Whisper API error: ${whisperRes.status}`, details: whisperText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = JSON.parse(whisperText)
    const transcribedText = result.text || ''
    console.log('Transcribed text:', transcribedText)

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
