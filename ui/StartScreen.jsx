import React, { useState, useRef } from "react";
import { ACTIVE_POSES } from "../engine/gameEngine.js";
import { BrandHeader, SimonArt } from "./Brand.jsx";
export default function StartScreen({ onStart }) {
  const [setup, setSetup] = useState(false);
  const [discovery, setDiscovery] = useState(true);
  const [topic, setTopic] = useState("space");
  const [answerMode, setAnswerMode] = useState("gestures");
  const [seconds, setSeconds] = useState(8);
  const poses = ACTIVE_POSES; // all movements are always in play
  const titleRef = useRef(null);
  function navigate(value) {
    setSetup(value);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => titleRef.current?.focus());
  }
  return (
    <div className="site-shell">
      <BrandHeader onHome={() => navigate(false)}>
        <nav aria-label="Main navigation">
          <a href="#how-it-works" onClick={() => setSetup(false)}>
            How to play
          </a>
          <button className="nav-start" onClick={() => navigate(!setup)}>
            {setup ? "Back to welcome" : "Let’s begin"}{" "}
            <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </BrandHeader>
      {!setup ? (
        <main id="main-content">
          <section className="welcome-hero">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="little-sun" aria-hidden="true">
                  ✳
                </span>{" "}
                A MOVEMENT GAME FOR OLDER ADULTS
              </p>
              <h1 tabIndex="-1" ref={titleRef}>
                Move a little.
                <br />Stay <em>sharp together.</em>
              </h1>
              <p className="hero-intro">
                A familiar game. Gentle movement. At your pace.
              </p>
              <p className="under-cta">
                3 lives · 6 rounds <span>·</span> Sit or stand
              </p>
            </div>
            <div className="hero-art">
              <svg className="orbit" viewBox="0 0 560 530" aria-hidden="true">
                <path
                  d="M42 394C-17 247 81 66 294 57C472 48 554 216 511 362C466 516 198 524 89 408"
                  fill="none"
                  stroke="#C7B6D7"
                  strokeWidth="1.4"
                />
                <path
                  d="M49 140Q91 115 107 69M100 70L108 67L110 78"
                  fill="none"
                  stroke="#806590"
                  strokeWidth="2"
                />
              </svg>
              <span className="hello-note">Oh, hello you!</span>
              <div className="art-disc" />
              <SimonArt />
            </div>
            <div className="hero-stats" aria-label="Market and demand statistics">
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/ageing-and-health"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TAM source: World Health Organization ageing and health fact sheet"
              >
                <span className="stat-label">TAM</span>
                <strong>1B</strong>
                <span>people aged 60+ worldwide in 2020</span>
                <small>WHO ↗</small>
              </a>
              <a
                href="https://www.americashealthrankings.org/explore/measures/physical_inactivity_sr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Demand source: 2024 physical inactivity data for adults age 65 and older"
              >
                <span className="stat-label">Demand</span>
                <strong>26.5%</strong>
                <span>of U.S. adults 65+ reported no recent physical activity</span>
                <small>2024 BRFSS ↗</small>
              </a>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/ageing-and-health"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Trend source: World Health Organization 2050 ageing projection"
              >
                <span className="stat-label">Trend</span>
                <strong>2.1B</strong>
                <span>people aged 60+ projected by 2050</span>
                <small>WHO ↗</small>
              </a>
            </div>
          </section>
          <section className="why-simon" aria-labelledby="why-simon-title">
            <div className="why-heading"><p className="eyebrow">WHY SIMON SAYS?</p><h2 id="why-simon-title">Made to fit <em>you.</em></h2></div>
            <div className="why-benefits">
              <article><h3>Move comfortably.</h3><p>Gentle movements, at your own pace.</p></article>
              <article><h3>Follow along.</h3><p>Clear words. A friendly voice.</p></article>
              <article><h3>Just you and a camera.</h3><p>No controller or wearable needed.</p></article>
              <article><h3>Stay curious.</h3><p>One discovery, woven through the game.</p></article>
            </div>
          </section>
          <section id="how-it-works" className="quiet-help">
            <details><summary>How to play</summary><p>“Simon says…” — do the move. Otherwise, stay still.</p><p>Three lives. Six rounds. A slip costs one life; skips are free.</p></details>
          </section>
          <section className="reassurance">
            <span aria-hidden="true">♡</span>
            <p>
              A camera, internet, and a little room to move.
            </p>
            <a
              className="text-button"
              href="https://github.com/midhatalvi/SimonSays"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more <span aria-hidden="true">↗</span>
            </a>
          </section>
        </main>
      ) : (
        <main className="setup-layout">
          <div className="setup-intro">
            <p className="eyebrow">LET’S FIND YOUR RHYTHM</p>
            <h1 ref={titleRef} tabIndex="-1">
              Your game.
              <br />
              <em>Your pace.</em>
            </h1>
            <p>
              Choose what feels comfortable.
            </p>
            <SimonArt />
            <details className="quiet-help"><summary>Camera & privacy</summary><p>Movement is processed on this device. Voice uses an online service. No microphone needed.</p><p>The session ends after 10 seconds without reliable tracking or readiness.</p></details>
          </div>
          <div className="setup-form">
            <fieldset>
              <legend>
                <span className="number-label">01</span> Your pace
              </legend>
              <div className="pace-options">
                {[
                  [12, "Relaxed"],
                  [8, "Comfortable"],
                  [5, "Quick"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className={seconds === value ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="pace"
                      value={value}
                      checked={seconds === value}
                      onChange={() => setSeconds(value)}
                    />
                    <span>
                      {label}
                      <small>{value} seconds</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <section className="discovery-settings">
              <label className="discovery-toggle">
                <span>
                  <strong>Move with discovery</strong>
                  <small>Discover a fact. Move. Remember.</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={discovery}
                  onChange={(e) => setDiscovery(e.target.checked)}
                />
              </label>
              {discovery && (
                <div className="discovery-options">
                  <label>
                    Explore
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    >
                      <option value="space">Space</option>
                      <option value="animals">Animals</option>
                    </select>
                  </label>
                  <label>
                    Answer with
                    <select
                      value={answerMode}
                      onChange={(e) => setAnswerMode(e.target.value)}
                    >
                      <option value="gestures">Comfortable gestures</option>
                      <option value="buttons">Answer buttons</option>
                    </select>
                  </label>
                  <details><summary>About discovery</summary><p>
                    No time limit. Your topic goes to Tavily only if you accept.
                    {answerMode === "gestures"
                      ? " Your first two moves answer A and B."
                      : ""}
                  </p></details>
                </div>
              )}
            </section>
            <div className="setup-action">
              <button
                className="big-btn"
                onClick={() =>
                  onStart({ seconds, poses, discovery, topic, answerMode })
                }
              >
                Play with Simon <span aria-hidden="true">↗</span>
              </button>
              <small>Camera permission comes next.</small>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
