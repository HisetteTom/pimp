2026-05-18T14:01:35.7261527Z Current runner version: '2.334.0'
2026-05-18T14:01:35.7337513Z ##[group]Runner Image Provisioner
2026-05-18T14:01:35.7338696Z Hosted Compute Agent
2026-05-18T14:01:35.7339650Z Version: 20260213.493
2026-05-18T14:01:35.7340891Z Commit: 5c115507f6dd24b8de37d8bbe0bb4509d0cc0fa3
2026-05-18T14:01:35.7341971Z Build Date: 2026-02-13T00:28:41Z
2026-05-18T14:01:35.7343110Z Worker ID: {a923cb90-1b8b-4162-847b-1ddcf1e94d4b}
2026-05-18T14:01:35.7344116Z Azure Region: eastus2
2026-05-18T14:01:35.7344993Z ##[endgroup]
2026-05-18T14:01:35.7347640Z ##[group]Operating System
2026-05-18T14:01:35.7348559Z Ubuntu
2026-05-18T14:01:35.7349207Z 24.04.4
2026-05-18T14:01:35.7370307Z LTS
2026-05-18T14:01:35.7371168Z ##[endgroup]
2026-05-18T14:01:35.7371868Z ##[group]Runner Image
2026-05-18T14:01:35.7372863Z Image: ubuntu-24.04
2026-05-18T14:01:35.7373584Z Version: 20260513.135.3
2026-05-18T14:01:35.7375660Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20260513.135/images/ubuntu/Ubuntu2404-Readme.md
2026-05-18T14:01:35.7377999Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20260513.135
2026-05-18T14:01:35.7379515Z ##[endgroup]
2026-05-18T14:01:35.7382066Z ##[group]GITHUB_TOKEN Permissions
2026-05-18T14:01:35.7384761Z Contents: write
2026-05-18T14:01:35.7385740Z Metadata: read
2026-05-18T14:01:35.7386443Z PullRequests: write
2026-05-18T14:01:35.7387244Z ##[endgroup]
2026-05-18T14:01:35.7410768Z Secret source: Actions
2026-05-18T14:01:35.7411862Z Prepare workflow directory
2026-05-18T14:01:35.8389354Z Prepare all required actions
2026-05-18T14:01:35.8519070Z Getting action download info
2026-05-18T14:01:36.3046169Z Download action repository 'actions/checkout@v4' (SHA:34e114876b0b11c390a56381ad16ebd13914f8d5)
2026-05-18T14:01:36.4043087Z Download action repository 'oven-sh/setup-bun@v1' (SHA:f4d14e03ff726c06358e5557344e1da148b56cf7)
2026-05-18T14:01:36.5792065Z Download action repository 'millionco/react-doctor@main' (SHA:39ae1cb2617b2c0cff8792a741f534caa178ef5f)
2026-05-18T14:01:36.9138997Z Download action repository 'stefanzweifel/git-auto-commit-action@v5' (SHA:b863ae1933cb653a53c021fe36dbb774e1fb9403)
2026-05-18T14:01:37.1332630Z Getting action download info
2026-05-18T14:01:37.3987955Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
2026-05-18T14:01:37.4981087Z Download action repository 'actions/github-script@v7' (SHA:f28e40c7f34bde8b3046d885e986cb6290c5673b)
2026-05-18T14:01:37.7692167Z Getting action download info
2026-05-18T14:01:38.0675740Z Complete job name: doctor
2026-05-18T14:01:38.1546246Z ##[group]Run actions/checkout@v4
2026-05-18T14:01:38.1547451Z with:
2026-05-18T14:01:38.1548154Z   fetch-depth: 0
2026-05-18T14:01:38.1548940Z   repository: HisetteTom/pimp
2026-05-18T14:01:38.1550535Z   token: ***
2026-05-18T14:01:38.1551269Z   ssh-strict: true
2026-05-18T14:01:38.1552019Z   ssh-user: git
2026-05-18T14:01:38.1552794Z   persist-credentials: true
2026-05-18T14:01:38.1553671Z   clean: true
2026-05-18T14:01:38.1554457Z   sparse-checkout-cone-mode: true
2026-05-18T14:01:38.1555413Z   fetch-tags: false
2026-05-18T14:01:38.1556176Z   show-progress: true
2026-05-18T14:01:38.1556949Z   lfs: false
2026-05-18T14:01:38.1557670Z   submodules: false
2026-05-18T14:01:38.1558451Z   set-safe-directory: true
2026-05-18T14:01:38.1559591Z ##[endgroup]
2026-05-18T14:01:38.2788999Z Syncing repository: HisetteTom/pimp
2026-05-18T14:01:38.2792740Z ##[group]Getting Git version info
2026-05-18T14:01:38.2793886Z Working directory is '/home/runner/work/pimp/pimp'
2026-05-18T14:01:38.2796146Z [command]/usr/bin/git version
2026-05-18T14:01:38.2845977Z git version 2.54.0
2026-05-18T14:01:38.2875456Z ##[endgroup]
2026-05-18T14:01:38.2892928Z Temporarily overriding HOME='/home/runner/work/_temp/43f1989b-4d35-404b-81d2-17d5c24daeb6' before making global git config changes
2026-05-18T14:01:38.2900686Z Adding repository directory to the temporary git global config as a safe directory
2026-05-18T14:01:38.2916883Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/pimp/pimp
2026-05-18T14:01:38.2967595Z Deleting the contents of '/home/runner/work/pimp/pimp'
2026-05-18T14:01:38.2973838Z ##[group]Initializing the repository
2026-05-18T14:01:38.2978792Z [command]/usr/bin/git init /home/runner/work/pimp/pimp
2026-05-18T14:01:38.3057727Z hint: Using 'master' as the name for the initial branch. This default branch name
2026-05-18T14:01:38.3060609Z hint: will change to "main" in Git 3.0. To configure the initial branch name
2026-05-18T14:01:38.3063163Z hint: to use in all of your new repositories, which will suppress this warning,
2026-05-18T14:01:38.3065100Z hint: call:
2026-05-18T14:01:38.3066055Z hint:
2026-05-18T14:01:38.3067274Z hint: 	git config --global init.defaultBranch <name>
2026-05-18T14:01:38.3068914Z hint:
2026-05-18T14:01:38.3070558Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2026-05-18T14:01:38.3073177Z hint: 'development'. The just-created branch can be renamed via this command:
2026-05-18T14:01:38.3075251Z hint:
2026-05-18T14:01:38.3076297Z hint: 	git branch -m <name>
2026-05-18T14:01:38.3077523Z hint:
2026-05-18T14:01:38.3079158Z hint: Disable this message with "git config set advice.defaultBranchName false"
2026-05-18T14:01:38.3082169Z Initialized empty Git repository in /home/runner/work/pimp/pimp/.git/
2026-05-18T14:01:38.3086200Z [command]/usr/bin/git remote add origin https://github.com/HisetteTom/pimp
2026-05-18T14:01:38.3136132Z ##[endgroup]
2026-05-18T14:01:38.3138715Z ##[group]Disabling automatic garbage collection
2026-05-18T14:01:38.3141197Z [command]/usr/bin/git config --local gc.auto 0
2026-05-18T14:01:38.3173936Z ##[endgroup]
2026-05-18T14:01:38.3176008Z ##[group]Setting up auth
2026-05-18T14:01:38.3179337Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-05-18T14:01:38.3246152Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-05-18T14:01:38.3560347Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-05-18T14:01:38.3590553Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-05-18T14:01:38.3838169Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-05-18T14:01:38.3874344Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-05-18T14:01:38.4146003Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
2026-05-18T14:01:38.4182294Z ##[endgroup]
2026-05-18T14:01:38.4184751Z ##[group]Fetching the repository
2026-05-18T14:01:38.4193672Z [command]/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/*
2026-05-18T14:01:38.8139235Z From https://github.com/HisetteTom/pimp
2026-05-18T14:01:38.8160870Z  * [new branch]      main       -> origin/main
2026-05-18T14:01:38.8166185Z [command]/usr/bin/git branch --list --remote origin/main
2026-05-18T14:01:38.8168286Z   origin/main
2026-05-18T14:01:38.8173059Z [command]/usr/bin/git rev-parse refs/remotes/origin/main
2026-05-18T14:01:38.8175378Z 0b9b18c7cddeed1fb735d5b3978da3020936b4c0
2026-05-18T14:01:38.8181055Z ##[endgroup]
2026-05-18T14:01:38.8182896Z ##[group]Determining the checkout info
2026-05-18T14:01:38.8184302Z ##[endgroup]
2026-05-18T14:01:38.8185538Z [command]/usr/bin/git sparse-checkout disable
2026-05-18T14:01:38.8207352Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2026-05-18T14:01:38.8239223Z ##[group]Checking out the ref
2026-05-18T14:01:38.8242889Z [command]/usr/bin/git checkout --progress --force -B main refs/remotes/origin/main
2026-05-18T14:01:38.8337347Z Switched to a new branch 'main'
2026-05-18T14:01:38.8339152Z branch 'main' set up to track 'origin/main'.
2026-05-18T14:01:38.8342905Z ##[endgroup]
2026-05-18T14:01:38.8426189Z [command]/usr/bin/git log -1 --format=%H
2026-05-18T14:01:38.8428543Z 0b9b18c7cddeed1fb735d5b3978da3020936b4c0
2026-05-18T14:01:38.8802549Z ##[group]Run oven-sh/setup-bun@v1
2026-05-18T14:01:38.8803986Z with:
2026-05-18T14:01:38.8804996Z   bun-version: latest
2026-05-18T14:01:38.8806137Z   no-cache: false
2026-05-18T14:01:38.8807200Z ##[endgroup]
2026-05-18T14:01:39.0276799Z Downloading a new version of Bun: https://bun.sh/download/latest/linux/x64?avx2=true&profile=false
2026-05-18T14:01:39.5704396Z [command]/usr/bin/unzip -o -q /home/runner/work/_temp/ba23b5a3-0e01-46bf-85e1-7be72c0bd143
2026-05-18T14:01:40.4175419Z [command]/home/runner/.bun/bin/bun --revision
2026-05-18T14:01:40.4237273Z 1.3.14+0d9b296af
2026-05-18T14:01:40.4537797Z ##[group]Run millionco/react-doctor@main
2026-05-18T14:01:40.4538101Z with:
2026-05-18T14:01:40.4538572Z   github-token: ***
2026-05-18T14:01:40.4538802Z   directory: .
2026-05-18T14:01:40.4538995Z   verbose: true
2026-05-18T14:01:40.4539178Z   fail-on: error
2026-05-18T14:01:40.4539365Z   offline: false
2026-05-18T14:01:40.4539544Z   annotations: false
2026-05-18T14:01:40.4539948Z   node-version: 22
2026-05-18T14:01:40.4540149Z ##[endgroup]
2026-05-18T14:01:40.4664608Z ##[group]Run actions/setup-node@v4
2026-05-18T14:01:40.4664874Z with:
2026-05-18T14:01:40.4665061Z   node-version: 22
2026-05-18T14:01:40.4665283Z   always-auth: false
2026-05-18T14:01:40.4665489Z   check-latest: false
2026-05-18T14:01:40.4665799Z   token: ***
2026-05-18T14:01:40.4665993Z ##[endgroup]
2026-05-18T14:01:40.6628020Z Found in cache @ /opt/hostedtoolcache/node/22.22.2/x64
2026-05-18T14:01:40.6650159Z ##[group]Environment details
2026-05-18T14:01:41.1966000Z node: v22.22.2
2026-05-18T14:01:41.1966995Z npm: 10.9.7
2026-05-18T14:01:41.1967620Z yarn: 1.22.22
2026-05-18T14:01:41.1968608Z ##[endgroup]
2026-05-18T14:01:41.2106540Z ##[group]Run FLAGS=("--fail-on" "$INPUT_FAIL_ON")
2026-05-18T14:01:41.2106999Z [36;1mFLAGS=("--fail-on" "$INPUT_FAIL_ON")[0m
2026-05-18T14:01:41.2107373Z [36;1mif [ "$INPUT_VERBOSE" = "true" ]; then FLAGS+=("--verbose"); fi[0m
2026-05-18T14:01:41.2107835Z [36;1mif [ -n "$INPUT_PROJECT" ]; then FLAGS+=("--project" "$INPUT_PROJECT"); fi[0m
2026-05-18T14:01:41.2108327Z [36;1mif [ -n "$INPUT_DIFF" ]; then FLAGS+=("--diff" "$INPUT_DIFF"); fi[0m
2026-05-18T14:01:41.2108804Z [36;1mif [ "$INPUT_OFFLINE" = "true" ]; then FLAGS+=("--offline"); fi[0m
2026-05-18T14:01:41.2109231Z [36;1mif [ "$INPUT_ANNOTATIONS" = "true" ]; then FLAGS+=("--annotations"); fi[0m
2026-05-18T14:01:41.2109576Z [36;1m[0m
2026-05-18T14:01:41.2110271Z [36;1mOUTPUT_FILE="${RUNNER_TEMP:-/tmp}/react-doctor-output-${GITHUB_RUN_ID:-$$}.txt"[0m
2026-05-18T14:01:41.2110775Z [36;1mecho "REACT_DOCTOR_OUTPUT_FILE=$OUTPUT_FILE" >> "$GITHUB_ENV"[0m
2026-05-18T14:01:41.2111096Z [36;1m[0m
2026-05-18T14:01:41.2111297Z [36;1mif [ -n "$INPUT_GITHUB_TOKEN" ]; then[0m
2026-05-18T14:01:41.2111651Z [36;1m  # --pr-comment demotes weak-signal rule families (default:[0m
2026-05-18T14:01:41.2112047Z [36;1m  # `design` tag) from the printed output and the fail-on gate[0m
2026-05-18T14:01:41.2112439Z [36;1m  # so style cleanup doesn't dilute meaningful React findings[0m
2026-05-18T14:01:41.2112825Z [36;1m  # in the sticky PR comment. Configure overrides via[0m
2026-05-18T14:01:41.2113245Z [36;1m  # config.surfaces.{prComment,ciFailure} in react-doctor.config.json.[0m
2026-05-18T14:01:41.2113713Z [36;1m  RAW_FILE="${RUNNER_TEMP:-/tmp}/react-doctor-raw-${GITHUB_RUN_ID:-$$}.txt"[0m
2026-05-18T14:01:41.2114059Z [36;1m  set +e[0m
2026-05-18T14:01:41.2114419Z [36;1m  npx react-doctor@latest "$INPUT_DIRECTORY" "${FLAGS[@]}" --pr-comment | tee "$RAW_FILE"[0m
2026-05-18T14:01:41.2114866Z [36;1m  PIPELINE_EXIT_CODES=("${PIPESTATUS[@]}")[0m
2026-05-18T14:01:41.2115161Z [36;1m  set -e[0m
2026-05-18T14:01:41.2115443Z [36;1m  # Strip annotation workflow commands from the PR-comment body;[0m
2026-05-18T14:01:41.2116116Z [36;1m  # the runner still parses them from the live step log.[0m
2026-05-18T14:01:41.2116514Z [36;1m  sed -E '/^::(error|warning) /d' "$RAW_FILE" > "$OUTPUT_FILE"[0m
2026-05-18T14:01:41.2116986Z [36;1m  if [ "${PIPELINE_EXIT_CODES[1]}" -ne 0 ]; then exit "${PIPELINE_EXIT_CODES[1]}"; fi[0m
2026-05-18T14:01:41.2117393Z [36;1m  exit "${PIPELINE_EXIT_CODES[0]}"[0m
2026-05-18T14:01:41.2117643Z [36;1melse[0m
2026-05-18T14:01:41.2117910Z [36;1m  npx react-doctor@latest "$INPUT_DIRECTORY" "${FLAGS[@]}"[0m
2026-05-18T14:01:41.2118223Z [36;1mfi[0m
2026-05-18T14:01:41.2162848Z shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0}
2026-05-18T14:01:41.2163184Z env:
2026-05-18T14:01:41.2163363Z   NO_COLOR: 1
2026-05-18T14:01:41.2163540Z   INPUT_DIRECTORY: .
2026-05-18T14:01:41.2163735Z   INPUT_VERBOSE: true
2026-05-18T14:01:41.2164182Z   INPUT_PROJECT: 
2026-05-18T14:01:41.2164372Z   INPUT_DIFF: 
2026-05-18T14:01:41.2164829Z   INPUT_GITHUB_TOKEN: ***
2026-05-18T14:01:41.2165059Z   INPUT_FAIL_ON: error
2026-05-18T14:01:41.2165280Z   INPUT_OFFLINE: false
2026-05-18T14:01:41.2165469Z   INPUT_ANNOTATIONS: false
2026-05-18T14:01:41.2165704Z   RUNNER_TEMP: /home/runner/work/_temp
2026-05-18T14:01:41.2165949Z   GITHUB_RUN_ID: 26038362818
2026-05-18T14:01:41.2166165Z ##[endgroup]
2026-05-18T14:01:43.6256486Z npm warn exec The following package was not found and will be installed: react-doctor@0.1.6
2026-05-18T14:01:55.7154679Z error: unknown option '--pr-comment'
2026-05-18T14:01:55.8194349Z ##[error]Process completed with exit code 1.
2026-05-18T14:01:55.8225887Z ##[group]Run # HACK: --score is an output-collection step, not a gate. Force
2026-05-18T14:01:55.8226376Z [36;1m# HACK: --score is an output-collection step, not a gate. Force[0m
2026-05-18T14:01:55.8226813Z [36;1m# --fail-on none so older react-doctor releases (which exit[0m
2026-05-18T14:01:55.8227215Z [36;1m# non-zero when the score lands in the "Needs work" band, even[0m
2026-05-18T14:01:55.8227964Z [36;1m# though the value itself is the only meaningful signal here)[0m
2026-05-18T14:01:55.8228376Z [36;1m# don't fail the composite action under `set -e -o pipefail`.[0m
2026-05-18T14:01:55.8228781Z [36;1mSCORE_ARGS=("$INPUT_DIRECTORY" "--score" "--fail-on" "none")[0m
2026-05-18T14:01:55.8229196Z [36;1mif [ "$INPUT_OFFLINE" = "true" ]; then SCORE_ARGS+=("--offline"); fi[0m
2026-05-18T14:01:55.8230039Z [36;1mSCORE=$(npx react-doctor@latest "${SCORE_ARGS[@]}" 2>/dev/null | tail -1 | tr -d '[:space:]') || true[0m
2026-05-18T14:01:55.8230593Z [36;1mif [[ -n "$SCORE" && "$SCORE" =~ ^[0-9]+$ ]]; then[0m
2026-05-18T14:01:55.8230920Z [36;1m  echo "score=$SCORE" >> "$GITHUB_OUTPUT"[0m
2026-05-18T14:01:55.8231181Z [36;1mfi[0m
2026-05-18T14:01:55.8266817Z shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0}
2026-05-18T14:01:55.8267129Z env:
2026-05-18T14:01:55.8267467Z   REACT_DOCTOR_OUTPUT_FILE: /home/runner/work/_temp/react-doctor-output-26038362818.txt
2026-05-18T14:01:55.8267865Z   INPUT_DIRECTORY: .
2026-05-18T14:01:55.8268075Z   INPUT_OFFLINE: false
2026-05-18T14:01:55.8268266Z ##[endgroup]
2026-05-18T14:01:57.0437987Z Post job cleanup.
2026-05-18T14:01:57.0499968Z Post job cleanup.
2026-05-18T14:01:57.1505607Z [command]/usr/bin/git version
2026-05-18T14:01:57.1546951Z git version 2.54.0
2026-05-18T14:01:57.1592556Z Temporarily overriding HOME='/home/runner/work/_temp/39a4f1d8-5814-480c-abd1-a87712306f04' before making global git config changes
2026-05-18T14:01:57.1594365Z Adding repository directory to the temporary git global config as a safe directory
2026-05-18T14:01:57.1599320Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/pimp/pimp
2026-05-18T14:01:57.1650864Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-05-18T14:01:57.1689130Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-05-18T14:01:57.1957680Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-05-18T14:01:57.1988608Z http.https://github.com/.extraheader
2026-05-18T14:01:57.2003761Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
2026-05-18T14:01:57.2039721Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-05-18T14:01:57.2310259Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-05-18T14:01:57.2351667Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-05-18T14:01:57.2711471Z Cleaning up orphan processes
2026-05-18T14:01:57.2964785Z ##[warning]Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/checkout@v4, actions/setup-node@v4, oven-sh/setup-bun@v1. Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026. Node.js 20 will be removed from the runner on September 16th, 2026. Please check if updated versions of these actions are available that support Node.js 24. To opt into Node.js 24 now, set the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true environment variable on the runner or in your workflow file. Once Node.js 24 becomes the default, you can temporarily opt out by setting ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
