const fs = require('fs');

const path = 'C:/Users/Usuario/Desktop/new_qmb/index.html';
let content = fs.readFileSync(path, 'utf8');

const colorMap = {
  'Azul': { id: 'blue', hex: '#2a75d3' },
  'Roja': { id: 'red', hex: '#d32a2a' },
  'Rojo': { id: 'red', hex: '#d32a2a' },
  'Verde': { id: 'green', hex: '#2ad366' },
  'Amarilla': { id: 'yellow', hex: '#f1c40f' },
  'Gris': { id: 'gray', hex: '#808080' },
  'Fucsia': { id: 'fuchsia', hex: '#d11186' },
  'Azul/Blanca': { id: 'blue_white', hex: '#9db4e0' },
  'Blanco': { id: 'white', hex: '#f8f9fa' },
  'Blanca': { id: 'white', hex: '#f8f9fa' },
  'Negro': { id: 'black', hex: '#2b2b2b' },
  'Negra': { id: 'black', hex: '#2b2b2b' },
  'Kraft': { id: 'kraft', hex: '#c19a6b' }
};

// 1. Regex to find objects with hasSizes and sizes that are colors
const regex = /hasSizes:\s*true,\s*sizes:\s*\[\s*([\s\S]*?)\s*\]/g;

content = content.replace(regex, (match, sizesContent) => {
  // Check if sizes contain valid color labels
  const hasColorLabels = Object.keys(colorMap).some(c => sizesContent.includes(`label: '${c}'`));
  
  // Exclude actual sizes like 5L, 75cm, 100cm, Pequeño, Grande, 4oz
  const isActualSize = /(?:5L|75cm|100cm|Pequeño|Grande|4oz|7oz|8oz|12oz|250cc|500cc|1000cc|30 Cm|45 Cm|150x200|Pollo)/i.test(sizesContent) || /6L|8L|12L|9 Cm|15 Cm/.test(sizesContent);

  if (hasColorLabels && !isActualSize) {
    // Parse the sizes array content
    const sizeItems = sizesContent.match(/\{\s*label:\s*'([^']+)'(?:,\s*img:\s*'([^']+)')?\s*\}/g);
    
    if (sizeItems) {
        let newColors = sizeItems.map(item => {
            const m = item.match(/\{\s*label:\s*'([^']+)'(?:,\s*img:\s*'([^']+)')?\s*\}/);
            const label = m[1];
            const img = m[2];
            const colorData = colorMap[label];
            if (colorData) {
                return `{ id: '${colorData.id}', label: '${label}', hex: '${colorData.hex}'${img ? `, img: '${img}'` : ''} }`;
            }
            return item; // Fallback
        });
        return `hasColors: true, colors: [\n            ${newColors.join(', \n            ')}\n          ]`;
    }
  }
  return match;
});

// 2. Refactor Bayeta
content = content.replace(
  /\{img:'assets\/prod_bayeta_azul.png', name:'Bayeta Microfibra', hasColors: true\}/g,
  `{img:'assets/prod_bayeta_azul.png', name:'Bayeta Microfibra', hasColors: true, colors: [
          { id: 'blue', label: 'Azul', hex: '#2a75d3', img: 'assets/prod_bayeta_azul.png' },
          { id: 'red', label: 'Roja', hex: '#d32a2a', img: 'assets/prod_bayeta_roja_1778931637246.png' },
          { id: 'green', label: 'Verde', hex: '#2ad366', img: 'assets/prod_bayeta_verde_1778931650426.png' },
          { id: 'yellow', label: 'Amarilla', hex: '#f1c40f', img: 'assets/prod_bayeta_amarilla_1778931662931.png' },
          { id: 'gray', label: 'Gris', hex: '#808080', img: 'assets/prod_bayeta_gris_1778931675824.png' }
        ]}`
);

// 3. Refactor Kanguro
content = content.replace(
  /\{img:'assets\/prod_kanguro_blanco.png', name:'Kanguro y Minikanguro', hasColors: true, type: 'servilleta'\}/g,
  `{img:'assets/prod_kanguro_blanco.png', name:'Kanguro y Minikanguro', type: 'servilleta', hasColors: true, colors: [
          { id: 'white', label: 'Blanco', hex: '#f8f9fa', img: 'assets/prod_kanguro_blanco.png' },
          { id: 'black', label: 'Negro', hex: '#2b2b2b', img: 'assets/prod_kanguro_negro.png' },
          { id: 'kraft', label: 'Kraft', hex: '#c19a6b', img: 'assets/prod_kanguro_kraft.png' },
          { id: 'green', label: 'Verde', hex: '#2ad366', img: 'assets/prod_kanguro_verde.png' },
          { id: 'blue', label: 'Azul', hex: '#2a75d3', img: 'assets/prod_kanguro_azul.png' }
        ]}`
);

