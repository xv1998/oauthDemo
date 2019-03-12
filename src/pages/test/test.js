// pages/test/test.js
import regeneratorRuntime from '../../utils/third-party/runtime' // eslint-disable-line
import { login, authorize, getJson, RedirectURL, getUserInfo } from '../../utils/myRequest'
import { showError } from '../../utils/lib/error'

Page({
    /**
     * 页面的初始数据
     */
    data: {
        account: '',
        password: '',
        skey: '',
        info: '',
        reply: true
    },

    /**
     * 生命周期函数--监听页面加载zhan按时
     */
    onLoad: function (options) {
    },

    bindInput(e) {
        console.log(e)
        this.setData({
            [e.currentTarget.dataset.key]: e.detail.value
        })
    },

    /**
     * 校园网登录方法
     */
    async login() {
        try {
            await login(this.data.account, this.data.password)
        } catch (e) {
            console.error(e)
            if (e.message === '密码错误') {
                await showError('密码错误')
            } else {
                await showError()
            }

        }
    },

    /**
     * Oauth授权方法
     */
    async authorize() {
        let that = this
        try {
            let json = await getJson()
            console.log('json:', json.client_id)
            let code = await authorize(json.client_id, json.state, json.scope, json.redirect_uri)
            console.log(code)
            let key = await RedirectURL(code, json.redirect_uri, json.state)
            that.setData({
                skey: key
            })
        } catch (e) {
            console.error(e)
            if (e.message.indexOf('Oauth登录过期，请重新登录') > -1) {
                await showError('登录过期，请重新登录')
                console.log('重定向到登录页面')
            } else {
                await showError()
            }
        }
    },


    async getUserInfo() {
        let info = await getUserInfo(this.data.skey)
        console.log(info)
        this.setData({
            info: info,
            reply: false,
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
