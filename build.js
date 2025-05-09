const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = [
    'public',
    'public/css',
    'public/js',
    'public/challenges',
    'node_modules'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Copy challenge files to public directory
function copyChallengeFiles() {
    const challengesDir = path.join(__dirname, 'challenges');
    const publicChallengesDir = path.join(__dirname, 'public', 'challenges');

    if (fs.existsSync(challengesDir)) {
        fs.cpSync(challengesDir, publicChallengesDir, { recursive: true });
        console.log('✅ Copied challenge files to public directory');
    }
}

// Copy static files
function copyStaticFiles() {
    const staticFiles = [
        { src: 'public/css/style.css', dest: 'public/css/style.css' },
        { src: 'public/js/main.js', dest: 'public/js/main.js' }
    ];

    staticFiles.forEach(file => {
        if (fs.existsSync(file.src)) {
            fs.copyFileSync(file.src, file.dest);
            console.log(`✅ Copied ${file.src} to ${file.dest}`);
        }
    });
}

// Main build process
console.log('🚀 Starting build process...');

try {
    copyChallengeFiles();
    copyStaticFiles();
    console.log('✨ Build completed successfully!');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
} 