import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { distillery } from "@/data/spirits";
import BrandMark from "@/components/BrandMark";


export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-parchment mb-3">
              <BrandMark />
            </p>
            <p className="font-body text-muted-foreground leading-relaxed max-w-sm">
              Montana roots. Independent spirit. The home of Whitefish Handcrafted Spirits and Copper Pirates.
            </p>
          </div>

          <div>
            <p className="font-label text-[11px] text-copper mb-5">Explore</p>
            <ul className="space-y-3">
              {[
                { label: "Products", path: "/spirits" },
                { label: "Signature Drinks", path: "/cocktails" },
  { label: "The Craft", path: "/craft" },
                { label: "Our Story", path: "/about" },
                { label: "Distribution", path: "/distribution" },
                { label: "Contact", path: "/contact" },
              ].map((l) => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="font-body text-muted-foreground hover:text-copper transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-label text-[11px] text-copper mb-5">Our distillery</p>
            <p className="font-body text-muted-foreground leading-relaxed mb-4 flex items-start gap-2">
              <MapPin size={16} className="mt-1 shrink-0 text-copper/70" />
              <span>{distillery.address}<br />{distillery.city}, {distillery.state} {distillery.zip}</span>
            </p>
            <a href="mailto:distillgrillchill@gmail.com" className="text-copper underline break-all">distillgrillchill@gmail.com</a>
          </div>
        </div>

        <nav aria-label="Customer information" className="flex flex-wrap gap-x-6 gap-y-4 mt-10">
          {[["privacy","Privacy"],["terms","Terms"],["responsible","Responsible Consumption"]].map(([slug,label])=><Link className="underline" key={slug} to={"/policies/"+slug}>{label}</Link>)}
        </nav>
        <div className="hairline my-10" />

        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground leading-relaxed">Distilled, Bottled and Labeled at<br />Hidden Lake Distillery<br />2134 US Hwy 2 E.<br />Kalispell, MT 59901</p><p className="text-sm text-muted-foreground">Responsible advertiser: Table 62 LLC · Hidden Lake Distillery · Kalispell, Montana. Montana DSM license holder.</p>
        </div>
        <div className="hairline my-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-label text-[10px] text-muted-foreground/70 tracking-widest">
            © {new Date().getFullYear()} Hidden Lake Distillery · All rights reserved
          </p>
          <p className="font-label text-[10px] text-muted-foreground/70 tracking-widest text-center">
            Please drink responsibly · 21+ only
          </p>
        </div>
      </div>
    </footer>
  );
}