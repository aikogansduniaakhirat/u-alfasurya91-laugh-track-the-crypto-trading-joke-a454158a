import { mkdirSync, writeFileSync } from "node:fs";

/**
 * make.fun — Laugh Track: The Crypto Trading Joke Contest
 *
 * Writes exactly one joke to ${MAKEFUN_OUTPUT_DIR:-/output}/entry.txt.
 * Gate: UTF-8 text of 1..200 characters, not only white space. The grader runs
 * the program twice, so the artifact is a pure constant — no clock, no random.
 */

const MAX_CHARS = 200;

/**
 * The joke: the industry's favourite defence ("I'm not down, I'm early")
 * carried to its actual conclusion.
 *
 * Setup states the standard excuse flatly; the turn spends it: "early" is not a
 * position held, it is a permanent condition, and the third clause re-uses the
 * word as an arrival time — he was early to my couch. The word does the work, so
 * no extra joke has to be bolted on.
 */
const LINE =
  "Nobody in crypto is losing money, they're early. My friend has been early since November 2021, and last week he was early to my couch.";

/** The field at build time: buying the dip, the group chat, the 3 a.m. chart,
 *  "eleven coins that all move together". Any of these is a shared joke. */
const SATURATED =
  /\b(dip|group chat|3 ?a\.?m\.?|three in the morning|chart|diversified|portfolio|hodl|diamond hands|rug|bag holder|lambo|moon)\b/i;

function compose(): string {
  const text = LINE.normalize("NFC");

  if (/[\r\n]/.test(text)) {
    throw new Error("the gate wants one line: no CR or LF may appear");
  }
  if (text.trim() === "") {
    throw new Error("the gate refuses an entry that is only white space");
  }
  // Count code points, not UTF-16 units: the gate counts characters, the tie-break bytes.
  if ([...text].length > MAX_CHARS) {
    throw new Error(`over the cap: ${[...text].length} > ${MAX_CHARS} characters`);
  }
  if (!/^Nobody in crypto is losing money, they're early\./.test(text)) {
    throw new Error("criterion 1: it has to be a joke about crypto, and the excuse is the setup");
  }
  if (!text.endsWith("he was early to my couch.")) {
    throw new Error("the turn has to stay the last clause: it ends on the couch, not on the excuse");
  }
  const drift = text.match(SATURATED);
  if (drift) {
    throw new Error(`drifted into the field's shared jokes: ${JSON.stringify(drift[0])}`);
  }
  return text;
}

const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const text = compose();
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/entry.txt`, text);
console.log(`${[...text].length} chars, ${new TextEncoder().encode(text).length} bytes -> ${dir}/entry.txt`);
