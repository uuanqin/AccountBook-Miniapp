const app = getApp()
Page({
  data:{
    //从getOpenID搬迁
    showUploadTip: false,
    haveGetOpenId: false,
    envId: '',
    openId: '',


    //当前数据库是否为空 //或者没登录
    emptyDatabase:false,

    emptyYearPage:true,

    dayIncome:0,
    dayCost:0,
    monthsCost:[0,0,0,0,0,0,0,0,0,0,0,0],
    monthsIncome:[0,0,0,0,0,0,0,0,0,0,0,0],


    // 支出的项目
    costTypeList:[
      {
        "sym":"food",
        "name":"餐饮",
        "tempSumOfAyear":0,        
      },
      {
        "sym":"dUse",
        "name":"日用",
        "tempSumOfAyear":0,        
      },
      {
        "sym":"trans",
        "name":"交通",
        "tempSumOfAyear":0,        
      },
      {
        "sym":"ent",
        "name":"娱乐",
        "tempSumOfAyear":0,
      },
    ],
    //收入的项目
    incomeTypeList:[
      {"sym":"salary","name":"工资","tempSumOfAyear":0},
      {"sym":"bonus","name":"奖金","tempSumOfAyear":0},
      {"sym":"monMan","name":"理财","tempSumOfAyear":0},
    ],
    TypeKeyPair:{
      "food":{"name":"餐饮","coi":"cost","tempSumOfAyear":0},
      "dUse":{"name":"日用","coi":"cost","tempSumOfAyear":0},
      "trans":{"name":"交通","coi":"cost","tempSumOfAyear":0},
      "ent":{"name":"娱乐","coi":"cost","tempSumOfAyear":0},
      "salary":{"name":"工资","coi":"income","tempSumOfAyear":0},
      "bonus":{"name":"奖金","coi":"income","tempSumOfAyear":0},
      "monMan":{"name":"理财","coi":"income","tempSumOfAyear":0}
    },

    slideButtons:[
      {
        "type":"default",
        "text":"修改",
        // "extClass":"slideModBtn",
        "data":"modifyBill"
      },
      {
        "type":"warn",
        "text":"删除",
        // "extClass":"slideDelBtn",
        "data":"DeleteBill"
      }
    ],

    //这里是假页设置
    show: false,
    duration: 300,
    position: 'top',
    round: false,
    overlay: true,
    // overlayStyle: '',
    // customStyle : '',
    // 论坛里找来的解决方法
    overlayStyle: 'z-index:99',
    customStyle : 'z-index:999',

    //存ID
    id_showModForm:'',
    id_showDelForm:'',

    // 默认选项
    costOrIncome:"cost",
    costType:"food",
    incomeType:"salary",

    initInput:"",
    successAdd:false,

    initInput_m_money:"",
    initInput_m_remarks:"",
    successMod:false,

    date:"",//提交表单里的日期选择 格式：1900-01-01
    today:"",//今天的日期         格式：1900-01-01
    todayYear:"",//今年           格式：1900

    years:[],   //账单涉及到的年份
    yearsIdx:0,
    months:[],

    // a_year_bill_data:[],//集合
    a_year_bill_data_Arr:[],//数组
    
  },
  
  async refreshYear(){

    //onLoad时加载年份
    console.log("refreshYear,开始查询记录")
    var that = this
    const db=wx.cloud.database()
    const $ = db.command.aggregate
    await db.collection('account_bill')
    .aggregate().group({
      _id: null,
      year: $.addToSet('$year')
    })
    .end()
    .then(function(res){
      console.log("查询年返回",res)
      if(res.list.length!=0){
        var arr=res.list[0].year
        arr.sort().reverse()
        that.setData({
          years:arr
        })
        console.log("refreshYear-",that.data.years)
      }else{
        console.log("refreshYear-没有读取到年份")
        that.setData({
          emptyDatabase:true,
          years:[]
        })
      }
    })
    //加载年份后肯定要加载月份和日期
    //但是这些，onLoad函数另外调用了，切换年份的绑定事件也另外调用了

  },
  
async refreshPage(){
  
    //年页面为空,onLoad不执行此条函数
    
    //添加数据成功后刷新页面
    

    console.log("refreshPage,开始更新页面")
    var that = this
    const db=wx.cloud.database()
    console.log("页面年份的下标",that.data.yearsIdx)
    var yearsIdx = this.data.yearsIdx
    if(yearsIdx>=that.data.years.length)yearsIdx=0

    console.log("页面选择的年份",that.data.years[yearsIdx])
    db.collection('account_bill').where({
      year:that.data.years[yearsIdx]//页面选择的年份

    }).get({
      complete:res=>{},
      success:res=>{
        console.log("list有啥",res.data.length)

        if(res.data.length!=0){
          console.log("按年份查询成功 - refreshPage",res.data)
          
          let monthSet = new Set()
          // 遍历每一条记录
          // console.log("res.data",res.data)
          let a_year_bill_data = new Array()
          for(i=0;i<12;i++){
            a_year_bill_data[i]=new Set()
          }
          var tMsCt = new Array(0,0,0,0,0,0,0,0,0,0,0,0)
          var tMsIc = new Array(0,0,0,0,0,0,0,0,0,0,0,0)

          // 既然刷新页面就应该重新计算
          var dayCost = 0
          var dayIncome = 0
          // console.log("执行到这里-1",dayCost,dayIncome)
          ///////////////////////////////////////////////每条信息的循环/////////////////////////////////////////////
          // console.log("执行到这里",res.data.length)
          var i
          var yearTypeStatistic = this.data.TypeKeyPair
          //必须要清空
          var keysOfTypePair = Object.keys(this.data.TypeKeyPair)
          var keysNum = Object.keys(this.data.TypeKeyPair).length
          for(i=0;i<keysNum;i++){
            yearTypeStatistic[keysOfTypePair[i]].tempSumOfAyear=0
          }
          for(i=0;i<res.data.length;i++){
            // console.log("能不能进入循环？")

            //年份统计，年度分类数据
            yearTypeStatistic[res.data[i].type].tempSumOfAyear+=res.data[i].money
            // console.log("come on !!!")


            //准备好month数组，收集出现过的月份          
            monthSet.add(Number(res.data[i].month))

            //对应月份的数据加进去（按月份整理到   a_year_bill_data ）       
            a_year_bill_data[Number(res.data[i].month)-1].add(res.data[i])   //坑坑！！！this.data!!!! //再次坑坑“-1”
            
            //每月收支统计
            if(res.data[i].coi=="cost"){
              tMsCt[Number(res.data[i].month)-1]+=res.data[i].money;
            }else{
              tMsIc[Number(res.data[i].month)-1]+=res.data[i].money;
            }

            

            console.log("只能出现今天的日期",res.data[i].year+"-"+res.data[i].month+"-"+res.data[i].day)
            //今日cost and income
            if(res.data[i].year+"-"+res.data[i].month+"-"+res.data[i].day==that.data.today){              
              if(res.data[i].coi=="cost")dayCost+=res.data[i].money
              else dayIncome+=res.data[i].money
            }
            // console.log("这句话为什么不出现？？？？")
            // console.log("本日支出收入",dayCost,dayIncome)

            
            
          }
          ////////////////////////////////////////////  end for  /////////////////////////////////////////////////////////
          
          let tempArrArr=new Array()
          for(i=0;i<12;i++){          
              tempArrArr[i]=Array.from(a_year_bill_data[i])
          }
          
          //moths 集合转数组
          var tempArr;
          var tempArr=Array.from(monthSet)
          tempArr.sort().reverse()


          
          // 把他弄成只渲染一次！！
          that.setData({
            months:tempArr,
            a_year_bill_data_Arr:tempArrArr,
            monthsCost:tMsCt,
            monthsIncome:tMsIc,
            emptyYearPage:false,
            dayCost:dayCost,
            dayIncome:dayIncome,
            TypeKeyPair:yearTypeStatistic,
            yearsIdx:yearsIdx
        })}else{
          //当前年页没有数据
          console.log("当前年页没有数据")
          that.setData({
            a_year_bill_data_Arr:[],
            months:[],
            emptyYearPage:true,
            dayCost:"-- ",
            dayIncome:"-- ",
            yearsIdx:yearsIdx
          })
        }
      },
      fail:err=>{
        wx.showToast({title: '查询失败',icon:none})
        console.error("数据库查询失败：",err)
      }
    })
  },
  refreshMonthsArr(){
    //主要用来解决Month数组只依赖于 a year bill
    var i
    var tempArr=new Array()
    for(i=0;i<this.data.a_year_bill_data_Arr.length;i++){
      if(this.data.a_year_bill_data_Arr[i].length>0)tempArr.push(i+1);
    }
    tempArr.sort().reverse()
    this.setData({
      months:tempArr
    })
  },
  
  async initPage(){
    var that = this
    console.log("initPage")
    await that.refreshYear()
    if(!that.data.emptyDatabase){
      console.log("数据库非空，即将执行refreshPage")
      await that.refreshPage()
    }
    else{
      console.log("数据库为空，清除页面数据")
      that.setData({
        a_year_bill_data_Arr:[],
        months:[],
        monthsCost:[0,0,0,0,0,0,0,0,0,0,0,0],
        monthsIncome:[0,0,0,0,0,0,0,0,0,0,0,0],
      })
    }

    //感觉console.log会和上面的refreshPage同时进行，emptyYearPage可能会有点问题，不过很快被refreshPage修改过来
    console.log("init-page里的that.data.emptyDatabase",that.data.emptyDatabase)
    console.log("init-page里的that.data.emptyYearPage",that.data.emptyYearPage)
    
    //
    console.log("initPage设置今天的日期")
    var obj = new Date()
    that.setData({
      today:that.makeDateString(new Date()),
      date:that.makeDateString(new Date()),
      todayYear:obj.getFullYear(),
    })
  },

  
  onLoad(options){
    console.log("加载")
    wx.setNavigationBarTitle({
      title: '记账'
    })
    if(this.data.haveGetOpenId){
      console.log("已经有OpenID直接加载页面")
      this.initPage()
    }
    this.setData({
      //从getOpenID搬迁
      envId: options.envId
    })
    // this.login()
    
  },
  onShow(){

  },
  

  //ISO日期的字符串拼接
  makeDateString:function(dateObj){
    var tempMonO="";
    var tempDayO="";
    if(dateObj.getMonth()+1<10){
      tempMonO="0"
    }
    if(dateObj.getDate()<10){
      tempDayO="0"
    }
    return dateObj.getFullYear()+'-'
      +tempMonO+(dateObj.getMonth()+1)+'-'
      +tempDayO+dateObj.getDate();
  },
  bindDateChange:function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        date: e.detail.value
      })
    
  },
  async login(){
    //登录功能
    var that = this
    await that.getOpenId()
    that.initPage()
  },

  writeABillPopup(e){    

    let position = this.data.position
    let customStyle = this.data.customStyle
    let duration = this.data.duration
    let overlayStyle = this.data.overlayStyle
    //中部弹出
    this.setData({
      position,
      show: true,
      customStyle,
      duration,
      overlayStyle
    })
  },
  
  onBeforeEnter(){
    // console.log("这个不能是true",this.data.successAdd)
  },
  onBeforeLeave(){
    // console.log("离开之前清空")
    this.setData({
      initInput:""
    })
  },
  
  exitPage() {
    this.setData({show: false})
    // wx.navigateBack()
    if(this.data.successAdd){
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
    }
    this.setData({
      successAdd:false
    })
  },
  
  selCost(){
    this.setData({
      costOrIncome:"cost"
    })
  },
  selIncome(){
    this.setData({
      costOrIncome:"income"
    })
  },
  selCostType(e){
    // console.log(e);
    var ct=e.target.id
    this.setData({
      costType:ct
    })
  },
  selIncomeType(e){
    // console.log(e);
    var it=e.target.id
    this.setData({
      incomeType:it
    })
  },

  //提交增加记录表单
  formSubmit: function (e) {
    // var that=this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var date=this.data.date
    var dateArr=date.split("-")
    // console.log(dateArr)
    var year = dateArr[0]
    var month = dateArr[1]
    var day = dateArr[2]
    var coi = this.data.costOrIncome
    var type= (coi=="cost") ? this.data.costType : this.data.incomeType
    var mon= e.detail.value.money    
    var remark=e.detail.value.remark
    var num_mon=Number(mon);
    var isBegin = false
    // console.log("金额",num_mon)
    if(mon!=""&&!isNaN(num_mon)){//金额不能为空
      const db= wx.cloud.database()
      db.collection('account_bill').add({
        data:{
          year,
          month,
          day,
          coi,
          type,
          money:num_mon,
          remark
        },
        complete:res=>{},
        success:res=>{
          console.log("添加数据成功",this)
          if(this.data.emptyDatabase)isBegin=true
          console.log("记账成功中的res",res)
          this.setData({
            successAdd:true,
            emptyDatabase:false
          })
          this.exitPage()

          console.log(this.data.years)
          //遍历数组
          var i
          var hasThatYear=false
          for(i=0;i<this.data.years.length;i++){
            if(this.data.years[i]==year){
              hasThatYear=true
              break;
            }
          }
          // console.log("这一年存不存在？",hasThatYear)
          
          //年页数据库为空？
          if(this.data.emptyYearPage){
                this.refreshYear()
                this.refreshPage()
                return;
          }



          //////////////////////////////////////////////////////////////////
          /***********       避免频繁查询数据库时的优化操作      ************/

          //是不是今天的数据？
          var dayIcome = this.data.dayIncome
          var dayCost = this.data.dayCost
          // console(dateArr,this.data.today)
          if(this.data.date==this.data.today){
            if(coi=="cost"){
              dayCost+=num_mon
            }else{
              dayIcome+=num_mon
            }
          }
          

          //如果年份是新的，直接假装加入年份选择列表（注意，把条目的ID也加进去，因为要查找
          var that = this
          if(!hasThatYear){
              //不是一开始的
              if(!isBegin){
                var tArr=this.data.years
                var beforeYear=Number(this.data.years[this.data.yearsIdx])
                var offset=0
                if(beforeYear<Number(year))offset=1
                var yearIdx=this.data.yearsIdx+offset
                
                tArr.push(year)
                tArr.sort().reverse()


                this.setData({
                  years:tArr,
                  //这些日数据要加
                  dayCost:dayCost,
                  dayIncome:dayIcome,
                  yearIdx:yearIdx
                })
              }else{//一开始的，数据库第一条数据
                that.initPage()
              }
                
              
          }
          else{//年份不是新的    
            var isTheSelectedYear=false
            if(this.data.years[this.data.yearsIdx]==year)isTheSelectedYear=true
            if(isTheSelectedYear){
              //是所选的年份，直接假装加入账单列表（附带渲染了）

              //一、准备好每月的数据条目
              var arr=this.data.a_year_bill_data_Arr
              arr[Number(month)-1].push({
                "_id":res._id,
                //我没加openID
                "coi":coi,
                "day":day,
                "money":num_mon,
                "month":month,
                "remark":remark,
                "type":type,
                "year":year
              })

              //二、准备好当前月的统计数统计数
              var tArrMonthIorC=(coi=="cost")?this.data.monthsCost:this.data.monthsIncome
              tArrMonthIorC[Number(month)-1]+=num_mon

              //三、年统计需要增加数据
              var tempPair = this.data.TypeKeyPair
              tempPair[type].tempSumOfAyear += num_mon

              if(coi=="cost"){
                this.setData({
                  a_year_bill_data_Arr:arr,
                  monthsCost:tArrMonthIorC,
                  emptyYearPage:false,
                  // months:tArrAddMonth
                  //这些日数据要加
                  dayCost:dayCost,
                  dayIncome:dayIcome,
                  //年统计
                  TypeKeyPair:tempPair
                })
              }else{
                this.setData({
                  a_year_bill_data_Arr:arr,
                  monthsIncome:tArrMonthIorC,
                  emptyYearPage:false,
                  // months:tArrAddMonth
                  //这些日数据要加
                  dayCost:dayCost,
                  dayIncome:dayIcome,
                  //年统计
                  TypeKeyPair:tempPair
                })
              }
              //四、准备好更新存在的月份
              this.refreshMonthsArr()
              // console.log(this.data.a_year_bill_data_Arr)

              


            }else{//不是所选的年份，只关心日期
                //do nothing
                this.setData({
                  //这些日数据要加
                  dayCost:dayCost,
                  dayIncome:dayIcome
                })
            }
          }

        },
        fail:err=>{
          wx.showToast({
            title: 'none',
            title:'新增记录失败'
          })
          console.error("数据库 新增记录 失败：",err)
        }
      })
    }else{
      wx.showToast({
        title: '请检查金额输入',
        icon:'error',
        duration:2000
      })
    }
  },

  //提交修改表单
  formSubmit_updateBill(e){
    console.log("修改表单带了啥数据",e)
    var money=e.detail.value.money_m
    var remark=e.detail.value.remark_m
    //啥也不输，确定就是取消
    if(money==""&&remark==""){
      this.cancelMod()
      return;
    }
    var id = this.data.id_showModForm
    console.log("即将修改此条记录",id)
    
    var that = this
    var those = this
    const db=wx.cloud.database()
    // var successUpdate =false
    //money合法性判断
    if(money!=""&&isNaN(Number(money))){
      wx.showToast({
        title: '请检查金额输入',
        icon:'error',
        duration:2000
      })
      return;
    }



    if(remark==""&&money!=""){//只更新money
      


      db.collection('account_bill').doc(id).update({
      data:{
        money:Number(money),
      },
      complete:res=>{},
      success:res=>{
        console.log("更新记录成功",res)
        // successUpdate=true
        //统一退出菜单，执行当前页面的更新    
        that.setData({
          id_showModForm:""
        })
        that.refreshPage()
    
      },
      fall:err=>{
        wx.showToast({
          title: '更新记录失败',
          icon:'error'
        })
        console.error("数据库 更新记录 失败",err)
      }
    })
    }else if(remark!=""&&money==""){//只更新备注
      db.collection('account_bill').doc(id).update({
        data:{
          remark:remark,
        },
        complete:res=>{},
        success:res=>{
          console.log("更新记录成功",res)
          // successUpdate=true
          //统一退出菜单，执行当前页面的更新    
          those.setData({
            id_showModForm:""
          })
          those.refreshPage()
        },
        fall:err=>{
          wx.showToast({
            title: '更新记录失败',
            icon:'error'
          })
          console.error("数据库 更新记录 失败",err)
        }
      })
    }else if(remark!=""&&money!=""){
      db.collection('account_bill').doc(id).update({
        data:{
          money:Number(money),
          remark:remark,
        },
        complete:res=>{},
        success:res=>{
          console.log("更新记录成功",res)
          // successUpdate=true
          //统一退出菜单，执行当前页面的更新    
          that.setData({
            id_showModForm:""
          })
          that.refreshPage()
        },
        fall:err=>{
          wx.showToast({
            title: '更新记录失败',
            icon:'error'
          })
          console.error("数据库 更新记录 失败",err)
        }
      })
    }

    
  },
  formSubmit_DeleteBill(e){
    var id=this.data.id_showDelForm
    console.log("即将删除这个记录",id)
    
    var that = this
    const db =wx.cloud.database()
    db.collection('account_bill').doc(id).remove({
      complete:res=>{},
      success:res=>{
        console.log("数据库删除成功")
        //统一退出菜单，执行所有更新的更新    
        that.setData({
          id_showDelForm:""
        })
        // this.refreshYear()
        // that.refreshPage()
        this.initPage()
      },
      fail:err=>{
        wx.showToast({
          title: '删除记录失败',
          icon:'error'
        })
        console.error("数据库 删除记录 失败",err)
      }
    })
  },
    
  


  //年份选择器变更
  bindPickerChange: function (e) {
    var lastSelYear=this.data.yearsIdx
    console.log('picker发送选择改变，携带值为', e.detail.value)
    if(lastSelYear==e.detail.value)return;//减少页面刷新
    this.setData({
      yearsIdx: e.detail.value
    })
    //刷新页面
    //不要刷新年份
    this.refreshPage()
  },
  
  slideButtonTap(e){
    // console.log('slide button tap', e);
    switch(e.detail.data){
      case "modifyBill":
        console.log("修改操作")
        this.setData({
          id_showDelForm:"",//只允许一个框出现
          id_showModForm:e.target.id
        })
        break
      case "DeleteBill":
        console.log("删除操作")
        this.setData({
          id_showModForm:"",//只允许一个框出现
          id_showDelForm:e.target.id
        })
        break
      default:console.error("err in slideButtonTap",err)
    }
  },



  //从getOpenID搬迁
  async getOpenId() {
    // return new Promise(function(resolve,reject){

      wx.showLoading({
        title: '获取openID中',
      })

    wx.cloud.callFunction({
        name: 'quickstartFunctions',
        config: {
          env: this.data.envId
        },
        data: {
          type: 'getOpenId'
        }
      }).then((resp) => {
        this.setData({
          haveGetOpenId: true,
          openId: resp.result.openid
        })
      wx.hideLoading()
      console.log("获取到的openID为",this.data.openId)
      console.log("是否获取到openID",this.data.haveGetOpenId)
    }).catch((e) => {
        this.setData({
          showUploadTip: true
        })
      wx.hideLoading()
      })
    //   resolve()
    // })
  },

  clearOpenId() {
    this.setData({
      haveGetOpenId: false,
      openId: ''
    })
  },

  cancelMod(){
    this.setData({
      id_showModForm:''
    })
  },
  cancelDel(){
    this.setData({
      id_showDelForm:''
    })
  },

  toStatistics(){
    if(this.data.emptyDatabase||this.data.emptyYearPage){
      wx.showToast({
        title: '暂时没有统计数据哦~',
        icon:"none"
      })
      return;
    }
    wx.navigateTo({
      url: '../accounts_sta/accounts_sta?data='+JSON.stringify(this.data.TypeKeyPair)+'&year='+this.data.years[this.data.yearsIdx],
    })
  }


})