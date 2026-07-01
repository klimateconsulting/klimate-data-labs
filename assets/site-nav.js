/* Klimate Data Labs — shared global nav injector.
 * Injects one consistent sticky header + footer into every dashboard so no
 * visitor is stranded and navigation can't drift page to page. Vanilla JS, no
 * dependencies, so it loads instantly on the Plotly/Mapbox/React dashboards.
 * Single source of truth — edit here, every page updates. Add to each page's
 * <head>:
 *   <link rel="stylesheet" href="/assets/site-nav.css">
 *   <script src="/assets/site-nav.js" defer></script>
 */
(function () {
  'use strict'

  var SITE = 'https://klimateconsulting.com'

  // Data Labs points at this property's own hub (/). Everything else is on the
  // main site (absolute, cross-property).
  var LINKS = [
    { label: 'Data Labs', href: '/' },
    { label: 'Insights', href: SITE + '/insights/' },
    { label: 'Research', href: SITE + '/research/' },
    { label: 'Services', href: SITE + '/services/' },
    { label: 'Contact', href: SITE + '/contact/' },
  ]

  function isHubHome() {
    // On the data-hub home page, mark "Data Labs" as current.
    var p = location.pathname.replace(/index\.html$/, '')
    return p === '/' || p === ''
  }

  function linkItems() {
    return LINKS.map(function (l) {
      var here = l.href === '/' && isHubHome() ? ' class="kc-here"' : ''
      return '<li><a href="' + l.href + '"' + here + '>' + l.label + '</a></li>'
    }).join('')
  }

  function build() {
    if (document.querySelector('.kc-nav')) return // idempotent

    var skip = document.createElement('a')
    skip.className = 'kc-skip'
    skip.href = '#kc-content'
    skip.textContent = 'Skip to content'

    var header = document.createElement('header')
    header.className = 'kc-nav'
    header.setAttribute('role', 'banner')
    header.innerHTML =
      '<div class="kc-nav__inner">' +
      '<a class="kc-nav__brand" href="' + SITE + '/" aria-label="Klimate Consulting home">' +
      '<img src="/assets/images/logo-white.png" alt="Klimate Consulting">' +
      '</a>' +
      '<button class="kc-nav__toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="kc-nav-links">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
      '</button>' +
      '<nav aria-label="Primary"><ul class="kc-nav__links" id="kc-nav-links">' +
      linkItems() +
      '</ul></nav>' +
      '</div>'

    var sentinel = document.createElement('span')
    sentinel.id = 'kc-content'
    sentinel.tabIndex = -1

    var footer = document.createElement('footer')
    footer.className = 'kc-foot'
    footer.setAttribute('role', 'contentinfo')
    footer.innerHTML =
      '<div class="kc-foot__inner">' +
      '<ul class="kc-foot__links">' +
      '<li><a href="/">Data Labs Home</a></li>' +
      '<li><a href="' + SITE + '/">Main Site</a></li>' +
      '<li><a href="' + SITE + '/insights/">Insights</a></li>' +
      '<li><a href="' + SITE + '/research/">Research</a></li>' +
      '<li><a href="' + SITE + '/services/">Services</a></li>' +
      '<li><a href="' + SITE + '/contact/">Contact</a></li>' +
      '</ul>' +
      '<p class="kc-foot__cross">These interactive dashboards are Klimate Consulting Data Labs. ' +
      'Return to the <a href="' + SITE + '/">main site</a> for services, insights, and research.</p>' +
      '<p class="kc-foot__copy">&copy; ' +
      new Date().getFullYear() +
      ' Klimate Consulting. All rights reserved.</p>' +
      '</div>'

    document.body.insertBefore(sentinel, document.body.firstChild)
    document.body.insertBefore(header, document.body.firstChild)
    document.body.insertBefore(skip, document.body.firstChild)
    document.body.appendChild(footer)

    var toggle = header.querySelector('.kc-nav__toggle')
    var links = header.querySelector('.kc-nav__links')
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('kc-open')
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('kc-open')
        toggle.setAttribute('aria-expanded', 'false')
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build)
  } else {
    build()
  }
})()
