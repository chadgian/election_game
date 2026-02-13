import Link from 'next/link';

export default function TutorialPage() {
  return (
    <main className="game">
      <section className="glass pageTabs">
        <Link href="/" className="tab">🏛️ HQ</Link>
        <Link href="/planning" className="tab">🗓️ Weekly Planning</Link>
        <Link href="/briefing" className="tab">🧾 Opposition Briefing</Link>
        <Link href="/tutorial" className="tab active">📘 Tutorial</Link>
      </section>

      <section className="glass panel tutorialPanel">
        <h2>📘 Election Command Tutorial</h2>
        <p>This guide explains the interface, weekly loop, and how scores are calculated.</p>

        <h3>1) Start setup</h3>
        <p>Choose your country and political party in HQ. This resets the campaign and also builds an opposition profile.</p>

        <h3>2) Color and UI meaning</h3>
        <p>• Blue bars and highlights = your positive campaign strength.</p>
        <p>• Red accents/risk tags = higher risk actions or opposition pressure.</p>
        <p>• Cyan outline on action cards = selected strategy for the current week.</p>
        <p>• Region lead/trail color cues show where you are strong or vulnerable.</p>

        <h3>3) Weekly flow (step-by-step)</h3>
        <p>Step A: Go to Weekly Planning and select up to 3 actions.</p>
        <p>Step B: If a media question appears, answer it (text input) or ignore it.</p>
        <p>Step C: Proceed week to resolve your actions, media impact, opposition move, and world event.</p>
        <p>Step D: Review outcomes in Opposition Briefing and plan the next week.</p>

        <h3>4) Media Q&A system</h3>
        <p>Your answer is evaluated by topic relevance + clarity. Ignoring usually hurts trust/momentum.</p>
        <p>The opposition also answers automatically based on its traits. Briefing shows both answers for comparison.</p>

        <h3>5) How result is calculated</h3>
        <p>Final outcome blends demographic support, momentum, field power, narrative, national pulse, regional score gap, and scandal risk penalty.</p>
        <p>At campaign end, the game now lists the top factors that most affected victory or defeat.</p>

        <h3>6) Quality-of-life controls</h3>
        <p>You can hide the floating analyst (✕ button) and bring it back with “Show Analyst”.</p>
      </section>
    </main>
  );
}
