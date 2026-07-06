import React from "react";
import { Section, Container, Eyebrow } from "./ui/Section";
import Button from "./ui/Button";

/**
 * Top-level error boundary — catches render errors anywhere in the routed
 * tree and shows a recoverable screen instead of a blank white page.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-brand-cream text-brand-ink">
        <Section size="xl" surface="cream" reveal={false}>
          <Container size="prose" className="text-center">
            <Eyebrow color="orange" className="justify-center">
              Something went wrong
            </Eyebrow>
            <h1 className="mt-5 font-poppins text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
              This page hit a snag.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-[1.6] text-brand-ink/70 sm:text-[1.0625rem] sm:leading-[1.7]">
              Something unexpected happened while loading this page. Let's
              get you back to a safe place.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="accent" onClick={this.handleReload}>
                Back to home
              </Button>
            </div>
          </Container>
        </Section>
      </div>
    );
  }
}
