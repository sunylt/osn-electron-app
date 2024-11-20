import { execSync } from 'child_process'
execSync('node ./install-native-deps.js', { stdio: [0, 1, 2] })