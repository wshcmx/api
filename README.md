<h1 align="center">Developers API - инструмент для разработчиков WebSoft HCM</h1>

## Что это такое и зачем оно мне?

Данное программное решение предоставляет набор удобных инструментов для разработчиков WebSoft HCM, которое позволяет существенно сократить время на разработку и отладку программного кода: вам больше не нужно создавать отдельные документы в системе и копировать в них исходные коды, всё будет лежать в едином структурированном репозитории, поддержка hotreload позволит сразу же видеть внесенные изменения, а типизация избавит от опечаток и необходимости просмотра наличия тех или иных полей объектов или аргументов функций в исходных файлах системы.

#### Основные преимущества инструмента

- Гибкий оркестр запросов для реализации REST API
- Набор часто используемых утилит для работы с объектами и выборками
- Механизм hotreload
- Поддержка типизации
- Автоматизированная сборка проекта с возможностью настройки поставки

## Как начать с этим работать?

### Клонирование и установка зависимостей

Для начала работы необходимо иметь интернет соединение, установленный [Git](https://git-scm.com/) и [Node.js](https://nodejs.org/), если эти условия удовлетворены - выполняем клонирование данного репозитория к себе и устанавливаем [npm](https://www.npmjs.com/) зависимости, делается это с помощью нескольких простых команд в командной строке.

```bash
git clone https://github.com/@wshcmx/api.git    # Клонирование репозитория
cd api                                         # Переходим в директорию, куда был склонирован репозиторий 
npm i                                                   # Устанавливаем заивимости с помощью npm
```

### Работа с проектом в редакторе

Открываем директорию проекта в редакторе форматированного текста, например, [Visual Studio Code](https://code.visualstudio.com/) или любом другом, с поддержкой TypeScript.

#### Структура проекта

Ниже представлена структура проекта с кратким описанием его директорий.

```
webtutor-api/
├─ build/                   # Собранный проект
├─ src/                     # В данной директории расположен основной код проекта
│  ├─ controllers/          # Доступные для вызова через API функции
│  ├─ services/             # Функции для выполнения запросов и действий, вызываются из контроллеров 
│  ├─ utils/                # Общие функции для упрощения разработки, например - приведение даты в определенный формат
```

Важно помнить, что в **программном коде библиотек можно объявлять только функции**, в противном случае - будет выведена ошибка из-за ограничений платформы.

Доступ к объявленным функциям можно получить с помощью глобальной переменной `wshcmx`, в ней хранятся ссылки на все функции из `services` и `utils`.
```typescript
wshcmx.utils.date.isDate(someDate);   // Обращение к функции `isDate`, расположенной в каталоге `utils`
wshcmx.services.events.getEvents();   // Обращение к функции `getEvents`, расположенной в каталоге `services`
```

Вы можете обращаться к переменной `wshcmx` из любого объекта системы на сервере, если же вам нужно реализовать поддержку в толстом клиенте администратора, необходимо будет точечно устанавливать данную библиотеку для каждого пользователя, что очень сильно не рекомендуется из-за сопутствующей сложности данного процесса.

#### controllers

Директория предназначена для размещения программного кода верхнеуровневых обработчиков пользовательских запросов - предлагается не размещать здесь бизнес-логику, а использовать как промежуточный слой для выполнения каких-то долнительных проверок, склеивания ответов разных функций и прочего.

Важно помнить, что функция будет доступна для вызова только если вы опишите её в специальной функции `functions()`, как показано на примере ниже.

```typescript
// Объявляем функцию `functions` и описываем какие endpoint будут доступны пользователю при обращении к ней
export function functions(): Route[] {
  return [{
    method: "GET",                  // HTTP метод
    pattern: "/collaborator",       // Адрес
    callback: getCollaborator    // Название вызываемой функции, расположенной в этом же файле
    access: "user"                  // Доступ к функции для пользователя или внешего приложения
  }];
}

// Объявляем функцию для вывода идентификатора текущего пользователя
export function getCollaborator(params: HandlerParams, Request: Request) {
  return wshcmx.utils.response.ok(`curUserID is ${Request.Session.Env.curUserID}`); // Возвращаем ответ, обернув в специальную функцию `ok`
}
```

В результате вышеописанных действий, пользователь сможет получить свой идентификатор, обратившись по адресу `https://<server_address>/api/v1/collaborators/collaborator`, при этом - вам не нужно думать об аутентификации, так как этот процесс зашит в ядро оркестратора.

**Результаты выполнения функций в контроллерах необходимо оборачивать в специальные функции из библиотеки** `data.utils.repsponse`, тогда ваши ответы будут иметь общий вид.

```typescript
// Пример формирования ответа с удачным исходом
export function getOk() {
  return wshcmx.utils.response.ok(`I'm okay!`, 200);  
}

// Пример формирования ответа с неудачным исходом
export function getFail() {
  return wshcmx.utils.reponse.abort(`I'm not okay!`, 418);
}
```

###### Валидация

Для контроллеров также предусмотрен механизм валидации, который, к тому же, служит 
источником данных для сборки `OpenApi` документации.

```typescript
export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/samples",
    callback: getSamples
    access: "user",
    summary: "Запрашивает какой-то объект",                   // Описание метода
    params: {                                                 // Набор параметров, принимаемых методом
      id: {
        type: "string",                                       // Тип значения параметра `id`
        optional: false,                                      // Является ли параметр обязательным
        store: "query",                                       // Откуда будет запрашиваться параметр - `query` | `body`
        description: "Идентификатор запрашиваемого объекта"   // Описание параметра
      }
    }
  }];
}
```

#### services

Директория для размещения программного кода для работы с конкретными объектами и выборками.

Фактически, является набором библиотек программного кода, функции которых размещаются в глобальной переменной `wshcmx.services`.

```typescript
// Пример реализации простого сервиса по выборке мероприятий 
export function getEvents() {
  return wshcmx.utils.query.extract<EventCatalogDocument>(`for $e in events return $e`);
}

