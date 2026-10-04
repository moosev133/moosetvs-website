// Real projects, distinct from the fictional interactive concepts in data.mjs.
// Only approved public destinations belong here; never link to private dashboards.
const shot=(file,alt,caption,mobile=false)=>({src:`/images/work/${file}`,alt,caption,mobile});
const base={kind:'real',featured:true,year:2026,demoUrl:null,githubUrl:null};
export const realProjects=[
 {
  ...base,title:'Moose Engine',slug:'moose-engine',category:'Custom Software',status:'Custom-built bot',visual:'engine',
  shortDescription:'A custom MQL5 trading bot, built for MetaTrader 5.',
  fullDescription:'Moose Engine is the portfolio name for our custom MQL5 / MetaTrader 5 bot project. It brings a trading workflow into software inside the trading terminal—a focused example of specialist automation development.',
  technologies:['MQL5','MetaTrader 5','Expert Advisor'],
  highlights:['Native MQL5 development','MetaTrader 5 environment','Specialist automation'],
  note:'Engineering showcase only. The artwork is an illustration, not a terminal screenshot or verified trading result. Trading involves risk; no returns are promised.',
  screenshots:[shot('moose-engine.svg','Moose Engine illustration connecting MQL5 development to a MetaTrader 5 bot','Original project illustration · not a trading-results screenshot')]
 },
 {
  ...base,title:'Aurum',slug:'aurum',category:'AI Automation',status:'Built application',visual:'aurum',
  shortDescription:'Twelve research perspectives. One beautifully organized workspace.',
  fullDescription:'Aurum is a multi-market paper-research application adapted from TradingAgents. Specialist analysts, opposing research views and risk reviewers feed a recorded decision. A custom dashboard brings the agent room, signal history and deterministic outcome tracking together.',
  technologies:['Python','FastAPI','TradingAgents','SQLite','JavaScript'],
  highlights:['Twelve-role research workflow','Recorded evidence and decisions','Multi-market dashboard and reports'],
  note:'Paper research only: no broker connection or real-money execution. These genuine interface captures use an isolated, empty workspace with integrations disabled. They do not show investment performance. Built on the open-source TradingAgents project.',
  screenshots:[shot('aurum-agents.jpg','Aurum agent room showing specialist research roles','The agent room · actual application, isolated portfolio workspace'),shot('aurum-overview.jpg','Aurum overview with market selection and research navigation','The overview · actual application, integrations disabled')]
 },
 {
  ...base,title:'ReeMove',slug:'reemove',category:'Mobile App',status:'App in development',visual:'reemove',
  shortDescription:'A sports community built around how you move.',
  fullDescription:'ReeMove brings sports profiles, community content, nearby discovery, events, challenges and messaging into a Flutter application backed by Firebase. Its welcoming identity and cross-platform interface connect the product around one idea: move together, grow stronger.',
  technologies:['Flutter','Dart','Firebase','Riverpod'],
  highlights:['Sports profiles and communities','Nearby discovery and events','Messaging and activity features'],
  note:'Application project in development, not an announced app-store release. Images show the actual welcome and account-creation interfaces. No customer account or private profile data is displayed.',
  screenshots:[shot('reemove-welcome.jpg','ReeMove desktop welcome screen with green sports-community branding','Actual ReeMove welcome screen'),shot('reemove-mobile.jpg','ReeMove mobile welcome screen','The mobile welcome experience',true),shot('reemove-onboarding.jpg','ReeMove mobile account-creation interface with empty fields','Creating a sports identity · actual app interface',true)]
 },
 {
  ...base,title:'Saleh Solar System',slug:'saleh-solar-system',category:'Website',status:'Live website',visual:'solar',
  shortDescription:'An interactive solar experience. Made to shine.',
  fullDescription:'An immersive website for Saleh Solar System that turns a solar installation into an explorable 3D experience. Visitors adjust the daylight, switch between home and business arrays and look inside a panel. A multilingual content studio lets the owner publish photos and videos.',
  technologies:['Three.js','JavaScript','WebGL','Cloudflare'],
  highlights:['Interactive 3D solar installation','English, Hebrew and Arabic','Owner-managed photo and video gallery'],
  liveUrl:'https://moosev133.github.io/saleh-solar-system/',
  note:'A live website built for Saleh Solar System. The daylight indicator is an illustrative interaction, not an energy-production estimate.',
  screenshots:[shot('saleh-solar-home.jpg','Saleh Solar System homepage with a three-dimensional solar installation','The live homepage · a solar installation in 3D'),shot('saleh-solar-detail.jpg','Exploded solar-panel view showing glass, cells and aluminum frame','A closer look · exploring a panel layer by layer')]
 }
];
