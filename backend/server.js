const http = require('http');
const fs   = require('fs');
const path = require('path');

// ── Читаем .env ───────────────────────────────────────────────
try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    for (const line of envFile.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i > 0) {
            const k = t.slice(0, i).trim();
            const v = t.slice(i + 1).trim();
            if (!process.env[k]) process.env[k] = v;
        }
    }
} catch (err) {
    if (err.code !== 'ENOENT') console.warn('⚠️  Ошибка чтения .env:', err.message);
}

const PORT        = process.env.PORT || 3000;
const GEMINI_KEY  = process.env.GEMINI_API_KEY;
const SITE        = path.resolve(__dirname, '..');
const MAX_QUESTION_LEN = 5000;

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

console.log('Папка сайта:', SITE);

// ── MIME-типы ─────────────────────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css' : 'text/css',
    '.js'  : 'text/javascript',
    '.png' : 'image/png',
    '.jpg' : 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico' : 'image/x-icon',
    '.json': 'application/json',
    '.svg' : 'image/svg+xml',
};

// ── Системный промпт ──────────────────────────────────────────
const SYSTEM_PROMPT = `Ты — ИИ-помощник по электроснабжению ТЦ Abusaxiy (Ташкент, Узбекистан).

ТЕРМИНОЛОГИЯ:
- ТП (Трансформаторная Подстанция) — главная подстанция, источник электроэнергии
- Т1/Т2 — трансформаторы №1 и №2 внутри ТП
- ВРУ (Вводно-Распределительное Устройство) — главный распределительный щит
- ЩР (Щит Распределительный) — промежуточный щит для группы объектов
- ЯРВ (Ящик Распределительный Вводной) — промежуточный ящик с автоматами
- АВР (Автоматический Ввод Резерва) — автоматическое переключение на резерв
- ШО (Щит Освещения) — конечный щит для группы магазинов

СТРУКТУРА ТЦ:
- 1-блок: ряды A, B, C, D, E, F, H, K, L, M, O, Q, R, V
- 2-блок: ряды S, R, P, J, U, T, G
- 3-блок: ряды 1–11
- Гипермаркет: Подвал, Этаж 1, Этаж 2
- Специфические объекты: кафе, посты, технические помещения

ПРАВИЛА:
1. Используй только данные из найденных путей
2. Показывай точный путь в формате: ТП > Т1 > ВРУ > ЩР > блок > ряд > ЯРВ > ШО
3. Объясни аббревиатуры при необходимости
4. Отвечай на том языке, на котором спрашивают`;

// ── Security headers ──────────────────────────────────────────
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options'       : 'DENY',
    'X-XSS-Protection'      : '1; mode=block',
};

