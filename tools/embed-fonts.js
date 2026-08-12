const fs = require('fs');
const path = require('path');

const root = (p) => path.resolve(__dirname, '../', p);

const fontDir = root('src/asset/font');
const htmlPath = root('src/asset/template/index.html');

const weights = [
  { weight: 400, file: 'red-hat-display-latin-400-normal.woff2' },
  { weight: 500, file: 'red-hat-display-latin-500-normal.woff2' },
  { weight: 600, file: 'red-hat-display-latin-600-normal.woff2' },
  { weight: 700, file: 'red-hat-display-latin-700-normal.woff2' },
];

let fontCss = '<style>\n';
weights.forEach(({ weight, file }) => {
  const filePath = path.join(fontDir, file);
  if (fs.existsSync(filePath)) {
    const base64 = fs.readFileSync(filePath).toString('base64');
    fontCss += `@font-face {
  font-family: 'Red Hat Display';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('data:font/woff2;charset=utf-8;base64,${base64}') format('woff2');
}\n`;
  }
});
fontCss += '</style>';

const htmlContent = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TCS SovereignSecure Cloud</title>
  ${fontCss}
</head>

<body>
  <div id="app"></div>
</body>

</html>
`;

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Successfully embedded Red Hat Display fonts into index.html');
