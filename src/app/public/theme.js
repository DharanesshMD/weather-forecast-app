(function() {
    try {
      let theme = localStorage.getItem('theme')
      if (!theme) {
        localStorage.setItem('theme', 'dark')
        theme = 'dark'
      }
      document.documentElement.classList.add(theme)
    } catch (err) {}
  })()