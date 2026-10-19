import { betterAuth } from 'better-auth';
export function createAuth(pool, env=process.env, sendMail) {
  if(!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length<32) throw new Error('BETTER_AUTH_SECRET must have at least 32 characters');
  const baseURL=env.BETTER_AUTH_URL || 'http://localhost:5173';
  const deliver=async(user,url,subject)=>{
    if(!sendMail)throw new Error('Email delivery is not configured');
    await sendMail({to:user.email,subject,text:`${subject}\n\n${url}\n\nIf you did not request this, you can ignore it.`});
  };
  return betterAuth({
    appName:'Hidden Lake Distillery',database:pool,baseURL,secret:env.BETTER_AUTH_SECRET,
    trustedOrigins:[new URL(baseURL).origin],
    emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128,requireEmailVerification:true,
      revokeSessionsOnPasswordReset:true,
      sendResetPassword:async({user,url})=>deliver(user,url,'Reset your Hidden Lake Distillery password')},
    emailVerification:{sendOnSignUp:true,sendOnSignIn:true,autoSignInAfterVerification:true,
      sendVerificationEmail:async({user,url})=>deliver(user,url,'Verify your Hidden Lake Distillery email')},
    user:{additionalFields:{role:{type:'string',defaultValue:'customer',input:false}},
      changeEmail:{enabled:true},deleteUser:{enabled:true}},
    databaseHooks:{user:{delete:{before:async(user)=>{
      await pool.query("UPDATE orders SET data=data-'customer_email'-'customer_name'-'shipping_address'-'billing_address'-'payment_method'-'phone'-'notes' WHERE user_id=$1",[user.id]);
    }}}},
    session:{expiresIn:60*60*24*7,updateAge:60*60*24},
    rateLimit:{enabled:true,storage:'database',window:60,max:30},
    advanced:{database:{validateSchema:env.DB_MIGRATION!=='true'},ipAddress:{ipAddressHeaders:env.VERCEL?['x-vercel-forwarded-for']:[]},useSecureCookies:baseURL.startsWith('https:'),defaultCookieAttributes:{sameSite:'lax',httpOnly:true}}
  });
}
