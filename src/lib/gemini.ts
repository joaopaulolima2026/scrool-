const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Cache do modelo descoberto para não listar toda vez
let cachedModel: string | null = null;

/**
 * Descobre automaticamente qual modelo Gemini está disponível para esta chave.
 * Chama GET /v1beta/models e filtra pelo que suporta generateContent.
 */
async function discoverModel(): Promise<string> {
  if (cachedModel) return cachedModel;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.models || data.models.length === 0) {
      throw new Error(
        '⚠️ Sua chave de API não tem acesso a nenhum modelo Gemini.\n\n' +
        'Para corrigir:\n' +
        '1. Acesse https://aistudio.google.com/apikey\n' +
        '2. Clique em "Create API Key"\n' +
        '3. Selecione um projeto existente ou crie um novo\n' +
        '4. Copie a nova chave\n' +
        '5. Cole no arquivo .env como VITE_GEMINI_API_KEY=sua_nova_chave\n' +
        '6. Reinicie o servidor (npm run dev)'
      );
    }

    // Filtra modelos que suportam generateContent
    const generativeModels = data.models.filter((m: any) =>
      m.supportedGenerationMethods?.includes('generateContent')
    );

    if (generativeModels.length === 0) {
      throw new Error(
        '⚠️ Nenhum modelo disponível suporta geração de conteúdo com esta chave.\n' +
        'Crie uma nova chave em: https://aistudio.google.com/apikey'
      );
    }

    // Prioridade: Flash 2.0 > Flash 1.5 > Pro 1.5 > Pro 1.0 > qualquer outro
    const priority = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    for (const preferred of priority) {
      const found = generativeModels.find((m: any) => m.name === `models/${preferred}`);
      if (found) {
        cachedModel = found.name.replace('models/', '');
        console.log(`✅ Modelo Gemini detectado: ${cachedModel}`);
        return cachedModel;
      }
    }

    // Se nenhum dos preferidos, pega o primeiro disponível
    cachedModel = generativeModels[0].name.replace('models/', '');
    console.log(`✅ Modelo Gemini detectado (fallback): ${cachedModel}`);
    return cachedModel;

  } catch (err: any) {
    if (err.message.startsWith('⚠️')) throw err;
    throw new Error(
      `Erro ao conectar com a API Gemini: ${err.message}\n\nVerifique sua conexão com a internet.`
    );
  }
}

export async function generateContent(
  systemPrompt: string,
  userMessage: string,
  _retryCount = 0
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'Chave da API Gemini não configurada.\n\n' +
      'Adicione VITE_GEMINI_API_KEY no arquivo .env\n' +
      'Crie uma chave em: https://aistudio.google.com/apikey'
    );
  }

  // Auto-detectar modelo disponível
  const model = await discoverModel();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ 
            text: `INSTRUÇÕES DE SISTEMA:\n${systemPrompt}\n\n---\n\nREQUISIÇÃO:\n${userMessage}` 
          }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Se quota excedida, auto-retry até 2 vezes com delay
    if (response.status === 429 && _retryCount < 2) {
      const waitSec = 30;
      console.log(`⏳ Rate limit atingido. Tentando novamente em ${waitSec}s... (tentativa ${_retryCount + 1}/2)`);
      await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
      return generateContent(systemPrompt, userMessage, _retryCount + 1);
    }
    if (response.status === 429) {
      throw new Error('Limite de requisições atingido. Aguarde 1 minuto e tente novamente.');
    }
    throw new Error(data?.error?.message || `Erro na API: ${response.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('A IA não gerou resposta. Tente novamente.');

  return text;
}
