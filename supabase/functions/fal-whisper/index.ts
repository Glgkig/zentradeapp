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

    // Step 1: Convert data URL to binary
    const [header, base64Data] = audio_url.split(',')
    const mimeMatch = header.match(/data:(audio\/[^;]+)/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm'
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    // Step 2: Upload to Fal storage
    const uploadRes = await fetch('https://fal.run/fal-ai/upload', {
      method: 'PUT',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': mimeType,
      },
      body: bytes,
    })

    let fileUrl: string

    if (uploadRes.ok) {
      const uploadData = await uploadRes.json()
      fileUrl = uploadData.url || uploadData.file_url
      console.log('Uploaded to Fal storage:', fileUrl)
    } else {
      // Fallback: try the REST upload endpoint
      const restUploadRes = await fetch('https://rest.alpha.fal.ai/storage/upload', {
        method: 'PUT',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': mimeType,
        },
        body: bytes,
      })

      if (!restUploadRes.ok) {
        const errText = await restUploadRes.text()
        console.error('Upload failed:', restUploadRes.status, errText)
        return new Response(JSON.stringify({ error: 'Failed to upload audio', details: errText }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const restData = await restUploadRes.json()
      fileUrl = restData.url || restData.file_url
      console.log('Uploaded via REST:', fileUrl)
    }

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: 'No URL returned from upload' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Step 3: Call Whisper with the uploaded file URL
    const whisperRes = await fetch('https://fal.run/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: fileUrl,
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
