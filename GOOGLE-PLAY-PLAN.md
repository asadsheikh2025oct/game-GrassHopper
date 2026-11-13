# GrassHopper — plan to publish on Google Play

Written 24 October 2026, revised 25 October after a fact-check. Nothing in this plan has been done yet; it is the route map.

**Section 13 at the end grades every claim in here as verified, second-hand, or my estimate.** Read it before you act on any single number.

---

## 1. The short version

| | |
|---|---|
| **What we put on Play** | GrassHopper as a real Android app, with the game files inside the app |
| **How** | Capacitor (an Android shell around the existing HTML/JS game) |
| **Money** | £0 to build. **$25 once** for the Google Play developer account. No yearly fee. |
| **Time** | About **5 to 6 weeks** from today, and most of that is waiting, not working |
| **The slow bit** | Google makes new personal accounts run a closed test with **12 testers for 14 days in a row** before they will let you go live |
| **What stays as it is** | The free web version on GitHub Pages keeps working exactly as now |

---

## 2. Two ways to do it, and why I recommend one

Both routes are legitimate — the TWA tooling is Google's own. The choice is about dependencies, not about what Play allows.

### Route A — Capacitor (recommended)

Capacitor builds a proper Android app and **puts the game files inside it**. The player downloads the game once from Play and it runs from the phone, with no browser involved.

**Good:**
- Works offline from the very first launch, with no reliance on the player's browser or on GitHub Pages staying up.
- We control the Android bits properly: screen orientation, the back button, the splash screen, the app icon.
- Nothing to prove about who owns a website (see Route B).
- Later options stay open — ads, in-app purchases, Google Play leaderboards and achievements all have Capacitor plugins.

**Less good:**
- Every change to the game means a new build and a new Play release (a day or two of review).
- Needs Android Studio on the laptop — about 10 GB.

### Route B — TWA / Bubblewrap

A thin shell that opens the GitHub Pages site full-screen in Chrome's engine. Updates to the website appear in the app with no new Play release.

**Why I am not recommending it:**
- Android has to verify we own the website using a file at `https://asadsheikh2025oct.github.io/.well-known/assetlinks.json`. I checked today: that address returns **404**, and it cannot live inside the `game-GrassHopper` repo because the game sits in a sub-folder. It would need a brand new repo called `asadsheikh2025oct.github.io`, or a paid custom domain. Doable, but it is a dependency we do not need.
- The first launch needs internet. Offline only works after Chrome has cached the game.
- If the ownership file is ever wrong, the app shows a browser address bar across the top of the game.

**My call: Route A.** The whole game is about 250 KB. There is no reason to make a phone fetch it over the internet when it can simply be in the app.

---

## 3. What has to happen first (pre-flight)

These are small and they block everything else.

1. **Push the two local commits.** The live site still says "Hop" — the telemetry removal and the GrassHopper rename are committed on this laptop only. The Play listing, the screenshots and the web version must all agree.
2. **Pick the package name.** Something like `com.fahadsheikh.grasshopper`. This is **permanent** — it can never be changed once the app is published, and it cannot be reused even if the app is deleted. Needs deciding before the first build.
3. **Pick the publisher name** players will see on the store page. Real name or a made-up studio name — both are allowed, but it must be a name we are happy being public.
4. **Decide the age rating we aim for** (see section 6 — this one has real consequences).
5. **Check Android Studio will fit on the laptop** (~10 GB free, 8 GB RAM).

---

## 4. Work needed on the game itself

The game is finished as a game. These are Android-specific jobs, not gameplay.

| # | Job | Why |
|---|---|---|
| 1 | **Android back button to pause menu** | On a phone, pressing Back in a Capacitor app closes the whole app by default. Losing a run to a stray thumb is the kind of thing that earns one-star reviews. |
| 2 | **Mark the app as a game** (`android:appCategory="game"`) | Apps targeting Android 16 can no longer lock orientation or aspect ratio on screens 600dp wide and over — tablets and unfolded foldables. Google's own list of exceptions has three entries, and the first is "Games (based on the `android:appCategory` flag)". GrassHopper is landscape-only, so without this flag it gets stretched on big screens. There is also a general opt-out property, but Google says that one **stops working at Android 17**, so the game flag is the durable route. |
| 3 | **Proper Android icons** | Android wants adaptive icons (a foreground layer and a background layer), not just the two PNGs we have. Generated from the existing art. |
| 4 | **Native splash screen** | There is a moment before the web view paints. Without a splash the player sees a white or black flash. It should match the meadow green `#1f3d2b`. |
| 5 | **Leave the dev files out of the build** | `editor.html`, `playbot.js`, `test-phase1..5.js`, `validate-levels.js`, `fix-platforms.js`, `tune-levels.js` have no business inside a shipped app. The level editor especially — players finding it would be confusing. |
| 6 | **Keep the save keys as they are** | The saved progress keys are still named `hop-*`. Leave them. Renaming would wipe progress for anyone who already played the web version. |
| 7 | **Re-run the full test suite on the real build** | All 235 tests currently pass in the browser. They need to pass inside the Android web view too, on a real phone. |

