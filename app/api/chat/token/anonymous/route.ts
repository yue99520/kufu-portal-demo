import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';

const kufuOrigin = process.env.NEXT_PUBLIC_WIDGET_ORIGIN;
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body) {
      return new Response('Missing body', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const payload = { 
      client_id: body.clientId, 
      client_secret: body.clientSecret, 
      user_id: randomUUID(), 
      user_name: 'Anonymous - ' + randomUUID(),
      user_avatar_url: undefined,
    };

    const res = await fetch(`${kufuOrigin}/api/widget/portal/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return new Response(`Error from sign API: ${res.statusText}`, {
        status: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const {
      exp,
      channel_name,
      token,
    } = await res.json();

    return new Response(JSON.stringify({
      exp,
      channel_name,
      token,
      user_name: payload.user_name,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error forwarding request:', err);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
