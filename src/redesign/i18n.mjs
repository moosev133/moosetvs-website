import en from '../locales/en.json' with {type:'json'};
import he from '../locales/he.json' with {type:'json'};
import ar from '../locales/ar.json' with {type:'json'};
import {esc} from './layout.mjs';
export const catalogs={en,he,ar};
export const usedMessages=new Set();
export function context(lang){
 if(!catalogs[lang])throw new Error(`Unknown locale ${lang}`);
 const text=key=>{if(/^[\d:]+$/.test(key))return key;usedMessages.add(key);const value=catalogs[lang][key];if(value===undefined)throw new Error(`Missing ${lang} translation: ${key}`);return value;};
 return {lang,text,t:key=>esc(text(key))};
}
