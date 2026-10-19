import BrandCollections from "@/components/BrandCollections";
export default function Spirits(){
  return <div className="distillery-site portfolio-page"><header className="page-width portfolio-heading"><p className="eyebrow">Hidden Lake Distillery / Our products</p><h1>Find your<br/><em>kind of spirit.</em></h1><div className="portfolio-heading-bottom"><p>Two brands. One Montana home. Choose a collection to explore its offerings and discover the character behind every bottle.</p><span className="eyebrow">Whitefish &amp; Copper Pirates</span></div></header><section className="page-width portfolio-section" aria-label="Our product brands"><BrandCollections/></section></div>;
}
