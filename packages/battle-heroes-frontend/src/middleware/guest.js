import store from '@/store'

export default (to, from, next) => {
  if (store.getters['auth/isLogin']) {
    next({
      name: 'players'
    })
  } else {
    next()
  }
}
