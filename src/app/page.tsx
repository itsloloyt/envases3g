import { getCatalog } from "@/lib/catalog-server";
import { categories } from "@/lib/catalog";
import { subcategories, toCard } from "@/lib/shop";
import { Hero } from "@/components/home/Hero";
import { AccessoryShowcase } from "@/components/home/AccessoryShowcase";
import { Discounts } from "@/components/home/Discounts";
import { ExpandImage, ScrollText } from "@/components/home/ScrollStory";
import { Featured, HowToBuy, Location, Marquee, Rubros, Stats, Wholesale, type Rubro } from "@/components/home/Sections";

export const revalidate = 3600;

const HERO = ["frasco-apollo-vidrio-125-ml-ambar-con-tapa-difusora", "gotero-vidrio-ambar-30cc-con-pipeta", "frasco-boticario-vidrio-10cc-20cc-30cc-50cc-con-gota-gota", "body-125-cc-ambar"];

const FEATURED = [
  "omega-200-cc-ambar",
  "heaven-200-ml-cristal",
  "frasco-apollo-vidrio-125-ml-cristal-con-tapa-difusora",
  "body-125-cc-ambar",
  "venecia-250-cc-fume",
  "gotero-colirio-vidrio-premium-ambar",
  "frasco-vidrio-hexagonal-190-cc",
  "perfumero-decant-10-ml-de-vidrio-con-spray-enfundados",
  "pote-vidrio-recto-glass-jar-15cc",
  "vaso-vidrio-tennesse-ambar",
  "varilla-de-ratan-natural-23cm-para-difusor-aromatico",
  "frasco-round-vidrio-de-30-ml-satinado",
];

// Configurador del inicio: envase con fotos IA de cada accesorio.
const SHOWCASE = { slug: "omega-200-cc-ambar", keys: ["spray-negra", "crema-oro", "gatillo-negra", "fliptop-negra", "crema-blanca", "spray-plata", "tapa-aluminio"] };

const ORDER = ["cosmetica-y-farmacia", "plastico", "frascos-y-botellas-de-vidrio", "esencias-y-difusores", "accesorios", "alimentos", "combos-y-kits"];
const BLURBS: Record<string, string> = {
  "cosmetica-y-farmacia": "Goteros, potes, tubos, perfumeros y latas para laboratorios, cosmética natural y farmacia.",
};

export default async function Home() {
  const products = await getCatalog();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const pick = (slugs: string[]) => slugs.flatMap((s) => (bySlug.has(s) ? [toCard(bySlug.get(s)!)] : []));

  const rubros: Rubro[] = [...categories]
    .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
    .map((c) => {
      const inRubro = products.filter((p) => p.category === c.slug);
      // Portadas editoriales de cada rubro generadas con Higgsfield.
      return { slug: c.slug, name: c.name, count: inRubro.length, image: `/rubros/${c.slug}.webp`, blurb: BLURBS[c.slug] ?? c.text };
    });

  const showcase = bySlug.get(SHOWCASE.slug);
  const hero = pick(HERO);
  const featured = pick(FEATURED);

  return (
    <>
      <Hero products={hero.length >= 4 ? hero : products.slice(0, 4).map(toCard)} total={products.length} />
      <Marquee />
      <ScrollText />
      <Stats products={Math.floor(products.length / 10) * 10} categories={subcategories.length} />
      <Rubros rubros={rubros} />
      <ExpandImage />
      {showcase && (
        <AccessoryShowcase
          slug={showcase.slug}
          name={showcase.name}
          base={`/ia/${showcase.slug}/solo-envase.webp`}
          options={SHOWCASE.keys.map((key) => ({ key, photo: `/ia/${showcase.slug}/${key}.webp` }))}
        />
      )}
      <Featured products={featured.length ? featured : products.slice(0, 10).map(toCard)} />
      <HowToBuy />
      <Discounts />
      <Wholesale />
      <Location />
    </>
  );
}
