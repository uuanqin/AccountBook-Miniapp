Page({
  data: {
    input: '',
    todos: [],
    leftCount: 0,
    allCompleted: false,
    logs: []
  },

  beginTime(e){
    this.setData({
     'input.begin': e.detail.value
   })
 },
 switch1Change(e){
   this.setData({
     'input.needRemind': e.detail.value
   })
 },
  save: function () {
    wx.setStorageSync('todo_list', this.data.todos)
    wx.setStorageSync('todo_logs', this.data.logs)
  },

  load: function () {
    var todos = wx.getStorageSync('todo_list')
    if (todos) {
      var leftCount = todos.filter(function (item) {
        return !item.completed
      }).length
      this.setData({ todos: todos, leftCount: leftCount })
    }
    var logs = wx.getStorageSync('todo_logs')
    if (logs) {
      this.setData({ logs: logs })
    }
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: 'TODOS'
    })
    this.load()
  },

  inputChangeHandle: function (e) {
    // console.log(e)
    this.setData({ input: e.detail.value })
  },

  addTodoHandle: function (e) {
    if (!this.data.input || !this.data.input.trim()) return
    var todos = this.data.todos
    todos.push({ name: this.data.input, completed: false })
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: 'Add', name: this.data.input })
    this.setData({
      input: '',
      todos: todos,
      leftCount: this.data.leftCount + 1,
      logs: logs
    })
    this.save()
  },

  toggleTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    todos[index].completed = !todos[index].completed
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: todos[index].completed ? 'Finish' : 'Restart',
      name: todos[index].name
    })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount + (todos[index].completed ? -1 : 1),
      logs: logs
    })
    this.save()
  },

  removeTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    var remove = todos.splice(index, 1)[0]
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: 'Remove', name: remove.name })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount - (remove.completed ? 0 : 1),
      logs: logs
    })
    this.save()
  },

  toggleAllHandle: function (e) {
    this.data.allCompleted = !this.data.allCompleted
    var todos = this.data.todos
    for (var i = todos.length - 1; i >= 0; i--) {
      todos[i].completed = this.data.allCompleted
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: this.data.allCompleted ? 'Finish' : 'Restart',
      name: 'All todos'
    })
    this.setData({
      todos: todos,
      leftCount: this.data.allCompleted ? 0 : todos.length,
      logs: logs
    })
    this.save()
  },
  
  clearCompletedHandle: function (e) {
    var todos = this.data.todos
    var remains = []
    for (var i = 0; i < todos.length; i++) {
      todos[i].completed || remains.push(todos[i])
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: 'Clear',
      name: 'Completed todo'
    })
    this.setData({ todos: remains, logs: logs })
    this.save()
  },
  getRemindArr(){
    let thisLists=this.data.lists,closeT=0,notDoneLists=[];
    let date = new Date(),now = [date.getHours(),date.getMinutes()];
    thisLists.map(function(l){
      if(l.needRemind){
        notDoneLists.push(l)
      }
    })
    if (notDoneLists.length>0){
      let newLists = util.sortBy(notDoneLists,'begin'),firstT = (newLists[0].begin).split(':') ,id = newLists[0].id,cnt = newLists[0].content;   
      closeT = ((firstT[0]-now[0])*60+(firstT[1]-now[1])-1)*60;
      closeT = closeT>=0?closeT:0;
      return {closeT,id,cnt};
    }else{
      return false;
    }    
  }, 
  remind(){    
    let result=this.getRemindArr(), t = result.closeT,id = result.id,that=this,cnt = result.cnt;
    function alarm(){
      that.audioPlay();
      let newLists = that.data.lists;
       wx.showModal({
            title: '马上去做吧',
            content: cnt,            
            success: function(res) {
              if (res.confirm) {
                that.audioPause();
                that.audioStart();
                newLists.map(function(l,index){
                  if (l.id == id){      
                    newLists[index].done = true; 
                    newLists[index].needRemind = false; 
                  }
                })  
                that.setData({
                  lists:newLists
                })
              }else{
                that.audioPause();
                that.audioStart();
                newLists.map(function(l,index){
                  if (l.id == id){      
                    newLists[index].needRemind = false; 
                  }
                })  
                that.setData({
                  lists:newLists
                })
              }
            }
       })

    }
    if(result){      
      setTimeout(alarm,Math.floor(t*1000),function(){
        that.remind();
      })
    }
  },

  //wwq增加的东西
  logPagePopup(){
    wx.navigateTo({
      url: '../logs/logs',
    })
  }
})
