import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入字体图标
import './assets/font/iconfont.css'
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'

//配置请求的根路径
axios.defaults.baseURL = 'http://zhuchaonan.myuxi.top/api/private/v1/';
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token');
  //最后必须  return config
  return config
})
Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.component('tree-table',TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
