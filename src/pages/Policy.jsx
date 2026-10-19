import {Link,useParams} from "react-router-dom";
import {ArrowRight} from "lucide-react";
import {policies,policyReviewDate} from "@/data/policies";

export default function Policy(){
  const {section}=useParams();
  const policy=policies[section];
  if(!policy)return <div className="policy-page page-width"><h1>Page not found</h1><Link to="/">Return home</Link></div>;
  return <div className="distillery-site policy-page page-width">
    <header><p className="eyebrow">Hidden Lake Distillery / Information</p><h1>{policy.title}</h1><p className="policy-intro">{policy.intro}</p><p className="policy-revision">Website model · Revised {policyReviewDate} · Owner review before public launch</p></header>
    <div className="policy-layout"><nav className="policy-contents" aria-label={policy.title+" contents"}><p className="eyebrow">On this page</p>{policy.sections.map(item=><a key={item.id} href={"#"+item.id}>{item.title}</a>)}<div className="policy-crosslinks"><Link to="/policies/privacy">Privacy</Link><Link to="/policies/terms">Terms</Link><Link to="/policies/responsible">Responsible consumption</Link></div></nav>
    <div className="policy-body">{policy.sections.map(item=><section id={item.id} key={item.id} className={item.tone==="urgent"?"policy-section policy-urgent":"policy-section"}><h2>{item.title}</h2>{item.paragraphs.map((text,i)=><p key={i}>{text}</p>)}{item.links&&<ul className="policy-sources">{item.links.map(([name,url])=><li key={url}><a href={url}>{name} <span aria-hidden="true">↗</span></a></li>)}</ul>}</section>)}<Link to="/contact" className="text-button">Contact Hidden Lake Distillery <ArrowRight size={16}/></Link></div></div>
  </div>;
}
