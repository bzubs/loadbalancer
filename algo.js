
function roundRobin() {
    let index = 0;
    return function roundRobinL(backends) {
        if (backends.length === 0) return null;

        const backend = backends[index];
        index = (index + 1) % backends.length;

        return backend;
    };
}


function leastConn(backends=[]){

    if(backends.length===0) return null;

    const backend = backends.reduce((a, b) => {
        return a.currentRequests < b.currentRequests ? a : b;
    })

    return backend;
}

function leastLaten(backends=[]){
    if(backends.length===0) return null;

    const backend = backends.reduce((a, b) => {
        return a.avgLatency < b.avgLatency ? a : b;
    });

    return backend;
}

function leastScore(backends=[]){
    if (backends.length == 0) return null;

    for (let i = 0; i < backends.length; i++) {
        backends[i].score = backends[i].avgLatency * (backends[i].currentRequests + 1);
    }

    const backend = backends.reduce((a, b) => {
        const scoreA = a.avgLatency * (a.currentRequests + 1);
        const scoreB = b.avgLatency * (b.currentRequests + 1);
        return scoreA < scoreB ? a : b;
    });

    return backend;
}

export {roundRobin, leastConn, leastScore, leastLaten};