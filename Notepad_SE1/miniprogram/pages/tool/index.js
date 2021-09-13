Page({
  data:{
    tools:[
      {
        "name":"手持弹幕",
        "image_src":"/images/bullet.png",
        "bind":"jumpToBullet"
      },
      {
        "name":"2048",
        "image_src":"/images/2048.png",
        "bind":"jumpTo2048"
      },
      {
        "name":"手电",
        "image_src":"/images/flashlight.png",
        "bind":"commingSoon"
      },
      {
        "name":"日期提醒",
        "image_src":"/images/calendar.png",
        "bind":"commingSoon"
      },
      {
        "name":"秒表",
        "image_src":"/images/watch.png",
        "bind":"commingSoon"
      },
      {
        "name":"天气",
        "image_src":"/images/weather.png",
        "bind":"commingSoon"
      },
      
    ]
  },
  jumpToBullet(){
    wx.navigateTo({
      url: '../pre_bullet/pre_bullet',
    })
  },
  jumpTo2048(){
    wx.navigateTo({
      url: '../2048/2048',
    })
  },
  commingSoon(){
    wx.showToast({
      title: '敬请期待',
      icon:'success'
    })
  }

})