import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import userModule from './modules/user';
interface SbomStore {
  productName: string;
  isThirdPart: string;
}
export default createStore({
  state: {
    productName: '',
    isThirdPart: '',
  },
  getters: {
    getProductName: (state: SbomStore) => {
      return state.productName;
    },
    getIsThirdPart: (state: SbomStore) => {
      return state.isThirdPart;
    },
  },
  mutations: {
    setProductName(state: SbomStore, productName: string): void {
      state.productName = productName;
    },
    setIsThirdPart(state: SbomStore, isThirdPart: string): void {
      state.isThirdPart = isThirdPart;
    },
  },
  actions: {},
  modules: {
    user: userModule,
  },
  plugins: [
    createPersistedState({
      paths: ['user'],
    }),
  ],
});
