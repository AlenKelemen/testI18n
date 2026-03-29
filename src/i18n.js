import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';

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

export function t(key, options) {
  return i18n.t(key, options);
}