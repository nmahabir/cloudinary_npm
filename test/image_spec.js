var cloudinary, expect, helper, includeContext, sharedContext, sharedExamples;

expect = require('expect.js');

cloudinary = require('../cloudinary');

helper = require("./spechelper");

sharedContext = helper.sharedContext;

sharedExamples = helper.sharedExamples;

includeContext = helper.includeContext;

describe('image helper', function() {
  beforeEach(function() {
    cloudinary.config(true); // Reset
    return cloudinary.config({
      cloud_name: "test",
      api_secret: "1234"
    });
  });
  it("should generate image", function() {
    return expect(cloudinary.image("hello", {
      format: "png"
    })).to.eql("<img src='http://res.cloudinary.com/test/image/upload/hello.png' />");
  });
  it("should accept scale crop and pass width/height to image tag ", function() {
    return expect(cloudinary.image("hello", {
      format: "png",
      crop: 'scale',
      width: 100,
      height: 100
    })).to.eql("<img src='http://res.cloudinary.com/test/image/upload/c_scale,h_100,w_100/hello.png' height='100' width='100'/>");
  });
  it("should add responsive width transformation", function() {
    return expect(cloudinary.image("hello", {
      format: "png",
      responsive_width: true
    })).to.eql("<img class='cld-responsive' data-src='http://res.cloudinary.com/test/image/upload/c_limit,w_auto/hello.png'/>");
  });
  it("should support width auto transformation", function() {
    return expect(cloudinary.image("hello", {
      format: "png",
      width: "auto",
      crop: "limit"
    })).to.eql("<img class='cld-responsive' data-src='http://res.cloudinary.com/test/image/upload/c_limit,w_auto/hello.png'/>");
  });
  it("should support dpr auto transformation", function() {
    return expect(cloudinary.image("hello", {
      format: "png",
      dpr: "auto"
    })).to.eql("<img class='cld-hidpi' data-src='http://res.cloudinary.com/test/image/upload/dpr_auto/hello.png'/>");
  });
  it("should support e_art:incognito transformation", function() {
    return expect(cloudinary.image("hello", {
      format: "png",
      effect: "art:incognito"
    })).to.eql("<img src='http://res.cloudinary.com/test/image/upload/e_art:incognito/hello.png' />");
  });
  it("should not mutate the options argument", function() {
    var options;
    options = {
      fetch_format: 'auto',
      flags: 'progressive'
    };
    cloudinary.image('hello', options);
    expect(options.fetch_format).to.eql('auto');
    return expect(options.flags).to.eql('progressive');
  });
  sharedExamples("client_hints", function(options) {
    it("should not use data-src or set responsive class", function() {
      var tag;
      tag = cloudinary.image('sample.jpg', options);
      expect(tag).to.match(/<img.*>/);
      expect(tag).not.to.match(/<.*class.*>/);
      expect(tag).not.to.match(/\bdata-src\b/);
      return expect(tag).to.match(/src=["']http:\/\/res.cloudinary.com\/test\/image\/upload\/c_scale,dpr_auto,w_auto\/sample.jpg["']/);
    });
    return it("should override responsive", function() {
      var tag;
      cloudinary.config({
        responsive: true
      });
      tag = cloudinary.image('sample.jpg', options);
      expect(tag).to.match(/<img.*>/);
      expect(tag).not.to.match(/<.*class.*>/);
      expect(tag).not.to.match(/\bdata-src\b/);
      return expect(tag).to.match(/src=["']http:\/\/res.cloudinary.com\/test\/image\/upload\/c_scale,dpr_auto,w_auto\/sample.jpg["']/);
    });
  });
  return describe(":client_hints", function() {
    describe("as option", function() {
      return includeContext("client_hints", {
        dpr: "auto",
        cloud_name: "test",
        width: "auto",
        crop: "scale",
        client_hints: true
      });
    });
    describe("as global configuration", function() {
      beforeEach(function() {
        return cloudinary.config().client_hints = true;
      });
      return includeContext("client_hints", {
        dpr: "auto",
        cloud_name: "test",
        width: "auto",
        crop: "scale"
      });
    });
    describe("false", function() {
      return it("should use normal responsive behaviour", function() {
        var tag;
        cloudinary.config().responsive = true;
        tag = cloudinary.image('sample.jpg', {
          width: "auto",
          crop: "scale",
          cloud_name: "test",
          client_hints: false
        });
        expect(tag).to.match(/<img.*>/);
        expect(tag).to.match(/class=["']cld-responsive["']/);
        return expect(tag).to.match(/data-src=['"]http:\/\/res.cloudinary.com\/test\/image\/upload\/c_scale,w_auto\/sample.jpg["']/);
      });
    });
    return describe("width", function() {
      return it("supports auto width", function() {
        var tag;
        tag = cloudinary.image('sample.jpg', {
          crop: "scale",
          dpr: "auto",
          cloud_name: "test",
          width: "auto:breakpoints",
          client_hints: true
        });
        return expect(tag).to.match(/src=["']http:\/\/res.cloudinary.com\/test\/image\/upload\/c_scale,dpr_auto,w_auto:breakpoints\/sample.jpg["']/);
      });
    });
  });
});
