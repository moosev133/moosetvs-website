import {createAuthService,authErrorKey} from './auth-service.mjs';
import {t,localPath} from './site.js';
import './demos.js';
import './motion.js';
import './project-reel.js';
const config=JSON.parse(document.getElementById('auth-config').textContent);
const form=document.querySelector('[data-auth-form]');
const protectedPage=document.querySelector('[data-account-content]');
const status=document.getElementById('auth-status');
const say=(text,error=false,target=status)=>{if(target){target.textContent=t(text);target.dataset.error=String(error);}};
const publicPage=!form&&!protectedPage;
document.querySelector('[data-show-password]')?.addEventListener('click',e=>{const button=e.currentTarget,input=form.elements.password;const show=input.type==='password';input.type=show?'text':'password';button.setAttribute('aria-pressed',String(show));button.textContent=t(show?'Hide':'Show');});
if(!config.url||!config.key){
 say('Accounts are being prepared. Please contact moosetvs1@gmail.com for now.');
 if(protectedPage)location.replace(localPath('sign-in'));
}else{
 const {createClient}=await import('@supabase/supabase-js');
 const client=createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
 const service=createAuthService(client,location.origin);
 const account=()=>location.assign(localPath('account'));
 let currentUser=null;
 let recoveryEvent=false;
 const setLinks=user=>document.querySelectorAll('[data-account-link]').forEach(a=>{a.textContent=t(user?'Account':'Sign In');a.href=localPath(user?'account':'sign-in');});
 const hideAccount=()=>{if(protectedPage)protectedPage.hidden=true;document.querySelector('[data-signout]')?.setAttribute('hidden','');};
 // Never trust cached user metadata to authorize account access. getUser verifies it remotely.
 async function verifyAccount(){
  try{currentUser=await service.user();}catch{currentUser=null;}
  if(!currentUser){hideAccount();location.replace(localPath('sign-in'));return;}
  renderAccount(currentUser);
 }
 function renderAccount(user){
  currentUser=user;document.querySelector('[data-user-name]').textContent=user.user_metadata?.display_name||t('Your account');
  document.querySelector('[data-user-email]').textContent=user.email||'';
  document.querySelector('[name=display_name]').value=user.user_metadata?.display_name||'';
  protectedPage.hidden=false;document.querySelector('[data-signout]').hidden=false;say('');setLinks(user);
 }
 client.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY')recoveryEvent=true;
  if(event==='SIGNED_OUT'){currentUser=null;setLinks(null);hideAccount();if(protectedPage)location.replace(localPath('sign-in'));}
  // Avoid awaiting Supabase calls inside its state-change lock.
  if(event==='TOKEN_REFRESHED'&&protectedPage)setTimeout(verifyAccount,0);
 });
 async function init(){
  try{
   const {error}=await client.auth.getSession(); // Completes code exchange and removes callback credentials from the URL.
   const params=new URLSearchParams(location.search),hash=new URLSearchParams(location.hash.slice(1));
   if(error||params.has('error')||hash.has('error')){say(authErrorKey(error||{code:'otp_expired'}),true);if(form?.dataset.authForm!=='reset-password')form?.querySelector('fieldset').removeAttribute('disabled');return;}
   if(protectedPage){await verifyAccount();return;}
   try{currentUser=await service.user();}catch{currentUser=null;}
   setLinks(currentUser);
   if(form?.dataset.authForm==='reset-password'){
    if(!currentUser){say('This link or session has expired. Request a new reset link.',true);return;}
    // Supabase verifies the recovery code / authenticated session before updateUser accepts a password.
    say('Choose a stronger password with at least 12 characters.');
   }else if(currentUser&&['sign-in','sign-up'].includes(form?.dataset.authForm)&&!recoveryEvent){account();return;}
   else say('');
   form?.querySelector('fieldset').removeAttribute('disabled');
  }catch{say('We couldn’t connect. Check your connection and try again.',true);form?.querySelector('fieldset').removeAttribute('disabled');}
 }
 form?.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const mode=form.dataset.authForm,values=new FormData(form),fieldset=form.querySelector('fieldset');
  if(mode==='reset-password'&&values.get('password')!==values.get('confirm_password')){say('The passwords do not match.',true);return;}
  fieldset.disabled=true;say('Please wait…');
  try{
   if(mode==='sign-in'){await service.signIn(values.get('email'),values.get('password'));await service.user();account();}
   if(mode==='sign-up'){const result=await service.signUp(values.get('email'),values.get('password'),values.get('name'),localPath('account'));if(result.session)account();else{say('Check your email to confirm your account. If you already have an account, sign in.');form.reset();}}
   if(mode==='forgot-password'){await service.reset(values.get('email'),localPath('reset-password'));say('If that email can receive a reset link, you’ll find it in your inbox. Open it in this browser.');form.reset();}
   if(mode==='reset-password'){await service.user();await service.updatePassword(values.get('password'));await service.signOut();form.reset();say('Your password has been updated. You can now sign in.');form.hidden=true;}
  }catch(error){say(authErrorKey(error),true);}finally{fieldset.disabled=false;}
 });
 document.querySelector('[data-signout]')?.addEventListener('click',async e=>{e.currentTarget.disabled=true;try{await service.signOut();hideAccount();location.replace(localPath('sign-in'));}catch(error){say(authErrorKey(error),true);e.currentTarget.disabled=false;}});
 document.querySelector('[data-profile-form]')?.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.currentTarget,button=f.querySelector('[type=submit]'),s=f.querySelector('.form-status');button.disabled=true;
  try{await service.user();renderAccount(await service.updateName(f.elements.display_name.value));say('Your changes are saved.',false,s);}catch(error){say(authErrorKey(error),true,s);}finally{button.disabled=false;}
 });
 document.querySelector('[data-reset-account]')?.addEventListener('click',async e=>{
  const s=e.currentTarget.closest('form').querySelector('.form-status');e.currentTarget.disabled=true;
  try{const user=await service.user();await service.reset(user.email,localPath('reset-password'));say('If that email can receive a reset link, you’ll find it in your inbox. Open it in this browser.',false,s);}catch(error){say(authErrorKey(error),true,s);}finally{e.currentTarget.disabled=false;}
 });
 document.addEventListener('visibilitychange',()=>{if(protectedPage&&document.visibilityState==='visible')verifyAccount();});
 window.addEventListener('pageshow',e=>{if(e.persisted&&protectedPage){hideAccount();verifyAccount();}});
 if(publicPage){client.auth.getSession().then(({data})=>setLinks(data.session?.user)).catch(()=>{});}else init();
}
