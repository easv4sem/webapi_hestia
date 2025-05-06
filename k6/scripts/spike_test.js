import http from 'k6/http';

export const options = {
    insecureSkipTLSVerify: true,
    noConnectionReuse: false,
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '30s', target: 0 },
    ],



    thresholds: {
        http_req_duration: ['p(95)<500'], // 95 percent of response times must be below 500ms
        http_req_failed: ['rate<0.01'], // Max 1% of requests may fail
    },

};

export default () => {

    const url = 'http://middleware:3000/api/devices/';
    http.get(url + "id/1", {
        headers: { 'Content-Type': 'application/json' },
    });
};