Page({
  data:[],
  // incomeTypeWithSum:[],
  whichYear:'',
  sumOfCost:0,
  sumOfIncome:0,

  onLoad(e){
    console.log("跳转到了统计页面")
    var y = e.year
    var obj = JSON.parse(e.data)
    // var obj_c= JSON.parse(e.cTypes)
    console.log("统计页面接收到的参数",obj,y)

    var sc=0,si=0
    var i
    var keys=Object.keys(obj)
    var len=keys.length
    for(i=0;i<len;i++){
      if(obj[keys[i]].coi=="cost")sc+=obj[keys[i]].tempSumOfAyear
      else si+=obj[keys[i]].tempSumOfAyear
    }

    sc=Number(sc.toFixed(2))
    si=Number(si.toFixed(2))
    console.log("sc=",sc,"si=",si)

    this.setData({
      data:obj,
      
      whichYear:y,
      sumOfCost:sc,
      sumOfIncome:si

    })
  }
})