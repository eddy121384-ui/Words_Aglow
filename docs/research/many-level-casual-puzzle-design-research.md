# Many-Level Casual Puzzle Design Research

Project: **燈火成章 / Words Aglow**  
Status: design research baseline  
Date: 2026-08-29

## Executive summary

Games such as match-3, bubble shooters, linker puzzles, Angry Birds-style physics puzzles, and other level-based casual games look mechanically simple, but their long-term production problem is not primarily art. It is **content design at scale**.

The strongest recurring pattern across King, Rovio, Wooga, academic puzzle-generation research, and multi-level production talks is:

> **Simple core mechanic + deliberate level composition + controlled luck + paced difficulty + fast iteration tools + analytics + automated testing.**

The key lesson for Words Aglow is that we should not begin by trying to invent a universal procedural generator. We should first create a **data-driven level format**, build several human-designed levels, identify what makes them fun, then build an editor and tester around those observed design rules. Only after that should generation become a production aid.

---

# 1. Why these games stay fun despite simple mechanics

## 1.1 The core action must feel good before the puzzle layer

Rovio describes the recurring pleasure of its puzzle games as pulling off a perfect shot, perfect match, or perfect strategy. The puzzle level is the arrangement that creates opportunities for those satisfying moments.

For Words Aglow, this means the wind-steering interaction itself must remain enjoyable even before the idiom system is considered:

- release a lantern;
- read drift and inertia;
- apply wind;
- counter-steer;
- settle into the intended region;
- receive immediate visual/audio confirmation.

If steering feels bad, more clever idiom design will not rescue the game.

## 1.2 The player needs both competence and uncertainty

Puzzle games stay engaging when the player can plausibly say:

> "I understand what I should do, but I am not certain I can execute it perfectly this time."

Too little challenge becomes routine. Too much uncertainty feels arbitrary. Research on game difficulty and flow consistently treats difficulty as most engaging when it remains meaningful relative to player skill.

For Words Aglow this maps cleanly into two independent difficulty axes:

- **Puzzle difficulty:** deciding where a character should go / which idiom route to pursue.
- **Execution difficulty:** steering the lantern accurately enough to put it there.

These should be tunable independently.

## 1.3 Familiar + fresh is a central long-term content formula

Rovio explicitly frames puzzle level design as balancing:

- challenge and luck;
- familiar and new.

The player should rarely need to relearn the whole game. Instead, most new levels recombine known rules in new contexts, occasionally introducing one new element.

This implies that Words Aglow should treat new mechanics as scarce design resources, not something to add every few levels.

---

# 2. A level is a designed experience, not merely a board

Across large casual puzzle games, a level is usually defined by multiple coordinated parameters rather than by layout alone.

Typical design levers include:

- initial board / object arrangement;
- objective;
- available actions or move count;
- spawn / draw logic;
- blockers / obstacles;
- movement rules;
- randomness bounds;
- tutorial intent;
- target difficulty;
- reward / completion conditions.

For Words Aglow, the equivalent level schema should eventually contain at least:

```text
Level ID
Initial lantern positions
Initial characters
Allowed idiom pool
Character queue / bag policy
Preview count
Rise speed
Near-cluster slowdown
Wind acceleration
Wind decay / inertia
Horizontal speed cap
Maximum lantern count / attempts
Fail line
Win condition
Difficulty tag
Mechanics tags
Tutorial / teaching intent
Designer notes
```

Important: this does not mean every parameter should be exposed to the player. It means the designer needs independent control over them.

---

# 3. Difficulty should pulse, not rise monotonically

A common mistake is imagining a campaign as a smooth line where every level is slightly harder than the last.

Multi-level design talks instead repeatedly recommend **waves / heartbeat / sawtooth pacing**:

1. introduce something in a safe or relatively easy level;
2. exercise it in several variations;
3. combine it with existing knowledge;
4. create a challenge spike;
5. provide a relief level;
6. introduce or remix the next idea.

Nathan Fouts describes this explicitly as a "heart-beat difficulty curve": introduce a mechanic in an easy level, challenge it, spike difficulty, then drop difficulty before introducing the next concept.

Wooga's Jelly Splash GDC material used a related vocabulary:

- Build-Up Levels
- Blocking Levels
- Relief Levels

The important design principle is not the terminology. It is that **difficulty rhythm matters more than monotonic escalation**.

### Implication for Words Aglow

