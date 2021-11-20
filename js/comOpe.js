let showTime //showMsg时间
let canReq = true //禁止按钮多次点击记录

const TEL_REG = /^(1[0-9]{10})$/ //电话号码正则
const TEL_ERR = '请输入正确的电话号码！' //电话号码错误提示
const SERVICE = 'http://103.142.102.209:9899/'

const SECONDS = 1000
const MINUTES = 60 * SECONDS
const HOURS = 60 * MINUTES
const DAY = 24 * HOURS

const STORAGE = { // 本地存储
  setItem: (k, v) => {
    localStorage.setItem(k, JSON.stringify(v))
  },
  getItem: k => {
    const data = localStorage.getItem(k)
    return data ? JSON.parse(data) : ''
  },
  removeItem: k => {
    localStorage.removeItem(k)
  }
}

//获取链接上的参数
const getUrlArg = name => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) return r[2]
  return ''
}

//数字返回2位数
const numLen = num => {
  num = num + ''
  return num.length === 1 ? 0 + num : num
}

//去掉空格、换行符、*等
const trim = (str, symbol) => {
  return str.replace(/(\s)|\*/g, '') + (symbol || '！')
}

//文字提醒
const showMsg = (msg, operation) => {
  clearTimeout(showTime)

  if ($('.show-msg').length === 0) {
    $('body').append('<div class="show-msg"></div>')
  }
  $('.show-msg').text(msg).show()

  if (operation !== 'noHide') {
    canReq = false
    showTime = setTimeout(() => {
      canReq = true
      $('.show-msg').hide()
      if (typeof operation == 'function') {
        operation()
      } else if (operation === 'back') {
        history.back()
      } else if (operation) {
        location.href = operation
      }
    }, 2000)
  }
}

//ajax请求和加载动画
const request = ({ service, args, ajaxArgs, onSuc, isGet }) => {
  const dataCanReq = args?.canReq
  if (!dataCanReq && !canReq) {
    return
  }

  !dataCanReq && (canReq = false)

  $.ajax({
    type: isGet ? 'GET' : 'POST',
    url: SERVICE + service,
    data: args,
    dataType: 'json',
    ...ajaxArgs,
    success: res => {
      const { msg } = res
      if (res.code === 1) {
        !dataCanReq && (canReq = true)
        onSuc(res.data, res)
      } else {
        showMsg(msg, () => {
          !dataCanReq && (canReq = true)

          if (service !== 'user/login' && (msg.indexOf('账号') > -1 || msg.indexOf('用户') > -1)) {
            location.href = 'login.html'
          }
        })
      }
    },
    complete: (res, stu) => {
      if (stu !== 'success') {
        console.log('error', service, res)
        canReq = true
        showMsg('请求' + (stu === 'timeout' ? '超时' : '失败') + '，请重新操作！')
      }
    }
  })
}

// 获取时间
const getNewTime = time => {
  return new Date(typeof time === 'string' ? time.replace(/-/g, '/') : time)
}

// 时间转换
const timeParse = (time, noDeal) => {
  const date = time ? getNewTime(time) : new Date()
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  if (!noDeal) {
    month = numLen(month)
    day = numLen(day)
    hours = numLen(hours)
    minutes = numLen(minutes)
    seconds = numLen(seconds)
  }
  return { year, month, day, hours, minutes, seconds }
}

// 时间格式化
const formatTime = (time, unit, noDeal) => {
  const { year, month, day, hours, minutes, seconds } = timeParse(time, noDeal)
  const ny = `${year}-${month}`
  const nyr = `${ny}-${day}`
  const sf = `${nyr} ${hours}:${minutes}`
  const sfm = `${sf}:${seconds}`
  const res = { ny, nyr, sf, sfm }
  return unit ? res[unit] : ny
}

// 时间差
const timeDiffer = time => {
  if (!time) {
    return null
  }

  return getNewTime(time) - new Date()
}

// 倒计时
const timeSpace = time => {
  const date = timeDiffer(time)

  if (!date || date < 0) {
    return null
  }

  const sDay = date % DAY
  const sHours = sDay % HOURS
  const sMinutes = sHours % MINUTES

  const day = Math.floor(date / DAY)
  const hours = Math.floor(sDay / HOURS)
  const minutes = Math.floor(sHours / MINUTES)
  const seconds = Math.round(sMinutes / SECONDS)
  return { day, hours, minutes, seconds }
}

// 复制
const onCopy = () => {
  const copy = document.getElementById('copy')
  copy.select()
  document.execCommand('copy')
  showMsg(('复制成功！'))
}

// 分页
const paging = ({ pageBox = $('.flex-auto'), service, args, normalizer, onSuc }) => {
  let page = 0
  let hasData = true

  const reqPage = () => {
    page += 1
    request({
      service,
      args: { size: 10, ...args, page },
      onSuc: res => {
        const data = normalizer ? normalizer(res) : res
        onSuc(data, res)

        if (!data.length) {
          hasData = false
          page > 1 && showMsg('没有数据了！')
        }
      }
    })
  }

  const resetPage = () => {
    page = 0
    hasData = true
    reqPage()
  }

  reqPage()

  pageBox.scroll(() => {
    if (!hasData) {
      return
    }

    const currentScrollTop = pageBox.scrollTop()
    const overHeight = $('.page-content').height() - pageBox.height()

    if (currentScrollTop >= overHeight) {
      reqPage()
    }
  })

  return { resetPage }
}

// 是否登录
const isLogin = callback => {
  const token = STORAGE.getItem('token')
  if (token) {
    callback && callback(token)
    return
  }

  showMsg('请登录！', 'login.html')
}

// 导航切换
const changeNav = callback => {
  $('.nav-bar .flex').click(function () {
    if ($(this).hasClass('nav-selected')) {
      return
    }

    $(this).addClass('nav-selected').siblings().removeClass('nav-selected')
    callback && callback($(this).attr('data-type'))
  })
}
