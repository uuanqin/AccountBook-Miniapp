const sourceType = [
  ['camera'],
  ['album'],
  ['camera', 'album']
]
const sizeType = [
  ['compressed'],
  ['original'],
  ['compressed', 'original']
]


var util = require('../utils/util.js');

/**
 * 文本框的输入字符串
 */
var inputContent = ''
Page({

  onShareAppMessage() {
    return {
      title: '图片',
      path: 'page/API/pages/image/image'
    }
  },


  data: {
    pagernumber: 0,

    tasks: [],

    task: {
      taskId: '',
      time: '',
      record: '',    
      des: '',  /* des time 默认为空*/
      images: []
    },


    imageList: [],
    sourceTypeIndex: 2,
    sourceType: ['拍照', '相册', '拍照或相册'],

    data: '',
    sizeTypeIndex: 0,
    sizeType: ['压缩', '原图', '压缩或原图'],
    value: '',
    countIndex: 8,
    count: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },

  // toselectterm: function(e) {
  //   wx.navigateTo({
  //     url: '../selectterm/selectterm'
  //   })
  // },


  todemo: function(e){
    wx.navigateBack({
      delta: 2,
    })
    
  },

/* 输入记事本的值*/
  onInputChange: function(e) {
    inputContent = e.detail.value;
    console.log("onInputChange:" + inputContent);
  },


  formSubmit: function(e) {

    const that = this;
    inputContent=e.detail.value.value
    console.log("save : " + inputContent);

    //获取系统时间
    var time = util.formatTime(new Date());
    console.log(time);


    this.data.task.images = this.data.imageList;
  

    //TODO字符串的切割 taskId
    this.data.task.des = inputContent.slice(0, inputContent.indexOf('/'));
    this.data.task.time = time.slice(0,10);
    this.data.task.record = inputContent;

    this.data.tasks.push(this.data.task);
    wx.setStorageSync("01", this.data.tasks);

    //测试保存是否成功
    var value = wx.getStorageSync("01");
    console.log("save value" + value);
    wx.navigateBack({
      delta: 0,
    })
    wx.showToast({
      title: '点击“搜索”进行刷新',
      icon:'none'
    })
  },
  
  chooseImage() {
    const that = this
    let imageList = that.data.imageList
    wx.chooseImage({
      sourceType: sourceType[this.data.sourceTypeIndex],
      sizeType: sizeType[this.data.sizeTypeIndex],
      count: this.data.count[this.data.countIndex],
      success(res) {
        console.log(res)
        imageList.push(res.tempFilePaths);
        that.setData({
          imageList
        })
      }
    })
  },
  previewImage(e) {
    const current = e.target.dataset.src
    wx.previewImage({
      current,
      urls: this.data.imageList
    })
  },

  onShow: function(options) {
    var that = this
    wx.getStorage({
      key: '01',
      success: function(res) {
        that.setData({
          tasks: res.data
        })
      },
    })
  }
})