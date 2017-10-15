(function () {
  'use strict'

  if (!window.addEventListener) return // Check for IE9+

  const https = require('https')

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

        const apiUri = getURL(config)
        console.log(apiUri)

        container.appendChild(div)

        function callExperiment(url, timeout, callback) {
            var args = Array.prototype.slice.call(arguments, 3);
            var xhr = new XMLHttpRequest();
            xhr.ontimeout = function () {
                console.error("The request for " + url + " timed out.");
            };
            xhr.onload = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        callback.apply(xhr, args);
                    } else {
                        console.error(xhr.statusText);
                    }
                }
            };
            xhr.open("GET", url, true);
            xhr.timeout = timeout;
            xhr.send(null);
        }

        function showJson () {
          const expData = JSON.parse(this.responseText)

            console.log(expData);
            div.innerHTML = 
              `<div class="funding-raised">
                <span class="focus-stat">$${expData.funding_raised}</span>
                <div class="description text-antialiased">
                  Pledged
                </div>
                <div class="funding-bar">
                  <div class="percent-funded" style="width:${expData.funding_percent}%;"></div>
                  <div class="stretch-goal-funded" style="width:0%;"></div>
                </div>

                <div class="funding-bar-stats">
                  <div class="stat">
                    <span>${expData.funding_percent}%</span>
                    <div class="label">Funded</div>
                  </div>
                  <div class="stat">
                    <span>$${expData.funding_target}</span>
                    <div class="label">Goal</div>
                  </div>
                  <div class="stat float-right text-right">
                    <span>${expData.funding_end}</span>
                    <div class="label">Funding Ends</div>
                  </div>
                </div>
              </div>`

              const bannerImg = document.createElement('div')
              bannerImg.style.backgroundImage = `url(${expData.banner})`
              bannerImg.style.width = '100%'
              container.appendChild(bannerImg)
        }

        callExperiment(apiUri, 2000, showJson);

        console.log('out of the request')

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
