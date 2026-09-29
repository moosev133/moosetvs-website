export function authConfig(env=process.env){
 const url=env.SUPABASE_URL||'';
 const key=env.SUPABASE_PUBLISHABLE_KEY||env.SUPABASE_ANON_KEY||'';
 if(Boolean(url)!==Boolean(key))throw new Error('Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or neither.');
 if(url){const parsed=new URL(url);if(parsed.protocol!=='https:'||!parsed.hostname.endsWith('.supabase.co')||parsed.pathname!=='/'||parsed.search||parsed.hash||parsed.username||parsed.password)throw new Error('Use the HTTPS Supabase project URL.');}
 if(key&&!key.startsWith('sb_publishable_')){let claims;try{claims=JSON.parse(Buffer.from(key.split('.')[1],'base64url'));}catch{}if(claims?.role!=='anon')throw new Error('Only a public publishable / anon key is allowed. Never use a service-role or secret key.');}
 return {url,key};
}