A future 10-level sequence might look like:

```text
L1  Easy tutorial: release + A/D
L2  Easy application
L3  Normal: wider lateral correction
L4  Normal: first meaningful counter-steer
L5  Hard: precision placement
L6  Relief: visually satisfying easy idiom chain
L7  Introduce two simultaneous idiom routes
L8  Develop route choice
L9  Combine route choice + tighter steering
L10 Hard capstone
```

Then difficulty can drop again when a new concept is introduced.

---

# 4. Teaching is level design, not a separate tutorial system

For games with many mechanics, teams often maintain a **Beat Chart** showing when objects, concepts, goals, and mechanics are introduced and reused.

King's internal workflow has been described as using both a Level Library and a Beat Chart. A separate multi-level production talk also emphasizes that complicated mechanics should first be introduced in safer, simpler levels before appearing inside complex combinations.

### The practical pattern

For each mechanic:

1. **Introduce** — isolate it, low failure pressure.
2. **Develop** — require the player to use it deliberately.
3. **Twist** — use the same rule in an unexpected spatial/contextual way.
4. **Combine** — mix with an already mastered mechanic.
5. **Test** — create a harder level that demands understanding.
6. **Rest** — let the player enjoy mastery before the next lesson.

### Words Aglow examples

Mechanic: wind inertia

- Introduce: target directly above with forgiving width.
- Develop: target slightly left/right.
- Twist: force overshoot unless player counter-steers.
- Combine: correct steering while choosing between two idioms.
- Test: narrow safe landing zone + meaningful word choice.

This is much stronger than a text box saying "Press A/D to steer."

---

# 5. Controlled luck is a design material

Candy Crush's own postmortem framed luck as important for casual players, but emphasized putting luck in the right places rather than letting production quality depend on luck.

A useful distinction:

### Bad randomness

- produces unwinnable situations;
- invalidates planning;
- makes the player feel that skill did not matter;
- creates long runs of useless resources / characters.

### Good controlled randomness

- creates variation between attempts;
- occasionally enables a comeback;
- produces surprising but understandable combinations;
- prevents identical rote solutions;
- makes success feel partly emergent without becoming arbitrary.

### Words Aglow implication

The character system should eventually support several modes, not one global RNG algorithm:

1. **Fixed sequence** — tutorials / authored puzzle levels.
2. **Scripted prefix + bag** — first N characters deliberate, later draws controlled.
3. **Weighted bag** — favors characters useful to active idiom routes.
4. **Seeded sequence** — reproducible test / challenge mode.
5. **Endless mode bag** — more procedural, with anti-frustration guarantees.

The correct question is therefore not "what is the perfect random character algorithm?" but:

> "What degree of uncertainty is this specific level supposed to contain?"

---

# 6. Near-wins are more useful than raw failure rate

Wooga's Jelly Splash presentation introduced the **FUUU Factor**:

```text
tries until win / near-win attempts
```

The idea is important even if Words Aglow never uses that exact formula.

Two levels can both have low pass rates but feel completely different:

- Level A: player fails badly and cannot see a path to victory.
- Level B: player repeatedly gets extremely close.

Level B usually creates a stronger "one more try" feeling because the player has evidence that success is plausible.

The broader lesson:

> **A good hard level should usually communicate possibility, not hopelessness.**

### Metrics Words Aglow should eventually record

Per level:

- attempts;
- wins;
- quit / abandon rate;
- average lanterns used;
- remaining required idioms at failure;
- distance from intended target regions;
- number of useful vs useless character draws;
- number of near-wins;
- time to completion;
- retries before first win;
- whether the player immediately starts the next level.

Do not rely only on pass rate.

---

# 7. Human level design becomes a production pipeline

Once a game contains hundreds of levels, memory and ad-hoc documents stop scaling.

Examples documented in GDC material include:

- King internal level editor with level thumbnails, overview information, and designer ratings;
- King Level Library and Beat Chart;
- custom tools to search levels by mechanics / objects;
- custom level rearrangement tools to change campaign ordering quickly;
- Where's My Water using a custom editor with quick edit → play testing;
- Tiny Bubbles using custom analytics to visualize quits and tries per level;
- teams physically or digitally arranging level thumbnails to inspect overall pacing.

This leads to a critical conclusion for Words Aglow:

> **The editor is not merely convenience software. It becomes part of the game-design process itself.**

