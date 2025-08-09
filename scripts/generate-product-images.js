import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Professional product photography prompts for each furniture piece
const productPrompts = {
  'mesa-comedor-roble': {
    name: 'Mesa de Comedor de Roble',
    prompts: [
      'Professional product photography of an elegant oak dining table for 6 people, shot in a luxury furniture showroom with pristine white background, studio lighting, high-end commercial photography style, top angle view showing the beautiful wood grain and natural finish, ultra-realistic, 8K resolution, perfect for e-commerce',
      'Professional side view of an oak dining table, luxury furniture photography, pristine white background, studio lighting, showcasing the solid wood construction and elegant design, commercial product photography, ultra-realistic, high resolution'
    ]
  },
  'sofa-cedro': {
    name: 'Sofá de Sala en Cedro',
    prompts: [
      'Professional product photography of a modern 3-seater cedar wood sofa with premium fabric upholstery, luxury furniture showroom style, pristine white background, perfect studio lighting, commercial photography, showcasing the solid cedar frame and elegant design, ultra-realistic, 8K resolution',
      'Professional angle view of a cedar wood sofa with premium upholstery, luxury furniture photography, white background, studio lighting, showing the comfort and craftsmanship, commercial product shot, ultra-realistic'
    ]
  },
  'cama-king-pino': {
    name: 'Cama King en Pino',
    prompts: [
      'Professional product photography of a king size pine wood bed with elegant headboard, luxury furniture showroom style, pristine white background, perfect studio lighting, commercial photography, showcasing the solid pine construction and beautiful natural finish, ultra-realistic, 8K resolution',
      'Professional side angle of a king size pine bed showing the headboard design, luxury furniture photography, white background, studio lighting, highlighting the craftsmanship and wood grain, commercial product photography'
    ]
  },
  'puerta-teca': {
    name: 'Puerta Interior de Teca',
    prompts: [
      'Professional product photography of an interior teak wood door with classic design and bronze hinges, luxury furniture showroom style, pristine white background, perfect studio lighting, commercial photography, showcasing the solid teak construction and elegant finish, ultra-realistic, 8K resolution',
      'Professional detail shot of a teak interior door showing the wood grain and bronze hardware, luxury furniture photography, white background, studio lighting, highlighting the craftsmanship and quality, commercial product shot'
    ]
  },
  'ventana-cedro': {
    name: 'Ventana Corredera de Cedro',
    prompts: [
      'Professional product photography of a cedar wood sliding window with tempered glass, luxury furniture showroom style, pristine white background, perfect studio lighting, commercial photography, showcasing the cedar frame and sliding mechanism, ultra-realistic, 8K resolution',
      'Professional angle view of a cedar sliding window showing the glass and frame details, luxury furniture photography, white background, studio lighting, highlighting the thermal insulation and craftsmanship, commercial product photography'
    ]
  },
  'estanteria-roble': {
    name: 'Estantería de Roble',
    prompts: [
      'Professional product photography of a 5-level oak wood bookshelf with modern design, luxury furniture showroom style, pristine white background, perfect studio lighting, commercial photography, showcasing the solid oak construction and clean lines, ultra-realistic, 8K resolution',
      'Professional side view of an oak bookshelf showing the 5 levels and solid construction, luxury furniture photography, white background, studio lighting, highlighting the modern design and wood quality, commercial product shot'
    ]
  }
};

