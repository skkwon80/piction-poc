// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Web3 from 'web3'

var provider = new Web3.providers.HttpProvider("http://127.0.0.1:9545");
window.web3 = new Web3(provider);
// web3 = new Web3(web3.currentProvider);
import Vue from 'vue'
import App from './App'
import PictionNetworkPlugin from './plugins/piction-network-plugin'
import FirebasePlugin from './plugins/firebase-plugin'
import Utils from './plugins/utils'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Toast from 'vue2-toast';
import 'vue2-toast/lib/toast.css';
import Datetime from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import councilSource from '../build/contracts/Council.json'
import councilInterfaceSource from '../build/contracts/CouncilInterface.json'

Vue.config.productionTip = false

Vue.use(BootstrapVue);
Vue.use(Datetime)
Vue.use(Toast);

(async () => {
  const accounts = await web3.eth.getAccounts();
  if (accounts.length == 0) {
    alert('Log in to the Metamask.')
  }
  const network = '4447';
  const councilAddress = councilSource.networks[network].address;
  const council = new web3.eth.Contract(councilInterfaceSource.abi, councilAddress);
  const pictionAddress = {};
  pictionAddress.council = councilAddress;
  pictionAddress.account = accounts[0].toLowerCase();
  pictionAddress.pxl = await council.methods.getToken().call();
  pictionAddress.pixelDistributor = await council.methods.getPixelDistributor().call();
  pictionAddress.depositPool = await council.methods.getDepositPool().call();
  pictionAddress.contentsManager = await council.methods.getContentsManager().call();
  pictionAddress.fundManager = await council.methods.getFundManager().call();
  pictionAddress.accountManager = await council.methods.getAccountManager().call();
  const pictionValue = {}
  pictionValue.initialDeposit = Number(await council.methods.getInitialDeposit().call());
  pictionValue.reportRegistrationFee = Number(await council.methods.getReportRegistrationFee().call());
  console.log('pictionAddress', pictionAddress);
  console.log('pictionValue', pictionValue);
  Vue.use(PictionNetworkPlugin, pictionAddress, pictionValue);

  Vue.use(FirebasePlugin, {
    apiKey: "AIzaSyAmq4aDivflyokSUzdDCPmmKBu_3LFTmkU",
    authDomain: "battlecomics-dev.firebaseapp.com",
    databaseURL: "https://battlecomics-dev.firebaseio.com",
    projectId: "battlecomics-dev",
    storageBucket: "battlecomics-dev.appspot.com",
    messagingSenderId: "312406426508"
  });
  Vue.use(Utils);

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    methods: {
      reload() {
        this.$router.push('/')
        window.location.reload()
      }
    },
    components: {App},
    template: '<App/>',
    created() {
      // web3.currentProvider.publicConfigStore.on('update', (provider) => {
      //   if (this.account != provider.selectedAddress.toLowerCase()) this.reload();
      // });
    }
  });
})()
