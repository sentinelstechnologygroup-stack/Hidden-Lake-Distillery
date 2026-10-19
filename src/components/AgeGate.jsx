import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import { distillery } from "@/data/spirits";

const STORAGE_KEY = "cpd_age_verified";

export default function AgeGate() {
  const [verified, setVerified] = useState(() => {
    try{return localStorage.getItem(STORAGE_KEY)==="true";}catch{return false;}
  });
  const dialog=useRef(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if(verified)return;
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    dialog.current?.querySelector("button,a[href]")?.focus();
    const trap=(e)=>{
      if(e.key!=="Tab")return;
      const buttons=dialog.current?.querySelectorAll("button,a[href]");
      if(!buttons?.length){e.preventDefault();return;}
      const first=buttons[0], last=buttons[buttons.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",trap);
    return ()=>{document.body.style.overflow=overflow;document.removeEventListener("keydown",trap);previous?.focus?.();};
  },[verified,denied]);

  const confirm = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    setVerified(true);
  };

  if (verified) return null;

  return (
    <div ref={dialog} role="dialog" aria-modal="true" aria-label="Age confirmation — 21 and older" className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${distillery.ageGateImage})` }}
      />
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-w-lg px-8 text-center">
        <div className="age-gate-brand"><BrandMark/></div>
        {denied ? (
          <div className="animate-fade-in">
            <p className="font-label text-xs text-copper mb-6">Access Denied</p>
            <h2 className="font-display text-3xl md:text-4xl text-parchment leading-tight mb-6">
              For adults 21 and older.
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              You must be of legal drinking age (21+) to enter Hidden Lake
              Distillery.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="font-label text-xs text-copper mb-6">
              Hidden Lake Distillery · Kalispell, MT
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-parchment leading-[1.05] mb-5">
              Are you 21 or older?
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-10">
              Welcome to Hidden Lake Distillery, home of Whitefish Handcrafted Spirits
              and Copper Pirates. Please confirm your age to explore.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={confirm}
                className="w-full sm:w-auto px-10 py-3.5 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90 transition-colors"
              >
                Yes, I’m 21+
              </button>
              <button
                onClick={() => setDenied(true)}
                className="w-full sm:w-auto px-10 py-3.5 border border-border text-parchment font-label text-sm tracking-widest uppercase hover:border-copper hover:text-copper transition-colors"
              >
                Not yet
              </button>
            </div>

            <p className="font-label text-[10px] text-muted-foreground/70 mt-10 leading-relaxed">
              Please drink responsibly · By entering you affirm you are of legal
              drinking age in your jurisdiction
            </p>
          </div>
        )}
        <nav className="flex justify-center gap-6 mt-7 text-sm text-parchment underline" aria-label="Safety and privacy information"><Link to="/policies/responsible">Responsible consumption &amp; support</Link><Link to="/policies/privacy">Privacy</Link></nav>
      </div>
    </div>
  );
}