import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { whitefishBottles } from "@/data/portfolio";

const categories=["All spirits","Rum","Gin","Vodka","Whiskey","Specialty spirits"];
export default function Whitefish(){
  const [category,setCategory]=useState("All spirits");
  const bottles=whitefishBottles.filter(bottle=>category==="All spirits"||bottle.category===category);
  return <div className="distillery-site whitefish-page">
    <header className="whitefish-hero page-width">
      <div><Link to="/spirits" className="back-link"><ArrowLeft size={15}/> All brands</Link><p className="eyebrow">From Hidden Lake Distillery · Kalispell, Montana</p><h1>Whitefish<span>Handcrafted Spirits.</span></h1><p>A collection of independent spirits with a Montana home. Explore rum, gin, vodka, whiskey and specialty offerings from Whitefish.</p><a href="#whitefish-collection" className="lake-button">Explore the collection <span aria-hidden="true">↓</span></a></div>
      <div className="whitefish-hero-bottles" aria-hidden="true"><img src="/images/whitefish/whitefish-10.jpg" alt=""/><img src="/images/whitefish/whitefish-0.jpg" alt=""/><img src="/images/whitefish/whitefish-11.jpg" alt=""/></div>
    </header>
    <section id="whitefish-collection" className="page-width whitefish-collection">
      <div className="collection-title"><div><p className="eyebrow">The Whitefish collection</p><h2>Meet the spirits.</h2></div><p>Browse our supplied bottle collection.<br/>Current availability and specifications confirmed directly.</p></div>
      <div className="category-filters" role="group" aria-label="Filter Whitefish spirits">{categories.map(name=><button key={name} aria-pressed={name===category} onClick={()=>setCategory(name)}>{name}</button>)}</div>
      <p className="result-count" role="status">{bottles.length} {bottles.length===1?"spirit":"spirits"} · {category}</p>
      <div className="whitefish-product-grid">{bottles.map(bottle=><article className="whitefish-product" key={bottle.name}><div className="product-image"><img loading="lazy" src={bottle.image} alt={"Whitefish "+bottle.name+" bottle"}/></div><div className="product-copy"><p className="eyebrow">{bottle.category}</p><h3>{bottle.name}</h3><Link to={"/distribution?brand=whitefish&product="+encodeURIComponent(bottle.name)}>Request product details <ArrowUpRight size={16}/></Link></div></article>)}</div>
      <div className="brand-trade-note"><h2>Made for your next conversation.</h2><p>For descriptions, specifications, case configurations, samples and territory inquiries, connect directly with Hidden Lake Distillery.</p><Link className="lake-button" to="/distribution?brand=whitefish">Discuss Whitefish distribution <ArrowUpRight size={17}/></Link></div>
      <Link className="back-link" to="/spirits/copper-pirates">Discover Copper Pirates <ArrowUpRight size={16}/></Link>
    </section>
  </div>;
}