// 4. Refactor Servilletas
const servilletaRegex = /\{img:'assets\/servilleta_blanca.png', name:'([^']+)', type: 'servilleta', hasColors: true\}/g;
content = content.replace(servilletaRegex, `{img:'assets/servilleta_blanca.png', name:'$1', type: 'servilleta', hasColors: true, colors: [
          { id: 'white', label: 'Blanco', hex: '#f8f9fa', img: 'assets/servilleta_blanca.png' },
          { id: 'blue', label: 'Azul', hex: '#2a75d3', img: 'assets/servilleta_azul.png' },
          { id: 'red', label: 'Rojo', hex: '#d32a2a', img: 'assets/servilleta_roja.png' },
          { id: 'green', label: 'Verde', hex: '#2ad366', img: 'assets/servilleta_verde.png' },
          { id: 'black', label: 'Negro', hex: '#2b2b2b', img: 'assets/servilleta_negra.png' }
        ]}`);

// 5. Update renderProducts colorsHtml logic
const renderRegex = /let colorsHtml = '';\s*if \(p\.hasColors\) \{[\s\S]*?\} else if \(p\.hasBagColors\) \{/m;
const newRenderLogic = `let colorsHtml = '';
      if (p.hasColors && p.colors) {
        colorsHtml = \`
          <div class="product-colors">
            \${p.colors.map((c, i) => \`
              <div class="color-swatch \${i === 0 ? 'active' : ''}" style="background:\${c.hex}" onclick="changeColor(\${index}, '\${c.id}', '\${c.img || ''}', event)" title="\${c.label}"></div>
            \`).join('')}
          </div>\`;
      } else if (p.hasBagColors) {`;
content = content.replace(renderRegex, newRenderLogic);

// 6. Update changeColor function
const changeColorRegex = /function changeColor\(pIndex, color, e\) \{[\s\S]*?if \(e && e\.currentTarget\) \{/m;
const newChangeColorLogic = `function changeColor(pIndex, colorId, newImg, e) {
    const overlay = document.getElementById(\`overlay-\${pIndex}\`);
    const img = document.getElementById(\`img-\${pIndex}\`);
    
    if (overlay) {
      const bagColors = {
        black: '#000000', white: '#e0e0e0', red: '#d32a2a',
        green: '#2ad366', blue: '#2a75d3', yellow: '#f1c40f', transparent: '#e0e0e080'
      };
      overlay.style.backgroundColor = bagColors[colorId];
    } else if (img) {
      if (newImg) {
        img.src = newImg;
        img.style.filter = 'none';
      } else {
        const filters = {
          white: 'none',
          blue: 'sepia(1) hue-rotate(190deg) saturate(4) brightness(0.85)',
          red: 'sepia(1) hue-rotate(330deg) saturate(6) brightness(0.85)',
          green: 'sepia(1) hue-rotate(90deg) saturate(3) brightness(0.85)',
          yellow: 'sepia(1) hue-rotate(35deg) saturate(5) brightness(0.95)',
          transparent: 'grayscale(1) opacity(0.5) brightness(1.2)',
          black: 'grayscale(1) brightness(0.3)'
        };
        img.style.filter = filters[colorId] || 'none';
      }
    }
    
    if (e && e.currentTarget) {`;
content = content.replace(changeColorRegex, newChangeColorLogic);

// Ensure bag types onclick still works (we must handle bag colors where event is passed as 3rd parameter)
// The HTML for bag colors passes: onclick="changeColor(${index}, 'black', event)"
// Since we added newImg as 3rd parameter, we should ensure the bag color buttons pass undefined for newImg
const bagColorsRegex = /onclick="changeColor\(\$\{index\}, '([^']+)', event\)"/g;
content = content.replace(bagColorsRegex, `onclick="changeColor(\${index}, '$1', null, event)"`);

fs.writeFileSync(path, content, 'utf8');
console.log("Refactoring complete.");
