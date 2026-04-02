const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
      return new Response(JSON.stringify({ error: 'Invalid or missing audio_url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Convert data URL to binary
    const [header, base64Data] = audio_url.split(',')
    const mimeMatch = header.match(/data:(audio\/[^;]+)/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm'
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    // Upload to Fal storage using their CDN upload endpoint
    const uploadRes = await fetch('https://fal.ai/api/storage/upload', {
      method: 'PUT',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': mimeType,
      },
      body: bytes,
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Fal upload failed:', uploadRes.status, errText)
      
      // Fallback: try the REST API upload endpoint
      const formData = new FormData()
      const blob = new Blob([bytes], { type: mimeType })
      formData.append('file', blob, 'audio.webm')
      
      const restRes = await fetch('https://fal.ai/api/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
        },
        body: formData,
      })

      if (!restRes.ok) {
        const restErr = await restRes.text()
        console.error('Fal REST upload also failed:', restRes.status, restErr)
        return new Response(JSON.stringify({ error: 'Failed to upload audio', details: restErr }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const restData = await restRes.json()
      const fileUrl = restData.url || restData.file_url || restData.access_url
      if (!fileUrl) {
        return new Response(JSON.stringify({ error: 'No URL from upload', data: restData }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      return await callWhisper(FAL_KEY, fileUrl, corsHeaders)
    }

    const uploadData = await uploadRes.json()
    const fileUrl = uploadData.url || uploadData.file_url || uploadData.access_url
    console.log('Uploaded to Fal:', fileUrl)

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: 'No URL from upload', data: uploadData }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return await callWhisper(FAL_KEY, fileUrl, corsHeaders)
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function callWhisper(falKey: string, audioUrl: string, headers: Record<string, string>) {
  console.log('Calling Whisper with URL:', audioUrl)
  
  const whisperRes = await fetch('https://fal.run/fal-ai/whisper', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey}`,
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
  console.log('Whisper status:', whisperRes.status)
  console.log('Whisper body:', whisperText.substring(0, 500))

  if (!whisperRes.ok) {
    return new Response(JSON.stringify({ error: `Whisper API error ${whisperRes.status}`, details: whisperText }), {
      status: 502,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const result = JSON.parse(whisperText)
  const transcribedText = result.text || ''
  console.log('Transcribed:', transcribedText)

  return new Response(JSON.stringify({ text: transcribedText }), {
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}