// Данная функция будет доступна к вызову следующим образом
wshcmx.services.events.getEvents();
```

#### utils

Директория для размещения программного кода общего назначения, например - конвертация дат, приведением объектов к определённому формату и прочее.

Фактически, является набором библиотек программного кода, функции которых размещаются в глобальной переменной `wshcmx.utils`.

```typescript
// Пример реализации аналога `Array.pop()`
export function pop(array: unknown[]): unknown[] {
  return ArrayRange(array, 0, ArrayCount(array) - 1);
}

// Данная функция будет доступна к вызову следующим образом
wshcmx.utils.array.pop(["foo", "bar"]);
```

### Переменные окружения

В репозитории, в файле `.env.example`, хранится пример с доступными в проекте переменными окружения, вы можете скопировать данный файл и назвать `.env`, после чего заполнить его в соответствии с вашими настройками системы.

```
DEPLOYER_LOGIN=deployer               # Логин внешнего приложения
DEPLOYER_PASSWORD=deployer            # Пароль внешнего приложения
DEPLOYER_HOST=http://localhost:8080   # Хост для подключения
DEPLOYER_APP_ID=deployer              # Идентификатор для подстановки в `x-app-id`
API_WEBTUTOR_BASE_PATH=/wshcmx          # Базовый путь `wshcmx`
```

Под внешним приложением понимается объект `remote_application` системы WebSoft HCM, расположенный в разделе `Безопасность >> API >> Внешние приложения API`.

### Сборка проекта

Сборка проекта выполняется с помощью вызова команды `npm run build` в командной строке.

Результат выполнения команды будет примерно следующим:

```bash
Запущена задача openapi:generate по генерации документации openapi
🔧 Файл ./webtutor-api/src/services/*.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/api.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/index.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/controllers/*.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/utils/*.ts успешно транспилирован

🔨 Собираем openapi документацию к проекту
🔎 Найдено:
        6 контроллеров
        9 обработчиков
📄 openapi.json сформирован
```

После этого у вас должна появиться новая директория `build`, в которой будет содержаться собранный для поставки проект.

В проекте также доступен скрипт, который сразу после сборки выполнит поставку на сервер `npm run build:delivery`.

#### Swagger (OpenAPI)

В проекте доступно несколько скриптов, предназначенных для сборки и поставки OpenAPI.

```bash
npm run openapi:generate  # Собирает openapi.json
npm run openapi:delivery  # Собирает openapi.json и выполняет поставку на сервер
```

Найти собранный `openapi.json` вы можете в директории `build/openapi`, на сервере же данный файл будет доступ в директории 
`x-local://wt/web/wshcmx/openapi`.

Для реализации web-интерфейса используется библиотека `RapiDoc`, которая доступна из коробки `WebSoft HCM`,
перейти к данному интерфейсу можно по ссылке `https://<server_address>/wshcmx/openapi/openapi.html`.

### Поставка на сервер

Контент директории `build` необходимо перенести на сервер в `x-local://wt/web/wshcmx`, если вы делаете это первый раз, после переноса, необходимо запустить скрипт установки библиотеки.

**Если вы используете Windows и PowerShell**, необходимо запустить скрипт `install.ps1`.

**Если вы используете Linux и Bash**, необходимо запустить скрипт `install.sh`.

В результате выполнения данных скриптов будет произведено добавление библиотеки `wshcmx` в коробочный файл `api_ext.xml`, используемый для регистрации сторонних библиотек, в консоли же, в случае успешного выполнения, вы увидите информацию о регистрации библиотеки следующего вида:

```bash
wshcmx node successfully added to api_ext.xml file
```

Для того чтобы изменения вступили в силу, вам необходимо произвести перезагрузку сервера.

После перезагрузки, вы увидите в журнале `xhttp` информацию о регистрации и загрузке, объявленных в `wshcmx`, библиотек следующего вида:

```bash
Registering wshcmx
array was successfully loaded as part of utils, hash is F29DE32E5B053DD42E71C52E80595F32
object was successfully loaded as part of utils, hash is A7DB89C01498303C8254B8A1593A653E
validator was successfully loaded as part of utils, hash is 7F670B7683DC0E1BFBC30B001CA1361C
passport was successfully loaded as part of utils, hash is A43BC502E35D1C0BFEE49DF8212CA97C
router was successfully loaded as part of utils, hash is 2FC7B615F195CB129CB8A0124C1D7676
fs was successfully loaded as part of utils, hash is 9D69670F309EF9CC22E142064A9A3233
paginator was successfully loaded as part of utils, hash is 1A71AF815E2EAFF76A22CB72C231D2FD
response was successfully loaded as part of utils, hash is C895BF217B8E225E7C32FB000E58173A
config was successfully loaded as part of utils, hash is C38B8CF9B098377BE3B9DA4BFF06C3C3
query was successfully loaded as part of utils, hash is 97B9E15ACA5D7A9911E4F0CEEADB6E2E
log was successfully loaded as part of utils, hash is C0A85788A3832253EEEBE74D6A8950CE
request was successfully loaded as part of utils, hash is CF0AD736861E2CB51F8CAD2330E18607
type was successfully loaded as part of utils, hash is 45508C2BFC6C5B14B7D409B089356D0E
events was successfully loaded as part of services, hash is BC355042ED2BBDAA234AFEABED752DA1
Config loaded: {"env":"development","version":"9.9.9","api":{"pattern":"/api/v1","basepath":"x-local://wt/web/wshcmx"},"stderr":true}
Web rule successfully updated 7257866394331456688
API is ready: /api/v1
wshcmx successfully registered
External API Lib: x-local://wt/web/wshcmx/index.xml. Loaded.
```

Если все библиотеки зарегистрировались успешно, вы можете проверить доступ к API по адресу `https://<server_address>/api/v1/ping`.

## Ограничения и условности

Так как в проекте используется `TypeScript`, который будет транспилирован в `JavaScript` - необходимо использовать в разработке только приближенные к `SP-XML Script` конструкции, иначе вы получите невалидный для WebSoft HCM программный код.
