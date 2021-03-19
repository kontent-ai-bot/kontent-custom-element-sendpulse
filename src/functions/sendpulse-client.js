const axios = require('axios')

exports.handler = async (event, context) => {

    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }

    const API_USER_ID = event.headers['x-api-userid'];
    if (!API_USER_ID) {
        return {
            statusCode: 401,
            body: "Missing API UserId"
        };
    }

    const API_SECRET = process.env.SENDPULSE_API_SECRET;

    if (!API_SECRET) {
        return {
            statusCode: 401,
            body: "Missing API Secret (check your function properties)"
        };
    }

    try {
        const tokenData = (await axios.post("https://api.sendpulse.com/oauth/access_token", {
            grant_type: "client_credentials",
            client_id: API_USER_ID,
            client_secret: API_SECRET
        })).data;

        const token = tokenData.access_token;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        var list = (await axios.get("https://api.sendpulse.com/addressbooks", {
            headers: headers
        })).data;

        return {
            statusCode: 200,
            body: JSON.stringify(list)
        };
    } catch (e) {
        console.log(e.data);
        return {
            statusCode: 500,
            body: JSON.stringify(e.data)
        }
    }
};