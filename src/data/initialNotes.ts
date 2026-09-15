import { Note } from '../types';

// Sample visual mock image to test annotation immediately
const sampleDiagramSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480" fill="none">
  <rect width="800" height="480" rx="16" fill="%230f172a"/>
  <rect x="40" y="40" width="720" height="400" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/>
  
  <!-- Header bar -->
  <rect x="40" y="40" width="720" height="60" rx="12" fill="%230f172a" stroke="%23334155" stroke-width="1"/>
  <circle cx="70" cy="70" r="7" fill="%23ef4444"/>
  <circle cx="95" cy="70" r="7" fill="%23f59e0b"/>
  <circle cx="120" cy="70" r="7" fill="%2310b981"/>
  <text x="160" y="75" fill="%2394a3b8" font-family="sans-serif" font-size="14" font-weight="600">The N1Pad — Visual Architecture v1.0</text>
  
  <!-- Left Column Card -->
  <rect x="70" y="130" width="200" height="270" rx="10" fill="%23090d16" stroke="%23334155" stroke-width="1.5"/>
  <text x="90" y="165" fill="%2338bdf8" font-family="sans-serif" font-size="16" font-weight="bold">Editor Engine</text>
  <rect x="90" y="185" width="160" height="8" rx="4" fill="%23334155"/>
  <rect x="90" y="205" width="130" height="8" rx="4" fill="%23334155"/>
  <rect x="90" y="225" width="150" height="8" rx="4" fill="%23334155"/>
  <rect x="90" y="260" width="160" height="40" rx="8" fill="%238b5cf6" fill-opacity="0.15" stroke="%238b5cf6" stroke-width="1"/>
  <text x="105" y="285" fill="%23c4b5fd" font-family="sans-serif" font-size="13">Canvas Annotator</text>

  <!-- Middle Column Card -->
  <rect x="300" y="130" width="200" height="270" rx="10" fill="%23090d16" stroke="%23334155" stroke-width="1.5"/>
  <text x="320" y="165" fill="%23a855f7" font-family="sans-serif" font-size="16" font-weight="bold">Annotation Tools</text>
  <text x="320" y="200" fill="%2394a3b8" font-family="sans-serif" font-size="13">• Setas Direcionais</text>
  <text x="320" y="230" fill="%2394a3b8" font-family="sans-serif" font-size="13">• Retângulos / Caixas</text>
  <text x="320" y="260" fill="%2394a3b8" font-family="sans-serif" font-size="13">• Marca-texto Realce</text>
  <text x="320" y="290" fill="%2394a3b8" font-family="sans-serif" font-size="13">• Texto e Notas</text>

  <!-- Right Column Card -->
  <rect x="530" y="130" width="200" height="270" rx="10" fill="%23090d16" stroke="%23334155" stroke-width="1.5"/>
  <text x="550" y="165" fill="%2306b6d4" font-family="sans-serif" font-size="16" font-weight="bold">Clerk Auth</text>
  <rect x="550" y="190" width="160" height="36" rx="6" fill="%231e293b" stroke="%23475569" stroke-width="1"/>
  <text x="565" y="213" fill="%23f8fafc" font-family="sans-serif" font-size="12">UserButton &amp; Modal</text>
  <rect x="550" y="240" width="160" height="80" rx="8" fill="%2306b6d4" fill-opacity="0.1" stroke="%2306b6d4" stroke-width="1"/>
  <text x="565" y="270" fill="%2367e8f9" font-family="sans-serif" font-size="12">High Performance</text>
  <text x="565" y="295" fill="%2394a3b8" font-family="sans-serif" font-size="11">Dark Mode Slate 950</text>
</svg>`;

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Bem-vindo ao The N1Pad 🚀',
    content: `O The N1Pad é o seu bloco de notas visual moderno e minimalista, projetado para velocidade de pensamento e precisão visual no estilo Linear / Notion.

✨ Principais Recursos:
• Título sem bordas com fonte marcante ("Sem título" padrão).
• Corpo de texto sem distrações com suporte a drag & drop e colar imagem da área de transferência (Ctrl+V).
• Suporte a múltiplas imagens por nota.
• Ferramenta avançada de anotação de imagem (Canvas API nativo):
  - Setas direcionais (para apontar bugs, fluxos ou detalhes).
  - Retângulos e caixas de seleção (para isolar áreas).
  - Marca-texto fluorescente (para realçar textos em capturas de tela).
  - Texto tipográfico com contraste nítido.
  - Caneta de desenho livre.

Experimente clicar no botão "Anotar / Marcar Imagem" abaixo no diagrama de demonstração!`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: true,
    tags: ['Início', 'Guia'],
    images: [
      {
        id: 'img-demo-1',
        url: sampleDiagramSvg,
        originalUrl: sampleDiagramSvg,
        name: 'arquitetura-the-n1pad.svg',
        size: 14200,
      },
    ],
  },
  {
    id: 'note-quick-ideas',
    title: 'Checklist de Lançamento e Ideias',
    content: `Tarefas para o deploy:
1. Validar fluxo de autenticação Clerk Auth (@clerk/nextjs).
2. Testar substituição automática da imagem após anotação no Canvas.
3. Exportação em PNG com alta resolução (devicePixelRatio 2x).
4. Sincronização e backup local automático no navegador.`,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    isPinned: false,
    tags: ['Projeto'],
    images: [],
  },
];
