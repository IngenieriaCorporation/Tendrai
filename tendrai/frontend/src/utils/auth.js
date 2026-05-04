export const getToken   = ()       => localStorage.getItem('ta_token')
export const getUser    = ()       => { try { return JSON.parse(localStorage.getItem('ta_user')) } catch { return null } }
export const setAuth    = (t, u)   => { localStorage.setItem('ta_token', t); localStorage.setItem('ta_user', JSON.stringify(u)) }
export const clearAuth  = ()       => { localStorage.removeItem('ta_token'); localStorage.removeItem('ta_user') }
export const isLoggedIn = ()       => !!getToken()
