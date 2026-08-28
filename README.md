# 燈火成章 / Words Aglow

A wind-controlled Chinese word puzzle built around sky lanterns.

> **Place a lantern → let it rise → steer with wind → connect characters → complete an idiom → burn the completed phrase.**

## Current status

Pre-production / playable greybox.

The core interaction has been tested in greybox form and is now moving into a real repository so it can be versioned, tested, polished, and actually finished.

## Core loop

1. Choose a launch position along the bottom of the playfield.
2. Release a lantern carrying one Chinese character.
3. The lantern rises automatically.
4. Hold **A** to blow left and **D** to blow right. Horizontal motion has inertia, so counter-steering matters.
5. The lantern catches onto the existing lantern cluster.
6. If four connected lanterns can form a valid four-character idiom, they ignite and disappear.
7. Lanterns that lose their connection to the anchored cluster are released and float away.
8. If the cluster grows down to the fail line, the run ends.

Desktop controls:

- **A** — wind left
- **D** — wind right
- **Space** — release lantern
- Mouse / pointer — choose launch position

Touch controls retain left/right wind buttons and a release button.

## Design principles

**Words first, not education-app first.** The game should feel like a satisfying casual puzzle. Learning idioms is a side effect, not homework.

**Wind is the skill layer.** The player should read the board and steer rather than solve precision physics.

**Readable cheating is allowed; visible cheating is not.** Assistance may soften motion or attachment, but lanterns must never visibly teleport.

**Content should grow through rules and data, not asset explosion.** The project is deliberately designed to avoid character-model, animation, and environment-asset hell.

## v0.1 scope lock

The first playable repository version contains only:

- four-character idioms
- launch-position selection
- automatic upward lantern motion
- A / D wind control with inertia
- Space to release a lantern
- lantern-cluster attachment
- unordered four-character idiom matching
- burn / removal feedback
- disconnected-lantern release
- fail line
- semi-random character bag

Explicitly **not** in v0.1:

- poetry / verse mode
- ordered-character matching
- font-matching rules
- special lanterns or power-ups
- environmental wind hazards
- progression / economy / collection systems
- narrative
- multiplayer

Those ideas belong in the roadmap only after the base game is proven and finished.

## Primary tuning questions

The current prototype is no longer searching for a core mechanic. It is tuning one.

1. **Character bag:** How often should the game offer a useful character without obviously feeding the answer?
2. **Rise speed:** Does the player have enough time to read, steer, and counter-steer without the game feeling slow?
3. **Wind curve:** How quickly should wind ramp up and decay after release?
4. **Attachment feel:** Does a lantern visibly settle into the cluster without teleporting or feeling overly sticky?
5. **Board readability:** Can players identify potential idioms before the next lantern reaches the cluster?

## Working title

**中文：燈火成章**  
**English: Words Aglow**
