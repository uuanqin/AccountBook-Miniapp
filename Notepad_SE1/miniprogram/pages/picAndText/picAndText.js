//来源home全局变量
var music = 0
let audio1=wx.createInnerAudioContext();
audio1.src="/music/yuiko - 苍い海.mp3";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    musicIcon:"/images/music_off.png",


    dydj: ['1', '3', '10', '20', '50', '60', '80', '100'],
    index: 1,//默认 不用修改



    // data,从history搬迁
    des: '',
    time: '',
    /**
     * 任务列表集合
     */
    tasks: [],

    //临时变量
    dydjList: [],
    timeList: [],

    task: {
      taskId: '',
      time: '',
      record: '',
      des: '',
      images: []
    },
    pagerList: [{
        id: "1",
        recode: "第一天",
        time: "2018-12-28",
        des: "one",
        lcoation: "112,113",
        dydj: "220"
      },
      {
        id: "1",
        recode: "第二天",
        time: "2018-11-28",
        des: "six",
        lcoation: "112,113",
        dydj: "110"
      },
    ]
  },

  /*提交*/
  formSubmit(e) {
    var des="";
    var time="";
    if (e.detail.value.time!=null){
      time = e.detail.value.time
    }
    
    var des = e.detail.value.des
    if (e.detail.value.des!=null){
      des = e.detail.value.des
    }
    console.log("formsubmit",e)
    this.setData({
      des:des,
      time:time
    })
    // console.log("设置后")
    // console.log("函数执行前")
    this.update()
  },

/*如果没有填关键字和日期，就不用这两个函数*/
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
    // this.update()
  },
  bindTimeChange(e) {
    var tempTime=e.detail.value;
    console.log(tempTime)
    tempTime = tempTime.replace("-","/");
    console.log(tempTime)
    this.setData({
      time: e.detail.value
    })
    // this.update()
  },

  //搬迁//更新
  update: function (options) {
    console.log("执行update")
    var that = this
    // var des = options.des;
    // var time = options.time;
    console.log("this.data.des:",this.data.des)
    console.log("this.data.time:",this.data.time)
    var des = this.data.des;
    var time = this.data.time;
    console.log(des,time)

    //wwq增加
    that.setData({
      timeList:[],
      dydjList:[]
    })

    wx.getStorage({
      key: '01',
      success: function (res) {
        //==搜索业务逻辑==

        var list = res.data;
        if (des != "") {
          for (var i in list) {
            if (des == list[i].des) {

              that.data.dydjList.push(list[i]);
            }
          }
        } else {
          that.data.dydjList = list;
        }
        // timeList = [];
        

        if (time != "") {
          var year = time.slice(0, 4)
          var month = time.slice(5, 7)
          var day = time.slice(8, 10)
          time = year + "/" + month + "/" + day
          console.log(year + '==' + month + "===" + day)
          for (var i in that.data.dydjList) {
            if (time == that.data.dydjList[i].time) {
              that.data.timeList.push(that.data.dydjList[i]);
            }
          }
        } else {
          that.data.timeList = that.data.dydjList;
        }
        console.log("timeList",that.data.timeList)
        that.setData({
          tasks: that.data.timeList

        })
      },
    })
  },
  toAdd(){
    wx.navigateTo({
      url: './add_pAt',
    })
  },
  ////////////////////////////////音乐播放
  tapSign:function(){
    music=music+1;
    if(music==1)
    {
      audio1.play();
      this.setData({
        musicIcon:"/images/music_on.png"
      })
    }
    else
    {
      if(music%2==0)
      {
        audio1.pause();
        this.setData({
          musicIcon:"/images/music_off.png"
        })
      }
      else
      {
        audio1.play();
        this.setData({
          musicIcon:"/images/music_on.png"
        })
      }
    }
  },
  onLoad(){
    wx.setNavigationBarTitle({
      title: '图文打卡'
    })
  }
})