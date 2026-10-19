import { Image } from "@/components/ui/image";

export default function PageHero({ label, title, subtitle, image, imageAlt = null, caption = null }) {
  return (
    <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        {image && (
          <Image
            src={image}
            alt={imageAlt || title}
            fittingType="fill"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 pb-14 md:pb-20 w-full">
        <p className="font-label text-xs text-copper mb-5">{label}</p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-parchment leading-[0.95] max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-xl text-parchment/80 leading-relaxed max-w-xl mt-6">
            {subtitle}
          </p>
        )}
      </div>
      {caption && <p className="absolute bottom-3 right-5 z-10 text-[10px] text-parchment/60 max-w-[230px] text-right">{caption}</p>}
    </section>
  );
}