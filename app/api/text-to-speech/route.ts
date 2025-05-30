import { NextResponse } from 'next/server';

type VoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
};

export async function POST(request: Request) {
  try {
    const { text, voice_id, language, emotion } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!voice_id) {
      return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 });
    }

    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
    if (!ELEVEN_LABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key is not configured' },
        { status: 500 }
      );
    }

    // Configure voice settings based on emotion
    let voiceSettings: VoiceSettings;
    
    switch(emotion) {
      case 'excited':
        voiceSettings = {
          stability: 0.3,
          similarity_boost: 0.85,
          style: 1.0,
          use_speaker_boost: true
        };
        break;
      case 'happy':
        voiceSettings = {
          stability: 0.4,
          similarity_boost: 0.75,
          style: 0.8,
          use_speaker_boost: true
        };
        break;
      case 'sad':
        voiceSettings = {
          stability: 0.7,
          similarity_boost: 0.65,
          style: 0.3,
          use_speaker_boost: false
        };
        break;
      case 'angry':
        voiceSettings = {
          stability: 0.3,
          similarity_boost: 0.85,
          style: 0.7,
          use_speaker_boost: true
        };
        break;
      case 'loving':
        voiceSettings = {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.6,
          use_speaker_boost: true
        };
        break;
      default:
        voiceSettings = {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        };
    }

    const options = {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
        language
      }),
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      options
    );

    if (!response.ok) {
      throw new Error('Failed to convert text to speech');
    }

    const audioData = await response.arrayBuffer();
    
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to convert text to speech' },
      { status: 500 }
    );
  }
} 