import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Home } from "lucide-react";
import { Section, Container, Eyebrow } from "../components/ui/Section";
import Button from "../components/ui/Button";
import { getPublicAssetUrl, PARENT_POLICIES } from "../data/content";
import NotFound from "./NotFound";
import PageMeta from "../components/PageMeta";

export default function PolicyPage() {
  const { policySlug } = useParams();
  const policy = PARENT_POLICIES.find((item) => item.slug === policySlug);

  if (!policy) {
    return <NotFound />;
  }

  return (
    <>
      <PageMeta
        title={`${policy.title} | Tiny Explorers Nursery & Preschool`}
        description={policy.summary}
      />
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem] bg-[radial-gradient(50%_40%_at_50%_0%,rgba(251,194,71,0.18)_0%,transparent_72%)]" />
        <Container size="prose">
          <Link
            to="/parents"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-ink/65 transition hover:text-brand-orange"
          >
            <ArrowLeft size={16} />
            Back to Parent Information
          </Link>

          <div className="mt-8 rounded-[2rem] border border-brand-ink/10 bg-white/90 p-8 shadow-soft sm:p-10 lg:p-12">
            <Eyebrow color="orange">{policy.category}</Eyebrow>
            <h1 className="mt-5 font-poppins text-3xl font-bold leading-[1.06] tracking-tight text-brand-ink sm:text-4xl lg:text-[2.8rem]">
              {policy.title}
            </h1>
            <p className="mt-6 text-[1.04rem] leading-[1.8] text-brand-ink/70">
              {policy.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" to="/parents" icon={false}>
                Back to parent information
              </Button>
              <Button variant="secondary" to="/" icon={false}>
                Back to home
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section size="default" surface="cream" className="pt-0">
        <Container size="prose">
          <div className="rounded-[2rem] border border-brand-ink/10 bg-white p-8 shadow-soft sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-ink/10 pb-6">
              <div>
                <Eyebrow color="orange">Official Policy</Eyebrow>
                <h2 className="mt-3 font-poppins text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl">
                  {policy.title}
                </h2>
              </div>
              <a
                href={getPublicAssetUrl(`/policies-docs/${encodeURIComponent(policy.downloadFile)}`)}
                download={policy.downloadFile}
                className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-white"
              >
                <Download size={16} />
                Download Original Policy
              </a>
            </div>

            <div className="prose prose-slate mt-8 max-w-none prose-headings:font-poppins prose-headings:text-brand-ink prose-p:text-brand-ink/75 prose-strong:text-brand-ink prose-li:text-brand-ink/75">
              {policy.content.map((section, index) => (
                <section key={`${section.title}-${index}`} className="mb-10">
                  <h3 className="mt-0 text-[1.35rem] font-semibold tracking-tight text-brand-ink">
                    {index + 1}. {section.title}
                  </h3>
                  {section.blocks.map((block, blockIndex) => {
                    if (block.type === "list") {
                      return (
                        <ul key={`${section.title}-${blockIndex}`} className="mt-4 list-disc space-y-2 pl-6">
                          {block.items.map((item, itemIndex) => (
                            <li key={`${section.title}-${blockIndex}-${itemIndex}`}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === "numbered-list") {
                      return (
                        <ol key={`${section.title}-${blockIndex}`} className="mt-4 list-decimal space-y-2 pl-6">
                          {block.items.map((item, itemIndex) => (
                            <li key={`${section.title}-${blockIndex}-${itemIndex}`}>
                              {item}
                            </li>
                          ))}
                        </ol>
                      );
                    }
                    if (block.type === "note") {
                      return (
                        <div
                          key={`${section.title}-${blockIndex}`}
                          className="mt-4 rounded-2xl border border-brand-ink/10 bg-brand-cream/60 p-4"
                        >
                          <p className="m-0 font-semibold text-brand-ink">{block.title}</p>
                          <p className="mt-2 m-0 text-brand-ink/75">{block.text}</p>
                        </div>
                      );
                    }
                    return (
                      <p key={`${section.title}-${blockIndex}`} className="mt-4 text-[1.02rem] leading-[1.8]">
                        {block.text}
                      </p>
                    );
                  })}
                </section>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