Jobs 1 and 2 are required. Jobs 3 and 4 are "the app looks amateur without them". Job 5 is tidiness and a small policy risk.

---

## 5. The Google Play developer account

| Step | Detail |
|---|---|
| Sign up | play.google.com/console, with a Google account that will be kept for years |
| Type | **Personal** account (an Organisation account needs a D-U-N-S business number) |
| Fee | **$25, one time.** Credit or debit card in your own legal name — **prepaid cards are refused** |
| Identity check | Government photo ID in the same legal name. If the details do not match, the $25 is **not refunded** |
| How long | Usually a couple of days, sometimes up to a week |
| Public contact details | An email address and a website shown on the store page. Worth making a separate Gmail for the game rather than using the personal one |

**One privacy point worth knowing before you type an address in.** For a personal account the public store page normally shows just your name and country — but reports are consistent that once an account **monetises** (a paid app, or in-app purchases), Play publishes the developer's **full address**, and for a personal account that means your home address. PO boxes and virtual offices are reportedly refused. GrassHopper is free with no purchases, so this does not bite today. It would bite the day you ever add a purchase. If paid games are anywhere in the plan, that is the argument for an Organisation account with a business address instead — and Organisation accounts need a D-U-N-S number, so it is a decision to take at the start, not later. I could not find Google's own current wording on exactly what is displayed, so check what the Console says before entering anything.

Do this early. It can verify in the background while the game work in section 4 happens.

---

## 6. The forms Google makes you fill in

These are not optional, and a wrong answer causes a rejection now or a removal later.

**Content rating** — a questionnaire (violence, language, gambling, and so on) which generates ratings for every region automatically. GrassHopper has cartoon bugs and frogs and no blood, so expect **PEGI 3 / Everyone**.

**Target audience and content** — this is the one that matters:
- Choosing **13 and over** keeps things simple.
- Choosing an age group **under 13** puts the app into Google's **Families policy**: a stricter content review, rules about ads and analytics, and a privacy policy written for children.
- GrassHopper will obviously be played by children. The honest answer is probably to include a younger age band and accept the extra forms. **This is a decision for you, not for me** — it changes both the paperwork and how long review takes.

**Data safety** — a declaration of what the app collects and sends. For GrassHopper the answer is **nothing**: the telemetry was removed, best times and progress stay on the phone, and nothing is transmitted. That is the easiest possible version of this form, and keeping it that way is worth something.

**Privacy policy** — a public web page is required even for an app that collects nothing. I can write a short, honest one and host it on GitHub Pages for free.

**Ads declaration** — "no ads". (If ads are ever added, this form and the content rating both have to change first.)

---

## 7. The store listing

| Asset | Requirement | Notes |
|---|---|---|
| App name | 30 characters | "GrassHopper" |
| Short description | 80 characters | The line that sells it in search results |
| Full description | 4,000 characters | Features, levels, controls |
| App icon | 512 x 512, 32-bit PNG with alpha, under 1024 KB | Have it. May need redrawing without rounded corners, since Play adds its own mask |
| Feature graphic | 1024 x 500, JPEG or 24-bit PNG, **no transparency** | **Does not exist yet.** The big banner at the top of the store page. Can be rendered from the game's own art |
| Phone screenshots | **Minimum 2** to publish, up to 8 per device type. Each side 320 to 3840 px, and the long side no more than twice the short side | Landscape, taken from the real build. Google separately *recommends* at least 4 at 1920 x 1080 — worth doing, because the recommended set is what store promotion looks at |
| Tablet screenshots | 4 or more, 16:9, between 1080 and 7680 px | Not compulsory, but large-screen listings without them do worse |
| Category | Game, then Arcade or Platformer | |
| Price | Free | A free app can never be made paid later. A paid app can be made free. |
| Countries | Suggest UK first, then worldwide | |

---

## 8. The testing ladder

Play has three test tracks, and only one of them counts toward the requirement.

**Internal testing** — up to 100 testers, available in minutes, no Google review. This is where we iterate. **It does not count** toward the 12-tester rule: Google's own wording only ever says "closed test", and every guide agrees internal testing is excluded. Do not burn two weeks on the wrong track.

**Closed testing** — this is the one Google requires. The rule, from Google's own help page:

> Personal accounts created after 13 November 2023 must run a closed test with **at least 12 testers, each opted in continuously for at least 14 days**, before the Production page is unlocked.

