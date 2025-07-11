// src/footer-components/terms.tsx
import React from 'react';

const TermsPage: React.FC = () => (
  <div className="pt-36 container mx-auto py-10 px-4 max-w-3xl space-y-6">
    <h1 className="text-3xl font-bold">Условия использования</h1>

    <p>
      Добро пожаловать на Shadowlink! Используя наш сайт и сервисы (далее «Сервис»), вы подтверждаете своё согласие с этими Условиями. 
      Если вы не принимаете какие-либо пункты, пожалуйста, незамедлительно прекратите использование.
    </p>

    <h2 className="text-2xl font-semibold">1. Предмет соглашения</h2>
    <p>
      Эти Условия регулируют отношения между пользователем и компанией, предоставляющей Сервис, в части доступа и использования всех функций сайта.
    </p>

    <h2 className="text-2xl font-semibold">2. Регистрация и аккаунт</h2>
    <ul className="list-disc list-inside space-y-2">
      <li>При регистрации вы обязаны указывать достоверные данные.</li>
      <li>Вы отвечаете за сохранность своих учётных данных и безопасность доступа.</li>
      <li>В случае компрометации аккаунта вы обязаны незамедлительно уведомить нас.</li>
    </ul>

    <h2 className="text-2xl font-semibold">3. Использование сервиса</h2>
    <p>
      Пользователь имеет право использовать Сервис в личных и коммерческих целях в рамках правил, не нарушающих законодательство.
    </p>

    <h2 className="text-2xl font-semibold">4. Ограничения и запреты</h2>
    <ul className="list-disc list-inside space-y-2">
      <li>Запрещено запускать скрипты, генерирующие чрезмерную нагрузку (DDoS, фроду).</li>
      <li>Запрещается применять Сервис для распространения вредоносного софта и спама.</li>
      <li>Нельзя передавать или продавать доступ третьим лицам.</li>
    </ul>

    <h2 className="text-2xl font-semibold">5. Платежи и возвраты</h2>
    <p>
      Любые финансовые операции осуществляются согласно условиям выбранного тарифного плана. При отказе от услуг возврат средств возможен в течение 14 дней при условии непревышения 10% трафика.
    </p>

    <h2 className="text-2xl font-semibold">6. Отказ от ответственности</h2>
    <p>
      Сервис предоставляется «как есть». Мы не гарантируем отсутствие сбоев, соответствие любым вашим требованиям или непрерывность работы. 
      Мы не несём ответственности за прямые и косвенные убытки, возникшие в связи с использованием сервиса.
    </p>

    <h2 className="text-2xl font-semibold">7. Изменения условий</h2>
    <p>
      Мы оставляем за собой право в любой момент вносить изменения в эти Условия. О новых редакциях будет объявлено на этой странице, а ваше дальнейшее использование означает принятие.
    </p>

    <h2 className="text-2xl font-semibold">8. Применимое право</h2>
    <p>
      К настоящим Условиям применяется законодательство Российской Федерации. Все споры разрешаются в суде по месту регистрации компании.
    </p>
  </div>
);

export default TermsPage;
