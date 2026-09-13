import React, { useState, useRef } from "react";
import { ACTIVE_POSES } from "../engine/gameEngine.js";
import { BrandHeader, SimonArt, MoveIcon } from "./Brand.jsx";
const names = {
  RIGHT_HAND_UP: "Right hand up",
  LEFT_HAND_UP: "Left hand up",
  TOUCH_HEAD: "Touch head",
  TOUCH_NOSE: "Touch nose",
  TOUCH_SHOULDERS: "Touch shoulders",
  ARMS_OUT: "Arms out wide",
};
export default function StartScreen({ onStart }) {
  const [setup, setSetup] = useState(false);
  const [discovery, setDiscovery] = useState(true);
  const [topic, setTopic] = useState("space");
  const [answerMode, setAnswerMode] = useState("gestures");
  const [seconds, setSeconds] = useState(8);
  const [poses, setPoses] = useState([
    "RIGHT_HAND_UP",
    "LEFT_HAND_UP",
    "TOUCH_NOSE",
  ]);
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
                Turn a few everyday movements into a game you know.
                Simon guides you with clear instructions, gentle encouragement,
                and movements you choose—seated or standing.
              </p>
              <p className="under-cta">
                3 lives · 6 rounds <span>·</span> Sit or stand <span>·</span> Your
                pace
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
              <span className="art-sticker">
                A good day starts
                <br />
                with a little <em>hello.</em>
              </span>
              <span className="art-caption">
                THIS IS SIMON. HE’S GLAD YOU’RE HERE.
              </span>
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
            <div className="why-heading"><p className="eyebrow">WHY SIMON SAYS?</p><h2 id="why-simon-title">Familiar play.<br />Made to fit <em>you.</em></h2><p>A simple way to add movement, listening, and a little curiosity to your day.</p></div>
            <div className="why-benefits">
              <article><h3>Your comfort comes first.</h3><p>Choose hand and arm movements that feel right for you. Play seated or standing, and choose how much time you have for each move.</p></article>
              <article><h3>Clear guidance, every round.</h3><p>Read the instruction on screen or listen to Simon’s voice. Large controls make it easy to pause, hear it again, or skip without a penalty.</p></article>
              <article><h3>Your movements are the controls.</h3><p>Your webcam follows your chosen movements, so you can play without clicking an answer each round. Camera images are processed on your device.</p></article>
              <article><h3>A familiar game. A little challenge.</h3><p>Move when Simon says. Otherwise, stay still. Start with three lives and play up to six rounds—a slip costs one life. Simon encourages you along the way.</p></article>
            </div>
          </section>
          <section id="how-it-works" className="how-section">
            <div className="section-intro">
              <p className="eyebrow">NOTHING TO MASTER. JUST ENJOY.</p>
              <h2>
                A familiar game,
                <br />a gentler rhythm.
              </h2>
            </div>
            <article>
              <span className="step-mark">
                01 <span aria-hidden="true">◔</span>
              </span>
              <h3>Listen for Simon.</h3>
              <p>
                When you hear “Simon says,” follow the move. Otherwise, stay
                still.
              </p>
            </article>
            <article>
              <span className="step-mark">
                02 <MoveIcon pose="ARMS_OUT" />
              </span>
              <h3>Make it your move.</h3>
              <p>
                Choose what feels comfortable. Pause or skip a round whenever you need.
              </p>
            </article>
            <article>
              <span className="step-mark">
                03 <span aria-hidden="true">✳</span>
              </span>
              <h3>Keep your lives.</h3>
              <p>
                You have three lives. Moving on a trick or missing a move costs
                one. Reach six rounds, or play again when your lives run out.
              </p>
            </article>
          </section>
          <section className="reassurance">
            <span aria-hidden="true">♡</span>
            <p>
              All you need is a camera, an internet connection, and room to move.
              <br />
              <strong>Choose your movements first. We’ll ask for camera access when you start.</strong>
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
              Choose your movements, then start the game. Sit or stand
              comfortably.
            </p>
            <SimonArt />
            <p className="privacy-note">
              Your camera processes movement on this device. Voice prompts use
              an online service. No microphone is needed.
            </p>
          </div>
          <div className="setup-form">
            <fieldset className="movement-field">
              <legend>
                <span className="number-label">01</span> What feels good today?
              </legend>
              <p className="field-help">
                Choose at least one comfortable movement.
              </p>
              <div className="movement-grid">
                {ACTIVE_POSES.map((pose) => (
                  <label
                    className={
                      "movement-option " +
                      (poses.includes(pose) ? "selected" : "")
                    }
                    key={pose}
                  >
                    <MoveIcon pose={pose} />
                    <span>{names[pose]}</span>
                    <input
                      type="checkbox"
                      checked={poses.includes(pose)}
                      onChange={() =>
                        setPoses((current) =>
                          current.includes(pose)
                            ? current.filter((p) => p !== pose)
                            : [...current, pose],
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                <span className="number-label">02</span> Leave yourself a little
                time.
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
                  <strong>A little discovery, too?</strong>
                  <small>Offer a question after three movement rounds.</small>
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
                  <p>
                    Always optional, with no time limit. Your topic goes to
                    Tavily only if you accept the break.
                    {answerMode === "gestures"
                      ? " Your first two selected moves answer A and B; with one move, you’ll use buttons."
                      : ""}
                  </p>
                </div>
              )}
            </section>
            <div className="setup-action">
              <p>
                Start with three lives. We’ll explain the rules when your camera is ready.
                Relax your hands between rounds, then follow the next instruction only if Simon says.
              </p>
              <button
                className="big-btn"
                disabled={!poses.length}
                onClick={() =>
                  onStart({
                    seconds,
                    poses,
                    discovery,
                    topic,
                    answerMode: poses.length < 2 ? "buttons" : answerMode,
                  })
                }
              >
                Play with Simon <span aria-hidden="true">↗</span>
              </button>
              {!poses.length && (
                <p role="status">
                  Choose at least one comfortable movement to begin.
                </p>
              )}
              <small>Your camera will ask permission next. The session ends after 10 seconds without movement detection.</small>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
