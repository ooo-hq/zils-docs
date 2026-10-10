import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-title-before': () => [
      h('span', { class: 'zils-wordmark' }, [
        'Zils',
        h('span', { class: 'zils-sheen', 'aria-hidden': 'true' }, 'Zils'),
      ]),
      h('span', { class: 'docs-label' }, '/ Docs'),
    ],
  }),
};
