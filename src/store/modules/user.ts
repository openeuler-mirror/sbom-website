interface UserStore {
  productName: string;
  isThirdPart: string;
  user: any;
}
export default {
  state: {
    user: {},
  },
  getters: {
    getUser: (state: UserStore) => {
      return state.user;
    },
  },
  mutations: {
    clearUser: (state: UserStore) => {
      state.user = {};
    },
    setUser(state: UserStore, payload: any) {
      state.user = payload;
    },
  },
};
