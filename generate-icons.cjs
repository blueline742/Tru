const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  // Android
  { size: 36, path: 'android/app/src/main/res/mipmap-ldpi/ic_launcher.png' },
  { size: 48, path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png' },
  { size: 72, path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png' },
  { size: 96, path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png' },
  { size: 144, path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png' },
  { size: 192, path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png' },
  // iOS
  { size: 20, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/20.png' },
  { size: 40, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/40.png' },
  { size: 60, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/60.png' },
  { size: 29, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/29.png' },
  { size: 58, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/58.png' },
  { size: 87, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/87.png' },
  { size: 80, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/80.png' },
  { size: 120, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/120.png' },
  { size: 180, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/180.png' },
  { size: 1024, path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/1024.png' },
];

async function generateIcons() {
  const inputPath = 'icon.png';

  if (!fs.existsSync(inputPath)) {
    console.error('icon.png not found!');
    return;
  }

  for (const { size, path: outputPath } of sizes) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${size}x${size} icon at ${outputPath}`);
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
