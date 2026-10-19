import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Mountain } from "lucide-react";
import BrandCollections from "@/components/BrandCollections";

export default function Home() {
  return <div className="distillery-site">
    <section className="lake-hero">
      <img className="lake-hero-scene" src="/images/distillery-hero.png" alt="Illustrated copper stills in a mountain distillery"/>
      <div className="lake-hero-shade"/>
      <div className="hero-content page-width">
        <p className="eyebrow hero-location"><span/> Kalispell, Montana · Est. in the Flathead</p>
        <h1>Hidden Lake<span>Distillery.</span></h1>
        <p className="hero-intro">Montana roots. Independent spirit.<br/>The home of Whitefish &amp; Copper Pirates.</p>
        <div className="hero-actions"><Link to="/spirits" className="lake-button">Discover our spirits <ArrowRight size={17}/></Link><Link to="/distribution" className="text-button">For the trade <ArrowUpRightIcon/></Link></div>
      </div>
      <div className="hero-seal" aria-hidden="true"><Mountain size={37}/><span>Hidden Lake</span><strong>Montana</strong><small>Independent spirit</small></div>
      <div className="hero-bottom page-width"><a href="#our-brands" className="eyebrow">The spirits of Hidden Lake <ArrowDown size={15}/></a><span>Distillery atmosphere · illustrated concept</span></div>
    </section>
    <div className="heritage-strip"><span>Distilled in Montana</span><i>✦</i><span>Whitefish Handcrafted Spirits</span><i>✦</i><span>Copper Pirates Rum</span><i>✦</i><span>Hidden Lake Distillery</span></div>
    <section id="our-brands" className="portfolio-section page-width">
      <div className="section-intro"><div><p className="eyebrow">The house of Hidden Lake</p><h2>One place.<br/><em>Two unmistakable spirits.</em></h2></div><p>Different characters. Shared roots. Explore the Whitefish collection and the bold world of Copper Pirates, brought together by Hidden Lake Distillery in Montana’s Flathead Valley.</p></div>
      <BrandCollections/>
    </section>
    <section className="lake-story">
      <div className="story-photo"><img loading="lazy" src="/images/justin-at-hidden-lake-retouched-v2.png" alt="Justin behind the bar at Hidden Lake Distillery"/><span className="photo-caption">Good spirits bring people together.</span></div>
      <div className="story-copy"><p className="eyebrow">Our place in Montana</p><h2>A little hidden.<br/><em>A lot of spirit.</em></h2><p>Our home is Kalispell. Our portfolio brings together the variety of Whitefish Handcrafted Spirits and the distinct character of Copper Pirates rum.</p><p>Behind both is Hidden Lake Distillery, owned and operated by Table 62 LLC. Get to know the place behind the bottle.</p><Link to="/about" className="text-button">The Hidden Lake story <ArrowRight size={17}/></Link></div>
    </section>
    <section className="trade-banner page-width"><p className="eyebrow">For distributors &amp; trade partners</p><h2>Good spirits.<br/><em>Great partnerships.</em></h2><p>Find a place for Hidden Lake in your portfolio. Let’s talk brands, your market, and what comes next.</p><Link to="/distribution" className="lake-button">Start a trade conversation <ArrowRight size={17}/></Link></section>
  </div>;
}
function ArrowUpRightIcon(){return <span aria-hidden="true">↗</span>;}
