const config = ({ placeId, query, longlat }) => {
    return (data = JSON.stringify({
        q: query,
        hl: 'vi',
        ll: longlat,
        placeId: placeId,
    }))
}

const distanceMatrixAPI = ({
    originLong,
    originLat,
    destinationLong,
    destinationLat,
}) => {
    return `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${originLat},${originLong},&destinations=${destinationLat},${destinationLong}&key=${global.config.get(
        'DISTANCE_MATRIX_API_KEY'
    )}`
}

const getDetailPlace = async (placeId) => {
    var myHeaders = new Headers()
    myHeaders.append('X-API-KEY', global.config.get('PLACE_X_API_KEY'))
    myHeaders.append('Content-Type', 'application/json')

    var raw = config({ placeId: placeId })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
    }

    try {
        var response = await fetch(
            global.config.get('PLACE_URL'),
            requestOptions
        )
        var result = await response.json()
    } catch (error) {
        console.log('error', error)
    }

    return result
}

const getDistanceToPlace = async (
    originLong,
    originLat,
    destinationLong,
    destinationLat
) => {
    const url = distanceMatrixAPI({
        originLong,
        originLat,
        destinationLong,
        destinationLat,
    })
    // fetch url
    try {
        var response = await fetch(url)
        var result = await response.json()
        return result.rows.elements[0]
    } catch (error) {
        console.log('error', error)
    }
}

module.exports = {
    getDetailPlace,
    getDistanceToPlace,
}
