import {LOGO_SITE} from '../../lib/logos';
export const dynamic='force-static';
export function GET(){
  return new Response(Buffer.from(LOGO_SITE,'base64'),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400, stale-while-revalidate=604800'}});
}