What that means in practice:
- 12 real people with real Google accounts who **accept the invitation and stay opted in**. Someone who installs and then removes the app from their account breaks the count.
- The safe number to invite is **16 to 18**, not 12, because some people never click the link. (That margin is my advice, not a Google rule.)
- The 14 days are consecutive. Google's wording is that each tester must be opted in *continuously*, and must still be opted in on the day you apply. Whether one person dropping out resets everybody's clock is **not stated anywhere in Google's documentation** — the guides that claim it and the guides that deny it are both guessing. Plan for the strict reading rather than finding out.
- Google also judges **engagement**, not just the headcount. Testers who never open the game are a problem.
- You already have a test group giving feedback on the touch controls — that group is the seed of this list.

**Production application** — once the 14 days are served, a three-part form:
1. About the closed test — how easy testers were to find, whether they used all the features, and a summary of their feedback.
2. About the game — audience, what makes it worth playing, expected installs in year one.
3. About production readiness — **what was changed because of tester feedback**, and how we know it is ready.

Google says review is **seven days or less**. A thin or evasive answer here is a common reason to be sent back to keep testing. Keeping notes during the 14 days makes this form easy.

---

## 9. Technical requirements to build against

| Requirement | Value | Status |
|---|---|---|
| File format | Android App Bundle (`.aab`), not `.apk` | Capacitor produces this |
| Target API level | **36 (Android 16) or higher** — mandatory for new apps since 31 Aug 2026 | Capacitor 8 targets exactly 36. Good. |
| Minimum API level | Whatever Capacitor 8 ships with | Don't fight it; it covers effectively every phone in use. Read the real number off `variables.gradle` after the first build rather than trusting this plan |
| 64-bit | Required | No native code in this game, so free |
| Build tools | Android Studio, a JDK (21 is the version the Capacitor community uses; the official docs don't name one), Node (already installed) | To install |
| Signing | **Play App Signing** — Google holds the release key, we hold an upload key | See below |

**On the target SDK, one thing to understand now.** Capacitor's docs state plainly that "Capacitor Android does not support custom target SDK versions" — each Capacitor version is tied to one target SDK. So when Google moves the deadline again next year, the fix is **upgrading Capacitor**, not editing a number. That is a yearly maintenance job for as long as the game stays on Play, and it is the main ongoing cost of being on the store at all.

**On the keystore — I had this wrong in the first draft.** I wrote that losing the upload keystore was unrecoverable. It isn't, as long as we use **Play App Signing**: Google's own documentation says that if you lose the upload key "you are not locked out of your app" — you generate a new key, export its certificate and request an upload key reset in the Console. It is a delay and a support round-trip, not a disaster. What *is* unrecoverable is managing your own signing key **without** Play App Signing and losing it. So: use Play App Signing, and still back the keystore and its passwords up twice, because a reset costs days you will not want to spend.

---

## 10. Timeline

Assuming the game work and the account setup run side by side.

| Week | What happens |
|---|---|
| **Week 1** | Push the two commits. Decide the package name, publisher name, age band. Open the developer account and pay the $25. Install Android Studio. Do game jobs 1 to 5 (back button, game flag, icons, splash, strip dev files). |
| **Week 2** | First Android build. Test on a real phone. Re-run all 235 tests in the web view. Write the listing text, draw the feature graphic, capture screenshots. Fill in the content rating, data safety and target audience forms. Publish the privacy policy page. |
| **Week 3** | Internal testing track — fix whatever the phone reveals. Then **start the closed test and invite 16 to 18 people.** The clock starts when they are opted in. |
| **Weeks 3 to 5** | The 14-day wait. Collect feedback, fix non-breaking things, keep notes for the production form. Watch Play's free pre-launch report — Google runs the game on real devices automatically and reports crashes. |
| **Week 5** | Apply for production access. |
| **Week 6** | Two separate waits that I ran together in the first draft: Google's decision on the **production access application** (Google says seven days or less), and then the **review of the release itself**, which has no published time limit and is slower for brand-new accounts. Then launch as a **staged rollout**, starting at 20% of users, so a bad surprise can be halted. |

Realistically: **live on Google Play in early December 2026**, if the account verification and the two reviews are not slow.

---

## 11. Things that could go wrong

| Risk | How bad | What we do about it |
|---|---|---|
| Not enough testers stay opted in for 14 days | **Highest risk in the plan** — the one thing we cannot shorten | Invite 16 to 18, explain clearly that they must leave it installed, check the count in Play Console weekly |
| Google rejects it as a "low functionality" app | Low — it is a real 7-level game with its own art and music | Route A (files inside the app) makes this much less likely than Route B |
| Upload keystore lost | Recoverable, but costs days | Use Play App Signing so a reset is possible at all, and back the keystore up twice on day one |
| Capacitor falls behind the next target-SDK deadline | Moderate, and it recurs every year | Diarise it each August; budget for a Capacitor upgrade, because the number cannot be edited by hand |
| Package name chosen carelessly | Permanent | Decided deliberately in week 1 |
| Landscape game squashed on tablets | Moderate | The `appCategory="game"` flag (job 2) |
| Age-band choice causes a Families policy rejection | Moderate | Answer the target-audience form honestly first time rather than being corrected later |
| Audio does not start on some phones | Low | The "tap to start" splash already solves this, and it is the correct pattern |
| Android Studio will not build | Annoying but normal | Pin JDK 21 and the Capacitor-documented Gradle version rather than guessing |

---

## 12. What I need from you to start

1. **Route A (Capacitor) — agreed?**
2. **Package name** — `com.fahadsheikh.grasshopper`, or something else?
3. **Publisher name** as players will see it on the store page.
4. **Age band** — 13+ for the simple path, or include under-13s and take the Families policy route?
5. **Shall I push the two commits** so the live web version matches the name?

Once those five are answered, week 1 can start.

---

## 13. How much to trust each part of this plan

I went back over every claim on 25 October and graded it. Use this before betting a week of work on any line above.

### Verified — read on Google's or Capacitor's own documentation

| Claim | Where |
|---|---|
| 12 testers, opted in continuously for 14 days, personal accounts created after 13 Nov 2023, Production page stays locked until then, three-part application, decision in seven days or less | [Play Console Help 14151465](https://support.google.com/googleplay/android-developer/answer/14151465) |
| New apps must target API 36 from 31 Aug 2026; existing apps need API 35 to reach new users; extensions to 1 Nov 2026 | [Play target SDK requirements](https://developer.android.com/google/play/requirements/target-sdk) |
| Orientation and aspect-ratio restrictions ignored at sw600dp and above for API 36 apps; **games exempt via `android:appCategory`**; the general opt-out property dies at API 37 | [Android 16 behaviour changes](https://developer.android.com/about/versions/16/behavior-changes-16) |
| Capacitor 8 is tied to target SDK 36; custom target SDK versions are not supported | [Capacitor target SDK docs](https://capacitorjs.com/docs/android/setting-target-sdk) |
| A lost **upload** key can be reset; you are not locked out | [Play App Signing help](https://support.google.com/googleplay/android-developer/answer/9842756) |
| Icon 512x512 32-bit PNG under 1024 KB; feature graphic 1024x500 JPEG or 24-bit PNG with no alpha; screenshots 320 to 3840 px per side with the long side at most twice the short, minimum 2 to publish, maximum 8 per device type; tablets 4 or more at 16:9, 1080 to 7680 px | [Play store listing assets](https://support.google.com/googleplay/android-developer/answer/9866151) |
| `assetlinks.json` returns 404 on the GitHub Pages origin, and the live site still says "Hop" | I ran the requests myself on 24 Oct |

### Second-hand — consistent across sources, but I did not find Google's own words

- **$25 one time, card in your legal name, prepaid cards refused, government ID, fee not refunded if details don't match.** The official help page was quoted to me in search results rather than read directly. The $25 and the ID check are not in doubt; treat the finer print as unconfirmed.
- **Internal testing does not count toward the 12-tester rule.** Google only ever writes "closed test", and every guide says internal is excluded. I am confident, but it is inference, not a quotation.
- **The 12-tester minimum was 20 until 11 Dec 2024, and Organisation accounts are exempt.** Widely repeated, not found in Google's text. The second half matters — if Organisation accounts really are exempt, that is a route around the 14-day wait, and it would be worth confirming in the Console before paying the $25.
- **A personal account's full home address becomes public once the account monetises.** Consistent across sources, none of them Google.

### My own estimates — not facts

- **The 5-to-6-week timeline and "early December".** Built from the published figures plus guesses at the review queues. Account verification, the release review and tester recruitment are all outside our control. Treat it as the optimistic case.
- **"Invite 16 to 18 people."** Judgement, not a rule.
- **Capacitor over TWA.** A recommendation. The facts underneath it are verified; the conclusion is mine and you can overrule it.
- **Android Studio needing about 10 GB, and JDK 21.** Ballpark, and the JDK number comes only from community blogs.
- **The seven jobs in section 4, and which two are mandatory.** My reading of the game, not a Play requirement — Google will not reject the app for lacking a splash screen.
- **Expecting a PEGI 3 / Everyone rating.** Likely, but the questionnaire decides, not me.

### The honest gap

Nobody has filled in these forms for this app yet. Everything above is desk research. The first contact with the real Console will turn up at least one thing this plan does not mention — that is normal, and it is the reason the account should be opened in week 1 rather than week 3.
