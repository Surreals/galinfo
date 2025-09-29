#!/usr/bin/env node

/**
 * Admin Video Card Test Script
 * 
 * This script tests that the video card has been properly added to the admin dashboard.
 * 
 * Usage:
 *   node scripts/test-admin-video-card.js
 */

const fs = require('fs');
const path = require('path');

function testVideoCardInAdminPage() {
  console.log('🧪 Testing Admin Video Card');
  console.log('==========================\n');
  
  try {
    const adminPagePath = path.join(__dirname, '..', 'app', 'admin', 'page.tsx');
    
    if (!fs.existsSync(adminPagePath)) {
      console.log('❌ Admin page not found');
      return false;
    }
    
    console.log('✅ Admin page exists');
    
    const content = fs.readFileSync(adminPagePath, 'utf8');
    
    // Check for video card configuration
    const videoCardChecks = [
      { name: 'Video ID', pattern: /id:\s*['"]videos['"]/, description: 'Video card has correct ID' },
      { name: 'Video Title', pattern: /title:\s*['"]Відео['"]/, description: 'Video card has Ukrainian title' },
      { name: 'Video Description', pattern: /description:\s*['"]Управління відео файлами та медіа['"]/, description: 'Video card has proper description' },
      { name: 'Video Href', pattern: /href:\s*['"]\/admin\/videos['"]/, description: 'Video card links to correct page' },
      { name: 'Video Icon', pattern: /icon:\s*['"]🎥['"]/, description: 'Video card has video icon' },
      { name: 'Video Color', pattern: /color:\s*['"]#dc3545['"]/, description: 'Video card has red color' },
      { name: 'Video Disabled', pattern: /disabled:\s*false/, description: 'Video card is enabled' }
    ];
    
    let allChecksPassed = true;
    
    videoCardChecks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name}: ${check.description}`);
      } else {
        console.log(`❌ ${check.name}: ${check.description}`);
        allChecksPassed = false;
      }
    });
    
    // Check that video card is in the correct position (after gallery)
    const galleryIndex = content.indexOf('id: \'gallery\'');
    const videoIndex = content.indexOf('id: \'videos\'');
    
    if (galleryIndex !== -1 && videoIndex !== -1 && videoIndex > galleryIndex) {
      console.log('✅ Video card positioned correctly after gallery');
    } else {
      console.log('❌ Video card not positioned correctly');
      allChecksPassed = false;
    }
    
    return allChecksPassed;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

function testVideoPageExists() {
  console.log('\n2. Testing video page existence...');
  
  try {
    const videoPagePath = path.join(__dirname, '..', 'app', 'admin', 'videos', 'page.tsx');
    
    if (fs.existsSync(videoPagePath)) {
      console.log('✅ Video page exists');
      
      // Check if it's a proper React component
      const content = fs.readFileSync(videoPagePath, 'utf8');
      
      if (content.includes('export default') && content.includes('VideosPage')) {
        console.log('✅ Video page is a proper React component');
        return true;
      } else {
        console.log('❌ Video page is not a proper React component');
        return false;
      }
    } else {
      console.log('❌ Video page does not exist');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Video page test failed:', error.message);
    return false;
  }
}

function testVideoCSSExists() {
  console.log('\n3. Testing video CSS exists...');
  
  try {
    const videoCSSPath = path.join(__dirname, '..', 'app', 'admin', 'videos', 'videos.module.css');
    
    if (fs.existsSync(videoCSSPath)) {
      console.log('✅ Video CSS exists');
      
      // Check for key CSS classes
      const content = fs.readFileSync(videoCSSPath, 'utf8');
      const cssChecks = [
        { name: 'Container', pattern: /\.container\s*{/, description: 'Container styles defined' },
        { name: 'Header', pattern: /\.header\s*{/, description: 'Header styles defined' },
        { name: 'Thumbnail', pattern: /\.thumbnail/, description: 'Thumbnail styles defined' }
      ];
      
      cssChecks.forEach(check => {
        if (check.pattern.test(content)) {
          console.log(`✅ ${check.name}: ${check.description}`);
        } else {
          console.log(`❌ ${check.name}: ${check.description}`);
        }
      });
      
      return true;
    } else {
      console.log('❌ Video CSS does not exist');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Video CSS test failed:', error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Admin Video Card Integration Test');
  console.log('====================================\n');
  
  const cardTest = testVideoCardInAdminPage();
  const pageTest = testVideoPageExists();
  const cssTest = testVideoCSSExists();
  
  console.log('\n📊 Test Summary');
  console.log('================');
  
  if (cardTest) {
    console.log('✅ Video card: Properly configured in admin dashboard');
  } else {
    console.log('❌ Video card: Configuration issues found');
  }
  
  if (pageTest) {
    console.log('✅ Video page: Exists and properly structured');
  } else {
    console.log('❌ Video page: Missing or improperly structured');
  }
  
  if (cssTest) {
    console.log('✅ Video CSS: Styling available');
  } else {
    console.log('❌ Video CSS: Styling missing');
  }
  
  if (cardTest && pageTest && cssTest) {
    console.log('\n🎉 Video card integration is complete!');
    console.log('\nFeatures:');
    console.log('- 🎥 Video card added to admin dashboard');
    console.log('- 🔗 Links to /admin/videos page');
    console.log('- 🎨 Red color scheme (#dc3545)');
    console.log('- ✅ Enabled and ready to use');
    console.log('- 🇺🇦 Ukrainian interface text');
  } else {
    console.log('\n⚠️  Some issues found, please check the details above');
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = { 
  testVideoCardInAdminPage, 
  testVideoPageExists, 
  testVideoCSSExists 
};
