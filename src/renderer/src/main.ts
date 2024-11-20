import { createApp } from 'vue'
import App from './App.vue'
import Worker from './Worker.vue'
console.log(location.href)
createApp(location.href.includes('worker') ? Worker : App).mount('#app')
