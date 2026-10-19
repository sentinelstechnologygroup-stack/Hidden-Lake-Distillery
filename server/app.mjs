import express from 'express';
import helmet from 'helmet';
import {toNodeHandler,fromNodeHeaders} from 'better-auth/node';
import {randomUUID,createHash} from 'node:crypto';
import {put} from '@vercel/blob';
import {one,transaction,problem} from './db.mjs';
import {profileSchema,addressSchema,productSchema,reviewSchema,inquirySchema,orderSchema,distributorInquirySchema} from './validation.mjs';
import {isAdult} from '../src/lib/commerce.mjs';
import {authorizedCron,flushMail} from './mail.mjs';
const product=row=>({...row.data,id:row.id,price:row.price_cents/100,in_stock:row.active,sort_order:row.sort_order});
const address=row=>({...row.data,id:row.id,is_default:row.is_default});
const review=row=>({...row.data,id:row.id,status:row.status,featured:row.featured,created_date:row.created_at});
const order=row=>({...row.data,id:row.id,user_id:row.user_id,status:row.status,fulfillment:row.fulfillment,is_demo:row.is_demo,subtotal:row.subtotal_cents/100,total:row.subtotal_cents/100,shipping:0,created_date:row.created_at});
const safeMethod=row=>({id:row.id,brand:row.brand,last4:row.last4,is_demo:row.is_demo,is_default:row.is_default});
export function createApp({pool,auth,env=process.env,sendMail}){
  const app=express();
  app.disable('x-powered-by');
  app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:{policy:'same-site'}}));
  app.use('/api',(req,res,next)=>{res.set('Cache-Control','private, no-store');next();});
  const origin=new URL(env.BETTER_AUTH_URL || 'http://localhost:5173').origin;
  app.use('/api',(req,res,next)=>{
    if(!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin!==origin)return res.status(403).json({error:'Request origin is not allowed'});
    next();
  });
  app.use('/api/auth',(req,res,next)=>{
    if(env.COMMERCE_ENABLED!=='true' && req.path==='/sign-up/email')return res.status(403).json({error:'Public account registration is currently closed.'});
    next();
  });
  app.all('/api/auth/*splat',toNodeHandler(auth));
  // Commerce remains preserved but requires an independent server opt-in.
  app.use('/api',(req,res,next)=>{
    const off=env.COMMERCE_ENABLED!=='true';
    if(off && (req.path==='/orders' && req.method==='POST' || req.path.startsWith('/payment-methods') && !['GET','HEAD'].includes(req.method)))return res.status(403).json({error:'Public ordering is currently unavailable. Please use our distribution inquiry form.'});
    next();
  });
  app.get('/api/health',async(req,res)=>{
    try{await pool.query('SELECT 1');res.json({ok:true,commerce:'demo',emailConfigured:!!(env.RESEND_API_KEY&&env.EMAIL_FROM)});}
    catch{res.status(503).json({ok:false,error:'Database unavailable'});}
  });
  app.use(express.json({limit:'64kb'}));
  async function session(req){
    if(req.copperSession!==undefined)return req.copperSession;
    req.copperSession=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    return req.copperSession;
  }
  async function user(req){const s=await session(req);if(!s?.user)throw problem(401,'Please sign in');return s.user;}
  async function admin(req){const u=await user(req);if(u.role!=='admin')throw problem(403,'Administrator access required');return u;}
  async function audit(db,actor,action,id){await db.query('INSERT INTO audit_events(actor_id,action,resource_id) VALUES($1,$2,$3)',[actor,action,id]);}
  async function rate(req,scope,max=5){
    // Vercel overwrites this header; local callers are bucketed by socket, never by arbitrary forwarded IPs.
    const ip=env.VERCEL ? req.headers['x-vercel-forwarded-for'] || req.socket.remoteAddress : req.socket.remoteAddress;
    const key=createHash('sha256').update(scope+':'+String(ip)).digest('hex');
    const row=await one(pool,"INSERT INTO rate_buckets(key,hits,expires_at) VALUES($1,1,now()+interval '10 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_buckets.expires_at<now() THEN 1 ELSE rate_buckets.hits+1 END,expires_at=CASE WHEN rate_buckets.expires_at<now() THEN now()+interval '10 minutes' ELSE rate_buckets.expires_at END RETURNING hits",[key]);
    if(row.hits>max)throw problem(429,'Too many requests. Please try again later.');
  }
  app.get('/api/me',async(req,res)=>{
    const u=await user(req),p=await one(pool,'SELECT phone,dob FROM customers WHERE user_id=$1',[u.id]);
    res.json({id:u.id,email:u.email,email_verified:u.emailVerified,full_name:u.name,role:u.role,phone:p?.phone||'',dob:p?.dob||''});
  });
  app.patch('/api/me',async(req,res)=>{
    const u=await user(req),p=profileSchema.parse(req.body);
    if(p.dob&&!isAdult(p.dob))throw problem(400,'A valid date of birth, age 21 or older, is required');
    await transaction(pool,async db=>{
      await db.query('UPDATE "user" SET name=$1,"updatedAt"=now() WHERE id=$2',[p.full_name,u.id]);
      await db.query('INSERT INTO customers(user_id,phone,dob) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET phone=$2,dob=$3,updated_at=now()',[u.id,p.phone,p.dob]);
    });
    res.json({...p,id:u.id,email:u.email,role:u.role});
  });
  app.get('/api/products',async(req,res)=>{
    const s=await session(req);if(env.COMMERCE_ENABLED!=='true' && s?.user?.role!=='admin')return res.json({items:[]});let sql='SELECT * FROM products WHERE ($1::boolean OR active)';const params=[s?.user?.role==='admin' && req.query.in_stock!=='true'];
    if(req.query.slug){params.push(String(req.query.slug));sql+=' AND slug=$2';}
    const {rows}=await pool.query(sql+' ORDER BY sort_order,id LIMIT 200',params);res.json({items:rows.map(product)});
  });
  app.post('/api/products',async(req,res)=>{
    const u=await admin(req),p=productSchema.parse(req.body),id=randomUUID();
    await transaction(pool,async db=>{await db.query('INSERT INTO products(id,slug,data,price_cents,active,sort_order) VALUES($1,$2,$3,$4,$5,$6)',[id,p.slug,p,Math.round(p.price*100),p.in_stock,p.sort_order]);await audit(db,u.id,'product.created',id);});
    res.status(201).json({...p,id});
  });
  app.patch('/api/products/:id',async(req,res)=>{
    const u=await admin(req);
    const result=await transaction(pool,async db=>{
      const old=await one(db,'SELECT * FROM products WHERE id=$1 FOR UPDATE',[req.params.id]);if(!old)throw problem(404,'Product not found');
      const p=productSchema.parse({...product(old),...productSchema.partial().parse(req.body)});
      await db.query('UPDATE products SET slug=$2,data=$3,price_cents=$4,active=$5,sort_order=$6,updated_at=now() WHERE id=$1',[old.id,p.slug,p,Math.round(p.price*100),p.in_stock,p.sort_order]);
      await audit(db,u.id,p.in_stock?'product.updated':'product.archived',old.id);return {...p,id:old.id};
    });res.json(result);
  });
  app.get('/api/addresses',async(req,res)=>{const u=await user(req);const {rows}=await pool.query('SELECT * FROM addresses WHERE user_id=$1 ORDER BY is_default DESC,created_at DESC LIMIT 50',[u.id]);res.json({items:rows.map(address)});});
  async function saveAddress(req,res){
    const u=await user(req),id=req.params.id || randomUUID();
    const result=await transaction(pool,async db=>{
      await db.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE',[u.id]);
      let previous;
      if(req.params.id){previous=await one(db,'SELECT * FROM addresses WHERE id=$1 AND user_id=$2',[id,u.id]);if(!previous)throw problem(404,'Address not found');}
      else if(Number((await one(db,'SELECT count(*) AS n FROM addresses WHERE user_id=$1',[u.id])).n)>=50)throw problem(400,'Address limit reached');
      const p=addressSchema.parse({...previous?.data,is_default:previous?.is_default,...req.body});
      if(p.is_default)await db.query('UPDATE addresses SET is_default=false WHERE user_id=$1',[u.id]);
      await db.query('INSERT INTO addresses(id,user_id,data,is_default) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET data=$3,is_default=$4',[id,u.id,p,p.is_default]);
      return {...p,id};
    });res.status(req.params.id?200:201).json(result);
  }
  app.post('/api/addresses',saveAddress);app.patch('/api/addresses/:id',saveAddress);
  app.delete('/api/addresses/:id',async(req,res)=>{const u=await user(req);const r=await pool.query('DELETE FROM addresses WHERE id=$1 AND user_id=$2',[req.params.id,u.id]);if(!r.rowCount)throw problem(404,'Address not found');res.json({ok:true});});
  app.get('/api/payment-methods',async(req,res)=>{const u=await user(req);res.json({items:(await pool.query('SELECT * FROM payment_methods WHERE user_id=$1 ORDER BY is_default DESC,created_at DESC',[u.id])).rows.map(safeMethod)});});
  app.post('/api/payment-methods/demo',async(req,res)=>{
    const u=await user(req),id=randomUUID();
    const row=await transaction(pool,async db=>{
      await db.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE',[u.id]);
      const old=await one(db,"SELECT * FROM payment_methods WHERE user_id=$1 AND provider='demo'",[u.id]);if(old)return old;
      await db.query('UPDATE payment_methods SET is_default=false WHERE user_id=$1',[u.id]);
      return one(db,"INSERT INTO payment_methods(id,user_id,provider,provider_reference,brand,last4,is_demo,is_default) VALUES($1,$2,'demo','demo-only','Demo Visa','4242',true,true) RETURNING *",[id,u.id]);
    });res.status(201).json(safeMethod(row));
  });
  app.patch('/api/payment-methods/:id',async(req,res)=>{
    const u=await user(req);if(req.body.is_default!==true || Object.keys(req.body).length!==1)throw problem(400,'Only the default setting can be changed');
    await transaction(pool,async db=>{
      await db.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE',[u.id]);
      if(!await one(db,'SELECT id FROM payment_methods WHERE id=$1 AND user_id=$2',[req.params.id,u.id]))throw problem(404,'Payment method not found');
      await db.query('UPDATE payment_methods SET is_default=false WHERE user_id=$1',[u.id]);await db.query('UPDATE payment_methods SET is_default=true WHERE id=$1 AND user_id=$2',[req.params.id,u.id]);
    });res.json({ok:true});
  });
  app.delete('/api/payment-methods/:id',async(req,res)=>{const u=await user(req);const r=await pool.query('DELETE FROM payment_methods WHERE id=$1 AND user_id=$2',[req.params.id,u.id]);if(!r.rowCount)throw problem(404,'Payment method not found');res.json({ok:true});});
  app.post('/api/orders',async(req,res)=>{
    const u=await user(req);if(!u.emailVerified)throw problem(403,'Verify your email before ordering');
    await rate(req,'order',30);const p=orderSchema.parse(req.body);
    if(new Set(p.items.map(i=>i.product_id)).size!==p.items.length)throw problem(400,'Duplicate products are not allowed');
    if(p.fulfillment==='shipping')addressSchema.parse({...p.shipping_address,name:p.customer_name});
    const hash=createHash('sha256').update(JSON.stringify(p)).digest('hex');
    const result=await transaction(pool,async db=>{
      await db.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE',[u.id]);
      const previous=await one(db,'SELECT * FROM orders WHERE user_id=$1 AND request_id=$2',[u.id,p.request_id]);
      if(previous){if(previous.request_hash!==hash)throw problem(409,'This request was already used for a different order');return previous;}
      const method=p.payment_method_id?await one(db,'SELECT * FROM payment_methods WHERE id=$1 AND user_id=$2',[p.payment_method_id,u.id]):null;
      if(p.payment_method_id&&!method)throw problem(400,'Saved payment method not found');
      const billing=p.billing_address_id?await one(db,"SELECT * FROM addresses WHERE id=$1 AND user_id=$2 AND data->>'purpose' IN ('billing','both')",[p.billing_address_id,u.id]):null;
      if(p.billing_address_id&&!billing)throw problem(400,'Saved billing address not found');
      const ids=p.items.map(i=>i.product_id);
      const {rows}=await db.query('SELECT * FROM products WHERE id=ANY($1::text[]) ORDER BY id FOR SHARE',[ids]);
      const items=p.items.map(i=>{const found=rows.find(v=>v.id===i.product_id);if(!found?.active)throw problem(409,'A product is no longer available');const v=product(found);return {product_id:v.id,name:v.name,image:v.image,price:v.price,quantity:i.quantity};});
      const subtotal=items.reduce((n,i)=>n+Math.round(i.price*100)*i.quantity,0);
      const data={items,billing_address:billing?.data||null,payment_method:method?safeMethod(method):null,customer_name:p.customer_name,customer_email:u.email,phone:p.phone,notes:p.notes,shipping_address:p.fulfillment==='shipping'?p.shipping_address:null,payment_status:'not_charged',age_confirmed:true,compliance_status:'demo_only'};
      const row=await one(db,'INSERT INTO orders(id,user_id,request_id,request_hash,fulfillment,data,subtotal_cents) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[randomUUID(),u.id,p.request_id,hash,p.fulfillment,data,subtotal]);
      await audit(db,u.id,'order.demo_created',row.id);return row;
    });res.status(201).json({order_id:result.id,order:order(result)});
  });
  app.get('/api/orders',async(req,res)=>{const u=await user(req);res.json({items:(await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200',[u.id])).rows.map(order)});});
  app.get('/api/orders/:id',async(req,res)=>{const u=await user(req),row=await one(pool,'SELECT * FROM orders WHERE id=$1 AND user_id=$2',[req.params.id,u.id]);if(!row)throw problem(404,'Order not found');res.json(order(row));});
  app.post('/api/orders/:id/cancel',async(req,res)=>{
    const u=await user(req);const row=await one(pool,"UPDATE orders SET status='cancelled',updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING *",[req.params.id,u.id]);if(!row)throw problem(404,'Order not found');res.json(order(row));
  });
  app.get('/api/reviews',async(req,res)=>{
    const approved=req.query.status==='approved';if(!approved)await admin(req);
    const {rows}=await pool.query(`SELECT * FROM reviews ${approved?"WHERE status='approved'":''} ORDER BY featured DESC,created_at DESC LIMIT ${approved?12:200}`);res.json({items:rows.map(review)});
  });
  app.post('/api/reviews/submit',async(req,res)=>{
    await rate(req,'review');const p=reviewSchema.parse(req.body);const id=randomUUID();
    await pool.query('INSERT INTO reviews(id,data) VALUES($1,$2)',[id,{...p,source:'website'}]);res.status(201).json({ok:true});
  });
  app.post('/api/reviews',async(req,res)=>{
    const u=await admin(req),p=reviewSchema.parse(req.body),id=randomUUID();
    if(!['admin','website','google','yelp'].includes(req.body.source))throw problem(400,'Invalid review source');
    await transaction(pool,async db=>{await db.query("INSERT INTO reviews(id,data,status) VALUES($1,$2,'approved')",[id,{...p,source:req.body.source}]);await audit(db,u.id,'review.created',id);});res.status(201).json({id,...p,status:'approved'});
  });
  app.patch('/api/reviews/:id',async(req,res)=>{
    const u=await admin(req),allowed=['status','featured'];if(Object.keys(req.body).some(k=>!allowed.includes(k)))throw problem(400,'Invalid review update');
    if(req.body.status!==undefined&&!['approved','pending','rejected'].includes(req.body.status))throw problem(400,'Invalid review status');
    if(req.body.featured!==undefined&&typeof req.body.featured!=='boolean')throw problem(400,'Invalid featured flag');
    const row=await transaction(pool,async db=>{const r=await one(db,'UPDATE reviews SET status=COALESCE($2,status),featured=COALESCE($3,featured),updated_at=now() WHERE id=$1 RETURNING *',[req.params.id,req.body.status??null,req.body.featured??null]);if(!r)throw problem(404,'Review not found');await audit(db,u.id,'review.moderated',r.id);return r;});res.json(review(row));
  });
  app.delete('/api/reviews/:id',async(req,res)=>{const u=await admin(req);await transaction(pool,async db=>{const r=await db.query('DELETE FROM reviews WHERE id=$1',[req.params.id]);if(!r.rowCount)throw problem(404,'Review not found');await audit(db,u.id,'review.deleted',req.params.id);});res.json({ok:true});});
  app.post('/api/inquiries',async(req,res)=>{
    await rate(req,'inquiry');const p=inquirySchema.parse(req.body),id=randomUUID();
    await transaction(pool,async db=>{
      await db.query('INSERT INTO inquiries(id,data) VALUES($1,$2)',[id,p]);
      if(env.CONTACT_EMAIL)await db.query('INSERT INTO email_outbox(id,recipient,subject,body) VALUES($1,$2,$3,$4)',[randomUUID(),env.CONTACT_EMAIL,`Website inquiry: ${p.subject}`,`${p.name} <${p.email}>\n\n${p.message}`]);
    });res.status(201).json({ok:true,id});
  });
  app.post('/api/distributor-inquiries',async(req,res)=>{
    await rate(req,'trade',5);
    const p=distributorInquirySchema.parse(req.body);
    if(p.website)return res.status(201).json({ok:true});
    const id=randomUUID();
    const {website,...details}=p;
    await transaction(pool,async db=>{
      await db.query('INSERT INTO inquiries(id,data) VALUES($1,$2)',[id,{...details,subject:'Wholesale',inquiry_type:'distribution',consent_at:new Date().toISOString(),follow_up_notes:''}]);
      if(env.CONTACT_EMAIL)await db.query('INSERT INTO email_outbox(id,recipient,subject,body) VALUES($1,$2,$3,$4)',[randomUUID(),env.CONTACT_EMAIL,'Hidden Lake Distillery distributor inquiry',`${p.company} — ${p.name} <${p.email}>\nTerritory: ${p.territory}\nInterest: ${p.interest}\n\n${p.message}`]);
    });
    res.status(201).json({ok:true,id});
  });
  app.get('/api/admin/orders',async(req,res)=>{await admin(req);res.json({items:(await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200')).rows.map(order)});});
  app.patch('/api/admin/orders/:id',async(req,res)=>{
    const u=await admin(req);if(req.body.status!=='cancelled')throw problem(400,'Demo orders can only be cancelled');
    const row=await transaction(pool,async db=>{const r=await one(db,"UPDATE orders SET status='cancelled',updated_at=now() WHERE id=$1 RETURNING *",[req.params.id]);if(!r)throw problem(404,'Order not found');await audit(db,u.id,'order.cancelled',r.id);return r;});res.json(order(row));
  });
  app.get('/api/admin/inquiries',async(req,res)=>{await admin(req);res.json({items:(await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 200')).rows.map(r=>({...r.data,id:r.id,status:r.status,created_date:r.created_at}))});});
  app.patch('/api/admin/inquiries/:id',async(req,res)=>{
    const u=await admin(req);
    if(!['new','contacted','reviewing','resolved'].includes(req.body.status))throw problem(400,'Invalid status');
    const notes=req.body.follow_up_notes;
    if(notes!==undefined&&(typeof notes!=='string'||notes.length>5000))throw problem(400,'Invalid follow-up notes');
    const row=await one(pool,"UPDATE inquiries SET status=$2,data=CASE WHEN $3::text IS NULL THEN data ELSE jsonb_set(data,'{follow_up_notes}',to_jsonb($3::text)) END WHERE id=$1 RETURNING id",[req.params.id,req.body.status,notes??null]);
    if(!row)throw problem(404,'Inquiry not found');await audit(pool,u.id,'inquiry.updated',row.id);res.json({ok:true});
  });
  app.get('/api/admin/audit',async(req,res)=>{await admin(req);res.json({items:(await pool.query('SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 200')).rows});});
  app.post('/api/uploads',async(req,res,next)=>{await admin(req);next();},express.raw({type:['image/png','image/jpeg','image/webp'],limit:'3mb'}),async(req,res)=>{
    const u=await admin(req);if(!env.BLOB_READ_WRITE_TOKEN)throw problem(503,'Image storage is not connected. Configure BLOB_READ_WRITE_TOKEN.');
    const b=req.body;if(!Buffer.isBuffer(b))throw problem(400,'Upload a PNG, JPEG, or WebP image');
    const png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpeg=b[0]===255&&b[1]===216&&b[2]===255;
    const webp=b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';
    const type=png?'image/png':jpeg?'image/jpeg':webp?'image/webp':null;if(!type||req.headers['content-type']!==type)throw problem(400,'Image content does not match its type');
    const blob=await put(`products/${randomUUID()}.${png?'png':jpeg?'jpg':'webp'}`,b,{access:'public',contentType:type,token:env.BLOB_READ_WRITE_TOKEN});
    await audit(pool,u.id,'image.uploaded',blob.pathname);res.status(201).json({file_url:blob.url});
  });
  app.get('/api/cron/mail',async(req,res)=>{if(!authorizedCron(req.headers.authorization,env.CRON_SECRET))throw problem(401,'Unauthorized');res.json(await flushMail(pool,env));});
  app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint not found'}));
  app.use((error,req,res,next)=>{
    const status=error.name==='ZodError'?400:error.status || (error.code==='23505'?409:500);
    if(status>=500)console.error(JSON.stringify({event:'api_error',method:req.method,path:req.path,code:error.code || error.name}));
    res.status(status).json({error:status===400?'Please check the submitted fields.':status===409?'The request conflicts with an existing record.':status>=500?'Service unavailable. Please try again.':error.message});
  });
  return app;
}
