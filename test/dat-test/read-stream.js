var test = require('tape').test
var fs = require('../../chrome')
var through = require('through2')

test('createReadStream', function (t) {
  fs.writeFile('/test1.txt', 'hello', function (err) {
    t.ok(!err, 'Write file error')
    var rs = fs.createReadStream('/test1.txt')
    rs.pipe(through(function (chunk, enc, callback) {
      t.same(chunk, new Buffer('hello'), '/test1.txt contians hello')
      fs.unlink('/test1.txt', function (err) {
        t.ok(!err, 'unlinked /test1.txt')
        t.end()
        callback()
      })
    }))
  })
})

test('createReadStream big file', function (t) {
  var big = new Buffer(100 * 1024)

  fs.writeFile('/testrs2.txt', big, function (err) {
    t.ok(!err)
    var actual = new Buffer(0)
    var rs = fs.createReadStream('/testrs2.txt')

    rs.pipe(through(function (chunk, enc, callback) {
      actual = Buffer.concat([actual, chunk])
      callback()
    }))
    // explicitly assign the close event.
    rs.on('close', function () {
      t.same(actual, big)
      fs.unlink('/testrs2.txt', function (err) {
        t.ok(!err, 'unlinked /testrs2.txt')
        t.end()
      })
    })
  })
})

test('createReadStream random access', function (t) {
  fs.writeFile('/testra.txt', 'hello world', function (err) {
    t.ok(!err)
    var rs = fs.createReadStream('/testra.txt', {
      start: 2,
      end: 5
    })
    rs.pipe(through(function (chunk, enc, callback) {
      t.same(chunk, new Buffer('llo '))
      fs.unlink('/testra.txt', function (err) {
        t.ok(!err, 'unlinked /testra.txt')
        t.end()
        callback()
      })
    }))
  })
})

test('createReadStream enoent', function (t) {
  var rs = fs.createReadStream('/test123.txt')
  rs.on('error', function (err) {
    t.ok(err)
    t.same(err.code, 'ENOENT')
    t.ok(true)
    t.end()
  })
})
