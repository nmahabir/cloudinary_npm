var ClientRequest, EMPTY_IMAGE, IMAGE_FILE, LARGE_RAW_FILE, LARGE_VIDEO, Q, RAW_FILE, TEST_TAG, UPLOAD_TAGS, at, cloudinary, expect, fs, helper, http, https, isFunction, sinon;

require('dotenv').load({
  silent: true
});

https = require('https');

http = require('http');

expect = require("expect.js");

sinon = require('sinon');

cloudinary = require("../cloudinary");

fs = require('fs');

Q = require('q');

isFunction = require('lodash/isFunction');

at = require('lodash/at');

ClientRequest = require('_http_client').ClientRequest;

require('jsdom-global')();

helper = require("./spechelper");

TEST_TAG = helper.TEST_TAG;

IMAGE_FILE = helper.IMAGE_FILE;

LARGE_RAW_FILE = helper.LARGE_RAW_FILE;

LARGE_VIDEO = helper.LARGE_VIDEO;

EMPTY_IMAGE = helper.EMPTY_IMAGE;

RAW_FILE = helper.RAW_FILE;

UPLOAD_TAGS = helper.UPLOAD_TAGS;

describe("uploader", function() {
  /**
   * Upload an image to be tested on.
   * @callback the callback receives the public_id of the uploaded image
   */
  var upload_image;
  before("Verify Configuration", function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      return expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  this.timeout(helper.TIMEOUT_LONG);
  after(function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
    if (!cloudinary.config().keep_test_products) {
      return cloudinary.v2.api.delete_resources_by_tag(helper.TEST_TAG);
    }
  });
  upload_image = function(options, callback) {
    [options, callback] = isFunction(options) ? [
      {
        tags: UPLOAD_TAGS
      },
      options
    ] : [options, callback];
    return cloudinary.v2.uploader.upload(IMAGE_FILE, options, function(error, result) {
      expect(error).to.be(void 0);
      return typeof callback === "function" ? callback(result) : void 0;
    });
  };
  beforeEach(function() {
    return cloudinary.config(true);
  });
  it("should successfully upload file", function(done) {
    this.timeout(helper.TIMEOUT_LONG);
    upload_image(function(result) {
      var expected_signature;
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      return done();
    });
    return true;
  });
  it("should successfully upload url", function(done) {
    cloudinary.v2.uploader.upload("http://cloudinary.com/images/old_logo.png", {
      tags: UPLOAD_TAGS
    }, function(error, result) {
      var expected_signature;
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      return done();
    });
    return true;
  });
  describe("rename", function() {
    this.timeout(helper.TIMEOUT_LONG);
    it("should successfully rename a file", function(done) {
      upload_image(function(result) {
        var public_id;
        public_id = result.public_id;
        cloudinary.v2.uploader.rename(public_id, public_id + "2", function(e1, r1) {
          if (e1 != null) {
            return done(new Error(e1.message));
          }
          cloudinary.v2.api.resource(public_id + "2", function(e2, r2) {
            expect(e2).to.be(void 0);
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
    it("should not rename to an existing public_id", function(done) {
      upload_image(function(result) {
        var first_id;
        first_id = result.public_id;
        upload_image(function(result) {
          var second_id;
          second_id = result.public_id;
          cloudinary.v2.uploader.rename(first_id, second_id, function(e3, r3) {
            expect(e3).not.to.be(void 0);
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
    it("should allow to rename to an existing ID, if overwrite is true", function(done) {
      upload_image(function(result) {
        var first_id;
        first_id = result.public_id;
        upload_image(function(result) {
          var second_id;
          second_id = result.public_id;
          cloudinary.v2.uploader.rename(first_id, second_id, {
            overwrite: true
          }, function(error, result) {
            expect(error).to.be(void 0);
            cloudinary.v2.api.resource(second_id, function(error, result) {
              expect(result.format).to.eql("png");
              return done();
            });
            return true;
          });
          return true;
        });
        return true;
      });
      return true;
    });
    return context(":invalidate", function() {
      var spy, xhr;
      spy = void 0;
      xhr = void 0;
      before(function() {
        spy = sinon.spy(ClientRequest.prototype, 'write');
        return xhr = sinon.useFakeXMLHttpRequest();
      });
      after(function() {
        spy.restore();
        return xhr.restore();
      });
      return it("should should pass the invalidate value in rename to the server", function(done) {
        cloudinary.v2.uploader.rename("first_id", "second_id", {
          invalidate: true
        }, function(error, result) {
          expect(spy.calledWith(sinon.match(function(arg) {
            return arg.toString().match(/name="invalidate"/);
          }))).to.be.ok();
          return done();
        });
        return true;
      });
    });
  });
  describe("destroy", function() {
    this.timeout(helper.TIMEOUT_MEDIUM);
    return it("should delete a resource", function(done) {
      upload_image(function(result) {
        var public_id;
        public_id = result.public_id;
        cloudinary.v2.uploader.destroy(public_id, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(result.result).to.eql("ok");
          cloudinary.v2.api.resource(public_id, function(error, result) {
            expect(error).to.be.ok();
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
  });
  it("should successfully call explicit api", function(done) {
    var current;
    current = this;
    cloudinary.v2.uploader.explicit("sample", {
      type: "upload",
      eager: [
        {
          crop: "scale",
          width: "2.0"
        }
      ]
    }, function(error, result) {
      var url;
      if (error == null) {
        url = cloudinary.utils.url("sample", {
          type: "upload",
          crop: "scale",
          width: "2.0",
          format: "jpg",
          version: result["version"]
        });
        expect(result.eager[0].url).to.eql(url);
        return done();
      } else {
        if (error.code === 420) {
          console.warn(error.message);
          console.warn(`Try running '${current.test.title}' again in 10 minutes`);
          current.test.pending = true;
          return done();
        } else {
          return done(new Error(error.message));
        }
      }
    });
    return true;
  });
  it("should support eager in upload", function(done) {
    this.timeout(helper.TIMEOUT_SHORT);
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      eager: [
        {
          crop: "scale",
          width: "2.0"
        }
      ],
      tags: UPLOAD_TAGS
    }, function(error, result) {
      if (error != null) {
        return done(new Error(error.message));
      }
      return done();
    });
    return true;
  });
  describe("custom headers", function() {
    it("should support custom headers in object format e.g. {Link: \"1\"}", function(done) {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        headers: {
          Link: "1"
        },
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        return done();
      });
      return true;
    });
    return it("should support custom headers as array of strings e.g. [\"Link: 1\"]", function(done) {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        headers: ["Link: 1"],
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        return done();
      });
      return true;
    });
  });
  it("should successfully generate text image", function(done) {
    cloudinary.v2.uploader.text("hello world", {
      tags: UPLOAD_TAGS
    }, function(error, result) {
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.width).to.within(50, 70);
      expect(result.height).to.within(5, 15);
      return done();
    });
    return true;
  });
  it("should successfully upload stream", function(done) {
    var file_reader, stream;
    stream = cloudinary.v2.uploader.upload_stream({
      tags: UPLOAD_TAGS
    }, function(error, result) {
      var expected_signature;
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      return done();
    });
    true;
    file_reader = fs.createReadStream(IMAGE_FILE, {
      encoding: 'binary'
    });
    file_reader.on('data', function(chunk) {
      return stream.write(chunk, 'binary');
    });
    return file_reader.on('end', function() {
      return stream.end();
    });
  });
  describe("tags", function() {
    this.timeout(helper.TIMEOUT_MEDIUM);
    it("should add tags to existing resources", function(done) {
      upload_image(function(result1) {
        var first_id;
        first_id = result1.public_id;
        upload_image(function(result2) {
          var second_id;
          second_id = result2.public_id;
          cloudinary.v2.uploader.add_tag("tag1", [first_id, second_id], function(et1, rt1) {
            if (et1 != null) {
              return done(new Error(et1.message));
            }
            cloudinary.v2.api.resource(second_id, function(error, r1) {
              if (error) {
                return done(new Error(error.message));
              }
              expect(r1.tags).to.contain("tag1");
              cloudinary.v2.uploader.remove_all_tags([first_id, second_id, 'noSuchId'], function(err, res) {
                expect(res["public_ids"]).to.contain(first_id);
                expect(res["public_ids"]).to.contain(second_id);
                expect(res["public_ids"]).to.not.contain('noSuchId');
                cloudinary.v2.api.delete_resources([first_id, second_id], function(err, res) {
                  return done();
                });
                return true;
              });
              return true;
            });
            return true;
          });
          return true;
        });
        return true;
      });
      return true;
    });
    it("should keep existing tags when adding a new tag", function(done) {
      upload_image(function(result1) {
        var public_id;
        public_id = result1.public_id;
        cloudinary.v2.uploader.add_tag("tag1", public_id, function(error, result) {
          cloudinary.v2.uploader.add_tag("tag2", public_id, function(error, result) {
            cloudinary.v2.api.resource(public_id, function(e1, r1) {
              expect(r1.tags).to.contain("tag1").and.contain("tag2");
              return done();
            });
            return true;
          });
          return true;
        });
        return true;
      });
      return true;
    });
    return it("should replace existing tag", function(done) {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: ["tag1", "tag2", TEST_TAG]
      }, function(error, result) {
        var public_id;
        if (error != null) {
          return done(new Error(error.message));
        }
        public_id = result.public_id;
        cloudinary.v2.uploader.replace_tag("tag3Å", public_id, function(error, result) { // TODO this also tests non ascii characters
          if (error != null) {
            return done(new Error(error.message));
          }
          cloudinary.v2.api.resource(public_id, function(error, result) {
            if (error != null) {
              return done(new Error(error.message));
            }
            expect(result.tags).to.eql(["tag3Å"]);
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
  });
  describe("context", function() {
    var first_id, second_id;
    second_id = first_id = '';
    this.timeout(helper.TIMEOUT_MEDIUM);
    before(function(done) {
      Q.all([upload_image(), upload_image()]).spread(function(result1, result2) {
        first_id = result1.public_id;
        second_id = result2.public_id;
        return done();
      }).fail(function(error) {
        return done(new Error(error.message));
      });
      return true;
    });
    it("should add context to existing resources", function(done) {
      cloudinary.v2.uploader.add_context('alt=testAlt|custom=testCustom', [first_id, second_id], function(et1, rt1) {
        if (et1 != null) {
          return done(new Error(et1.message));
        }
        cloudinary.v2.uploader.add_context({
          alt2: "testAlt2",
          custom2: "testCustom2"
        }, [first_id, second_id], function(et1, rt1) {
          if (et1 != null) {
            return done(new Error(et1.message));
          }
          cloudinary.v2.api.resource(second_id, function(error, r1) {
            if (error) {
              return done(new Error(error.message));
            }
            expect(r1.context.custom.alt).to.equal('testAlt');
            expect(r1.context.custom.alt2).to.equal('testAlt2');
            expect(r1.context.custom.custom).to.equal('testCustom');
            expect(r1.context.custom.custom2).to.equal('testCustom2');
            cloudinary.v2.uploader.remove_all_context([first_id, second_id, 'noSuchId'], function(err, res) {
              if (error) {
                return done(new Error(error.message));
              }
              expect(res["public_ids"]).to.contain(first_id);
              expect(res["public_ids"]).to.contain(second_id);
              expect(res["public_ids"]).to.not.contain('noSuchId');
              cloudinary.v2.api.resource(second_id, function(error, r1) {
                if (error) {
                  return done(new Error(error.message));
                }
                expect(r1.context).to.be(void 0);
                return done();
              });
              return true;
            });
            return true;
          });
          return true;
        });
        return true;
      });
      return true;
    });
    return it("should upload with context containing reserved characters", function(done) {
      var context;
      context = {
        key1: 'value1',
        key2: 'valu\e2',
        key3: 'val=u|e3',
        key4: 'val\=ue'
      };
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        context: context
      }, function(error, result) {
        cloudinary.v2.api.resource(result.public_id, {
          context: true
        }, function(error, result) {
          expect(result.context.custom).to.eql(context);
          return done();
        });
        return true;
      });
      return true;
    });
  });
  it("should support timeouts", function(done) {
    // testing a 1ms timeout, nobody is that fast.
    cloudinary.v2.uploader.upload("http://cloudinary.com/images/old_logo.png", {
      timeout: 1,
      tags: UPLOAD_TAGS
    }, function(error, result) {
      expect(error.http_code).to.eql(499);
      expect(error.message).to.eql("Request Timeout");
      return done();
    });
    return true;
  });
  it("should upload a file and base public id on the filename if use_filename is set to true", function(done) {
    this.timeout(helper.TIMEOUT_MEDIUM);
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      use_filename: true,
      tags: UPLOAD_TAGS
    }, function(error, result) {
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.public_id).to.match(/logo_[a-zA-Z0-9]{6}/);
      return done();
    });
    return true;
  });
  it("should upload a file and set the filename as the public_id if use_filename is set to true and unique_filename is set to false", function(done) {
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      use_filename: true,
      unique_filename: false,
      tags: UPLOAD_TAGS
    }, function(error, result) {
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.public_id).to.eql("logo");
      return done();
    });
    return true;
  });
  describe("allowed_formats", function() {
    it("should allow whitelisted formats", function(done) {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["png"],
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.format).to.eql("png");
        return done();
      });
      return true;
    });
    it("should prevent non whitelisted formats from being uploaded", function(done) {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["jpg"],
        tags: UPLOAD_TAGS
      }, function(error, result) {
        expect(error.http_code).to.eql(400);
        return done();
      });
      return true;
    });
    return it("should allow non whitelisted formats if type is specified and convert to that type", function(done) {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        allowed_formats: ["jpg"],
        format: "jpg",
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.format).to.eql("jpg");
        return done();
      });
      return true;
    });
  });
  it("should allow sending face coordinates", function(done) {
    var coordinates, custom_coordinates, different_coordinates, out_coordinates;
    this.timeout(helper.TIMEOUT_LONG);
    coordinates = [[120, 30, 109, 150], [121, 31, 110, 151]];
    out_coordinates = [
      [120,
      30,
      109,
      51],
      [
        121,
        31,
        110,
        51 // coordinates are limited to the image dimensions
      ]
    ];
    different_coordinates = [[122, 32, 111, 152]];
    custom_coordinates = [1, 2, 3, 4];
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      face_coordinates: coordinates,
      faces: true,
      tags: UPLOAD_TAGS
    }, function(error, result) {
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.faces).to.eql(out_coordinates);
      cloudinary.v2.uploader.explicit(result.public_id, {
        faces: true,
        face_coordinates: different_coordinates,
        custom_coordinates: custom_coordinates,
        type: "upload"
      }, function(error2, result2) {
        if (error2 != null) {
          return done(new Error(error2.message));
        }
        expect(result2.faces).not.to.be(void 0);
        cloudinary.v2.api.resource(result2.public_id, {
          faces: true,
          coordinates: true
        }, function(ierror, info) {
          if (ierror != null) {
            return done(new Error(ierror.message));
          }
          expect(info.faces).to.eql(different_coordinates);
          expect(info.coordinates).to.eql({
            faces: different_coordinates,
            custom: [custom_coordinates]
          });
          return done();
        });
        return true;
      });
      return true;
    });
    return true;
  });
  it("should allow sending context", function(done) {
    var context;
    this.timeout(helper.TIMEOUT_LONG);
    context = {
      caption: "some caption",
      alt: "alternative"
    };
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      context: context,
      tags: UPLOAD_TAGS
    }, function(error, result) {
      if (error != null) {
        return done(new Error(error.message));
      }
      cloudinary.v2.api.resource(result.public_id, {
        context: true
      }, function(error, info) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(info.context.custom.caption).to.eql("some caption");
        expect(info.context.custom.alt).to.eql("alternative");
        return done();
      });
      return true;
    });
    return true;
  });
  it("should support requesting manual moderation", function(done) {
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      moderation: "manual",
      tags: UPLOAD_TAGS
    }, function(error, result) {
      expect(result.moderation[0].status).to.eql("pending");
      expect(result.moderation[0].kind).to.eql("manual");
      return done();
    });
    return true;
  });
  it("should support requesting ocr analysis", function() {
    return cloudinary.v2.uploader.upload(IMAGE_FILE, {
      ocr: "adv_ocr",
      tags: UPLOAD_TAGS
    }, function(error, result) {
      return expect(result.info.ocr).to.have.key("adv_ocr");
    });
  });
  it("should support requesting raw conversion", function(done) {
    cloudinary.v2.uploader.upload(RAW_FILE, {
      raw_convert: "illegal",
      resource_type: "raw",
      tags: UPLOAD_TAGS
    }, function(error, result) {
      expect(error != null).to.be(true);
      expect(error.message).to.contain("Raw convert is invalid");
      return done();
    });
    return true;
  });
  it("should support requesting categorization", function(done) {
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      categorization: "illegal",
      tags: UPLOAD_TAGS
    }, function(error, result) {
      expect(error != null).to.be(true);
      return done();
    });
    return true;
  });
  it("should support requesting detection", function(done) {
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      detection: "illegal",
      tags: UPLOAD_TAGS
    }, function(error, result) {
      expect(error).not.to.be(void 0);
      expect(error.message).to.contain("is not a valid");
      return done();
    });
    return true;
  });
  it("should support requesting background_removal", function(done) {
    cloudinary.v2.uploader.upload(IMAGE_FILE, {
      background_removal: "illegal",
      tags: UPLOAD_TAGS
    }, function(error, result) {
      expect(error != null).to.be(true);
      expect(error.message).to.contain("is invalid");
      return done();
    });
    return true;
  });
  describe("upload_chunked", function() {
    this.timeout(helper.TIMEOUT_LONG * 10);
    it("should specify chunk size", function(done) {
      return fs.stat(LARGE_RAW_FILE, function(err, stat) {
        cloudinary.v2.uploader.upload_large(LARGE_RAW_FILE, {
          chunk_size: 7000000,
          timeout: helper.TIMEOUT_LONG,
          tags: UPLOAD_TAGS
        }, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(result.bytes).to.eql(stat.size);
          expect(result.etag).to.eql("4c13724e950abcb13ec480e10f8541f5");
          return done();
        });
        return true;
      });
    });
    it("should return error if value is less than 5MB", function(done) {
      return fs.stat(LARGE_RAW_FILE, function(err, stat) {
        cloudinary.v2.uploader.upload_large(LARGE_RAW_FILE, {
          chunk_size: 40000,
          tags: UPLOAD_TAGS
        }, function(error, result) {
          expect(error.message).to.eql("All parts except EOF-chunk must be larger than 5mb");
          return done();
        });
        return true;
      });
    });
    it("should support uploading a small raw file", function(done) {
      return fs.stat(RAW_FILE, function(err, stat) {
        cloudinary.v2.uploader.upload_large(RAW_FILE, {
          tags: UPLOAD_TAGS
        }, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(result.bytes).to.eql(stat.size);
          expect(result.etag).to.eql("ffc265d8d1296247972b4d478048e448");
          return done();
        });
        return true;
      });
    });
    it("should support uploading a small image file", function(done) {
      return fs.stat(IMAGE_FILE, function(err, stat) {
        cloudinary.v2.uploader.upload_chunked(IMAGE_FILE, {
          tags: UPLOAD_TAGS
        }, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(result.bytes).to.eql(stat.size);
          expect(result.etag).to.eql("7dc60722d4653261648038b579fdb89e");
          return done();
        });
        return true;
      });
    });
    it("should support uploading large video files", function(done) {
      this.timeout(helper.TIMEOUT_LONG * 10);
      return fs.stat(LARGE_VIDEO, function(err, stat) {
        if (err != null) {
          return done(new Error(err.message));
        }
        cloudinary.v2.uploader.upload_chunked(LARGE_VIDEO, {
          resource_type: 'video',
          timeout: helper.TIMEOUT_LONG * 10,
          tags: UPLOAD_TAGS
        }, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(result.bytes).to.eql(stat.size);
          expect(result.etag).to.eql("ff6c391d26be0837ee5229885b5bd571");
          cloudinary.v2.uploader.destroy(result.public_id, function() {
            return done();
          });
          return true;
        });
        return true;
      });
    });
    return it("should support uploading based on a url", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.uploader.upload_large("http://cloudinary.com/images/old_logo.png", {
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.etag).to.eql("7dc60722d4653261648038b579fdb89e");
        return done();
      });
      return true;
    });
  });
  it("should support unsigned uploading using presets", function(done) {
    this.timeout(helper.TIMEOUT_LONG);
    cloudinary.v2.api.create_upload_preset({
      folder: "upload_folder",
      unsigned: true,
      tags: UPLOAD_TAGS
    }, function(error, preset) {
      cloudinary.v2.uploader.unsigned_upload(IMAGE_FILE, preset.name, {
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        cloudinary.v2.api.delete_upload_preset(preset.name, function() {
          expect(result.public_id).to.match(/^upload_folder\/[a-z0-9]+$/);
          return done();
        });
        return true;
      });
      return true;
    });
    return true;
  });
  it("should reject promise if error code is returned from the server", function(done) {
    cloudinary.v2.uploader.upload(EMPTY_IMAGE, {
      tags: UPLOAD_TAGS
    }).then(function() {
      return expect().fail("server should return an error when uploading an empty file");
    }).catch(function(error) {
      return expect(error.message).to.contain("empty");
    }).finally(function() {
      return done();
    });
    return true;
  });
  it("should successfully upload with pipes", function(done) {
    var file_reader, upload;
    this.timeout(helper.TIMEOUT_LONG);
    upload = cloudinary.v2.uploader.upload_stream({
      tags: UPLOAD_TAGS
    }, function(error, result) {
      var expected_signature;
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      return done();
    });
    true;
    file_reader = fs.createReadStream(IMAGE_FILE);
    return file_reader.pipe(upload);
  });
  it("should fail with http.Agent (non secure)", function(done) {
    var file_reader, upload;
    if (process.version <= 'v.11.11') {
      this.timeout(helper.TIMEOUT_LONG);
      upload = cloudinary.v2.uploader.upload_stream({
        agent: new http.Agent,
        tags: UPLOAD_TAGS
      }, function(error, result) {
        expect(error).to.be.ok();
        expect(error.message).to.match(/socket hang up|ECONNRESET/);
        return done();
      });
      true;
      file_reader = fs.createReadStream(IMAGE_FILE);
      return file_reader.pipe(upload);
    } else {
      // Node > 0.11.11
      this.timeout(helper.TIMEOUT_LONG);
      expect(cloudinary.v2.uploader.upload_stream).withArgs({
        agent: new http.Agent
      }, function(error, result) {
        return done();
      }).to.throwError();
      done();
      return true;
    }
  });
  it("should successfully override https agent", function(done) {
    var file_reader, upload;
    upload = cloudinary.v2.uploader.upload_stream({
      agent: new https.Agent,
      tags: UPLOAD_TAGS
    }, function(error, result) {
      var expected_signature;
      if (error != null) {
        return done(new Error(error.message));
      }
      expect(result.width).to.eql(241);
      expect(result.height).to.eql(51);
      expected_signature = cloudinary.utils.api_sign_request({
        public_id: result.public_id,
        version: result.version
      }, cloudinary.config().api_secret);
      expect(result.signature).to.eql(expected_signature);
      return done();
    });
    true;
    file_reader = fs.createReadStream(IMAGE_FILE);
    return file_reader.pipe(upload);
  });
  context(":responsive_breakpoints", function() {
    return context(":create_derived with different transformation settings", function() {
      return it('should return a responsive_breakpoints in the response', function(done) {
        cloudinary.v2.uploader.upload(IMAGE_FILE, {
          responsive_breakpoints: [
            {
              transformation: {
                effect: "sepia"
              },
              format: "jpg",
              bytes_step: 20000,
              create_derived: true,
              min_width: 200,
              max_width: 1000,
              max_images: 20
            },
            {
              transformation: {
                angle: 10
              },
              format: "gif",
              create_derived: true,
              bytes_step: 20000,
              min_width: 200,
              max_width: 1000,
              max_images: 20
            }
          ],
          tags: UPLOAD_TAGS
        }, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(result).to.have.key('responsive_breakpoints');
          expect(result.responsive_breakpoints).to.have.length(2);
          expect(at(result, "responsive_breakpoints[0].transformation")[0]).to.eql("e_sepia");
          expect(at(result, "responsive_breakpoints[0].breakpoints[0].url")[0]).to.match(/\.jpg$/);
          expect(at(result, "responsive_breakpoints[1].transformation")[0]).to.eql("a_10");
          expect(at(result, "responsive_breakpoints[1].breakpoints[0].url")[0]).to.match(/\.gif$/);
          return done();
        });
        return true;
      });
    });
  });
  describe("async upload", function() {
    var mocked;
    mocked = helper.mockTest();
    return it("should pass `async` value to the server", function() {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        async: true,
        transformation: {
          effect: "sepia"
        }
      });
      return sinon.assert.calledWith(mocked.write, sinon.match(helper.uploadParamMatcher("async", 1)));
    });
  });
  describe("explicit", function() {
    var spy, xhr;
    spy = void 0;
    xhr = void 0;
    before(function() {
      xhr = sinon.useFakeXMLHttpRequest();
      return spy = sinon.spy(ClientRequest.prototype, 'write');
    });
    after(function() {
      spy.restore();
      return xhr.restore();
    });
    describe(":invalidate", function() {
      return it("should should pass the invalidate value to the server", function() {
        cloudinary.v2.uploader.explicit("cloudinary", {
          type: "twitter_name",
          eager: [
            {
              crop: "scale",
              width: "2.0"
            }
          ],
          invalidate: true,
          tags: [TEST_TAG]
        });
        return sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('invalidate', 1)));
      });
    });
    return it("should support raw_convert", function() {
      cloudinary.v2.uploader.explicit("cloudinary", {
        raw_convert: "google_speech",
        tags: [TEST_TAG]
      });
      return sinon.assert.calledWith(spy, sinon.match(helper.uploadParamMatcher('raw_convert', 'google_speech')));
    });
  });
  it("should create an image upload tag with required properties", function() {
    var fakeDiv, input_element, tag;
    this.timeout(helper.TIMEOUT_LONG);
    tag = cloudinary.v2.uploader.image_upload_tag("image_id", {
      chunk_size: "1234"
    });
    expect(tag).to.match(/^<input/);
    // Create an HTMLElement from the returned string to validate attributes
    fakeDiv = document.createElement('div');
    fakeDiv.innerHTML = tag;
    input_element = fakeDiv.firstChild;
    expect(input_element.tagName.toLowerCase()).to.be('input');
    expect(input_element.getAttribute("data-url")).to.be.ok();
    expect(input_element.getAttribute("data-form-data")).to.be.ok();
    expect(input_element.getAttribute("data-cloudinary-field")).to.match(/image_id/);
    expect(input_element.getAttribute("data-max-chunk-size")).to.match(/1234/);
    expect(input_element.getAttribute("class")).to.match(/cloudinary-fileupload/);
    expect(input_element.getAttribute("name")).to.be('file');
    return expect(input_element.getAttribute("type")).to.be('file');
  });
  return describe("access_control", function() {
    var acl, acl_string, options, requestSpy, writeSpy;
    writeSpy = void 0;
    requestSpy = void 0;
    options = void 0;
    beforeEach(function() {
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      requestSpy = sinon.spy(http, 'request');
      return options = {
        public_id: helper.TEST_TAG,
        tags: [...helper.UPLOAD_TAGS, 'access_control_test']
      };
    });
    afterEach(function() {
      requestSpy.restore();
      return writeSpy.restore();
    });
    acl = {
      access_type: 'anonymous',
      start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
      end: '2019-03-22 00:00 +0200'
    };
    acl_string = '{"access_type":"anonymous","start":"2019-02-22T16:20:57.000Z","end":"2019-03-22 00:00 +0200"}';
    return it("should allow the user to define ACL in the upload parameters", function() {
      options.access_control = [acl];
      return upload_image(options).then((resource) => {
        var response_acl;
        sinon.assert.calledWith(writeSpy, sinon.match(helper.uploadParamMatcher('access_control', helper.escapeRegexp(`[${acl_string}]`))));
        expect(resource).to.have.key('access_control');
        response_acl = resource["access_control"];
        expect(response_acl.length).to.be(1);
        expect(response_acl[0]["access_type"]).to.be("anonymous");
        expect(Date.parse(response_acl[0]["start"])).to.be(Date.parse(acl.start));
        return expect(Date.parse(response_acl[0]["end"])).to.be(Date.parse(acl.end));
      });
    });
  });
});
