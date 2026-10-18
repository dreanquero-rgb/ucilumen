import { clearSessionCookie } from '../../lib/auth.js';

export async function onRequest(context) {
  return new Response(null, { status: 302, headers: { Location: '/admin/login', 'Set-Cookie': clearSessionCookie() } });
}
