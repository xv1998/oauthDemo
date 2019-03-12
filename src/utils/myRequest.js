import regeneratorRuntime from 'third-party/runtime' // eslint-disable-line
import { wxRequest } from '../utils/lib/wxApi'
import { throwError } from './lib/error'

const app = getApp()

const login = async function (account, password) {
    let data = {
        url: 'http://139.199.224.230:7001/oauth/login',
        data: {
            account,
            password,
        },
        method: 'POST'
    }
    let res = await wxRequest(data)
    console.log('http://139.199.224.230:7001/oauth/login', res)
    switch (res.data.code) {
        case '0':
            break
        case '0120102':
            wx.showToast({
                title: '账号或密码错误',
                icon: 'none'
            })
            break
        default:
            console.log('Oauth登录失败:', res.data.code)
    }
    let oauthSessionKey
    let oauthSessionValue
    try {
        [oauthSessionKey, oauthSessionValue] = res.header['set-cookie'].split(';')[0].split('=')
        wx.showToast({
            title: '',
            icon: 'success'
        })
        console.log('login success')
    } catch (e) {
        console.log('获取session失败', e)
    }
    app.globalData.oauthSession = {
        oauthSessionKey,
        oauthSessionValue
    }

}

const authorize = async function (client_id, state, scope) {
    try {
        let res = await wxRequest({
            url: 'http://139.199.224.230:7001/oauth/authorize',
            data: {
                'response_type': 'code',
                'client_id': client_id,
                'state': state,
                'scope': scope,
                'from': 'mini'
            },
            header: { cookie: `${app.globalData.oauthSession.oauthSessionKey}=${app.globalData.oauthSession.oauthSessionValue}` },
            method: 'GET'
        })
        if (res.data.code === '0') {
            wx.showToast({
                title: '',
                icon: 'success'
            })
            return res.data.authorization_code
        } else {
            wx.showToast({
                title: '授权失败',
                icon: 'none'
            })
        }
    } catch (e) {
        wx.showToast({
            title: '授权失败',
            icon: 'none'
        })
        console.log(e)
    }

}

const RedirectURL = async function (code, redirect_uri, state) {
    try {
        let res = await wxRequest({
            url: redirect_uri,
            method: 'GET',
            data: {
                code: code,
                state: state,
                from: 'mini'
            },
            header: { cookie: `${app.globalData.cookieA.Key}=${app.globalData.cookieA.Value}` },
        })
        return res.data.skey
    } catch (e) {
        console.log(e)
    }
}
const getUserInfo = async function (skey) {
    try {
        console.log(
            skey
        )
        let res = await wxRequest({
            url: 'http://139.199.224.230:7002/user/info',
            method: 'POST',
            header: {
                skey: skey
            }
        })
        if (res.data.code === '0') {
            return res.data.user_info
        }
    } catch (e) {
        console.log(e)
    }
}
const getJson = async function () {
    let res = await wxRequest({
        url: 'http://139.199.224.230:7002/user/get_oauth_data',
        data: {
            from: 'mini'
        },
        method: 'GET'
    })
    console.log('http://139.199.224.230:7002/user/get_oauth_data', res)
    let Key
    let Value;
    [Key, Value] = res.header['set-cookie'].split(';')[0].split('=')
    app.globalData.cookieA = {
        Key,
        Value
    }
    // console.log(app.globalData.cookieA)
    let json = {
        state: res.data.state,
        client_id: res.data.client_id,
        scope: res.data.scope,
        redirect_uri: res.data.redirect_uri
    }
    return json
}


export {
    login,
    authorize,
    getJson,
    RedirectURL,
    getUserInfo
}