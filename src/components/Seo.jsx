import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const brand="Hidden Lake Distillery";
const routes={
 "/":["Montana Spirits in Kalispell","Discover Hidden Lake Distillery, producer of Whitefish Handcrafted Spirits and Copper Pirates in Kalispell, Montana."],
 "/spirits":["Our Brands & Products","Explore Whitefish Handcrafted Spirits and Copper Pirates rum from Hidden Lake Distillery. Request product and distribution information."],
 "/distribution":["Distributor & Trade Inquiries","Connect with Hidden Lake Distillery about Whitefish, Copper Pirates and distribution opportunities for your market."],
 "/about":["Our Story","Meet Hidden Lake Distillery, the Montana producer behind Whitefish Handcrafted Spirits and Copper Pirates."],
 "/craft":["Our Distillery","Learn about Hidden Lake Distillery in Kalispell, Montana, owned and operated by Table 62 LLC."],
 "/contact":["Contact Our Team","Contact Hidden Lake Distillery for product, distribution and business inquiries."],
 "/cocktails":["Serving Inspiration","Explore cocktail ideas and contact Hidden Lake Distillery for approved serving information."]
};
export function setMeta(name,content,property=false) {
  const attr=property?"property":"name";
  let el=document.head.querySelector('meta['+attr+'="'+name+'"]');
  if(!el){el=document.createElement("meta");el.setAttribute(attr,name);document.head.append(el);}
  el.setAttribute("content",content);
}
export default function Seo() {
 const {pathname}=useLocation();
 useEffect(()=>{
  const route=routes[pathname] || (pathname.startsWith("/spirits/")?["Rum Details","Explore this rum and its tasting notes."]:pathname.startsWith("/policies/")?["Customer Information","Customer policies and responsible consumption information."]:["Page","Hidden Lake Distillery"]);
  const title=route[0]+" | "+brand;
  document.title=title;setMeta("description",route[1]);
  setMeta("og:title",title,true);setMeta("og:description",route[1],true);setMeta("og:type","website",true);
  setMeta("og:site_name",brand,true);setMeta("twitter:card","summary");
  const publicRoute=["/","/spirits","/craft","/about","/contact","/cocktails","/distribution"].includes(pathname)||pathname.startsWith("/spirits/");
  const raw=import.meta.env.VITE_SITE_URL;
  let origin="";
  try{const u=new URL(raw);if(u.protocol==="https:")origin=u.origin;}catch { /* awaiting final domain */ }
  const index=import.meta.env.VITE_INDEXING_ENABLED==="true" && !!origin && publicRoute;
  setMeta("robots",index?"index,follow":"noindex,nofollow");
  document.head.querySelector('link[rel="canonical"]')?.remove();
  document.head.querySelector('meta[property="og:url"]')?.remove();
  if(origin){
    const el=document.createElement("link");el.rel="canonical";el.href=origin+pathname;document.head.append(el);
    setMeta("og:url",origin+pathname,true);
  }
 },[pathname]);
 return null;
}
