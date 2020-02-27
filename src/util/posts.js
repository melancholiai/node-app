const { calculateDistance } = require('./geo-location');
const Post = require('../models/post');


module.exports.getFilteredPosts = (filter) => {
    // pointA post location
    // pointB user location
    
    await Post.find().where( (calculateDistance(pointA, pointB) < filter.radius) );
}