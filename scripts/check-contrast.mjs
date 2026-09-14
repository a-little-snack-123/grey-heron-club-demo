const approved = [
  ['#e9dfc8', '#30271b'], ['#e9dfc8', '#574831'],
  ['#ded1b6', '#30271b'], ['#ded1b6', '#574831'],
  ['#1b241e', '#efe6d4'], ['#1b241e', '#c5ae7b'],
  ['#2f2119', '#efe6d4'], ['#2f2119', '#c5ae7b'],
  ['#7c2b26', '#efe6d4'], ['#3d2d1d', '#efe6d4'],
  ['#241a12', '#efe6d4'],
];

const rgb = (hex) => hex.match(/[a-f\d]{2}/gi).map((part) => parseInt(part, 16) / 255);
const luminance = (hex) => rgb(hex).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
const ratio = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

let bad = 0;
for (const [background, foreground] of approved) {
  const value = ratio(background, foreground);
  const ok = value >= 4.5;
  console.log(`${ok ? '✓' : '✗'} ${background} / ${foreground}: ${value.toFixed(2)}:1`);
  if (!ok) bad++;
}
process.exit(bad ? 1 : 0);
