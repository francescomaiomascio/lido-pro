const minimumMajor = 22
const minimumMinor = 12
const currentVersion = process.versions.node
const [currentMajor, currentMinor] = currentVersion.split('.').map(Number)

if (currentMajor < minimumMajor || (currentMajor === minimumMajor && currentMinor < minimumMinor)) {
  console.error(
    [
      `Node.js ${currentVersion} is active, but LidoPro desktop/mobile scripts require Node.js >=${minimumMajor}.${minimumMinor}.0.`,
      'Use Node 24 from your installed version manager, or put /opt/homebrew/bin before /usr/local/bin in PATH.',
      'One-off Apple Silicon command: PATH=/opt/homebrew/bin:$PATH npm run cap:sync',
      'Then rerun "npm run cap:sync".',
    ].join('\n'),
  )
  process.exit(1)
}
