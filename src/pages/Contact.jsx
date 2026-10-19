import {Link} from "react-router-dom";
import {request} from "@/api/client";
import { useState } from "react";
import { MapPin, Send } from "lucide-react";
import { distillery } from "@/data/spirits";
import PageHero from "@/components/PageHero";


export default function Contact() {
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "General", message: "" });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async(e) => {
    e.preventDefault();setBusy(true);setError("");
    try{await request('/inquiries',{method:'POST',body:JSON.stringify(form)});setSent(true);}
    catch(e){setError(e.status===503?"The contact service is not available yet. Please email distillgrillchill@gmail.com.":e.message);}finally{setBusy(false);}
  };

  return (
    <div className="bg-background">
      <PageHero
        label="Contact Hidden Lake Distillery"
        title="Let’s start a conversation"
        subtitle="Questions about Hidden Lake Distillery, Whitefish or Copper Pirates? For trade opportunities, use our dedicated distributor inquiry page."
        image="/images/contact-trade-hero-concept.png"
        imageAlt="Illustrative spirits sample bottle and tasting glasses in a timber distillery setting"
        caption="Illustrative concept · venue photography to follow"
      />

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-5 gap-12 md:gap-16">
          <Link to="/distribution" className="md:col-span-5 border border-copper p-5 text-copper underline">Distribution, product information or sample requests? Start a trade conversation.</Link>
          {/* Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="border border-copper/40 bg-card/40 p-10 text-center">
                <p className="font-display text-3xl text-parchment mb-4">
                  Your message has been recorded.
                </p>
                <p className="font-body text-lg text-muted-foreground leading-relaxed">
                  Thank you for contacting Hidden Lake Distillery. Our team will review your inquiry.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "General", message: "" });
                  }}
                  className="mt-8 font-label text-xs tracking-widest text-copper hover:underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6"><p className="text-sm text-muted-foreground">We use your details to respond to this inquiry. Please read our <Link to="/policies/privacy" className="underline">Privacy Notice</Link>. Do not submit sensitive personal information.</p>{error && <p role="alert">{error}</p>}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="field-name" className="font-label text-[10px] text-copper block mb-2">
                      Name
                    </label><input id="field-name"
                      required
                      value={form.name}
                      onChange={update("name")}
                      className="w-full bg-transparent border-b border-border py-3 font-body text-lg text-parchment focus:border-copper outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="field-email" className="font-label text-[10px] text-copper block mb-2">
                      Email
                    </label><input id="field-email"
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      className="w-full bg-transparent border-b border-border py-3 font-body text-lg text-parchment focus:border-copper outline-none transition-colors"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="field-subject" className="font-label text-[10px] text-copper block mb-2">
                    Subject
                  </label>
                  <select id="field-subject"
                    value={form.subject}
                    onChange={update("subject")}
                    className="w-full bg-background border-b border-border py-3 font-body text-lg text-parchment focus:border-copper outline-none transition-colors"
                  >
                    <option>General</option>
                    <option>Wholesale</option>
                    <option>Events</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-message" className="font-label text-[10px] text-copper block mb-2">
                    Message
                  </label>
                  <textarea id="field-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={update("message")}
                    className="w-full bg-transparent border-b border-border py-3 font-body text-lg text-parchment focus:border-copper outline-none transition-colors resize-none"
                    placeholder="What's on your mind?"
                  />
                </div>

                <button
                  type="submit" disabled={busy}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90 transition-colors"
                >
                  Send message <Send size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="font-label text-xs text-copper mb-5">Direct Line</p>

              <a className="text-copper underline break-all" href="mailto:distillgrillchill@gmail.com">distillgrillchill@gmail.com</a>
            </div>

            <div>
              <p className="font-label text-xs text-copper mb-5">Our distillery</p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-copper/70" />
                <span>
                  {distillery.address}<br />{distillery.city}, {distillery.state} {distillery.zip}
                  <br />
                  <span className="font-label text-xs text-muted-foreground/70">
                    {distillery.coordinates}
                  </span>
                </span>
              </p>
            </div>

            <div>
              <p className="font-label text-xs text-copper mb-5">Licensing</p>
              <div className="flex flex-col gap-3">
                <p className="text-muted-foreground">Owned and operated by Table 62 LLC, holder of the Montana DSM license permitting distillation.</p>
              </div>
            </div>


          </div>
        </div>
      </section>
    </div>
  );
}
