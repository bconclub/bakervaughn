import EnquiryProvider from "@/components/enquiry/EnquiryProvider";
import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import WhyWeExist from "@/components/home/WhyWeExist";
import Services from "@/components/home/Services";
import Statement from "@/components/home/Statement";
import ConnectMap from "@/components/home/ConnectMap";
import Work from "@/components/home/Work";
import Testimonials from "@/components/home/Testimonials";
import Operators from "@/components/home/Operators";
import Approach from "@/components/home/Approach";
import { Beliefs, Labs } from "@/components/home/LabsAndBeliefs";
import { Close, Footer } from "@/components/home/Close";
import { homeContent } from "@/lib/cms/home";
import { getSiteCollections } from "@/lib/collections/read";

export default async function Home() {
  const c = homeContent;
  const { brands, testimonials, work, people } = await getSiteCollections();

  // Collections managed in /admin. null (not readable) falls back to the content in code.
  const projects = work
    ? work.map((w) => ({
        name: w.name,
        client: w.client ?? "",
        kind: w.category ?? "",
        title: w.headline ?? "",
        challenge: w.challenge ?? "",
        did: w.what_we_did ?? "",
        outcome: w.outcome ?? "",
        image: w.image_url ?? "",
        alt: w.image_alt ?? "",
      }))
    : c.work.projects;
  const leadership = people
    ? people.filter((p) => p.team === "leadership").map((p) => ({ name: p.name, role: p.role ?? "", note: p.bio ?? "", photo: p.photo_url }))
    : c.operators.leadership;
  const advisors = people
    ? people.filter((p) => p.team === "advisor").map((p) => ({ name: p.name, role: p.role ?? "" }))
    : c.operators.advisors;

  return (
    <EnquiryProvider>
      <Nav />
      <main>
        <Hero c={c.hero} brands={brands} />
        <WhyWeExist c={c.why} />
        <Services c={c.services} />
        <Statement c={c.statement} />
        <ConnectMap c={c.connect} />
        <Work c={{ ...c.work, projects }} />
        <Testimonials items={testimonials} />
        <Operators c={{ ...c.operators, leadership, advisors }} />
        <Approach c={c.approach} />
        <Labs c={c.labs} />
        <Beliefs c={c.beliefs} />
        <Close c={c.close} />
      </main>
      <Footer c={c.footer} services={c.services.items} />
    </EnquiryProvider>
  );
}
