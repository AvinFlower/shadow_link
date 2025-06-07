// src/footer-components/cookies.tsx
import React from 'react';

const CookiesPage: React.FC = () => (
  <div className="pt-36 container mx-auto py-10 px-4 max-w-3xl space-y-6">
    <h1 className="text-3xl font-bold">Политика использования cookies</h1>

    <p>
      Shadowlink минимально использует браузерные хранилища. Ниже описано, какие данные сохраняются и как вы можете управлять ими.
    </p>

    <h2 className="text-2xl font-semibold">1. Функциональные cookies</h2>
    <p>
      Мы не устанавливаем сторонние cookies. Для авторизации и поддержания сеанса используются:
    </p>
    <ul className="list-disc list-inside space-y-2">
      <li><strong>localStorage</strong> — хранение JWT.</li>
      <li><strong>sessionStorage</strong> — временные данные в рамках сеанса.</li>
    </ul>

    <h2 className="text-2xl font-semibold">2. Аналитические скрипты</h2>
    <p>
      Мы не подключаем Google Analytics, Yandex.Metrika или иные сторонние трекеры. Единственный способ анализа — бэкенд-логи.
    </p>

    <h2 className="text-2xl font-semibold">3. Управление и удаление</h2>
    <p>
      Вы в любой момент можете:
      <ul className="list-decimal list-inside ml-4 space-y-1 mt-2">
        <li>Очистить localStorage и sessionStorage через инструменты разработчика.</li>
        <li>Настроить автоматическую очистку при выходе из браузера.</li>
      </ul>
    </p>

    <h2 className="text-2xl font-semibold">4. Влияние на работу сервиса</h2>
    <p>
      Если вы отключите или очистите хранилище, то:
    </p>
    <ul className="list-disc list-inside space-y-2">
      <li>Придётся каждый раз заново входить в систему.</li>
      <li>Некоторые пользовательские настройки могут сбрасываться.</li>
    </ul>

    <h2 className="text-2xl font-semibold">5. Обновления политики</h2>
    <p>
      Изменения вступают в силу с момента публикации. Проверяйте дату обновления вверху страницы.
    </p>
  </div>
);

export default CookiesPage;
