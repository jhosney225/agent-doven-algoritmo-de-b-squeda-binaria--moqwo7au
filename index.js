
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Algoritmo de búsqueda binaria
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let steps = [];

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = arr[mid];

    steps.push({
      left,
      right,
      mid,
      midValue,
      target,
      comparison: midValue === target ? "found" : midValue < target ? "go right" : "go left",
    });

    if (midValue === target) {
      return { found: true, index: mid, steps };
    } else if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { found: false, index: -1, steps };
}

// Visualizar los pasos de la búsqueda binaria
function visualizeSearch(arr, result) {
  console.log("\n📊 VISUALIZACIÓN DE BÚSQUEDA BINARIA");
  console.log("═".repeat(60));
  console.log(`Array: [${arr.join(", ")}]\n`);

  result.steps.forEach((step, index) => {
    const visualization = arr
      .map((val, i) => {
        if (i === step.mid) return `[${val}]←`;
        if (i >= step.left && i <= step.right) return ` ${val} `;
        return `  - `;
      })
      .join(" ");

    console.log(`Paso ${index + 1}:`);
    console.log(`  Rango: [${step.left}...${step.right}] | Medio: índice ${step.mid} (valor: ${step.midValue})`);
    console.log(`  Comparación: ${step.midValue} vs ${step.target} → ${step.comparison}`);
    console.log(`  ${visualization}`);
    console.log();
  });

  if (result.found) {
    console.log(`✅ ¡ENCONTRADO! El número ${arr[result.index]} está en el índice ${result.index}`);
  } else {
    console.log(`❌ NO ENCONTRADO. El número no existe en el array.`);
  }
  console.log("═".repeat(60));
}

// Función para usar Claude con streaming para análisis
async function analyzeSearchWithClaude(arr, target, result) {
  console.log("\n🤖 ANÁLISIS CON CLAUDE (Streaming):");
  console.log("─".repeat(60));

  const stepsDescription = result.steps
    .map((step, i) => `Paso ${i + 1}: Evaluó índice ${step.mid} (valor ${step.midValue}), ${step.comparison}`)
    .join("\n");

  const prompt = `Analiza brevemente esta búsqueda binaria:
Array: [${arr.join(", ")}]
Buscando: ${target}
Pasos realizados:
${stepsDescription}

Resultado: ${result.found ? `Encontrado en índice ${result.index}` : "No encontrado"}
Número de pasos: ${result.steps.length}

Proporciona un análisis corto sobre la eficiencia y cómo funcionó.`;

  try {
    const stream = await client.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        process.stdout.write(chunk.delta.text);
      }
    }
    console.log("\n" + "─".repeat(60));
  } catch (error) {
    console.error("Error al conectar con Claude:", error.message);
  }
}

// Función principal interactiva
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     ALGORITMO DE BÚSQUEDA BINARIA CON VISUALIZACIÓN        ║");
  console.log("║                    Impulsado por Claude                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Demo automática
  const demoArrays = [
    { arr: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 7 },
    { arr: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20], target: 14 },
    { arr: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45], target: 25 },
  ];

  console.log("Ejecutando demostraciones automáticas...\n");

  for (const demo of demoArrays) {
    console.log(`\n🔍 Buscando ${demo.target} en [${demo.arr.join(", ")}]`);
    const result = binarySearch(demo.arr, demo.target);
    visualizeSearch(demo.arr, result);
    await analyzeSearchWithClaude(demo.arr, demo.target, result);