A useful level tool should eventually let us see not only one level, but the campaign as a dataset.

---

# 8. Recommended internal tooling for Words Aglow

## Stage A — Data-driven levels

First priority.

Move hard-coded board state into data files.

Example structure:

```text
levels/
  level-001.json
  level-002.json
  level-003.json
```

The runtime should not care whether a level was written by a human, generated by AI, or created in an editor.

## Stage B — Level Inspector / Editor

Required capabilities:

- select level;
- place/remove lanterns;
- edit characters;
- set idiom pool;
- edit fixed queue / character bag settings;
- tune rise speed and wind parameters;
- set win/fail conditions;
- play immediately;
- reset instantly;
- save/export level JSON.

Later:

- thumbnail overview;
- filters by mechanic;
- difficulty tag;
- tutorial tag;
- designer notes;
- duplicate level;
- reorder levels.

## Stage C — Validator

Before a level is even played, run deterministic checks:

- malformed JSON;
- invalid characters;
- invalid idioms;
- duplicate lantern positions;
- impossible initial overlaps;
- required character never appears;
- win condition inconsistent with available content;
- unreachable / unsupported cluster structures;
- fail line already crossed at start.

## Stage D — Logical Solver

Do **not** begin with full physical wind simulation.

First create an abstract solver that treats placement as discrete reachable regions / adjacency possibilities.

Questions:

- Does at least one solution exist?
- What is the minimum number of lantern placements?
- How many distinct solution branches exist?
- Is one particular character placement mandatory?
- Can the level become irrecoverable after a plausible mistake?

## Stage E — Physics / Skill Bots

After the abstract solver works, simulate imperfect execution.

Possible agent profiles:

```text
Perfect       exact steering / optimal choice
Skilled       small steering error
Average       moderate correction delay / occasional poor word choice
Novice        late counter-steer / larger positioning error
```

Run many seeded simulations to estimate a difficulty fingerprint.

The academic literature on match-3 already demonstrates reinforcement-learning agents and simulated data being used for playtesting and difficulty modelling. King has also publicly discussed AI-assisted regression testing across thousands of Candy Crush levels.

## Stage F — Generator

Only after good handcrafted levels exist.

Recommended approach:

### Solution-first generation

1. choose target idioms;
2. choose intended completion order;
3. generate a valid solution path;
4. construct the initial lantern arrangement around that path;
5. insert controlled alternatives / decoys;
6. run validator;
7. run solver;
8. run bot simulations;
9. score candidate;
10. send the best candidates to a human designer.

The generator should be a **candidate miner**, not an autonomous level publisher.

---

# 9. Testing: bots do not replace human playtesting

There are three distinct testing jobs.

## 9.1 Structural validation

Cheap, deterministic, exhaustive.

"Is this level legal?"

## 9.2 Automated simulation

Fast statistical testing.

"How does this level behave under many strategies / skill profiles?"

## 9.3 Human playtesting

Subjective quality.

"Is this actually fun, readable, surprising, satisfying, or annoying?"

Academic procedural-generation systems often use the same general structure: generate candidate levels, evaluate static properties, then run AI-agent simulations against promising candidates.

Rovio also stresses that data only identifies where to look; designers still inspect the level and decide why the experience is failing.

This distinction should remain a permanent design principle for Words Aglow.

---

# 10. What analytics should tell us

A level analytics screen should eventually answer:

### Difficulty

- pass rate;
- attempts-to-win distribution;
- first-attempt win rate;
- average retries;
- near-win frequency.

### Frustration

- abandonment after failure;
- failure distance from objective;
- repeated same failure mode;
- unusually long session on one level.

### Readability / understanding

- obvious bifurcation between players who understand a mechanic and players who do not;
- unusually high failure despite high remaining resources;
- placement patterns indicating players misunderstood the intended rule.

### Pacing

Across adjacent levels:

- consecutive difficulty spikes;
- too many trivial levels;
- mechanic repetition;
- new mechanics introduced too rapidly;
- insufficient relief after a blocker level.

Rovio explicitly describes using data to find trouble spots but relying on designers to determine the cause. Tiny Bubbles' developer similarly visualized wins/tries and used clusters of problematic attempts to distinguish genuinely difficult levels from explanation/readability problems.

---

# 11. Why thousands of levels do not require thousands of mechanics

The scalable content model is **combinatorial reuse**.