// Generate detailed prompt instructions
function generatePromptInstructions() {
  console.log('🎨 PROFESSIONAL FURNITURE PHOTOGRAPHY PROMPTS');
  console.log('=' .repeat(60));
  console.log();
  
  Object.entries(productPrompts).forEach(([key, product]) => {
    console.log(`📸 ${product.name.toUpperCase()}`);
    console.log('-'.repeat(40));
    
    product.prompts.forEach((prompt, index) => {
      console.log(`Image ${index + 1}:`);
      console.log(`"${prompt}"`);
      console.log();
    });
    
    console.log(`File names: ${key}-1.jpg, ${key}-2.jpg`);
    console.log();
  });
  
  console.log('💡 GENERATION TIPS:');
  console.log('- Use high-end AI image generators like Midjourney, DALL-E 3, or Stable Diffusion');
  console.log('- Generate at least 1024x1024 resolution');
  console.log('- Ensure white/clean backgrounds for professional e-commerce look');
  console.log('- Focus on wood grain details and craftsmanship');
  console.log('- Multiple angles for each product (front, side, detail shots)');
  console.log();
  
  console.log('📁 FOLDER STRUCTURE:');
  console.log('public/images/');
  console.log('├── mesa-comedor-roble-1.jpg');
  console.log('├── mesa-comedor-roble-2.jpg');
  console.log('├── sofa-cedro-1.jpg');
  console.log('├── sofa-cedro-2.jpg');
  console.log('├── cama-king-pino-1.jpg');
  console.log('├── cama-king-pino-2.jpg');
  console.log('├── puerta-teca-1.jpg');
  console.log('├── puerta-teca-2.jpg');
  console.log('├── ventana-cedro-1.jpg');
  console.log('├── ventana-cedro-2.jpg');
  console.log('├── estanteria-roble-1.jpg');
  console.log('└── estanteria-roble-2.jpg');
}

// Create the images directory if it doesn't exist
async function setupImageDirectory() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  
  try {
    await fs.access(imagesDir);
    console.log('✅ Images directory already exists');
  } catch {
    await fs.mkdir(imagesDir, { recursive: true });
    console.log('📁 Created images directory');
  }
  
  return imagesDir;
}

// Generate a README file with instructions
async function generateInstructions() {
  const instructionsContent = `# 🎨 Casa Piñón - Product Photography Generation Guide

## 📸 Professional Furniture Photography Requirements

### Style Guidelines:
- **Background**: Pure white or light gray seamless background
- **Lighting**: Professional studio lighting with soft shadows
- **Quality**: Ultra-realistic, high resolution (minimum 1024x1024)
- **Style**: Luxury furniture showroom aesthetic
- **Focus**: Highlight wood grain, craftsmanship, and materials

### Products to Generate:

${Object.entries(productPrompts).map(([key, product]) => `
#### ${product.name}
**Files needed**: \`${key}-1.jpg\`, \`${key}-2.jpg\`

**Prompt 1**:
\`\`\`
${product.prompts[0]}
\`\`\`

**Prompt 2**:
\`\`\`
${product.prompts[1]}
\`\`\`
`).join('\n')}

## 🛠 Recommended AI Tools:
1. **Midjourney** - Best for artistic, high-quality furniture
2. **DALL-E 3** - Great for detailed product photography
3. **Stable Diffusion** - Good for customization and control
4. **Adobe Firefly** - Professional commercial use

## 📁 File Organization:
Place all generated images in: \`/public/images/\`

## 🎯 Quality Checklist:
- [ ] White/clean background
- [ ] High resolution (1024x1024 minimum)
- [ ] Professional lighting
- [ ] Wood grain visible
- [ ] Realistic proportions
- [ ] E-commerce ready quality

## 🚀 After Generation:
1. Place images in \`/public/images/\` directory
2. Ensure file names match exactly: \`product-name-1.jpg\`, \`product-name-2.jpg\`
3. Run \`npm run dev\` to see images in the website
4. Test image loading in ProductCard components
`;

  const instructionsPath = path.join(__dirname, '..', 'PRODUCT_PHOTOGRAPHY_GUIDE.md');
  await fs.writeFile(instructionsPath, instructionsContent);
  console.log('📋 Generated PRODUCT_PHOTOGRAPHY_GUIDE.md');
}

// Main execution
async function main() {
  console.log('🎨 Setting up Casa Piñón Product Photography System...\n');
  
  await setupImageDirectory();
  await generateInstructions();
  
  console.log('\n' + '='.repeat(60));
  generatePromptInstructions();
  console.log('='.repeat(60));
  
  console.log('\n✅ Setup complete! Next steps:');
  console.log('1. Use the prompts above with your preferred AI image generator');
  console.log('2. Save images with exact file names in /public/images/');
  console.log('3. Images will automatically appear in your website');
  console.log('\n📋 Check PRODUCT_PHOTOGRAPHY_GUIDE.md for detailed instructions');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { productPrompts, generatePromptInstructions };
