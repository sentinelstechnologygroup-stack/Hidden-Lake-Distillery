import {Link} from "react-router-dom";
import {ArrowRight, Wine, Leaf} from "lucide-react";
import drinks from "@/data/cocktails.json";

export default function Cocktails(){
  return <div className="distillery-site signature-page">
    <header className="signature-hero page-width">
      <div><p className="eyebrow">Hidden Lake Distillery / Signature drinks</p><h1>A little Montana.<br/><em>A lot of character.</em></h1><p>Fourteen signature rum cocktails from our supplied house menu. A taste of how the Whitefish spirits collection comes to life behind the bar.</p><a href="#signature-menu" className="lake-button">Explore the menu <ArrowRight size={17}/></a></div>
      <figure><img src="/images/justin-mixing-cocktails.jpg" alt="Justin smiling while mixing a cocktail at the distillery"/><figcaption>From the Hidden Lake bar · supplied event photography</figcaption></figure>
    </header>
    <section id="signature-menu" className="page-width signature-menu"><div className="collection-title"><div><p className="eyebrow">The house menu</p><h2>Signature rum cocktails.</h2></div><p>Ingredients as listed on the supplied menu.<br/>Availability and substitutions may vary.</p></div>
      <div className="cocktail-grid">{drinks.map((drink,index)=><article key={drink.name} className="cocktail-entry"><div className="cocktail-number"><span>{String(index+1).padStart(2,"0")}</span><Wine size={19} strokeWidth={1.3} aria-hidden="true"/></div><p className="eyebrow">{drink.rum}</p><h3>{drink.name}</h3><p>{drink.ingredients.join(" · ")}</p>{drink.note&&<span className="cocktail-note">{drink.note}</span>}</article>)}</div>
      <div className="zero-proof-note"><Leaf size={31} strokeWidth={1.3} aria-hidden="true"/><div><h2>All the occasion. An alcohol-free option.</h2><p>The supplied menu offers zero-proof alcohol alternatives on request. Ask the team about availability, ingredients, allergens, and whether an alternative is 0.0% ABV. Substitutions are subject to availability.</p></div></div>
      <div className="signature-trade"><p>Menu inspiration for adults 21 and older. These ingredient lists are not measured recipes or serving-size guidance, and do not imply every cocktail is made with Copper Pirates. A cocktail may contain more than one standard drink.</p><Link to="/policies/responsible" className="text-button">Responsible consumption <ArrowRight size={16}/></Link><Link to="/distribution" className="lake-button">Discuss the spirits portfolio <ArrowRight size={16}/></Link></div>
    </section>
  </div>;
}