Suppose Words Aglow eventually has only a modest set of dimensions:

- rise speed;
- wind strength;
- target geometry;
- idiom count;
- simultaneous candidate routes;
- queue certainty;
- preview length;
- cluster density;
- obstacle / special lantern types;
- ordered vs unordered matching;
- typography constraints.

A small number of independently tunable dimensions creates a very large design space.

The trick is not maximizing combinations. It is curating combinations that teach, surprise, challenge, and then release tension.

---

# 12. Level design should separate puzzle difficulty from skill difficulty

A useful multi-level design distinction is:

### Puzzle difficulty

How hard is it to identify the correct plan?

For Words Aglow:

- number of plausible idioms;
- ambiguity of character placement;
- queue information;
- dependency between clears;
- recovery after mistakes.

### Skill / execution difficulty

How hard is it to execute the known plan?

For Words Aglow:

- rise speed;
- wind acceleration;
- inertia;
- counter-steer timing;
- target width;
- cluster geometry.

This is extremely useful because a level can intentionally be:

- easy puzzle / easy execution;
- easy puzzle / hard execution;
- hard puzzle / easy execution;
- hard puzzle / hard execution.

Do not make every hard level hard in every dimension simultaneously.

---

# 13. A practical content taxonomy for Words Aglow

Each authored level should eventually have an explicit **intent**, not merely a numeric difficulty.

Suggested tags:

```text
TUTORIAL
APPLICATION
TWIST
COMBINATION
PUZZLE
PRECISION
BLOCKER
RELIEF
SPECTACLE
CAPSTONE
```

Examples:

- `TUTORIAL`: introduce Space launch.
- `APPLICATION`: straightforward A/D steering.
- `TWIST`: overshoot requires counter-steer.
- `PUZZLE`: two idioms compete for the same useful region.
- `PRECISION`: known answer, difficult physical placement.
- `BLOCKER`: intentionally hard checkpoint.
- `RELIEF`: easier, high-combo / satisfying burn sequence.
- `SPECTACLE`: chain reaction or visually large release.
- `CAPSTONE`: combines recent lessons.

A campaign should be inspected by these tags, not just by level number.

---

# 14. Immediate implications for Words Aglow

## Do now

1. Keep current wind core prototype.
2. Convert levels to data.
3. Handcraft 5–10 small levels.
4. Give each level an explicit design intent.
5. Record puzzle difficulty separately from steering difficulty.
6. Build instant retry / playtest workflow.
7. Learn what actually makes a good Words Aglow level.

## Do shortly after

8. Build a minimal Level Editor.
9. Add Level Library view / tags.
10. Add deterministic validator.
11. Add basic analytics hooks.
12. Create a simple logical solver.

## Do later

13. Skill-profile bots.
14. Difficulty prediction.
15. Candidate level generation.
16. AI-assisted level ranking / variation.
17. Endless procedural mode.

## Explicitly do NOT do yet

- universal procedural generator;
- ML personalization;
- thousands of idioms before level design is understood;
- complex monetization-driven difficulty;
- massive live-ops infrastructure;
- advanced special-lantern mechanics.

---

# 15. Design rules to keep permanently

1. **A simple mechanic can support deep production complexity.** Do not confuse simple controls with simple game design.
2. **Every level needs an intention.** "Harder than the previous one" is not an intention.
3. **Difficulty is multidimensional.** Separate thinking difficulty from execution difficulty.
4. **Use a heartbeat, not a ramp.** Challenge must have relief.
5. **Teach with levels.** Introduce → develop → twist → combine → test.
6. **Controlled randomness should create possibility, not invalidate planning.**
7. **Measure near-wins, not only losses.** Hard-but-close and hard-and-hopeless are different products.
8. **The level editor is a design instrument.** Fast iteration directly changes level quality.
9. **A Level Library / Beat Chart becomes necessary surprisingly early.**
10. **Analytics tells us where to inspect, not what the design fix is.**
11. **Bots are filters, not taste.** They find impossibility, instability, and statistical difficulty; humans judge fun.
12. **Generate solutions before generating chaos.** Solution-first generation is safer for puzzle content.
13. **The generator should mine candidates; humans curate.**
14. **Do not build the generator until we can describe why several handcrafted levels are good.**
15. **For Words Aglow, content production—not 3D art—is likely to become the dominant scaling problem.**

---

# 16. Proposed Words Aglow production pipeline

