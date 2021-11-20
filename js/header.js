const headerContent = (page) => {
  let menuHtml = ''
  const menu = {
    index: { text: '首页', icon: 'icon-shouye' },
    hall: { text: '众筹大厅', icon: 'icon-zhongchou' },
    // ctc: { text: 'CTC交易', icon: 'icon-jinqianjiaoyi' },
    assets: { text: '我的资产', icon: 'icon-wodezichan' },
    order: { text: '我的订单', icon: 'icon-youxuliebiao' },
    team: { text: '我的团队', icon: 'icon-wodetuandui' },
    data: { text: '个人资料', icon: 'icon-gerenziliao' },
    share: { text: '邀请好友', icon: 'icon-share' }
  }
  const current = menu[page]

  for (const key in menu) {
    const item = menu[key]
    menuHtml += `
    <a
      class='menu flex-r ${key === page ? 'current' : ''}'
      href='${key}.html'
    >
      <div class='iconfont ${item.icon}'></div>
      <div class='flex'>${item.text}</div>
    </a>`
  }

  // 添加头部
  $('.page').prepend(`
    <div class='header flex-r c-f'>
      <div class='iconfont f-17 ${current.icon}'></div>
      <div class='flex f-15 bold text-line1'>${current.text}</div>
      <div class='more'>⋮</div>
    </div>
  `)

  // 添加导航
  $('body').append(`
    <div class='menu-out pos-full text-center c-f'>
      <div class='menu-box p-15'>
        ${menuHtml}
      </div>
    </div>
  `)

  // 显示导航
  $('.header .more').click(function () {
    $('.menu-out').show()
  })

  // 关闭导航
  $('.menu-out').click(function () {
    $('.menu-out').hide()
  })
}
