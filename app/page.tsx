import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { VisualGallery } from "@/components/VisualGallery";
import { WorksSection } from "@/components/WorksSection";
import { getContentByLocale, getWhatsappUrl } from "@/content/site-content";

export default function HomePage() {
  const content = getContentByLocale();
  const whatsappUrl = getWhatsappUrl();

  return (
    <>
      <Navbar
        brand={content.nav.brand}
        links={content.nav.links}
        contactCta={content.nav.contactCta}
        contactHref="#contacto"
      />

      <main>
        <HeroSection
          label={content.hero.label}
          marqueeText={content.hero.marqueeText}
          paragraph={content.hero.paragraph}
          disciplines={content.hero.disciplines}
          media={content.hero.media}
        />

        <WorksSection heading={content.works.heading} intro={content.works.intro} items={content.works.recent} />

        <AboutSection heading={content.aboutStudio.heading} paragraphs={content.aboutStudio.paragraphs} />

        <ExpertiseSection heading={content.expertise.heading} intro={content.expertise.intro} items={content.expertise.items} />

        <VisualGallery heading={content.gallery.heading} items={content.gallery.images} />

        <ContactSection
          heading={content.contact.heading}
          intro={content.contact.intro}
          email={content.contact.email}
          contactLabel={content.contact.contactLabel}
          copyEmailLabel={content.contact.copyEmail}
          whatsappLabel={content.contact.whatsappLabel}
          whatsappUrl={whatsappUrl}
          socials={content.contact.socials}
        />
      </main>

      <Footer brandLine={content.footer.brandLine} copyright={content.footer.copyright} />
    </>
  );
}
