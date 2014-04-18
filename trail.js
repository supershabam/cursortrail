(function() {
  'use strict'
  var math     = new mathjs()
  var origin   = [0, 0]
  var elements = []

  function doCreateElement() {
    var node = document.createElement('img')
    node.src = 'https://s3.amazonaws.com/turst/coin25.png'
    node.setAttribute('style', defaultStyle())
    document.body.appendChild(node)
    return {
      end: Date.now() + 1000 + Math.random() * 2000,
      origin: origin,
      velocity: [Math.random() * 2000, Math.random() * 2000, 20],
      acceleration: [0, -8000, -40],
      start: Date.now(),
      node: node
    }
  }

  function matrixStyle(matrix) {
    var indexes = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
      [2, 1]
    ]
    var values = indexes.map(function(index) {
      return math.subset(matrix, math.index(index[0], index[1]))
    })
    var value = 'matrix(' + values.join(',') + ');'
    return [
      '-ms-transform',
      '-webkit-transform', 
      'transform'
    ].reduce(function(memo, key){
      return memo + key + ':' + value + ';'
    }, '')
  }

  function opacityStyle(opacity) {
    return [
      '-moz-opacity',
      '-webkit-opacity',
      'opacity'
    ].reduce(function(memo, key) {
      return memo + key + ':' + opacity + ';'
    }, '')
  }

  function defaultStyle() {
    return 'position: absolute; top: -9999px; left: -9999px; z-index: 9999;pointer-events: none;'
  }

  function style(matrix, opacity) {
    return defaultStyle() + matrixStyle(matrix) + opacityStyle(opacity)
  }

  function rotate(matrix, radians) {
    return math.multiply(math.matrix([
      [math.cos(radians) , math.sin(radians), 0],
      [-math.sin(radians), math.cos(radians), 0],
      [0, 0, 1]
    ]), matrix)
  }

  function translate(matrix, x, y) {
    return math.multiply(math.matrix([
      [1, 0, 0],
      [0, 1, 0],
      [x, -y, 1]
    ]), matrix)
  }

  function scale(matrix, x, y) {
    return math.multiply(math.matrix([
      [x, 0, 0],
      [0, y, 0],
      [0, 0, 1]
    ]), matrix)
  }

  function makeDoAnimation(now) {
    return function(element) {
      var elapsed = (now - element.start) / 1000
      var elapsedPow2 = math.pow(elapsed, 2)
      var completion = (now - element.start) / (element.end - element.start)
      var completionPow2 = math.pow(completion, 2)

      var x = elapsedPow2 * element.acceleration[0] + elapsed * element.velocity[0] + element.origin[0]
      var y = elapsedPow2 * element.acceleration[1] + elapsed * element.velocity[1] + element.origin[1]
      var theta = elapsedPow2 * element.acceleration[2] + elapsed * element.velocity[2] + element.origin[2]

      var matrix = math.eye(3)
      matrix = translate(matrix, 9999, -9999)
      matrix = translate(matrix, x, y)
      matrix = rotate(matrix, theta)

      var opacity = Math.max(0, Math.min(1, 1-completion))

      element.node.setAttribute('style', style(matrix, opacity))
    }
  }

  function makeExpiredFilter(expired) {
    return function(element) {
      return element.end > expired
    }
  }

  function doAnimation() {
    var partition = _.partition(elements, makeExpiredFilter(Date.now()))
    var expired = partition[1]
    elements = partition[0]
    expired.forEach(function(element) {
      document.body.removeChild(element.node)
    })
    elements.forEach(makeDoAnimation(Date.now()))
    requestAnimationFrame(doAnimation)
  }
  requestAnimationFrame(doAnimation)

  elements = elements.concat([doCreateElement()])
  elements = elements.concat([doCreateElement()])
  elements = elements.concat([doCreateElement()])
  elements = elements.concat([doCreateElement()])

  window.addEventListener('mousemove', function(e) {
    origin = [e.pageX, -e.pageY, 0]
  })
  window.addEventListener('mouseover', function() {
    console.log('mousein')
  })
  window.addEventListener('mouseout', function() {
    console.log('mouseout')
  })
})()
