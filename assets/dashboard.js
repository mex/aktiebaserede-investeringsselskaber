var DEFAULT_YEAR = new Date().getFullYear()

var lists = {}
var selected = {}

function updateYear(year) {
  getYearButtons().forEach(function (yearEl) {
    yearEl.className = yearEl.className.replace(/\s*active\s*/, '')
    if (yearEl.getAttribute('ref') == year) {
      yearEl.className += ' active'
    }
  })
}
function updateReg(reg) {
  getRegButtons().forEach(function (regEl) {
    regEl.className = regEl.className.replace(/\s*active\s*/, '')
    if (regEl.getAttribute('ref') == reg) {
      regEl.className += ' active'
    }
  })
}
function updateSearch(search) {
  document.getElementById('search').value = search
}

function readFromUrl() {
  if (!document.location.search) {
    return
  }
  const query = document.location.search.substr(1)
  query.split('&').forEach(function (param) {
    var [key, val] = param.split('=')
    if (!val) {
      return
    }
    switch (key) {
      case 'year': {
        selected[key] = val
        updateYear(val)
        break
      }
      case 'reg': {
        selected[key] = val
        updateReg(val)
        break
      }
      case 'search': {
        selected[key] = val
        updateSearch(val)
        break
      }
    }
  })
}
function updateUrl() {
  var params = []
  if (selected.year && selected.year != DEFAULT_YEAR) {
    params.push('year=' + selected.year)
  }
  if (selected.reg) {
    params.push('reg=' + selected.reg)
  }
  if (selected.search) {
    params.push('search=' + selected.search)
  }
  var url = '/aktiebaserede-investeringsselskaber/'
  if (params.length > 0) {
    url += '?' + params.join('&')
  }
  window.history.replaceState({}, '', url)
}

function getYearButtons() {
  return Array.prototype.slice.call(document.getElementById('year').children)
}
function getRegButtons() {
  return Array.prototype.slice.call(document.getElementById('reg').children).map(function (el) {
    return el.children[0]
  })
}
function getSearchField() {
  return document.getElementById('search')
}

function setYear(year) {
  selected.year = year
  updateYear(year)
}
function setReg(reg) {
  selected.reg = reg
  updateReg(reg)
}
function setSearch(search) {
  selected.search = search
}

function fetchList(year) {
  if (lists[year]) {
    return Promise.resolve()
  }
  document.getElementById('spinner').style.display = 'block'
  document.getElementById('headline').style.display = 'none'
  document.getElementById('table').style.display = 'none'
  return fetch('/aktiebaserede-investeringsselskaber/lists/' + year + '.json')
    .then(function (val) {
      return val.json()
    })
    .then(function (data) {
      lists[year] = data
      document.getElementById('spinner').style.display = 'none'
      document.getElementById('headline').style.display = 'block'
      document.getElementById('table').style.display = 'block'
    })
    .catch(function (reason) {
      console.error(reason)
    })
}
function renderList() {
  updateUrl()
  var year = selected.year
  var reg = selected.reg
  var search = selected.search
  fetchList(year)
    .then(function () {
      if (lists[year] && lists[year].length > 0) {
        let output = ''
        lists[year].forEach(function (row) {
          if (reg && row.reg != reg) {
            return
          }
          if (search) {
            const pattern = new RegExp(search, 'i')
            if (!pattern.test(row.reg) && !pattern.test(row.isin) && !pattern.test(row.name) && !pattern.test(row.lei) && !pattern.test(row.asident) && !pattern.test(row.cvr) && !pattern.test(row.group)) {
              return
            }
          }
          output += '<tr><td>' + (row.reg || '') + '</td><td>' + (row.isin || '') + '</td><td>' + (row.name || '') + '</td><td>' + (row.lei || '') + '</td><td>' + (row.asident || '') + '</td><td>' +( row.cvr || '') + '</td><td>' + (row.group || '') + '</td><td>' + (row.year || '') + '</td></tr>'
        })
        document.getElementById('table-content').innerHTML = output
      }
    })
}

(function () {
  'use strict'

  Array.prototype.slice.call(document.getElementsByClassName('has-tooltip')).forEach(function (tooltipEl) {
    new bootstrap.Tooltip(tooltipEl)
  })
  
  getYearButtons().forEach(function (yearEl) {
    yearEl.onclick = function (e) {
      e.preventDefault()
      setYear(yearEl.getAttribute('ref'))
      renderList()
    }
  })
  getRegButtons().forEach(function (regEl) {
    regEl.onclick = function (e) {
      e.preventDefault()
      setReg(regEl.getAttribute('ref'))
      renderList()
    }
  })
  var timeout
  getSearchField().onkeyup = function (e) {
    clearTimeout(timeout)
    var val = e.target.value
    timeout = setTimeout(function () {
      setSearch(val)
      renderList()
    }, 300)
  }

  setYear(DEFAULT_YEAR)
  readFromUrl()
  renderList()
})()
