// pages/pre_bullet/pre_bullet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text:'',
    // color:'',
    colorBox:[
      {"name":"随机","rgb":""},
      {"name":"天蓝","rgb":"rgb(0,191,255)"},
      {"name":"橙绿","rgb":"rgb(0,255,0)"},
      {"name":"纯黄","rgb":"rgb(255,255,0)"},
      {"name":"橙红","rgb":"rgb(255,69,0)"},
    ]
  },

  onCurrentInput(e){
    console.log("输入了什么",e)
    this.setData({
      text:e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  toBullet(e){
    console.log("点击事件",e)
    var rgb=e.currentTarget.id
    if(this.data.text==''){
      wx.showToast({
        title: '请输入要展示的文字',
        icon:'none'
      })
      return;
    }
    
    if(rgb==""){
      var rgb1 = Math.floor(Math.random()*256), rgb2 = Math.floor(Math.random()*256), rgb3 = Math.floor(Math.random()*256);
      rgb = "rgb(" + rgb1 + "," + rgb2 + "," + rgb3 + ")";
    }

    wx.navigateTo({
      url: '../bullet/bullet?rgb='+rgb+'&text='+this.data.text,
    })
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '手持弹幕'
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