var barrage_style_obj = {};
var screenHeight = 0;
var timer;


Page({
  data: {
    barrageTextColor: "#D3D3D3",
    barrage_inputText: "none",
    barrage_shoottextColor: "black",
    bind_shootValue: "",
    barrage_style: {},
    barrageText_height: '',
    textColor: "rgb(255,0,155)",
    barrage_screenHeight: '',

    text:''

  },

  onLoad(e){
    console.log(e)
    var that = this;
    //获取屏幕的高度
    
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          barrage_screenHeight: res.screenHeight,
          textColor:e.rgb,
          text:e.text
        })
      }
    })
  },
  onReady: function () {
    screenHeight = this.data.barrage_screenHeight;
    barrage_style_obj = {
      barrageText_height: screenHeight,
      barrage_shoottextColor: this.data.textColor,
      barrage_shootText: this.data.text
    }
    var rgb=this.data.textColor
    this.setData({
      barrageTextColor: rgb,
      barrage_inputText: "flex",
      barrage_style: barrage_style_obj, //发送弹幕

    });
    //打开定时器    
    timer = setInterval(this.barrageText_move, 50);
    // timer = setInterval(this.barrageText_move, 120);
  },

  // shoot: function (e) {
  //   //字体颜色随机
  //   // var rgb1 = Math.floor(Math.random()*256), rgb2 = Math.floor(Math.random()*256), rgb3 = Math.floor(Math.random()*256);
  //   // var textColor = "rgb(" + rgb1 + "," + rgb2 + "," + rgb3 + ")";
  //   // console.log("",textColor)
  //   //设置弹幕字体的垂直位置样式  
  //   var barrageText_height = screenHeight;
  //   barrage_style_obj = {
  //     barrageText_height: barrageText_height,
  //     barrage_shootText: this.data.bind_shootValue,
  //     barrage_shoottextColor: textColor,
  //   };
  //   this.setData({
  //     barrage_style: barrage_style_obj, //发送弹幕
  //     bind_shootValue: "" //清空输入框  
  //   })
  //   //定时器 让弹幕动起来 
  //   timer = setInterval(this.barrageText_move, 120);
  // },

    //定时器 让弹幕动起来 
    barrageText_move: function () {
      var textMove = barrage_style_obj.barrageText_height;
      textMove = textMove - 10;
      barrage_style_obj.barrageText_height = textMove;
      if (barrage_style_obj.barrageText_height <= -barrage_style_obj.barrage_shootText.length * 250) {
        barrage_style_obj.barrageText_height = screenHeight;
      }
      this.setData({
        barrage_style: barrage_style_obj,
      })
    },
    back(){
      wx.navigateBack({
        delta: 0,
      })
    }
})