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

const PORT             = process.env.PORT || 3000;
const SITE             = path.resolve(__dirname, '..');
const MAX_QUESTION_LEN = 5000;
const KEY_COOLDOWN_MS  = 60_000; // 1 минута cooldown при 429

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Загрузка ключей (ротация) ─────────────────────────────────
// Форматы в .env:
//   GEMINI_API_KEY=key1                 (одиночный, обратная совместимость)
//   GEMINI_API_KEYS=key1,key2,key3      (список через запятую)
//   GEMINI_API_KEY_1=key1               (пронумерованные)
//   GEMINI_API_KEY_2=key2
const GEMINI_KEYS = (() => {
    const seen = new Set();
    const add  = k => { if (k?.trim()) seen.add(k.trim()); };
    add(process.env.GEMINI_API_KEY);
    (process.env.GEMINI_API_KEYS || '').split(',').forEach(add);
    for (let i = 1; i <= 20; i++) add(process.env[`GEMINI_API_KEY_${i}`]);
    return [...seen];
})();

const geminiClients = GEMINI_KEYS.map(k => new GoogleGenerativeAI(k));
const keyCooldown   = new Array(GEMINI_KEYS.length).fill(0); // unix ms: до какого времени ключ на cooldown
let   rrIdx         = 0; // round-robin стартовая позиция

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
- Буква "g" в номере магазина (например 19g, 12ag) — означает, что магазин питается от ТП-5353

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
    if (geminiClients.length === 0) {
        jsonResponse(res, 500, { error: 'Ни один GEMINI_API_KEY не найден в .env файле.' });
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
    const MODELS = ['gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];
    const n      = geminiClients.length;
    const now    = Date.now();

    // Перебираем ключи по round-robin; внутри каждого ключа — все модели
    for (let ki = 0; ki < n; ki++) {
        const keyIdx = (rrIdx + ki) % n;

        if (now < keyCooldown[keyIdx]) {
            const secsLeft = Math.ceil((keyCooldown[keyIdx] - now) / 1000);
            console.log(`  ⏳ Ключ ${keyIdx + 1}/${n} cooldown ещё ${secsLeft}s — пропускаем`);
            continue;
        }

        for (const modelName of MODELS) {
            try {
                const model  = geminiClients[keyIdx].getGenerativeModel({ model: modelName, systemInstruction });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: cleanQuestion }] }],
                    generationConfig: { temperature: 0.15, maxOutputTokens: 1000 }
                });
                const answer = result.response.text().trim() || 'ИИ не смог ответить.';
                rrIdx = (keyIdx + 1) % n; // сдвигаем round-robin для следующего запроса
                console.log(`  ✅ Ключ ${keyIdx + 1}/${n}, модель: ${modelName}`);
                jsonResponse(res, 200, { reply: answer, found: searchResults.length > 0, paths: searchResults.slice(0, 5) });
                return;
            } catch (e) {
                const is429 = e.status === 429 ||
                              /429|quota exceeded|RESOURCE_EXHAUSTED/i.test(e.message);
                if (is429) {
                    keyCooldown[keyIdx] = Date.now() + KEY_COOLDOWN_MS;
                    console.log(`  ✗ Ключ ${keyIdx + 1}/${n} — лимит превышен, cooldown ${KEY_COOLDOWN_MS / 1000}s`);
                    break; // переходим к следующему ключу
                }
                console.log(`  ✗ Ключ ${keyIdx + 1}/${n}, ${modelName}: ${e.message}`);
            }
        }
    }

    jsonResponse(res, 500, { error: 'Все ключи и модели недоступны. Проверьте лимиты и интернет.' });
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
    if (GEMINI_KEYS.length === 0) {
        console.log('   ❌ Gemini ключи: НЕ НАЙДЕНЫ — добавьте GEMINI_API_KEY в .env');
    } else {
        console.log(`   Gemini ключи: ${GEMINI_KEYS.length} шт. загружено ✓ (ротация активна)`);
    }
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
