(function () {
  'use strict'

  if (!window.addEventListener) return // Check for IE9+

  let options = INSTALL_OPTIONS
  let widgetElements = []

  // const URL_PATTERN = new RegExp('spotify.com/(.+)')

  // https://experiment.com/api/projects/fanteca-project-student-led-study-of-opiates-and-overdose-in-nyc/embed
  const URL_PATTERN = new RegExp('experiment.com/api/projects/(.+)/embed')

  const SIZES = {
    small: {
      width: 300,
      height: 80
    },
    large: {
      width: 300,
      height: 380
    },
    wide: {
      width: 800,
      height: 480
    }
  }

  function parseURI (URI) {
    const URLMatch = URI.match(URL_PATTERN)

    if (URLMatch) {
      const segments = URLMatch[1].split('/')
      console.log(segments)
      var temp = ['spotify', ...segments].join(':')
      console.log(temp)
      return temp // FIXME
    }

    return URI
  }

  function getURL (config) {
    const URI = parseURI(config.project.URI) // FIXME
    // const URI = 'fanteca-project-student-led-study-of-opiates-and-overdose-in-nyc' // FIXME

    // return `https://open.spotify.com/embed?uri=${URI}&theme=${theme}`
    return `https://experiment.com/api/projects/${URI}/embed`
    // return `https://experiment.com/projects/${URI}`
  }

  function updateElements () {
    widgetElements.forEach(element => {
      if (element.parentElement) element.parentElement.removeChild(element)
    })

    widgetElements = options.widgets
      .reverse()
      .filter(config => {
        if (!document.querySelector(config.location.selector)) {
          console.log('location selector not found')
          return false
        }
        // if (!config.project.URI) {
        //   console.log('no config.project.URI')
        //   return false
        // }

        return true
      })
      .map(config => {
        const container = INSTALL.createElement(config.location)
        container.setAttribute('app', 'grasshopper')
        container.setAttribute('data-position', config.position)
        container.setAttribute('data-size', config.size)

        const size = SIZES[config.size]
        const div = document.createElement('div')

        div.height = size.height
        div.width = size.width

        div.innerHTML = getURL(config)
        console.log(getURL(config))

        // container.appendChild(iframe)
        container.appendChild(div)

        return container
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateElements)
  } else {
    updateElements()
  }

  window.INSTALL_SCOPE = {
    setOptions (nextOptions) {
      options = nextOptions

      updateElements()
    }
  }
}())