// ── Отдача статических файлов ─────────────────────────────────
async function serveStatic(res, filePath) {
    const siteRoot = path.resolve(SITE);
    const resolved = path.resolve(filePath);
    if (resolved !== siteRoot && !resolved.startsWith(siteRoot + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
        res.end('403 — доступ запрещён');
        return;
    }
    try {
        const data = await fs.promises.readFile(resolved);
        const ext  = path.extname(resolved).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', ...SECURITY_HEADERS });
        res.end(data);
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
        res.end('404 — файл не найден');
    }
}

// ── AI-запрос (Gemini) ────────────────────────────────────────
async function handleAI(req, res) {
    if (!genAI) {
        jsonResponse(res, 500, { error: 'GEMINI_API_KEY не найден в .env файле.' });
        return;
    }

    const raw = await readBody(req);

    // Валидация JSON
    let body;
    try {
        body = JSON.parse(raw);
    } catch {
        jsonResponse(res, 400, { error: 'Невалидный JSON в теле запроса.' });
        return;
    }

    // Валидация question
    const { question, searchResults: rawResults = [] } = body;
    if (!question || typeof question !== 'string' || !question.trim()) {
        jsonResponse(res, 400, { error: 'Поле "question" должно быть непустой строкой.' });
        return;
    }
    const cleanQuestion = question.trim();
    if (cleanQuestion.length > MAX_QUESTION_LEN) {
        jsonResponse(res, 400, { error: `Вопрос слишком длинный (макс ${MAX_QUESTION_LEN} символов).` });
        return;
    }

    // Валидация searchResults
    const searchResults = Array.isArray(rawResults)
        ? rawResults.filter(r =>
            r && typeof r === 'object' &&
            typeof r.block === 'string' &&
            typeof r.path  === 'string' &&
            Array.isArray(r.shops) &&
            r.shops.every(s => typeof s === 'string')
          ).slice(0, 10)
        : [];

    let ctx = '';
    if (searchResults.length > 0) {
        const safe = s => String(s).replace(/\n/g, ' ').slice(0, 200);
        ctx = '\n\n=== НАЙДЕННЫЕ ДАННЫЕ ===\n' +
              searchResults.map(r =>
                  `• Блок: ${safe(r.block)} | Путь: ${safe(r.path)} | Магазины: [${r.shops.map(safe).join(', ')}]`
              ).join('\n');
    } else {
        ctx = '\n\n=== ДАННЫЕ ===\nТочных путей не найдено. Попроси уточнить блок, ряд или номер магазина.';
    }

    const systemInstruction = SYSTEM_PROMPT + ctx;
    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-flash-lite-latest'];

    for (const modelName of models) {
        try {
            const model  = genAI.getGenerativeModel({ model: modelName, systemInstruction });
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: cleanQuestion }] }],
                generationConfig: { temperature: 0.15, maxOutputTokens: 1000 }
            });
            const answer = result.response.text().trim() || 'ИИ не смог ответить.';
            console.log(`  ✅ Модель: ${modelName}`);
            jsonResponse(res, 200, { reply: answer, found: searchResults.length > 0, paths: searchResults.slice(0, 5) });
            return;
        } catch (e) {
            console.log(`  ✗ ${modelName}: ${e.message}`);
        }
    }

    jsonResponse(res, 500, { error: 'Все модели недоступны. Проверьте GEMINI_API_KEY и интернет.' });
}

// ── Утилиты ───────────────────────────────────────────────────
function readBody(req) {
    return new Promise((ok, fail) => {
        const chunks = [];
        let size = 0;
        const MAX = 1024 * 1024; // 1 МБ
        req.on('data', c => {
            size += c.length;
            if (size > MAX) { fail(new Error('Тело запроса слишком большое')); req.destroy(); return; }
            chunks.push(c);
        });
        req.on('end',   () => ok(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', fail);
    });
}

function jsonResponse(res, code, obj) {
    res.writeHead(code, {
        'Content-Type'                : 'application/json',
        'Access-Control-Allow-Origin' : '*',
        ...SECURITY_HEADERS,
    });
    res.end(JSON.stringify(obj));
}

// ── Главный обработчик ────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    console.log(`→ ${req.method} ${req.url}`);

    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'POST' && req.url === '/api/ai') {
        try   { await handleAI(req, res); }
        catch (e) {
            console.error('AI error:', e.message);
            jsonResponse(res, 500, { error: 'Ошибка при обработке запроса.' });
        }
        return;
    }

    if (req.method === 'GET') {
        let urlPath;
        try { urlPath = decodeURIComponent(req.url.split('?')[0]); }
        catch { res.writeHead(400); res.end(); return; }
        const filePath = (urlPath === '/' || urlPath === '/index.html')
            ? path.join(SITE, 'index.html')
            : path.join(SITE, urlPath);
        await serveStatic(res, filePath);
        return;
    }

    res.writeHead(405); res.end();
});

// ── Запуск ────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`   Gemini ключ: ${GEMINI_KEY ? 'загружен ✓' : 'НЕ НАЙДЕН ✗'}`);
    console.log('   Ожидаю запросы... (Ctrl+C для остановки)');
});

server.on('error', err => {
    if (err.code === 'EADDRINUSE')
        console.error(`❌ Порт ${PORT} уже занят — закройте другой процесс.`);
    else
        console.error('❌ Ошибка сервера:', err.message);
    process.exit(1);
});

process.on('uncaughtException', err => {
    console.error('❌ Необработанное исключение:', err);
    process.exit(1);
});
process.on('unhandledRejection', reason => {
    console.error('❌ Необработанный Promise rejection:', reason);
    process.exit(1);
});
