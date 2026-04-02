import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';

// i18n modul inicijalizira i18next instancu s HTTP backendom
// zavisno o jeziku učitava prijevode iz /localhost/locales/{lng}/translation.json
const i18n = i18next.createInstance();

await i18n
  .use(HttpBackend)
  .init({
    lng: 'hr',
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  });

export default i18n;

// helper funkcija za prevođenje u kodu
export function t(key, options) {
  return i18n.t(key, options);
}