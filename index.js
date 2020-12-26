const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
    // `who-to-greet` input defined in action metadata file
        const myToken = core.getInput('github-token')
        const octokit = github.getOctokit(myToken)
        const labelDict = core.getInput('keyword-labels')
        const time = (new Date()).toTimeString();

        const payload = JSON.stringify(github.context.payload, undefined, 2);
        var ourIssueOrPR = github.context.payload.issue;
        if (ourIssueOrPR == null) {
            ourIssueOrPR = github.context.payload.pull_request;}

        let fetchedTitle = ourIssueOrPR.title.slice().toLowerCase();
        let fetchedBody = ourIssueOrPR.body.slice().toLowerCase();

        var labels = [];
        for (key in labelDict) {

        }

        octokit.issues.addLabels({
            issue: ourIssueOrPR, 
            labels: labels
        })

        core.setOutput("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()