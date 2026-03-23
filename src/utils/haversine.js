function toRad(deg) {
    return (deg * Math.PI) / 180
  }
  
  // returns distance in km
  export function haversine(pointA, pointB) {
    const R = 6371
    const dLat = toRad(pointB.lat - pointA.lat)
    const dLng = toRad(pointB.lng - pointA.lng)
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(pointA.lat)) *
      Math.cos(toRad(pointB.lat)) * 
      Math.sin(dLng / 2) ** 2
  
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }