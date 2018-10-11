var API_TEST_UPLOAD_PRESET1, API_TEST_UPLOAD_PRESET2, API_TEST_UPLOAD_PRESET3, API_TEST_UPLOAD_PRESET4, ClientRequest, EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2, EXPLICIT_TRANSFORMATION_NAME, EXPLICIT_TRANSFORMATION_NAME2, IMAGE_FILE, IMAGE_URL, NAMED_TRANSFORMATION, PUBLIC_ID, PUBLIC_ID_1, PUBLIC_ID_2, PUBLIC_ID_3, PUBLIC_ID_4, PUBLIC_ID_5, PUBLIC_ID_6, PUBLIC_ID_PREFIX, Q, SUFFIX, TEST_TAG, UPLOAD_TAGS, cloudinary, expect, find, fs, getAllTags, helper, http, itBehavesLike, keys, matchesProperty, merge, mockTest, sharedExamples, sinon, utils;

require('dotenv').load({
  silent: true
});

expect = require("expect.js");

cloudinary = require("../cloudinary");

utils = require("../lib/utils");

({matchesProperty, merge} = utils);

matchesProperty = require('lodash/matchesProperty');

find = require('lodash/find');

keys = require('lodash/keys');

sinon = require('sinon');

ClientRequest = require('_http_client').ClientRequest;

http = require('http');

Q = require('q');

fs = require('fs');

helper = require("./spechelper");

mockTest = helper.mockTest;

sharedExamples = helper.sharedExamples;

itBehavesLike = helper.itBehavesLike;

TEST_TAG = helper.TEST_TAG;

IMAGE_FILE = helper.IMAGE_FILE;

IMAGE_URL = helper.IMAGE_URL;

UPLOAD_TAGS = helper.UPLOAD_TAGS;

SUFFIX = helper.SUFFIX;

PUBLIC_ID_PREFIX = "npm_api_test";

PUBLIC_ID = PUBLIC_ID_PREFIX + SUFFIX;

PUBLIC_ID_1 = PUBLIC_ID + "_1";

PUBLIC_ID_2 = PUBLIC_ID + "_2";

PUBLIC_ID_3 = PUBLIC_ID + "_3";

PUBLIC_ID_4 = PUBLIC_ID + "_4";

PUBLIC_ID_5 = PUBLIC_ID + "_5";

PUBLIC_ID_6 = PUBLIC_ID + "_6";

NAMED_TRANSFORMATION = "npm_api_test_transformation" + SUFFIX;

API_TEST_UPLOAD_PRESET1 = "npm_api_test_upload_preset_1_" + SUFFIX;

API_TEST_UPLOAD_PRESET2 = "npm_api_test_upload_preset_2_" + SUFFIX;

API_TEST_UPLOAD_PRESET3 = "npm_api_test_upload_preset_3_" + SUFFIX;

API_TEST_UPLOAD_PRESET4 = "npm_api_test_upload_preset_4_" + SUFFIX;

EXPLICIT_TRANSFORMATION_NAME = `c_scale,l_text:Arial_60:${TEST_TAG},w_100`;

EXPLICIT_TRANSFORMATION_NAME2 = `c_scale,l_text:Arial_60:${TEST_TAG},w_200`;

EXPLICIT_TRANSFORMATION = {
  width: 100,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};

EXPLICIT_TRANSFORMATION2 = {
  width: 200,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};

sharedExamples("a list with a cursor", function(testFunc, ...args) {
  var request, requestSpy, requestStub, writeSpy, xhr;
  xhr = request = requestStub = requestSpy = writeSpy = void 0;
  before(function() {
    xhr = sinon.useFakeXMLHttpRequest();
    writeSpy = sinon.spy(ClientRequest.prototype, 'write');
    return requestSpy = sinon.spy(http, 'request');
  });
  after(function() {
    writeSpy.restore();
    requestSpy.restore();
    return xhr.restore();
  });
  specify(":max_results", function() {
    testFunc(...args, {
      max_results: 10
    });
    if (writeSpy.called) {
      return sinon.assert.calledWith(writeSpy, sinon.match(/max_results=10/));
    } else {
      return sinon.assert.calledWith(requestSpy, sinon.match({
        query: sinon.match(/max_results=10/)
      }));
    }
  });
  return specify(":next_cursor", function() {
    testFunc(...args, {
      next_cursor: 23452342
    });
    if (writeSpy.called) {
      return sinon.assert.calledWith(writeSpy, sinon.match(/next_cursor=23452342/));
    } else {
      return sinon.assert.calledWith(requestSpy, sinon.match({
        query: sinon.match(/next_cursor=23452342/)
      }));
    }
  });
});

sharedExamples("accepts next_cursor", function(testFunc, ...args) {
  var request, requestSpy, requestStub, writeSpy, xhr;
  xhr = request = requestStub = requestSpy = writeSpy = void 0;
  before(function() {
    xhr = sinon.useFakeXMLHttpRequest();
    writeSpy = sinon.spy(ClientRequest.prototype, 'write');
    return requestSpy = sinon.spy(http, 'request');
  });
  after(function() {
    writeSpy.restore();
    requestSpy.restore();
    return xhr.restore();
  });
  return specify(":next_cursor", function() {
    testFunc(...args, {
      next_cursor: 23452342
    });
    if (writeSpy.called) {
      return sinon.assert.calledWith(writeSpy, sinon.match(/next_cursor=23452342/));
    } else {
      return sinon.assert.calledWith(requestSpy, sinon.match({
        query: sinon.match(/next_cursor=23452342/)
      }));
    }
  });
});

