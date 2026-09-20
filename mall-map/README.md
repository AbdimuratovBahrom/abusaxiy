# Карта ТЦ «Абусахий»

Интерактивная карта торгового центра на React + Vite: поиск магазинов, построение пешеходных маршрутов через Google Maps и редактор точек для администратора.

## Технологии

- React + Vite
- [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api)
- Tailwind CSS 4
- React Router
- Данные точек — `src/data/stores.json`

## Как получить Google Maps API ключ

1. Зайдите в [Google Cloud Console](https://console.cloud.google.com/) и создайте (или выберите) проект.
2. В разделе **APIs & Services → Library** включите:
   - **Maps JavaScript API**
   - **Directions API**
3. В разделе **APIs & Services → Credentials** нажмите **Create credentials → API key**.
4. Рекомендуется ограничить ключ по HTTP-referrer (домен вашего сайта) и по включённым API.

## Установка и запуск

```bash
cd mall-map
npm install
cp .env.example .env
```

Впишите ваш ключ в `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=ваш_ключ
```

Запуск дев-сервера:

```bash
npm run dev
```

Сборка для продакшна:

```bash
npm run build
```

## Деплой на Vercel

1. Импортируйте репозиторий в Vercel, укажите **Root Directory: `mall-map`**.
2. Framework Preset — Vite (определится автоматически).
3. В настройках проекта (Environment Variables) добавьте `VITE_GOOGLE_MAPS_API_KEY`.
4. Deploy.

## Карта (`/`)

- Поиск по названию, номеру, блоку и ряду (с задержкой 300мс).
- Клик по результату поиска или маркеру — центрирует карту и строит пешеходный маршрут от главного входа (`main_entrance` в stores.json).
- Кнопка «Моё местоположение» строит маршрут от текущих координат пользователя (через geolocation браузера).
- Последний выбранный магазин запоминается в localStorage.

## Редактор (`/editor`)

1. Откройте `/editor` и введите пароль **`admin2024`** (захардкожен в `src/pages/EditorPage.jsx`, при необходимости смените).
2. Кликайте по карте, чтобы добавить новую точку — координаты подставятся автоматически.
3. В списке справа можно отредактировать («изм.») или удалить («удал.») любую точку.
4. Все изменения сохраняются в `localStorage` браузера, пока вы их не экспортируете.

### Как экспортировать данные

Нажмите **«Экспорт JSON»** — скачается актуальный `stores.json`. Замените им файл `src/data/stores.json` в проекте и задеплойте заново, чтобы изменения увидели все пользователи.

### Как импортировать данные

Нажмите **«Импорт JSON»** и выберите файл `stores.json` нужного формата — он заменит текущую рабочую копию в редакторе.

## Структура данных (`src/data/stores.json`)

```json
{
  "stores": [
    { "id": "001", "name": "Магазин №001", "block": "A", "row": "1", "type": "store", "lat": 41.2995, "lng": 69.2401, "description": "" }
  ],
  "specialObjects": [
    { "id": "main_entrance", "name": "Главный вход", "type": "entrance", "lat": 41.2995, "lng": 69.2401 }
  ],
  "mapCenter": { "lat": 41.2995, "lng": 69.2401 },
  "defaultZoom": 18
}
```

`type` — один из: `store`, `toilet`, `food`, `atm`, `exit`, `entrance`, `other`.
