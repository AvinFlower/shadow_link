// src/footer-components/privacy.tsx
import React from 'react';

const PrivacyPage: React.FC = () => (
  <div className="pt-36 container mx-auto py-10 px-4 max-w-3xl space-y-6">
    <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>

    <p>
      Мы уважаем вашу приватность и обязуемся защищать данные, которые вы нам доверяете. В этом документе изложено, какие данные мы собираем и как их используем.
    </p>

    <h2 className="text-2xl font-semibold">1. Собираемые данные</h2>
    <ul className="list-disc list-inside space-y-2">
      <li>Технические логи сервера: IP-адрес, URL запроса, время и статус ответа.</li>
      <li>JWT-токены для поддержания сеанса, хранящиеся в браузере.</li>
      <li>Данные из формы обратной связи: имя (опционально), email (опционально), сообщение.</li>
    </ul>

    <h2 className="text-2xl font-semibold">2. Цели обработки</h2>
    <p>
      Собранные данные используются исключительно для:
      <ul className="list-decimal list-inside ml-4 space-y-1 mt-2">
        <li>Обеспечения безопасности и аутентификации.</li>
        <li>Диагностики и устранения технических ошибок.</li>
        <li>Связи с вами по вопросам поддержки.</li>
      </ul>
    </p>

    <h2 className="text-2xl font-semibold">3. Передача третьим лицам</h2>
    <p>
      Мы не передаём ваши персональные данные сторонним компаниям, за исключением:
    </p>
    <ul className="list-disc list-inside space-y-2">
      <li>Поставщиков облачных услуг для хранения логов (обработчики данных по договору).</li>
      <li>Правоохранительных органов при наличии официального запроса.</li>
    </ul>

    <h2 className="text-2xl font-semibold">4. Сроки хранения</h2>
    <p>
      Логи сохраняются не более 90 дней для целей безопасности, после чего автоматически удаляются. Данные из формы обратной связи хранятся до момента вашего запроса на удаление.
    </p>

    <h2 className="text-2xl font-semibold">5. Права пользователя</h2>
    <p>
      Вы имеете право:
      <ul className="list-decimal list-inside ml-4 space-y-1 mt-2">
        <li>Запросить копию своих данных.</li>
        <li>Потребовать исправления некорректных сведений.</li>
        <li>Потребовать удаления данных из формы обратной связи.</li>
      </ul>
    </p>

    <h2 className="text-2xl font-semibold">6. Защита данных</h2>
    <p>
      Мы применяем современные методы шифрования (TLS 1.3), а доступ к логам ограничен по ролевой модели.
    </p>

    <h2 className="text-2xl font-semibold">7. Контактная информация</h2>
    <p>
      По вопросам конфиденциальности пишите на <a href="mailto:privacy@shadowlink.example" className="text-primary">privacy@shadowlink.example</a>.
    </p>

    <h2 className="text-2xl font-semibold">8. Изменения политики</h2>
    <p>
      Мы можем обновлять эту Политику. Дата последнего обновления отображается вверху страницы. Ваше дальнейшее использование сервиса означает принятие изменений.
    </p>
  </div>
);

export default PrivacyPage;
