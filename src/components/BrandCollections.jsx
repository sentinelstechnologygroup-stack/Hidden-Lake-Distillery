import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function BrandCollections() {
  return <div className="brand-collections">
    <Link to="/spirits/whitefish" className="collection-card collection-whitefish">
      <div className="collection-heading"><span className="eyebrow">01 / Whitefish</span><ArrowUpRight aria-hidden="true" size={26}/></div>
      <div className="whitefish-display" aria-hidden="true">
        <img src="/images/whitefish/whitefish-3.jpg" alt="" loading="lazy"/>
        <img src="/images/whitefish/whitefish-0.jpg" alt="" loading="lazy"/>
        <img src="/images/whitefish/whitefish-10.jpg" alt="" loading="lazy"/>
      </div>
      <div className="collection-copy"><p className="eyebrow">A collection with Montana character</p><h2>Whitefish<br/><em>Handcrafted Spirits</em></h2><p>Rum, gin, vodka, whiskey and specialty spirits. Discover the collection, bottle by bottle.</p><span className="collection-action">Explore Whitefish <ArrowUpRight size={17} aria-hidden="true"/></span></div>
    </Link>
    <Link to="/spirits/copper-pirates" className="collection-card collection-pirates">
      <div className="collection-heading"><span className="eyebrow">02 / Copper Pirates</span><ArrowUpRight aria-hidden="true" size={26}/></div>
      <img className="pirates-card-bottle" src="/images/copper-pirates-front.png" alt="" loading="lazy"/>
      <div className="collection-copy"><p className="eyebrow">A different kind of Montana spirit</p><h2>Copper<br/><em>Pirates</em></h2><p>Converting Cowboys to Pirates. Everyday. Meet the rum with a spirit of its own.</p><span className="collection-action">Explore Copper Pirates <ArrowUpRight size={17} aria-hidden="true"/></span></div>
    </Link>
  </div>;
}
