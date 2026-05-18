2026-05-18T15:42:05.4927157Z Current runner version: '2.334.0'
2026-05-18T15:42:05.5003124Z ##[group]Runner Image Provisioner
2026-05-18T15:42:05.5004445Z Hosted Compute Agent
2026-05-18T15:42:05.5005322Z Version: 20260213.493
2026-05-18T15:42:05.5006333Z Commit: 5c115507f6dd24b8de37d8bbe0bb4509d0cc0fa3
2026-05-18T15:42:05.5007742Z Build Date: 2026-02-13T00:28:41Z
2026-05-18T15:42:05.5008834Z Worker ID: {a6b15e4a-2f5b-4c1d-bc2c-85ff8b4eb819}
2026-05-18T15:42:05.5009998Z Azure Region: eastus
2026-05-18T15:42:05.5011136Z ##[endgroup]
2026-05-18T15:42:05.5014273Z ##[group]Operating System
2026-05-18T15:42:05.5015245Z Ubuntu
2026-05-18T15:42:05.5016128Z 24.04.4
2026-05-18T15:42:05.5016981Z LTS
2026-05-18T15:42:05.5017737Z ##[endgroup]
2026-05-18T15:42:05.5018778Z ##[group]Runner Image
2026-05-18T15:42:05.5019703Z Image: ubuntu-24.04
2026-05-18T15:42:05.5020622Z Version: 20260513.135.3
2026-05-18T15:42:05.5043128Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20260513.135/images/ubuntu/Ubuntu2404-Readme.md
2026-05-18T15:42:05.5045879Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20260513.135
2026-05-18T15:42:05.5047517Z ##[endgroup]
2026-05-18T15:42:05.5049458Z ##[group]GITHUB_TOKEN Permissions
2026-05-18T15:42:05.5052972Z Contents: write
2026-05-18T15:42:05.5053918Z Metadata: read
2026-05-18T15:42:05.5054764Z PullRequests: write
2026-05-18T15:42:05.5055857Z ##[endgroup]
2026-05-18T15:42:05.5058929Z Secret source: Actions
2026-05-18T15:42:05.5060515Z Prepare workflow directory
2026-05-18T15:42:05.6294157Z Prepare all required actions
2026-05-18T15:42:05.6402183Z Getting action download info
2026-05-18T15:42:06.1082012Z Download action repository 'actions/checkout@v4' (SHA:34e114876b0b11c390a56381ad16ebd13914f8d5)
2026-05-18T15:42:06.2615042Z Download action repository 'oven-sh/setup-bun@v1' (SHA:f4d14e03ff726c06358e5557344e1da148b56cf7)
2026-05-18T15:42:06.4235608Z Download action repository 'actions/github-script@v7' (SHA:f28e40c7f34bde8b3046d885e986cb6290c5673b)
2026-05-18T15:42:06.6135099Z Download action repository 'stefanzweifel/git-auto-commit-action@v5' (SHA:b863ae1933cb653a53c021fe36dbb774e1fb9403)
2026-05-18T15:42:06.8635319Z Complete job name: doctor
2026-05-18T15:42:06.9381898Z ##[group]Run actions/checkout@v4
2026-05-18T15:42:06.9382846Z with:
2026-05-18T15:42:06.9383232Z   fetch-depth: 0
2026-05-18T15:42:06.9383660Z   repository: HisetteTom/pimp
2026-05-18T15:42:06.9384383Z   token: ***
2026-05-18T15:42:06.9384769Z   ssh-strict: true
2026-05-18T15:42:06.9385164Z   ssh-user: git
2026-05-18T15:42:06.9385561Z   persist-credentials: true
2026-05-18T15:42:06.9386008Z   clean: true
2026-05-18T15:42:06.9386519Z   sparse-checkout-cone-mode: true
2026-05-18T15:42:06.9387004Z   fetch-tags: false
2026-05-18T15:42:06.9387400Z   show-progress: true
2026-05-18T15:42:06.9387811Z   lfs: false
2026-05-18T15:42:06.9388179Z   submodules: false
2026-05-18T15:42:06.9388585Z   set-safe-directory: true
2026-05-18T15:42:06.9389254Z env:
2026-05-18T15:42:06.9389622Z   NO_COLOR: 1
2026-05-18T15:42:06.9390013Z ##[endgroup]
2026-05-18T15:42:07.0654054Z Syncing repository: HisetteTom/pimp
2026-05-18T15:42:07.0656284Z ##[group]Getting Git version info
2026-05-18T15:42:07.0657052Z Working directory is '/home/runner/work/pimp/pimp'
2026-05-18T15:42:07.0658681Z [command]/usr/bin/git version
2026-05-18T15:42:07.0702003Z git version 2.54.0
2026-05-18T15:42:07.0733011Z ##[endgroup]
2026-05-18T15:42:07.0750790Z Temporarily overriding HOME='/home/runner/work/_temp/0aedcd55-c2a0-409f-bb29-8fefe0bbd962' before making global git config changes
2026-05-18T15:42:07.0754466Z Adding repository directory to the temporary git global config as a safe directory
2026-05-18T15:42:07.0759672Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/pimp/pimp
2026-05-18T15:42:07.0825986Z Deleting the contents of '/home/runner/work/pimp/pimp'
2026-05-18T15:42:07.0828400Z ##[group]Initializing the repository
2026-05-18T15:42:07.0830033Z [command]/usr/bin/git init /home/runner/work/pimp/pimp
2026-05-18T15:42:07.0937830Z hint: Using 'master' as the name for the initial branch. This default branch name
2026-05-18T15:42:07.0940789Z hint: will change to "main" in Git 3.0. To configure the initial branch name
2026-05-18T15:42:07.0942616Z hint: to use in all of your new repositories, which will suppress this warning,
2026-05-18T15:42:07.0945456Z hint: call:
2026-05-18T15:42:07.0947031Z hint:
2026-05-18T15:42:07.0948207Z hint: 	git config --global init.defaultBranch <name>
2026-05-18T15:42:07.0951467Z hint:
2026-05-18T15:42:07.0952766Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2026-05-18T15:42:07.0954421Z hint: 'development'. The just-created branch can be renamed via this command:
2026-05-18T15:42:07.0955657Z hint:
2026-05-18T15:42:07.0956324Z hint: 	git branch -m <name>
2026-05-18T15:42:07.0957041Z hint:
2026-05-18T15:42:07.0958002Z hint: Disable this message with "git config set advice.defaultBranchName false"
2026-05-18T15:42:07.0959510Z Initialized empty Git repository in /home/runner/work/pimp/pimp/.git/
2026-05-18T15:42:07.0966308Z [command]/usr/bin/git remote add origin https://github.com/HisetteTom/pimp
2026-05-18T15:42:07.1011406Z ##[endgroup]
2026-05-18T15:42:07.1013728Z ##[group]Disabling automatic garbage collection
2026-05-18T15:42:07.1016800Z [command]/usr/bin/git config --local gc.auto 0
2026-05-18T15:42:07.1050854Z ##[endgroup]
2026-05-18T15:42:07.1052878Z ##[group]Setting up auth
2026-05-18T15:42:07.1058941Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-05-18T15:42:07.1096704Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-05-18T15:42:07.1445808Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-05-18T15:42:07.1480206Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-05-18T15:42:07.1720457Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-05-18T15:42:07.1757103Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-05-18T15:42:07.2016650Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
2026-05-18T15:42:07.2063226Z ##[endgroup]
2026-05-18T15:42:07.2065044Z ##[group]Fetching the repository
2026-05-18T15:42:07.2075261Z [command]/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/*
2026-05-18T15:42:07.5309078Z From https://github.com/HisetteTom/pimp
2026-05-18T15:42:07.5311324Z  * [new branch]      main       -> origin/main
2026-05-18T15:42:07.5314013Z  * [new branch]      test       -> origin/test
2026-05-18T15:42:07.5358859Z [command]/usr/bin/git branch --list --remote origin/test
2026-05-18T15:42:07.5389607Z   origin/test
2026-05-18T15:42:07.5400824Z [command]/usr/bin/git rev-parse refs/remotes/origin/test
2026-05-18T15:42:07.5425439Z b5245c1c2925ccd9aad8c255d78a3030a02227f4
2026-05-18T15:42:07.5433455Z ##[endgroup]
2026-05-18T15:42:07.5435943Z ##[group]Determining the checkout info
2026-05-18T15:42:07.5438088Z ##[endgroup]
2026-05-18T15:42:07.5463039Z [command]/usr/bin/git sparse-checkout disable
2026-05-18T15:42:07.5509379Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2026-05-18T15:42:07.5575926Z ##[group]Checking out the ref
2026-05-18T15:42:07.5578140Z [command]/usr/bin/git checkout --progress --force -B test refs/remotes/origin/test
2026-05-18T15:42:07.5676721Z Switched to a new branch 'test'
2026-05-18T15:42:07.5680293Z branch 'test' set up to track 'origin/test'.
2026-05-18T15:42:07.5689708Z ##[endgroup]
2026-05-18T15:42:07.5734547Z [command]/usr/bin/git log -1 --format=%H
2026-05-18T15:42:07.5761061Z b5245c1c2925ccd9aad8c255d78a3030a02227f4
2026-05-18T15:42:07.6001154Z ##[group]Run oven-sh/setup-bun@v1
2026-05-18T15:42:07.6002206Z with:
2026-05-18T15:42:07.6002678Z   bun-version: latest
2026-05-18T15:42:07.6003121Z   no-cache: false
2026-05-18T15:42:07.6003521Z env:
2026-05-18T15:42:07.6003887Z   NO_COLOR: 1
2026-05-18T15:42:07.6004281Z ##[endgroup]
2026-05-18T15:42:07.7218752Z Downloading a new version of Bun: https://bun.sh/download/latest/linux/x64?avx2=true&profile=false
2026-05-18T15:42:08.3210067Z [command]/usr/bin/unzip -o -q /home/runner/work/_temp/2bf5b9b5-6491-475c-8e30-db01648d82b9
2026-05-18T15:42:09.0202850Z [command]/home/runner/.bun/bin/bun --revision
2026-05-18T15:42:09.0206494Z 1.3.14+0d9b296af
2026-05-18T15:42:09.0402722Z ##[group]Run # Run react-doctor and save human-readable report
2026-05-18T15:42:09.0404770Z [36;1m# Run react-doctor and save human-readable report[0m
2026-05-18T15:42:09.0406930Z [36;1mbunx react-doctor@latest . --project pimp --fail-on none -y > report.txt 2>&1[0m
2026-05-18T15:42:09.0408870Z [36;1m[0m
2026-05-18T15:42:09.0410186Z [36;1m# Run with --json to temp file, redirecting stderr to avoid noise[0m
2026-05-18T15:42:09.0412804Z [36;1mbunx react-doctor@latest . --project pimp --json -y > raw_result.json 2>/dev/null[0m
2026-05-18T15:42:09.0414770Z [36;1m[0m
2026-05-18T15:42:09.0415691Z [36;1m# Extract only the JSON part[0m
2026-05-18T15:42:09.0417081Z [36;1msed -n '/{/,$p' raw_result.json > result.json[0m
2026-05-18T15:42:09.0418470Z [36;1m[0m
2026-05-18T15:42:09.0419439Z [36;1m# Extract score with fallback paths[0m
2026-05-18T15:42:09.0421259Z [36;1mSCORE=$(jq '.summary.score // .projects[0].score.score // 0' result.json)[0m
2026-05-18T15:42:09.0423492Z [36;1mecho "score=$SCORE" >> $GITHUB_OUTPUT[0m
2026-05-18T15:42:09.0424784Z [36;1m[0m
2026-05-18T15:42:09.0425723Z [36;1m# Prepare clean report for PR comment[0m
2026-05-18T15:42:09.0427056Z [36;1m# Start from the version header[0m
2026-05-18T15:42:09.0428649Z [36;1mREPORT=$(sed -n '/react-doctor/,$p' report.txt || cat report.txt)[0m
2026-05-18T15:42:09.0430384Z [36;1mecho "report<<EOF" >> $GITHUB_OUTPUT[0m
2026-05-18T15:42:09.0431816Z [36;1mecho "$REPORT" >> $GITHUB_OUTPUT[0m
2026-05-18T15:42:09.0433051Z [36;1mecho "EOF" >> $GITHUB_OUTPUT[0m
2026-05-18T15:42:09.0504275Z [36;1m[0m
2026-05-18T15:42:09.0505583Z [36;1mecho "Captured Score: $SCORE"[0m
2026-05-18T15:42:09.0556777Z shell: /usr/bin/bash -e {0}
2026-05-18T15:42:09.0557850Z env:
2026-05-18T15:42:09.0558601Z   NO_COLOR: 1
2026-05-18T15:42:09.0560062Z   GITHUB_TOKEN: ***
2026-05-18T15:42:09.0560943Z   CI: true
2026-05-18T15:42:09.0562036Z ##[endgroup]
2026-05-18T15:42:12.0044656Z Captured Score: 0
2026-05-18T15:42:12.0147175Z ##[group]Run SCORE=0
2026-05-18T15:42:12.0147501Z [36;1mSCORE=0[0m
2026-05-18T15:42:12.0147693Z [36;1mCOLOR="lightgrey"[0m
2026-05-18T15:42:12.0147942Z [36;1mif [[ "$SCORE" =~ ^[0-9]+$ ]]; then[0m
2026-05-18T15:42:12.0148267Z [36;1m  if [ "$SCORE" -gt 85 ]; then COLOR="brightgreen";[0m
2026-05-18T15:42:12.0148648Z [36;1m  elif [ "$SCORE" -gt 70 ]; then COLOR="green";[0m
2026-05-18T15:42:12.0148981Z [36;1m  elif [ "$SCORE" -gt 50 ]; then COLOR="yellow";[0m
2026-05-18T15:42:12.0149296Z [36;1m  elif [ "$SCORE" -gt 25 ]; then COLOR="orange";[0m
2026-05-18T15:42:12.0149581Z [36;1m  else COLOR="red"; fi[0m
2026-05-18T15:42:12.0149800Z [36;1melse[0m
2026-05-18T15:42:12.0149978Z [36;1m  SCORE="0"[0m
2026-05-18T15:42:12.0150164Z [36;1mfi[0m
2026-05-18T15:42:12.0150318Z [36;1m[0m
2026-05-18T15:42:12.0150537Z [36;1m# Use Shields.io endpoint or simple badge. [0m
2026-05-18T15:42:12.0150902Z [36;1m# Spaces should be underscores or %20. React_Doctor is fine.[0m
2026-05-18T15:42:12.0151322Z [36;1m# Slashes in message must be encoded as %2F.[0m
2026-05-18T15:42:12.0152297Z [36;1mBADGE="[![Health Score](https://img.shields.io/badge/React_Doctor-${SCORE}%2F100-${COLOR})](https://github.com/millionco/react-doctor)"[0m
2026-05-18T15:42:12.0152891Z [36;1m[0m
2026-05-18T15:42:12.0153334Z [36;1m# Replace the badge line in README.md[0m
2026-05-18T15:42:12.0153642Z [36;1m# Match the existing badge line and swap it.[0m
2026-05-18T15:42:12.0154134Z [36;1msed -i "s@\[\!\[Health Score\].*@${BADGE} <!-- DOCTOR_BADGE_START --><!-- DOCTOR_BADGE_END -->@g" README.md[0m
2026-05-18T15:42:12.0189479Z shell: /usr/bin/bash -e {0}
2026-05-18T15:42:12.0189728Z env:
2026-05-18T15:42:12.0189922Z   NO_COLOR: 1
2026-05-18T15:42:12.0190101Z ##[endgroup]
2026-05-18T15:42:12.0366730Z ##[group]Run stefanzweifel/git-auto-commit-action@v5
2026-05-18T15:42:12.0367069Z with:
2026-05-18T15:42:12.0367329Z   commit_message: chore: update react-doctor health score [skip ci]
2026-05-18T15:42:12.0367695Z   file_pattern: README.md
2026-05-18T15:42:12.0367931Z   repository: .
2026-05-18T15:42:12.0368132Z   commit_user_name: github-actions[bot]
2026-05-18T15:42:12.0368497Z   commit_user_email: 41898282+github-actions[bot]@users.noreply.github.com
2026-05-18T15:42:12.0368962Z   commit_author: HisetteTom <144245085+HisetteTom@users.noreply.github.com>
2026-05-18T15:42:12.0369351Z   skip_dirty_check: false
2026-05-18T15:42:12.0369546Z   skip_fetch: false
2026-05-18T15:42:12.0369727Z   skip_checkout: false
2026-05-18T15:42:12.0369921Z   disable_globbing: false
2026-05-18T15:42:12.0370113Z   create_branch: false
2026-05-18T15:42:12.0370305Z   create_git_tag_only: false
2026-05-18T15:42:12.0370515Z   internal_git_binary: git
2026-05-18T15:42:12.0370712Z env:
2026-05-18T15:42:12.0370900Z   NO_COLOR: 1
2026-05-18T15:42:12.0371062Z ##[endgroup]
2026-05-18T15:42:12.0645672Z Started: bash /home/runner/work/_actions/stefanzweifel/git-auto-commit-action/v5/entrypoint.sh
2026-05-18T15:42:12.0691797Z INPUT_REPOSITORY value: .
2026-05-18T15:42:12.0692499Z INPUT_STATUS_OPTIONS: 
2026-05-18T15:42:12.0693773Z INPUT_FILE_PATTERN: README.md
2026-05-18T15:42:12.0758020Z INPUT_BRANCH value: 
2026-05-18T15:42:12.3807851Z M	README.md
2026-05-18T15:42:12.3822581Z Your branch is up to date with 'origin/test'.
2026-05-18T15:42:12.3852743Z INPUT_ADD_OPTIONS: 
2026-05-18T15:42:12.3862296Z INPUT_FILE_PATTERN: README.md
2026-05-18T15:42:12.3882363Z INPUT_COMMIT_OPTIONS: 
2026-05-18T15:42:12.3901077Z INPUT_COMMIT_USER_NAME: github-actions[bot]
2026-05-18T15:42:12.3922888Z INPUT_COMMIT_USER_EMAIL: 41898282+github-actions[bot]@users.noreply.github.com
2026-05-18T15:42:12.3945921Z INPUT_COMMIT_MESSAGE: chore: update react-doctor health score [skip ci]
2026-05-18T15:42:12.3947171Z INPUT_COMMIT_AUTHOR: HisetteTom <144245085+HisetteTom@users.noreply.github.com>
2026-05-18T15:42:12.3948317Z [test 185ec03] chore: update react-doctor health score [skip ci]
2026-05-18T15:42:12.3962593Z  Author: HisetteTom <144245085+HisetteTom@users.noreply.github.com>
2026-05-18T15:42:12.3982428Z  1 file changed, 1 insertion(+), 1 deletion(-)
2026-05-18T15:42:12.3988333Z INPUT_TAGGING_MESSAGE: 
2026-05-18T15:42:12.3989085Z No tagging message supplied. No tag will be added.
2026-05-18T15:42:12.3989899Z INPUT_PUSH_OPTIONS: 
2026-05-18T15:42:13.2619619Z To https://github.com/HisetteTom/pimp
2026-05-18T15:42:13.2632471Z    b5245c1..185ec03  test -> test
2026-05-18T15:42:13.2776459Z Post job cleanup.
2026-05-18T15:42:13.4060127Z Post job cleanup.
2026-05-18T15:42:13.5086116Z [command]/usr/bin/git version
2026-05-18T15:42:13.5128844Z git version 2.54.0
2026-05-18T15:42:13.5176719Z Temporarily overriding HOME='/home/runner/work/_temp/3fee6c78-6683-4372-bdcd-6e0d25a53210' before making global git config changes
2026-05-18T15:42:13.5178349Z Adding repository directory to the temporary git global config as a safe directory
2026-05-18T15:42:13.5184889Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/pimp/pimp
2026-05-18T15:42:13.5231075Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-05-18T15:42:13.5268570Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-05-18T15:42:13.5507274Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-05-18T15:42:13.5535906Z http.https://github.com/.extraheader
2026-05-18T15:42:13.5549839Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
2026-05-18T15:42:13.5586120Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-05-18T15:42:13.5821423Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-05-18T15:42:13.5859617Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-05-18T15:42:13.6217184Z Cleaning up orphan processes
2026-05-18T15:42:13.6482699Z ##[warning]Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/checkout@v4, oven-sh/setup-bun@v1, stefanzweifel/git-auto-commit-action@v5. Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026. Node.js 20 will be removed from the runner on September 16th, 2026. Please check if updated versions of these actions are available that support Node.js 24. To opt into Node.js 24 now, set the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true environment variable on the runner or in your workflow file. Once Node.js 24 becomes the default, you can temporarily opt out by setting ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
