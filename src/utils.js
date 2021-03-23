
/*
This function to valid if it is a number
*/
export const validatorNumber = (rule, value) => {
    let reg = /^[0-9]+.?[0-9]*$/;
    if (value) {
        if (reg.test(value)) {
            return Promise.resolve()
        } else if (!reg.test(value)) {
            return Promise.reject('Input only be number')
        }
    } else {
        return Promise.resolve()
    }
}

/*
This is the recommendation algorithm
*/
//get input weight to calculate each repo's value
const getValue = (timeWei, issuesWei, forkWei, data) => {
    let result = [];
    data.forEach(item => {
        let timeValue = timeWei * ((new Date().getTime() - new Date(item.updated_at).getTime()) / (24 * 60 * 60 * 1000));
        result.push({
            repoName: item.name,
            value: timeValue + issuesWei * item.open_issues + forkWei * item.forks
        })
    })
    return result
}

const formatParams = (timeWei, issuesWei, forkWei) => {
    timeWei = timeWei ? parseFloat(timeWei) : 0;
    issuesWei = issuesWei ? parseFloat(issuesWei) : 0;
    forkWei = forkWei ? parseFloat(forkWei) : 0;
    return { t: timeWei, i: issuesWei, f: forkWei}
}

//softmax function convert value to probility, return top 5
export const softmax = (timeWei, issuesWei, forkWei, data) => {
    let {t, i, f} = formatParams(timeWei, issuesWei, forkWei);
    let result = getValue(t, i, f, data) || []
    let totalExp = 0;
    result.forEach(item => {
        let repoExp = isNaN(parseFloat(Math.exp(item.value.toFixed(2)).toString().substr(0,3))) ? 0 : parseFloat(Math.exp(item.value.toFixed(2)).toString().substr(0,3));
        totalExp += repoExp;
        item.value = repoExp;
    })

    result.forEach(item => {
        item.value = (item.value / totalExp).toFixed(6);
    })
    return result.sort((a, b) => b.value - a.value).slice(0, 5)
}
