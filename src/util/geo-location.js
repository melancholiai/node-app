const express = requier('express');
const { getDistance } = require('geolib');


module.exports.getCurrentLocation = () => {

    return [32.099819, 34.801985];
};

// returns distance in meters.
module.exports.calculateDistance = (pointA, pointB) => {
    // const distance = getDistance(
    //     { latitude: 32.095960, longitude: 34.779710 },
    //     { latitude: 32.096342, longitude: 34.784573 }
    // );
    const distance = getDistance({ pointA }, { pointB });
    return distance;
};