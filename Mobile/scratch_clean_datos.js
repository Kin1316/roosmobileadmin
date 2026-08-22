const fs = require('fs');

const path = 'C:/Users/braya/Trabajo/roosmobileadmin/Mobile/src/services/datos.ts';
let content = fs.readFileSync(path, 'utf8');

// Regex replacements to remove interfaces and methods
const patterns = [
  // ImagenEvidencia and EvidenciaData
  /export interface ImagenEvidencia \{[\s\S]*?\}\s*export interface EvidenciaData \{[\s\S]*?\}/g,
  
  // BackendEvidencePayload
  /interface BackendEvidencePayload \{[\s\S]*?\}/g,
  
  // BackendEvidenceWastePayload
  /interface BackendEvidenceWastePayload \{[\s\S]*?\}/g,
  
  // MappedEvidenceWaste
  /interface MappedEvidenceWaste \{[\s\S]*?\}/g,
  
  // EVIDENCIAS array
  /private static readonly EVIDENCIAS: EvidenciaData\[\] = \[\];/g,
  
  // getEvidenceByRutaDesdeBackend
  /private static async getEvidenceByRutaDesdeBackend[\s\S]*?\} catch \{[\s\S]*?return null;\n    \}\n  \}/g,
  
  // getEvidenceByServiceDesdeBackend
  /private static async getEvidenceByServiceDesdeBackend[\s\S]*?\} catch \{[\s\S]*?return null;\n    \}\n  \}/g,
  
  // buildEvidenciaDataFromBackend
  /private static async buildEvidenciaDataFromBackend[\s\S]*?return \{\n[\s\S]*?firmaEncargado,\n      comentario,\n    \};\n  \}/g,
  
  // getImagesByEvidenceFromBackend
  /private static async getImagesByEvidenceFromBackend[\s\S]*?\} catch \{[\s\S]*?return null;\n    \}\n  \}/g,
  
  // getEvidenceWasteByEvidenceFromBackend
  /private static async getEvidenceWasteByEvidenceFromBackend[\s\S]*?\} catch \{[\s\S]*?return null;\n    \}\n  \}/g,
  
  // getEvidenciasByRutaId
  /static async getEvidenciasByRutaId[\s\S]*?return null;\n  \}/g,
  
  // getEvidenciasByServiceId
  /static async getEvidenciasByServiceId[\s\S]*?return null;\n  \}/g,
];

let newContent = content;
patterns.forEach(p => {
  newContent = newContent.replace(p, '');
});

fs.writeFileSync(path, newContent, 'utf8');
console.log('Obsolete evidence code removed from datos.ts');
