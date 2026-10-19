import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright';

const root=path.dirname(fileURLToPath(import.meta.url));
const destination=path.resolve(root,'../../public/animations');
await mkdir(destination,{recursive:true});
const server=createServer(async(req,res)=>{
 try{
  const filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const buffer=await readFile(filename);
  const type={'.html':'text/html','.js':'text/javascript','.png':'image/png'}[path.extname(filename)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':type});res.end(buffer);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:720,height:1080},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/model.html?manual`);
 await page.waitForFunction(()=>window.bottleReady,{timeout:60000});
 for(const [name,angle] of [['front',0],['right',Math.PI/2],['back',Math.PI],['left',Math.PI*1.5]]){
  await page.evaluate(a=>window.renderBottle(a),angle);
  await page.screenshot({path:path.join(root,`model-${name}.png`)});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('Model ready: front, back and both side views rendered without browser errors.');
 if(!process.argv.includes('--preview')){
  const ffmpeg=execFileSync('python',['-c','import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],{encoding:'utf8'}).trim();
  const frames=432,fps=24;
  const encoder=spawn(ffmpeg,['-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',path.join(destination,'copper-pirates-round-rotation-v3.mp4')],{stdio:['pipe','ignore','pipe']});
  let encoderLog='';encoder.stderr.on('data',d=>{encoderLog+=d.toString();});
  const completed=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('close',code=>code===0?resolve():reject(new Error(encoderLog)));});
  for(let frame=0;frame<frames;frame++){
   const encoded=await page.evaluate(a=>{window.renderBottle(a);return document.querySelector('canvas').toDataURL('image/jpeg',.96).split(',')[1];},frame/frames*Math.PI*2);
   if(!encoder.stdin.write(Buffer.from(encoded,'base64')))await once(encoder.stdin,'drain');
   if(frame%48===0)console.log(`Rendered ${frame}/${frames} frames`);
  }
  encoder.stdin.end();await completed;
  await page.evaluate(()=>window.renderBottle(0));
  await page.screenshot({path:path.join(destination,'copper-pirates-round-rotation-poster-v3.png')});
  execFileSync(ffmpeg,['-y','-i',path.join(destination,'copper-pirates-round-rotation-v3.mp4'),'-vf','fps=12,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse','-loop','0',path.join(destination,'copper-pirates-round-rotation-v3.gif')],{stdio:'ignore'});
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Copper Pirates — round bottle rotation</title><style>body{margin:0;background:#202326;color:#efe4d2;font:16px system-ui;display:grid;place-items:center;min-height:100vh}main{text-align:center}video{display:block;max-height:84vh;max-width:95vw;margin:auto;border-radius:8px}p{margin:12px}button{font:inherit;padding:8px 18px;border:1px solid #b28a55;color:inherit;background:transparent;border-radius:30px;cursor:pointer}</style><main><video muted loop playsinline controls preload="metadata" poster="copper-pirates-round-rotation-poster-v3.png" aria-label="Round Copper Pirates bottle rotating through a full turn"><source src="copper-pirates-round-rotation-v3.mp4" type="video/mp4"></video><p>Round bottle · packaging concept · 18-second rotation</p><button type="button">Play rotation</button></main><script>const video=document.querySelector('video'),button=document.querySelector('button');button.onclick=()=>video.paused?video.play():video.pause();video.onplay=()=>button.textContent='Pause rotation';video.onpause=()=>button.textContent='Play rotation';if(!matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().catch(()=>{});</script></html>`;
  await writeFile(path.join(destination,'copper-pirates-round-preview.html'),html);
  console.log('MP4, looping GIF, poster and accessible video preview saved.');
 }
}finally{await browser?.close();server.close();}
