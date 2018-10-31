module.exports = Number(process.versions.node[0]) < 8 ? require('./lib-node4/cloudinary') : require('./lib/cloudinary');
