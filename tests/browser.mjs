import {chromium} from 'playwright';
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import pg from 'pg';
import {createServer} from 'vite';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createAuth} from '../server/auth.mjs';
import {createApp} from '../server/app.mjs';
import {migrate} from '../server/migrate.mjs';
import {seed} from '../scripts/seed.mjs';
const db=await PGlite.create(),wire=new PGLiteSocketServer({db,port:0,host:'127.0.0.1',maxConnections:5});
let pool,api,vite,browser;
const env={COMMERCE_ENABLED:'true',BETTER_AUTH_URL:'http://localhost:5183',BETTER_AUTH_SECRET:randomBytes(32).toString('hex')};
const mail=[];
try{
 await wire.start();pool=new pg.Pool({connectionString:`postgresql://postgres:postgres@${wire.getServerConn()}/postgres`,max:2});
 let auth=createAuth(pool,{...env,DB_MIGRATION:'true'},async m=>mail.push(m));await migrate(pool,auth);await seed(pool);
 auth=createAuth(pool,env,async m=>mail.push(m));
 api=createApp({pool,auth,env}).listen(3011,'127.0.0.1');await new Promise(r=>api.once('listening',r));
 vite=await createServer({server:{port:5183,strictPort:true,host:'127.0.0.1',proxy:{'/api':{target:'http://127.0.0.1:3011',changeOrigin:false}}}});await vite.listen();
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath(),headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:"reduce"});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const base='http://localhost:5183';
 await page.goto(base);await page.getByRole('button',{name:"Yes, I’m 21+"}).click();
 await page.getByRole('heading',{name:/Hidden Lake.*Distillery/i}).waitFor();
 await mkdir('test-artifacts',{recursive:true});await page.screenshot({path:'test-artifacts/home-desktop.png'});
 await page.goto(base+'/spirits');
 await page.getByRole('link',{name:/Explore Whitefish/}).click();await page.waitForURL('**/spirits/whitefish');await page.locator('.whitefish-product').first().waitFor();
 assert.equal(await page.locator('.whitefish-product').count(),13);
 await page.getByRole('button',{name:'Gin',exact:true}).click();assert.equal(await page.locator('.whitefish-product').count(),2);
 await page.getByRole('button',{name:'All spirits',exact:true}).click();assert.equal(await page.locator('.whitefish-product').count(),13);
 for(const image of await page.locator('img').all()){await image.evaluate(async img=>{img.loading='eager';await img.decode();});assert.equal(await image.evaluate(img=>img.naturalWidth>0),true);}
 await page.screenshot({path:'test-artifacts/whitefish-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'All brands',exact:true}).click();await page.waitForURL('**/spirits');await page.getByRole('heading',{name:/Find your.*kind of spirit/}).waitFor();
 for(const image of await page.locator('img').all()){await image.evaluate(async img=>{img.loading='eager';await img.decode();});}
 await page.screenshot({path:'test-artifacts/brands-desktop.png',fullPage:true});
 await page.getByRole('link',{name:/Explore Copper Pirates/}).click();await page.waitForURL('**/spirits/copper-pirates');
 await page.getByRole('heading',{name:/Copper.*Pirates/}).waitFor();await page.locator('.pirates-hero-figure img').evaluate(img=>img.decode());
 await page.screenshot({path:'test-artifacts/copper-pirates-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'Request product information',exact:true}).click();await page.waitForURL('**/distribution?*');
 assert.match(await page.getByRole('textbox',{name:'Tell us about your market'}).inputValue(),/Copper Pirates.*Rum with Spices/);
 assert.equal(await page.getByRole('button',{name:'Add to Hold'}).count(),0);
 assert.equal(await page.getByRole('button',{name:'Open cart'}).count(),0);
 for(const path of ['/checkout','/account','/register','/spirits/highline-spiced']){await page.goto(base+path);await page.waitForURL(path.startsWith('/spirits/')?'**/spirits':'**/distribution');}
 await page.goto(base+'/distribution');
 await page.getByRole('textbox',{name:'Contact name',exact:true}).fill('Trade Captain');await page.getByRole('textbox',{name:'Work email',exact:true}).fill('trade@example.com');await page.getByRole('textbox',{name:'Company',exact:true}).fill('Example Distribution');await page.getByRole('textbox',{name:'States or territory of interest',exact:true}).fill('Montana');await page.getByRole('textbox',{name:'Tell us about your market',exact:true}).fill('Please provide product details for our distribution team.');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Send trade inquiry'}).click();await page.getByText('Your trade inquiry has been recorded.').waitFor();
 const inquiry=(await pool.query("SELECT * FROM inquiries WHERE data->>'inquiry_type'='distribution'")).rows[0];assert.equal(inquiry.data.company,'Example Distribution');
 assert.equal(await page.getByRole('link',{name:'Email our trade team'}).getAttribute('href'),'mailto:distillgrillchill@gmail.com?subject=Hidden%20Lake%20Distillery%20Trade%20Inquiry');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/spirits');await page.getByRole('button',{name:'Open navigation'}).click();await page.locator('#mobile-navigation').getByRole('link',{name:'Distribution',exact:true}).waitFor();await page.screenshot({path:'test-artifacts/menu-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
 await page.getByRole('button',{name:'Close navigation'}).click();for(const image of await page.locator('img').all()){await image.evaluate(async img=>{img.loading='eager';await img.decode();});}await page.screenshot({path:'test-artifacts/products-mobile.png',fullPage:true});
 for(const route of ['/','/spirits','/spirits/whitefish','/spirits/copper-pirates']){
  await page.goto(base+route);await page.locator('h1').waitFor();
  for(const image of await page.locator('img').all()){await image.evaluate(async img=>{img.loading='eager';await img.decode();});}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Mobile overflow: '+route);
  await page.screenshot({path:'test-artifacts/'+(route==='/'?'home':route.split('/').pop())+'-mobile.png',fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log('Browser portfolio flow passed: brand navigation, Whitefish filters and 13 images, Copper Pirates bottle, product inquiry context, disabled commerce, SQL inquiry submission, four mobile layouts.');
}finally{
 if(browser)await browser.close();if(vite)await vite.close();if(api)await new Promise(r=>api.close(r));if(pool)await pool.end();await wire.stop();await db.close();
}
