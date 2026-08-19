/**
 * Minimal, dependency-free console logger.
 *
 * Playwright already owns the structured reporting story, so this only exists
 * to make local runs and CI logs readable. Colours are disabled automatically
 * when the output is not a TTY (i.e. in CI log files) or when NO_COLOR is set.
 */

const ESC = `${String.fromCharCode(27)}[`;
const RESET = `${ESC}0m`;
const useColour = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

const paint = (code, text) => (useColour ? `${ESC}${code}m${text}${RESET}` : text);

const colours = {
  grey: (t) => paint(90, t),
  red: (t) => paint(31, t),
  green: (t) => paint(32, t),
  yellow: (t) => paint(33, t),
  cyan: (t) => paint(36, t),
  bold: (t) => paint(1, t),
};

const timestamp = () => new Date().toISOString().substring(11, 23);

const logger = {
  info: (message) =>
    console.log(`${colours.grey(timestamp())} ${colours.cyan('INFO')}  ${message}`),
  step: (message) =>
    console.log(`${colours.grey(timestamp())} ${colours.grey('STEP')}  ${message}`),
  pass: (message) =>
    console.log(`${colours.grey(timestamp())} ${colours.green('PASS')}  ${message}`),
  warn: (message) =>
    console.warn(`${colours.grey(timestamp())} ${colours.yellow('WARN')}  ${message}`),
  error: (message) =>
    console.error(`${colours.grey(timestamp())} ${colours.red('ERROR')} ${message}`),

  /** Boxed multi-line banner used by global setup/teardown. */
  banner: (title, lines = []) => {
    const width = Math.max(title.length, ...lines.map((line) => line.length)) + 4;
    const edge = '='.repeat(width);
    console.log(`\n${colours.cyan(edge)}`);
    console.log(colours.bold(`  ${title}`));
    if (lines.length) console.log(colours.cyan('-'.repeat(width)));
    lines.forEach((line) => console.log(`  ${line}`));
    console.log(`${colours.cyan(edge)}\n`);
  },
};

module.exports = logger;
