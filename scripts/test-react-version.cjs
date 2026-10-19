const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const reactMajor = process.argv[2];
const mode = process.argv[3] || 'compat';
const supportedMajors = new Set(['16', '17', '18', '19']);
const modeToTestScript = {
  compat: 'test:compat',
  'all-browsers': 'test:all-browsers',
};

if (!supportedMajors.has(reactMajor)) {
  console.error('Usage: npm run test:with-react -- <16|17|18|19> [compat|all-browsers]');
  process.exit(1);
}

if (!modeToTestScript[mode]) {
  console.error('Mode must be one of: compat, all-browsers');
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function ensureReactDomClientShimForLegacy(major) {
  if (major !== '16' && major !== '17') {
    return;
  }

  const shimPath = path.join(process.cwd(), 'node_modules', 'react-dom', 'client.js');
  const shimSource = `const ReactDOM = require('./index.js');\n\nexports.createRoot = function createRoot(container) {\n  return {\n    render(element) {\n      ReactDOM.render(element, container);\n    },\n    unmount() {\n      ReactDOM.unmountComponentAtNode(container);\n    },\n  };\n};\n`;

  fs.writeFileSync(shimPath, shimSource, 'utf8');
}

const versionMatrix = {
  '16': {
    react: '^16.14.0',
    reactDom: '^16.14.0',
    typesReact: '^16.14.0',
    typesReactDom: '^16.9.0',
  },
  '17': {
    react: '^17.0.2',
    reactDom: '^17.0.2',
    typesReact: '^17.0.0',
    typesReactDom: '^17.0.0',
  },
  '18': {
    react: '^18.2.0',
    reactDom: '^18.2.0',
    typesReact: '^18.0.0',
    typesReactDom: '^18.0.0',
  },
  '19': {
    react: '^19.0.0',
    reactDom: '^19.0.0',
    typesReact: '^19.0.0',
    typesReactDom: '^19.0.0',
  },
};

const selected = versionMatrix[reactMajor];
const packageSpecs = [
  `react@${selected.react}`,
  `react-dom@${selected.reactDom}`,
  `@types/react@${selected.typesReact}`,
  `@types/react-dom@${selected.typesReactDom}`,
  '@types/scheduler@^0.16.8',
];

console.log(`Installing React ${reactMajor}.x test deps...`);
run('npm', ['install', '--no-save', '--no-package-lock', '--legacy-peer-deps', ...packageSpecs]);

ensureReactDomClientShimForLegacy(reactMajor);

if (mode === 'all-browsers') {
  console.log('Ensuring all Playwright browsers are installed...');
  run('npx', ['playwright', 'install']);
} else {
  console.log('Ensuring Playwright Chromium is installed...');
  run('npx', ['playwright', 'install', 'chromium']);
}

console.log(`Running ${modeToTestScript[mode]} with React ${reactMajor}.x...`);
run('npm', ['run', modeToTestScript[mode]]);
