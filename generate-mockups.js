const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_KEY || 'AIzaSyA7a0S6mFUwancudslIempss64_BEN1v7I';
const MOCKUPS_DIR = path.join(__dirname, 'mockups');

const mockups = [
  {
    filename: 'CINEMA-SCREEN-GEN.png',
    aspectRatio: '16:9',
    prompt: 'luxury cinema theater interior, large empty projection screen glowing softly, rows of red velvet seats, dramatic cinematic side lighting, dark moody atmosphere, film noir aesthetic, warm golden ambient glow, no text on screen, photorealistic, 8k, wide angle shot'
  },
  {
    filename: 'POPCORN-BUCKET-GEN.png',
    aspectRatio: '3:4',
    prompt: 'premium cinema popcorn bucket product mockup, matte black bucket with thin gold rim, filled with popcorn, dark gradient background, studio product photography, dramatic side lighting, elegant minimal design, plain surface visible for branding, photorealistic, 4k'
  },
  {
    filename: 'TICKETS-GEN.png',
    aspectRatio: '3:4',
    prompt: 'luxury cinema movie tickets mockup, two premium black tickets with subtle gold foil texture placed on dark polished stone surface, dramatic raking side light, elegant minimalist layout, no printed text visible on tickets, product photography, photorealistic'
  },
  {
    filename: 'BILLBOARD-GEN.png',
    aspectRatio: '16:9',
    prompt: 'large outdoor billboard mockup, city street at dusk, billboard face completely plain and dark ready for branding, warm dramatic urban bokeh background, low angle perspective, photorealistic, cinematic, no text on billboard panel'
  },
  {
    filename: 'SIGNAGE-GEN.png',
    aspectRatio: '3:4',
    prompt: 'luxury cinema venue entrance sign mockup, elegant dark stone facade, illuminated empty rectangular sign panel with warm golden backlit glow, night scene, architectural photography, premium venue exterior, no text on sign, photorealistic'
  },
  {
    filename: 'UNIFORME-GEN.png',
    aspectRatio: '3:4',
    prompt: 'elegant cinema staff uniform mockup, flat lay of dark charcoal black premium polo shirt on dark background, studio lighting with subtle top light, empty clean chest area, premium fabric texture visible, professional product photography, no logo or text, photorealistic'
  }
];

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['image', 'text'] }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.slice(0, 300))); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🎬 AURUM Cinema — Gerando mockups com Nano Banana 2\n');

  for (const mockup of mockups) {
    process.stdout.write(`⏳ Gerando ${mockup.filename}...`);

    try {
      const result = await generateImage(mockup.prompt);

      // Find inline image data in response
      const parts = result.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart) {
        const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
        fs.writeFileSync(path.join(MOCKUPS_DIR, mockup.filename), buffer);
        console.log(` ✓`);
      } else if (result.error) {
        console.log(` ✗ ${result.error.message}`);
      } else {
        console.log(` ✗ sem imagem — resposta:`, JSON.stringify(result).slice(0, 200));
      }
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n✅ Pronto! Mockups salvos em ./mockups/');
  mockups.forEach(m => console.log(`  → mockups/${m.filename}`));
}

main();