getAllTags = function(arr) {
  return arr.resources.map(function(e) {
    return e.tags;
  }).reduce((function(a, b) {
    return a.concat(b);
  }), []);
};

describe("api", function() {
  /**
   * Upload an image to be tested on.
   * @callback the callback recieves the public_id of the uploaded image
   */
  var contextKey, find_by_attr, upload_image;
  before("Verify Configuration", function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      return expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
  });
  before(function(done) {
    this.timeout(helper.TIMEOUT_LONG);
    Q.allSettled([
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID_2,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID_5,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=test`,
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: PUBLIC_ID_6,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=alt-test`,
        eager: [EXPLICIT_TRANSFORMATION]
      })
    ]).finally(function() {
      return done();
    });
    return true;
  });
  after(function(done) {
    var config;
    this.timeout(helper.TIMEOUT_LONG);
    if (cloudinary.config().keep_test_products) {
      return done();
    } else {
      config = cloudinary.config();
      if (!(config.api_key && config.api_secret)) {
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
      }
      Q.allSettled([cloudinary.v2.api.delete_resources_by_tag(TEST_TAG), cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET1), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET2), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET3), cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4)]).finally(function() {
        return done();
      });
      return true;
    }
  });
  find_by_attr = function(elements, attr, value) {
    var element, j, len;
    for (j = 0, len = elements.length; j < len; j++) {
      element = elements[j];
      if (element[attr] === value) {
        return element;
      }
    }
    return void 0;
  };
  upload_image = function(callback) {
    cloudinary.v2.uploader.upload(IMAGE_FILE, function(error, result) {
      expect(error).to.be(void 0);
      expect(result).to.be.an(Object);
      return callback(result);
    });
    return true;
  };
  contextKey = `test-key${helper.SUFFIX}`;
  describe("resources", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources);
    it("should allow listing resource_types", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.resource_types(function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.resource_types).to.contain("image");
        return done();
      });
      return true;
    });
    it("should allow listing resources", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS
      }, function(error, result) {
        var public_id;
        if (error != null) {
          done(new Error(error.message));
        }
        public_id = result.public_id;
        cloudinary.v2.api.resources(function(error, result) {
          var resource;
          if (error != null) {
            return done(new Error(error.message));
          }
          resource = find_by_attr(result.resources, "public_id", public_id);
          expect(resource).not.to.eql(void 0);
          expect(resource.type).to.eql("upload");
          return done();
        });
        return true;
      });
      return true;
    });
    it("should allow listing resources by type", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS
      }, function(error, result) {
        var public_id;
        if (error != null) {
          return done(new Error(error.message));
        }
        public_id = result.public_id;
        cloudinary.v2.api.resources({
          type: "upload"
        }, function(error, result) {
          var resource;
          if (error != null) {
            return done(new Error(error.message));
          }
          resource = find_by_attr(result.resources, "public_id", public_id);
          expect(resource).to.be.an(Object);
          expect(resource.type).to.eql("upload");
          return done();
        });
        return true;
      });
      return true;
    });
    it("should allow listing resources by prefix", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.resources({
        type: "upload",
        prefix: PUBLIC_ID_PREFIX,
        max_results: 500
      }, function(error, result) {
        var public_ids, resource;
        if (error != null) {
          return done(new Error(error.message));
        }
        public_ids = (function() {
          var j, len, ref, results1;
          ref = result.resources;
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            resource = ref[j];
            results1.push(resource.public_id);
          }
          return results1;
        })();
        expect(public_ids).to.contain(PUBLIC_ID);
        expect(public_ids).to.contain(PUBLIC_ID_2);
        return done();
      });
      return true;
    });
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources_by_tag, TEST_TAG);
    it("should allow listing resources by tag", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.resources_by_tag(TEST_TAG, {
        context: true,
        tags: true,
        max_results: 500
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.resources.map(function(e) {
          return e.public_id;
        })).to.contain(PUBLIC_ID).and.contain(PUBLIC_ID_2);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        expect(result.resources.map(function(e) {
          if (e.context != null) {
            return e.context.custom.key;
          } else {
            return null;
          }
        })).to.contain("value");
        return done();
      });
      return true;
    });
    it("should allow listing resources by context only", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.resources_by_context(contextKey, null, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.resources).to.have.length(2);
        return done();
      });
      return true;
    });
    it("should allow listing resources by context key and value", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.resources_by_context(contextKey, "test", function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.resources).to.have.length(1);
        return done();
      });
      return true;
    });
    it("should allow listing resources by public ids", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.resources_by_ids([PUBLIC_ID, PUBLIC_ID_2], {
        context: true,
        tags: true
      }, function(error, result) {
        var resource;
        if (error != null) {
          return done(new Error(error.message));
        }
        resource = find_by_attr(result.resources, "public_id", PUBLIC_ID);
        expect(result.resources.map(function(e) {
          return e.public_id;
        }).sort()).to.eql([PUBLIC_ID, PUBLIC_ID_2]);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        expect(result.resources.map(function(e) {
          return e.context.custom.key;
        })).to.contain("value");
        return done();
      });
      return true;
    });
    it("should allow listing resources specifying direction", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.api.resources_by_tag(TEST_TAG, {
        type: "upload",
        max_results: 500,
        direction: "asc"
      }, (error, result) => {
        var asc, resource;
        if (error != null) {
          return done(new Error(error.message));
        }
        asc = (function() {
          var j, len, ref, results1;
          ref = result.resources;
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            resource = ref[j];
            results1.push(resource.public_id);
          }
          return results1;
        })();
        cloudinary.v2.api.resources_by_tag(TEST_TAG, {
          type: "upload",
          max_results: 500,
          direction: "desc"
        }, function(error, result) {
          var desc;
          if (error != null) {
            return done(new Error(error.message));
          }
          desc = (function() {
            var j, len, ref, results1;
            ref = result.resources;
            results1 = [];
            for (j = 0, len = ref.length; j < len; j++) {
              resource = ref[j];
              results1.push(resource.public_id);
            }
            return results1;
          })();
          expect(asc.reverse()).to.eql(desc);
          return done();
        });
        return true;
      });
      return true;
    });
    it("should allow listing resources by start_at", function(done) {
      var requestSpy, start_at, writeSpy, xhr;
      xhr = sinon.useFakeXMLHttpRequest();
      writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      requestSpy = sinon.spy(http, 'request');
      start_at = new Date().toString();
      cloudinary.v2.api.resources({
        type: "upload",
        start_at: start_at,
        direction: "asc"
      }).then(function() {
        var formatted;
        if (writeSpy.called) {
          sinon.assert.calledWith(writeSpy, sinon.match(/stazdfasrt_at=10/));
        } else {
          formatted = encodeURIComponent(start_at.slice(0, start_at.search("\\("))); // cut the date string before the '('
        }
        return done();
      }).fail(function(error) {
        return done(error);
      }).finally(function() {
        writeSpy.restore();
        requestSpy.restore();
        return xhr.restore();
      });
      return true;
    });
    return it("should allow get resource metadata", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS,
        eager: [EXPLICIT_TRANSFORMATION]
      }, function(error, result) {
        var public_id;
        if (error != null) {
          done(new Error(error.message));
        }
        public_id = result.public_id;
        cloudinary.v2.api.resource(public_id, function(error, resource) {
          if (error != null) {
            done(new Error(error.message));
          }
          expect(resource).not.to.eql(void 0);
          expect(resource.public_id).to.eql(public_id);
          expect(resource.bytes).to.eql(3381);
          expect(resource.derived).to.have.length(1);
          return done();
        });
        return true;
      });
      return true;
    });
  });
  describe("delete", function() {
    it("should allow deleting derived resource", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        tags: UPLOAD_TAGS,
        eager: [
          {
            width: 101,
            crop: "scale"
          }
        ]
      }, function(error, r) {
        var public_id;
        if (error != null) {
          return done(new Error(error.message));
        }
        public_id = r.public_id;
        cloudinary.v2.api.resource(public_id, function(error, resource) {
          var derived_resource_id;
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(resource).not.to.eql(void 0);
          expect(resource.bytes).to.eql(3381);
          expect(resource.derived).to.have.length(1);
          derived_resource_id = resource.derived[0].id;
          cloudinary.v2.api.delete_derived_resources(derived_resource_id, function(error, r) {
            if (error != null) {
              return done(new Error(error.message));
            }
            cloudinary.v2.api.resource(public_id, function(error, resource) {
              if (error != null) {
                return done(new Error(error.message));
              }
              expect(resource).not.to.eql(void 0);
              expect(resource.derived).to.have.length(0);
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
    it("should allow deleting derived resources by transformations", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      Q.all([
        cloudinary.v2.uploader.upload(IMAGE_FILE,
        {
          public_id: PUBLIC_ID_1,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION]
        }),
        cloudinary.v2.uploader.upload(IMAGE_FILE,
        {
          public_id: PUBLIC_ID_2,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION2]
        }),
        cloudinary.v2.uploader.upload(IMAGE_FILE,
        {
          public_id: PUBLIC_ID_3,
          tags: UPLOAD_TAGS,
          eager: [EXPLICIT_TRANSFORMATION,
        EXPLICIT_TRANSFORMATION2]
        })
      ]).then(function(results) {
        return cloudinary.v2.api.delete_derived_by_transformation([PUBLIC_ID_1, PUBLIC_ID_3], [EXPLICIT_TRANSFORMATION, EXPLICIT_TRANSFORMATION2], function(error, result) {
          cloudinary.v2.api.resource(PUBLIC_ID_1, function(error, result) {
            return expect(result.derived.length).to.eql(0);
          });
          cloudinary.v2.api.resource(PUBLIC_ID_2, function(error, result) {
            return expect(find(result.derived, function(d) {
              return d.transformation === EXPLICIT_TRANSFORMATION_NAME2;
            })).to.not.be.empty();
          });
          return cloudinary.v2.api.resource(PUBLIC_ID_3, function(error, result) {
            expect(result.derived.length).to.eql(0);
            return done();
          });
        });
      });
      return true;
    });
    it("should allow deleting resources", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        public_id: PUBLIC_ID_3,
        tags: UPLOAD_TAGS
      }, function(error, r) {
        if (error != null) {
          return done(new Error(error.message));
        }
        cloudinary.v2.api.resource(PUBLIC_ID_3, function(error, resource) {
          expect(resource).not.to.eql(void 0);
          cloudinary.v2.api.delete_resources(["apit_test", PUBLIC_ID_2, PUBLIC_ID_3], function(error, result) {
            if (error != null) {
              return done(new Error(error.message));
            }
            cloudinary.v2.api.resource(PUBLIC_ID_3, function(error, result) {
              expect(error).to.be.an(Object);
              expect(error.http_code).to.eql(404);
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
    describe("delete_resources_by_prefix", function() {
      itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, "prefix_foobar");
      return it("should allow deleting resources by prefix", function(done) {
        this.timeout(helper.TIMEOUT_MEDIUM);
        cloudinary.v2.uploader.upload(IMAGE_FILE, {
          public_id: "api_test_by_prefix",
          tags: UPLOAD_TAGS
        }, function(error, r) {
          if (error != null) {
            return done(new Error(error.message));
          }
          cloudinary.v2.api.resource("api_test_by_prefix", function(error, resource) {
            expect(resource).not.to.eql(void 0);
            cloudinary.v2.api.delete_resources_by_prefix("api_test_by", function() {
              cloudinary.v2.api.resource("api_test_by_prefix", function(error, result) {
                expect(error).to.be.an(Object);
                expect(error.http_code).to.eql(404);
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
    });
    return describe("delete_resources_by_tag", function() {
      var deleteTestTag;
      deleteTestTag = TEST_TAG + "_delete";
      itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_resources_by_prefix, deleteTestTag);
      return it("should allow deleting resources by tags", function(done) {
        this.timeout(helper.TIMEOUT_MEDIUM);
        cloudinary.v2.uploader.upload(IMAGE_FILE, {
          public_id: PUBLIC_ID_4,
          tags: UPLOAD_TAGS.concat([deleteTestTag])
        }, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          cloudinary.v2.api.resource(PUBLIC_ID_4, function(error, resource) {
            expect(resource).to.be.ok();
            cloudinary.v2.api.delete_resources_by_tag(deleteTestTag, function(error, result) {
              if (error != null) {
                return done(new Error(error.message));
              }
              cloudinary.v2.api.resource(PUBLIC_ID_4, function(error, result) {
                expect(error).to.be.an(Object);
                expect(error.http_code).to.eql(404);
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
    });
  });
  describe("tags", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.tags);
    it("should allow listing tags", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.tags({
        max_results: 500
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.tags).to.contain(TEST_TAG);
        return done();
      });
      return true;
    });
    it("should allow listing tag by prefix ", (done) => {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.tags({
        prefix: TEST_TAG.slice(0, -1),
        max_results: 500
      }, (error, result) => {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.tags).to.contain(TEST_TAG);
        return done();
      });
      return true;
    });
    return it("should allow listing tag by prefix if not found", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.tags({
        prefix: "api_test_no_such_tag"
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.tags).to.be.empty();
        return done();
      });
      return true;
    });
  });
  describe("transformations", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.transformation, EXPLICIT_TRANSFORMATION_NAME);
    itBehavesLike("a list with a cursor", cloudinary.v2.api.transformations);
    it("should allow listing transformations", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.transformations(function(error, result) {
        var previous_cursor, transformation;
        if (error != null) {
          return done(new Error(error.message));
        }
        transformation = find_by_attr(result.transformations, "name", EXPLICIT_TRANSFORMATION_NAME);
        expect(result.next_cursor).not.to.be.empty();
        expect(transformation).not.to.eql(void 0);
        expect(transformation.used).to.be.ok;
        previous_cursor = result.next_cursor;
        return cloudinary.v2.api.transformations({
          next_cursor: result.next_cursor
        }, function(error, result) {
          expect(result).not.to.be.empty();
          expect(result.next_cursor).not.to.eql(previous_cursor);
          return done();
        });
      });
      return true;
    });
    it("should allow getting transformation metadata", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME, function(error, transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION]);
        return done();
      });
      return true;
    });
    it("should allow getting transformation metadata by info", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION, function(error, transformation) {
        expect(transformation).not.to.eql(void 0);
        expect(transformation.info).to.eql([EXPLICIT_TRANSFORMATION]);
        return done();
      });
      return true;
    });
    it("should allow updating transformation allowed_for_strict", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {
        allowed_for_strict: true
      }, function() {
        cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME, function(error, transformation) {
          expect(transformation).not.to.eql(void 0);
          expect(transformation.allowed_for_strict).to.be.ok;
          cloudinary.v2.api.update_transformation(EXPLICIT_TRANSFORMATION_NAME, {
            allowed_for_strict: false
          }, function() {
            cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME, function(error, transformation) {
              expect(transformation).not.to.eql(void 0);
              expect(transformation.allowed_for_strict).not.to.be.ok;
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
    it("should allow creating named transformation", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.create_transformation(NAMED_TRANSFORMATION, {
        crop: "scale",
        width: 102
      }, function() {
        cloudinary.v2.api.transformation(NAMED_TRANSFORMATION, function(error, transformation) {
          expect(transformation).not.to.eql(void 0);
          expect(transformation.allowed_for_strict).to.be.ok;
          expect(transformation.info).to.eql([
            {
              crop: "scale",
              width: 102
            }
          ]);
          expect(transformation.used).not.to.be.ok;
          return done();
        });
        return true;
      });
      return true;
    });
    it("should allow unsafe update of named transformation", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.create_transformation("api_test_transformation3", {
        crop: "scale",
        width: 102
      }, function() {
        cloudinary.v2.api.update_transformation("api_test_transformation3", {
          unsafe_update: {
            crop: "scale",
            width: 103
          }
        }, function() {
          cloudinary.v2.api.transformation("api_test_transformation3", function(error, transformation) {
            expect(transformation).not.to.eql(void 0);
            expect(transformation.info).to.eql([
              {
                crop: "scale",
                width: 103
              }
            ]);
            expect(transformation.used).not.to.be.ok;
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
    it("should allow deleting named transformation", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.delete_transformation(NAMED_TRANSFORMATION, function() {
        cloudinary.v2.api.transformation(NAMED_TRANSFORMATION, function(error, transformation) {
          expect(error.http_code).to.eql(404);
          return done();
        });
        return true;
      });
      return true;
    });
    return it("should allow deleting implicit transformation", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME, function(error, transformation) {
        expect(transformation).to.be.an(Object);
        cloudinary.v2.api.delete_transformation(EXPLICIT_TRANSFORMATION_NAME, function() {
          cloudinary.v2.api.transformation(EXPLICIT_TRANSFORMATION_NAME, function(error, transformation) {
            expect(error.http_code).to.eql(404);
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
  });
  describe("upload_preset", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.upload_presets);
    it("should allow creating and listing upload_presets", function(done) {
      var after_create, after_delete, create_names, delete_names, validate_presets;
      this.timeout(helper.TIMEOUT_MEDIUM);
      create_names = [API_TEST_UPLOAD_PRESET3, API_TEST_UPLOAD_PRESET2, API_TEST_UPLOAD_PRESET1];
      delete_names = [];
      after_delete = function() {
        delete_names.pop();
        if (delete_names.length === 0) {
          done();
        }
        return true;
      };
      validate_presets = function() {
        cloudinary.v2.api.upload_presets(function(error, response) {
          expect(response.presets.slice(0, 3).map(function(p) {
            return p.name;
          })).to.eql(delete_names);
          return delete_names.forEach(function(name) {
            cloudinary.v2.api.delete_upload_preset(name, after_delete);
            return true;
          });
        });
        return true;
      };
      after_create = function() {
        var name;
        if (create_names.length > 0) {
          name = create_names.pop();
          delete_names.unshift(name);
          cloudinary.v2.api.create_upload_preset({
            name: name,
            folder: "folder"
          }, after_create);
          return true;
        } else {
          return validate_presets();
        }
      };
      after_create();
      return true;
    });
    it("should allow getting a single upload_preset", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.create_upload_preset({
        unsigned: true,
        folder: "folder",
        transformation: EXPLICIT_TRANSFORMATION,
        tags: ["a", "b", "c"],
        context: {
          a: "b",
          c: "d"
        }
      }, function(error, preset) {
        var name;
        name = preset.name;
        cloudinary.v2.api.upload_preset(name, function(error, preset) {
          expect(preset.name).to.eql(name);
          expect(preset.unsigned).to.eql(true);
          expect(preset.settings.folder).to.eql("folder");
          expect(preset.settings.transformation).to.eql([EXPLICIT_TRANSFORMATION]);
          expect(preset.settings.context).to.eql({
            a: "b",
            c: "d"
          });
          expect(preset.settings.tags).to.eql(["a", "b", "c"]);
          cloudinary.v2.api.delete_upload_preset(name, function() {
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
    it("should allow deleting upload_presets", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.create_upload_preset({
        name: API_TEST_UPLOAD_PRESET4,
        folder: "folder"
      }, function(error, preset) {
        cloudinary.v2.api.upload_preset(API_TEST_UPLOAD_PRESET4, function() {
          cloudinary.v2.api.delete_upload_preset(API_TEST_UPLOAD_PRESET4, function() {
            cloudinary.v2.api.upload_preset(API_TEST_UPLOAD_PRESET4, function(error, result) {
              expect(error.message).to.contain("Can't find");
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
    return it("should allow updating upload_presets", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      cloudinary.v2.api.create_upload_preset({
        folder: "folder"
      }, function(error, preset) {
        var name;
        name = preset.name;
        cloudinary.v2.api.upload_preset(name, function(error, preset) {
          cloudinary.v2.api.update_upload_preset(name, merge(preset.settings, {
            colors: true,
            unsigned: true,
            disallow_public_id: true
          }), function(error, preset) {
            cloudinary.v2.api.upload_preset(name, function(error, preset) {
              expect(preset.name).to.eql(name);
              expect(preset.unsigned).to.eql(true);
              expect(preset.settings).to.eql({
                folder: "folder",
                colors: true,
                disallow_public_id: true
              });
              cloudinary.v2.api.delete_upload_preset(name, function() {
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
  });
  it("should support the usage API call", function(done) {
    this.timeout(helper.TIMEOUT_MEDIUM);
    cloudinary.v2.api.usage(function(error, usage) {
      expect(usage.last_update).not.to.eql(null);
      return done();
    });
    return true;
  });
  describe("delete_all_resources", function() {
    itBehavesLike("accepts next_cursor", cloudinary.v2.api.delete_all_resources);
    return describe("keep_original: yes", function() {
      return it("should allow deleting all derived resources", function() {
        return helper.mockPromise(function(xhr, write, request) {
          var options;
          options = {
            keep_original: true
          };
          cloudinary.v2.api.delete_all_resources(options);
          sinon.assert.calledWith(request, sinon.match(function(arg) {
            return new RegExp("/resources/image/upload$").test(arg.pathname);
          }, "/resources/image/upload"));
          sinon.assert.calledWith(request, sinon.match(function(arg) {
            return "DELETE" === arg.method;
          }, "DELETE"));
          sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('keep_original', 'true'), "keep_original=true"));
          return sinon.assert.calledWith(write, sinon.match(helper.apiParamMatcher('all', 'true'), "all=true"));
        });
      });
    });
  });
  describe("update", function() {
    describe("notification url", function() {
      var request, requestSpy, requestStub, writeSpy, xhr;
      xhr = request = requestStub = requestSpy = writeSpy = void 0;
      before(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        return writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      });
      after(function() {
        writeSpy.restore();
        return xhr.restore();
      });
      return it("should support changing moderation status with notification-url", function() {
        cloudinary.v2.api.update("sample", {
          moderation_status: "approved",
          notification_url: "http://example.com"
        });
        if (writeSpy.called) {
          sinon.assert.calledWith(writeSpy, sinon.match(/notification_url=http%3A%2F%2Fexample.com/));
          return sinon.assert.calledWith(writeSpy, sinon.match(/moderation_status=approved/));
        }
      });
    });
    it("should support setting manual moderation status", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        moderation: "manual"
      }, function(error, upload_result) {
        cloudinary.v2.api.update(upload_result.public_id, {
          moderation_status: "approved"
        }, function(error, api_result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(api_result.moderation[0].status).to.eql("approved");
          return done();
        });
        return true;
      });
      return true;
    });
    it("should support requesting ocr info", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return upload_image(function(upload_result) {
        cloudinary.v2.api.update(upload_result.public_id, {
          ocr: "illegal"
        }, function(error, api_result) {
          expect(error.message).to.contain("Illegal value");
          return done();
        });
        return true;
      });
    });
    it("should support requesting raw conversion", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return upload_image(function(upload_result) {
        cloudinary.v2.api.update(upload_result.public_id, {
          raw_convert: "illegal"
        }, function(error, api_result) {
          expect(error.message).to.contain("Illegal value");
          return done();
        });
        return true;
      });
    });
    it("should support requesting categorization", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return upload_image(function(upload_result) {
        cloudinary.v2.api.update(upload_result.public_id, {
          categorization: "illegal"
        }, function(error, api_result) {
          expect(error.message).to.contain("Illegal value");
          return done();
        });
        return true;
      });
    });
    it("should support requesting detection", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return upload_image(function(upload_result) {
        cloudinary.v2.api.update(upload_result.public_id, {
          detection: "illegal"
        }, function(error, api_result) {
          expect(error.message).to.contain("Illegal value");
          return done();
        });
        return true;
      });
    });
    it("should support requesting background_removal", function(done) {
      this.timeout(helper.TIMEOUT_MEDIUM);
      return upload_image(function(upload_result) {
        cloudinary.v2.api.update(upload_result.public_id, {
          background_removal: "illegal"
        }, function(error, api_result) {
          expect(error.message).to.contain("Illegal value");
          return done();
        });
        return true;
      });
    });
    return describe("access_control", function() {
      var acl, acl_string, options;
      acl = {
        access_type: 'anonymous',
        start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
        end: '2019-03-22 00:00 +0200'
      };
      acl_string = '{"access_type":"anonymous","start":"2019-02-22T16:20:57.000Z","end":"2019-03-22 00:00 +0200"}';
      options = {
        public_id: helper.TEST_TAG,
        tags: [...helper.UPLOAD_TAGS, 'access_control_test']
      };
      return it("should allow the user to define ACL in the update parameters2", function() {
        return helper.mockPromise(function(xhr, writeSpy, requestSpy) {
          options.access_control = [acl];
          cloudinary.v2.api.update("id", options);
          return sinon.assert.calledWith(writeSpy, sinon.match(function(arg) {
            return helper.apiParamMatcher('access_control', `[${acl_string}]`)(arg);
          }));
        });
      });
    });
  });
  it("should support listing by moderation kind and value", function() {
    itBehavesLike("a list with a cursor", cloudinary.v2.api.resources_by_moderation, "manual", "approved");
    return helper.mockPromise(function(xhr, write, request) {
      return ["approved", "pending", "rejected"].forEach(function(stat) {
        var status, status2;
        status = stat;
        status2 = status;
        request.resetHistory();
        cloudinary.v2.api.resources_by_moderation("manual", status2, {
          moderations: true
        });
        sinon.assert.calledWith(request, sinon.match(function(arg) {
          return new RegExp(`/resources/image/moderations/manual/${status2}$`).test(arg != null ? arg.pathname : void 0);
        }, `/resources/image/moderations/manual/${status}`));
        return sinon.assert.calledWith(request, sinon.match(function(arg) {
          return /^moderations=true$/.test(arg != null ? arg.query : void 0);
        }, "moderations=true"));
      });
    });
  });
  // For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
  // Replace `it` with  `it.skip` below if you want to disable it.
  it("should list folders in cloudinary", function(done) {
    this.timeout(helper.TIMEOUT_LONG);
    Q.all([
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder1/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder2/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder2/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder1/test_subfolder1/item',
        tags: UPLOAD_TAGS
      }),
      cloudinary.v2.uploader.upload(IMAGE_FILE,
      {
        public_id: 'test_folder1/test_subfolder2/item',
        tags: UPLOAD_TAGS
      })
    ]).then(function(results) {
      return Q.all([cloudinary.v2.api.root_folders(), cloudinary.v2.api.sub_folders('test_folder1')]);
    }).then(function(results) {
      var folder, root, root_folders, sub_1;
      root = results[0];
      root_folders = (function() {
        var j, len, ref, results1;
        ref = root.folders;
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          folder = ref[j];
          results1.push(folder.name);
        }
        return results1;
      })();
      sub_1 = results[1];
      expect(root_folders).to.contain('test_folder1');
      expect(root_folders).to.contain('test_folder2');
      expect(sub_1.folders[0].path).to.eql('test_folder1/test_subfolder1');
      expect(sub_1.folders[1].path).to.eql('test_folder1/test_subfolder2');
      return cloudinary.v2.api.sub_folders('test_folder_not_exists');
    }).then(function(result) {
      console.log('error test_folder_not_exists should not pass to "then" handler but "catch"');
      return expect(true).to.eql(false);
    }).catch(function(err) {
      expect(err.error.message).to.eql('Can\'t find folder with path test_folder_not_exists');
      return done();
    });
    return true;
  });
  describe('.restore', function() {
    this.timeout(helper.TIMEOUT_MEDIUM);
    before(function(done) {
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        public_id: "api_test_restore",
        backup: true,
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        cloudinary.v2.api.resource("api_test_restore", function(error, resource) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(resource).not.to.be(null);
          expect(resource["bytes"]).to.eql(3381);
          cloudinary.v2.api.delete_resources("api_test_restore", function(error, resource) {
            if (error != null) {
              return done(new Error(error.message));
            }
            cloudinary.v2.api.resource("api_test_restore", function(error, resource) {
              if (error != null) {
                return done(new Error(error.message));
              }
              expect(resource).not.to.be(null);
              expect(resource["bytes"]).to.eql(0);
              expect(resource["placeholder"]).to.eql(true);
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
    return it('should restore a deleted resource', function(done) {
      cloudinary.v2.api.restore("api_test_restore", function(error, response) {
        var info;
        info = response["api_test_restore"];
        expect(info).not.to.be(null);
        expect(info["bytes"]).to.eql(3381);
        cloudinary.v2.api.resource("api_test_restore", function(error, resource) {
          expect(resource).not.to.be(null);
          expect(resource["bytes"]).to.eql(3381);
          return done();
        });
        return true;
      });
      return true;
    });
  });
  describe('mapping', function() {
    var deleteMapping, mapping;
    mapping = `api_test_upload_mapping${Math.floor(Math.random() * 100000)}`;
    deleteMapping = false;
    after(function(done) {
      if (deleteMapping) {
        cloudinary.v2.api.delete_upload_mapping(mapping, function(error, result) {
          return done();
        });
        return true;
      } else {
        return done();
      }
    });
    itBehavesLike("a list with a cursor", cloudinary.v2.api.upload_mappings);
    return it('should create mapping', function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.api.create_upload_mapping(mapping, {
        template: "http://cloudinary.com",
        tags: UPLOAD_TAGS
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        deleteMapping = true;
        cloudinary.v2.api.upload_mapping(mapping, function(error, result) {
          if (error != null) {
            return done(new Error(error.message));
          }
          expect(result['template']).to.eql("http://cloudinary.com");
          cloudinary.v2.api.update_upload_mapping(mapping, {
            template: "http://res.cloudinary.com"
          }, function(error, result) {
            if (error != null) {
              return done(new Error(error.message));
            }
            cloudinary.v2.api.upload_mapping(mapping, function(error, result) {
              if (error != null) {
                return done(new Error(error.message));
              }
              expect(result["template"]).to.eql("http://res.cloudinary.com");
              cloudinary.v2.api.upload_mappings(function(error, result) {
                if (error != null) {
                  return done(new Error(error.message));
                }
                expect(find(result["mappings"], {
                  folder: mapping,
                  template: "http://res.cloudinary.com"
                })).to.be.ok();
                cloudinary.v2.api.delete_upload_mapping(mapping, function(error, result) {
                  if (error != null) {
                    return done(new Error(error.message));
                  }
                  deleteMapping = false;
                  cloudinary.v2.api.upload_mappings(function(error, result) {
                    if (error != null) {
                      return done(new Error(error.message));
                    }
                    expect(find(result["mappings"], matchesProperty('folder', mapping))).not.to.be.ok();
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
      return true;
    });
  });
  describe("publish", function() {
    var i, idsToDelete, publishTestId, publishTestTag;
    this.timeout(helper.TIMEOUT_LONG);
    i = 0;
    publishTestId = "";
    publishTestTag = "";
    idsToDelete = [];
    beforeEach(function(done) {
      publishTestTag = TEST_TAG + i++;
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        type: "authenticated",
        tags: UPLOAD_TAGS.concat([publishTestTag])
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        publishTestId = result.public_id;
        idsToDelete.push(publishTestId);
        return done();
      });
      return true;
    });
    after(function(done) {
      // cleanup any resource that were not published
      cloudinary.v2.api.delete_resources(idsToDelete, {
        type: "authenticated"
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        return done();
      });
      return true;
    });
    it("should publish by public id", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.api.publish_by_ids([publishTestId], {
        type: "authenticated"
      }, function(error, result) {
        var published;
        if (error != null) {
          return done(new Error(error.message));
        }
        published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        expect(published[0].url).to.match(/\/upload\//);
        return done();
      });
      return true;
    });
    it("should publish by prefix", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.api.publish_by_prefix(publishTestId.slice(0, -1), function(error, result) {
        var published;
        if (error != null) {
          return done(new Error(error.message));
        }
        published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        expect(published[0].url).to.match(/\/upload\//);
        return done();
      });
      return true;
    });
    it("should publish by tag", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.api.publish_by_tag(publishTestTag, function(error, result) {
        var published;
        if (error != null) {
          return done(new Error(error.message));
        }
        published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(1);
        expect(published[0].public_id).to.eql(publishTestId);
        expect(published[0].url).to.match(/\/upload\//);
        return done();
      });
      return true;
    });
    return it("should return empty when explicit given type doesn't match resource", function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      cloudinary.v2.api.publish_by_ids([publishTestId], {
        type: "private"
      }, function(error, result) {
        var published;
        if (error != null) {
          return done(new Error(error.message));
        }
        published = result.published;
        expect(published).not.to.be(null);
        expect(published.length).to.be(0);
        return done();
      });
      return true;
    });
  });
  return describe("access_mode", function() {
    var access_mode_tag, i, publicId;
    i = 0;
    this.timeout(helper.TIMEOUT_LONG);
    publicId = "";
    access_mode_tag = '';
    beforeEach(function(done) {
      access_mode_tag = TEST_TAG + "access_mode" + i++;
      cloudinary.v2.uploader.upload(IMAGE_FILE, {
        access_mode: "authenticated",
        tags: UPLOAD_TAGS.concat([access_mode_tag])
      }, function(error, result) {
        if (error != null) {
          return done(new Error(error.message));
        }
        publicId = result.public_id;
        expect(result.access_mode).to.be("authenticated");
        return done();
      });
      return true;
    });
    it("should update access mode by ids", function(done) {
      cloudinary.v2.api.update_resources_access_mode_by_ids("public", [publicId], function(error, result) {
        var resource;
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.updated).to.be.an('array');
        expect(result.updated.length).to.be(1);
        resource = result.updated[0];
        expect(resource.public_id).to.be(publicId);
        expect(resource.access_mode).to.be('public');
        return done();
      });
      return true;
    });
    it("should update access mode by prefix", function(done) {
      cloudinary.v2.api.update_resources_access_mode_by_prefix("public", publicId.slice(0, -2), function(error, result) {
        var resource;
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.updated).to.be.an('array');
        expect(result.updated.length).to.be(1);
        resource = result.updated[0];
        expect(resource.public_id).to.be(publicId);
        expect(resource.access_mode).to.be('public');
        return done();
      });
      return true;
    });
    return it("should update access mode by tag", function(done) {
      cloudinary.v2.api.update_resources_access_mode_by_tag("public", access_mode_tag, function(error, result) {
        var resource;
        if (error != null) {
          return done(new Error(error.message));
        }
        expect(result.updated).to.be.an('array');
        expect(result.updated.length).to.be(1);
        resource = result.updated[0];
        expect(resource.public_id).to.be(publicId);
        expect(resource.access_mode).to.be('public');
        return done();
      });
      return true;
    });
  });
});
