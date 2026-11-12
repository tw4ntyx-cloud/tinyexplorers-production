import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Section, Container, Eyebrow } from "../components/ui/Section";
import PageMeta from "../components/PageMeta";
import Button from "../components/ui/Button";
import api from "../lib/api";
import { BRAND } from "../data/content";

/**
 * Newsletter unsubscribe, opened from the link in the welcome email.
 * Asks for a click before unsubscribing, so email scanners that open links
 * automatically cannot unsubscribe anyone by accident.
 */
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const onConfirm = async () => {
    setStatus("loading");
    try {
      const { data } = await api.post("/newsletter/unsubscribe", { token });
      setMessage(data.message);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Section size="xl" surface="cream" reveal={false}>
      <PageMeta title="Unsubscribe | Tiny Explorers Nursery & Preschool" description="Stop receiving Tiny Explorers newsletter emails." noindex />
      <Container size="prose">
        <Eyebrow color="orange">Newsletter</Eyebrow>
        <h1 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
          Unsubscribe from our updates
        </h1>
        {!token ? (
          <p className="mt-6 text-[1.04rem] leading-[1.8] text-brand-ink/75" data-testid="unsubscribe-missing">
            This link is incomplete. Please use the link in your email, or write to{" "}
            <a className="font-semibold underline" href={`mailto:${BRAND.email}?subject=Unsubscribe`}>{BRAND.email}</a>{" "}
            and we will remove your address.
          </p>
        ) : status === "done" ? (
          <p role="status" className="mt-6 text-[1.04rem] leading-[1.8] text-brand-ink/75" data-testid="unsubscribe-done">
            {message}
          </p>
        ) : (
          <>
            <p className="mt-6 text-[1.04rem] leading-[1.8] text-brand-ink/75">
              Confirm below and we will stop sending Tiny Explorers newsletter emails to this address.
            </p>
            <div className="mt-8">
              <Button variant="primary" onClick={onConfirm} disabled={status === "loading"} icon={false} data-testid="unsubscribe-confirm">
                {status === "loading" ? "Unsubscribing…" : "Unsubscribe me"}
              </Button>
            </div>
            {status === "error" && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-700">
                Something went wrong. Please try again, or write to {BRAND.email}.
              </p>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}