```text
Core Game
   ↓
Data-Driven Level Format
   ↓
Handcrafted Levels
   ↓
Level Editor + Level Library + Beat Chart
   ↓
Validator
   ↓
Human Playtest + Analytics
   ↓
Abstract Solver
   ↓
Physics / Skill Bots
   ↓
Difficulty Model
   ↓
Candidate Generator
   ↓
Automated Screening
   ↓
Human Curation
   ↓
Released Level Set
   ↓
Live Player Analytics
   ↺ tune / reorder / replace
```

This should be considered the long-term content architecture for the project unless playtesting disproves it.

---

# References / source notes

Primary / industry sources:

- King / Jeremy Kang, **Level Design Saga: Creating Levels for Casual Games**, GDC Europe 2016.  
  https://www.gdcvault.com/play/1023854/Level-Design-Saga-Creating-Levels
- King / Tommy Palm, **Candy Crush Saga Postmortem: Luck in the Right Places**, GDC 2013.  
  https://www.gdcvault.com/play/1019062/Candy-Crush-Saga-Postmortem-Luck
- King, **How King Uses AI in Candy Crush**, GDC Europe 2016.  
  https://www.gdcvault.com/play/1023858/How-King-Uses-AI-in
- InfoQ, **How King uses AI to test Candy Crush Saga**.  
  https://www.infoq.com/articles/candy-crush-QA-AI-saga/
- Rovio, **The Craft Behind the Levels: A Look into Level Design in Rovio Games**.  
  https://www.rovio.com/articles/the-craft-behind-the-levels-a-look-into-level-design-in-rovio-games/
- Rovio, **Using Data to Improve Player Experience: Insights from Rovio's Game Analytics**.  
  https://www.rovio.com/articles/using-data-to-improve-player-experience-insights-from-rovios-game-analytics/
- Rovio, **Creating Personally Tailored Games with Machine Learning**.  
  https://www.rovio.com/articles/creating-personally-tailored-games-with-machine-learning/
- Pocket Gamer, **The making of an Angry Birds level** (interview with Rovio level designer Arttu Mäki).  
  https://www.pocketgamer.com/angry-birds/exclusive-the-making-of-an-angry-birds-level/
- Nathan Fouts, **Set This Game in Order**, GDC 2018 — multi-level organization, heartbeat curve, editors, analytics, Level Library examples.  
  https://media.gdcvault.com/gdc2018/presentations/Fouts_Nathan_SetThisGame.pdf
- Wooga / Florian Steinhoff, **Jelly Splash: Puzzling Your Way to the Top of the App Stores**, GDC 2014 — Build-Up / Blocking / Relief levels and FUUU Factor.  
  https://media.gdcvault.com/GDC2014/Presentations/Steinhoff_Florian_Jelly_Splash_Puzzling.pdf

Academic / technical sources:

- Williams-King et al., **The Gold Standard: Automatically Generating Puzzle Game Levels**, AIIDE — candidate generation followed by AI-agent simulation.  
  https://ojs.aaai.org/index.php/AIIDE/article/view/12529
- Kim et al., **Playtesting in Match 3 Game Using Strategic Plays via Reinforcement Learning**, IEEE Access 2020.  
  https://doi.org/10.1109/ACCESS.2020.2980380
- Kristensen et al., **Statistical Modelling of Level Difficulty in Puzzle Games** — Lily's Garden difficulty modelling.  
  https://arxiv.org/abs/2107.03305
- Kristensen et al., **Difficulty Modelling in Mobile Puzzle Games: combining player analytics and simulated data**, 2024.  
  https://onlinelibrary.wiley.com/doi/10.1155/2024/5592373
- Ascarza et al., **Personalized content, engagement, and monetization in a mobile puzzle game**, International Journal of Industrial Organization — perceived difficulty and near-win based friction metric.  
  https://doi.org/10.1016/j.ijindorg.2024.103128
- Hamari et al., **Challenging games help students learn: engagement, flow and immersion**, Computers in Human Behavior — useful general evidence on challenge/skill and engagement.  
  https://doi.org/10.1016/j.chb.2015.07.045

Secondary observations should not be treated as proof of hidden live-game algorithms. Claims about exact dynamic difficulty manipulation in commercial games are often player inference unless confirmed by the developer. For Words Aglow, use the documented design principles rather than copying speculative dark-pattern claims.
