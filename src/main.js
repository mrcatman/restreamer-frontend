import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import 'sweetalert2/src/sweetalert2.scss'
import './css/main.scss'
Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  connection: 'http://localhost:8082',
}))

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
