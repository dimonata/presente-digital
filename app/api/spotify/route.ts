import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ tracks: [] }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Credenciais do Spotify não configuradas no .env' }, { status: 500 });
  }

  try {
    // 1. Pede o Token de Acesso ao Spotify
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Faz a busca pela música informada pelo usuário
    const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const searchData = await searchResponse.json();

    // Mapeia os dados para entregar um formato limpo ao front-end
    const tracks = searchData.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      albumCover: track.album.images[0]?.url || '',
      previewUrl: track.preview_url
    }));

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error('Erro na API do Spotify:', error);
    return NextResponse.json({ error: 'Erro ao buscar músicas' }, { status: 500 });
  }
}