// This adapter uses a real Supabase client in production. Tests inject a contract stub.
export function createAuthService(client,origin){
 const callback=path=>new URL(path,origin).href;
 return {
  async user(){const {data,error}=await client.auth.getUser();if(error)throw error;return data.user;},
  async signIn(email,password){const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;return data;},
  async signUp(email,password,name,path){if(password.length<12)throw new Error('password_too_short');if(!name.trim())throw new Error('name_required');const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:name.trim().slice(0,80)},emailRedirectTo:callback(path)}});if(error)throw error;return data;},
  async reset(email,path){const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:callback(path)});if(error)throw error;},
  async updatePassword(password){if(password.length<12)throw new Error('password_too_short');const {error}=await client.auth.updateUser({password});if(error)throw error;},
  async updateName(name){const value=name.trim().slice(0,80);if(!value)throw new Error('name_required');const {data,error}=await client.auth.updateUser({data:{display_name:value}});if(error)throw error;return data.user;},
  async signOut(){const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;}
 };
}
export function authErrorKey(error){
 const code=error?.code||error?.message;
 if(['invalid_credentials','invalid_grant'].includes(code))return 'The email or password is incorrect.';
 if(code==='email_not_confirmed')return 'Check your email to confirm your account before signing in.';
 if(['over_email_send_rate_limit','over_request_rate_limit','request_timeout'].includes(code))return 'Too many attempts. Please wait a little and try again.';
 if(['weak_password','password_too_short'].includes(code))return 'Choose a stronger password with at least 12 characters.';
 if(code==='same_password')return 'Choose a password you have not used before.';
 if(['otp_expired','flow_state_expired','flow_state_not_found','bad_code_verifier','session_not_found','refresh_token_not_found'].includes(code))return 'This link or session has expired. Request a new reset link.';
 if(code==='signup_disabled')return 'New accounts are not available right now. Please contact us.';
 if(code==='name_required')return 'Please enter your name.';
 if(code==='email_address_not_authorized'||code==='unexpected_failure')return 'Email delivery is unavailable right now. Please contact us.';
 if(code==='user_already_exists')return 'If an account exists, sign in or request a password reset.';
 if(error?.name==='AuthRetryableFetchError'||error instanceof TypeError)return 'We couldn’t connect. Check your connection and try again.';
 return 'We couldn’t complete that request. Please try again or contact us.';
}
