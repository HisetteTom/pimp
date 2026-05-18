2026-05-18T15:51:36.1837246Z Current runner version: '2.334.0'
2026-05-18T15:51:36.1871803Z ##[group]Runner Image Provisioner
2026-05-18T15:51:36.1873078Z Hosted Compute Agent
2026-05-18T15:51:36.1874142Z Version: 20260213.493
2026-05-18T15:51:36.1875278Z Commit: 5c115507f6dd24b8de37d8bbe0bb4509d0cc0fa3
2026-05-18T15:51:36.1876926Z Build Date: 2026-02-13T00:28:41Z
2026-05-18T15:51:36.1878179Z Worker ID: {9cd3f571-19b5-4e10-b89e-5f5d94b622cb}
2026-05-18T15:51:36.1879389Z Azure Region: westus
2026-05-18T15:51:36.1880374Z ##[endgroup]
2026-05-18T15:51:36.1882751Z ##[group]Operating System
2026-05-18T15:51:36.1883970Z Ubuntu
2026-05-18T15:51:36.1884818Z 24.04.4
2026-05-18T15:51:36.1885997Z LTS
2026-05-18T15:51:36.1886944Z ##[endgroup]
2026-05-18T15:51:36.1887866Z ##[group]Runner Image
2026-05-18T15:51:36.1888855Z Image: ubuntu-24.04
2026-05-18T15:51:36.1889874Z Version: 20260513.135.3
2026-05-18T15:51:36.1892039Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20260513.135/images/ubuntu/Ubuntu2404-Readme.md
2026-05-18T15:51:36.1894687Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20260513.135
2026-05-18T15:51:36.1896632Z ##[endgroup]
2026-05-18T15:51:36.1898496Z ##[group]GITHUB_TOKEN Permissions
2026-05-18T15:51:36.1901056Z Contents: write
2026-05-18T15:51:36.1901925Z Metadata: read
2026-05-18T15:51:36.1902795Z PullRequests: write
2026-05-18T15:51:36.1903673Z ##[endgroup]
2026-05-18T15:51:36.1906992Z Secret source: Actions
2026-05-18T15:51:36.1908222Z Prepare workflow directory
2026-05-18T15:51:36.2678253Z Prepare all required actions
2026-05-18T15:51:36.2736876Z Getting action download info
2026-05-18T15:51:37.0105776Z Download action repository 'actions/checkout@v4' (SHA:34e114876b0b11c390a56381ad16ebd13914f8d5)
2026-05-18T15:51:37.1396496Z Download action repository 'oven-sh/setup-bun@v1' (SHA:f4d14e03ff726c06358e5557344e1da148b56cf7)
2026-05-18T15:51:37.5447705Z Download action repository 'millionco/react-doctor@main' (SHA:549e4d2132dbbe3221bfd9e2d25b802fb31bbaff)
2026-05-18T15:51:38.0576501Z Download action repository 'actions/github-script@v7' (SHA:f28e40c7f34bde8b3046d885e986cb6290c5673b)
2026-05-18T15:51:38.4350280Z Download action repository 'stefanzweifel/git-auto-commit-action@v5' (SHA:b863ae1933cb653a53c021fe36dbb774e1fb9403)
2026-05-18T15:51:38.8328384Z Getting action download info
2026-05-18T15:51:39.1592610Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
2026-05-18T15:51:39.2905774Z Complete job name: doctor
2026-05-18T15:51:39.3561012Z ##[group]Run actions/checkout@v4
2026-05-18T15:51:39.3561588Z with:
2026-05-18T15:51:39.3561777Z   fetch-depth: 0
2026-05-18T15:51:39.3561990Z   repository: HisetteTom/pimp
2026-05-18T15:51:39.3562370Z   token: ***
2026-05-18T15:51:39.3562554Z   ssh-strict: true
2026-05-18T15:51:39.3562743Z   ssh-user: git
2026-05-18T15:51:39.3562941Z   persist-credentials: true
2026-05-18T15:51:39.3563154Z   clean: true
2026-05-18T15:51:39.3563353Z   sparse-checkout-cone-mode: true
2026-05-18T15:51:39.3563603Z   fetch-tags: false
2026-05-18T15:51:39.3563792Z   show-progress: true
2026-05-18T15:51:39.3563977Z   lfs: false
2026-05-18T15:51:39.3564139Z   submodules: false
2026-05-18T15:51:39.3564319Z   set-safe-directory: true
2026-05-18T15:51:39.3564721Z env:
2026-05-18T15:51:39.3564881Z   NO_COLOR: 1
2026-05-18T15:51:39.3565054Z ##[endgroup]
2026-05-18T15:51:39.4819661Z Syncing repository: HisetteTom/pimp
2026-05-18T15:51:39.4821659Z ##[group]Getting Git version info
2026-05-18T15:51:39.4822372Z Working directory is '/home/runner/work/pimp/pimp'
2026-05-18T15:51:39.4823323Z [command]/usr/bin/git version
2026-05-18T15:51:39.4886331Z git version 2.54.0
2026-05-18T15:51:39.4915769Z ##[endgroup]
2026-05-18T15:51:39.4933477Z Temporarily overriding HOME='/home/runner/work/_temp/aa2bef98-8d0e-47b4-87a3-da151696d98f' before making global git config changes
2026-05-18T15:51:39.4939796Z Adding repository directory to the temporary git global config as a safe directory
2026-05-18T15:51:39.4941874Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/pimp/pimp
2026-05-18T15:51:39.5002076Z Deleting the contents of '/home/runner/work/pimp/pimp'
2026-05-18T15:51:39.5006567Z ##[group]Initializing the repository
2026-05-18T15:51:39.5012783Z [command]/usr/bin/git init /home/runner/work/pimp/pimp
2026-05-18T15:51:39.5105162Z hint: Using 'master' as the name for the initial branch. This default branch name
2026-05-18T15:51:39.5106935Z hint: will change to "main" in Git 3.0. To configure the initial branch name
2026-05-18T15:51:39.5108881Z hint: to use in all of your new repositories, which will suppress this warning,
2026-05-18T15:51:39.5109667Z hint: call:
2026-05-18T15:51:39.5109966Z hint:
2026-05-18T15:51:39.5110403Z hint: 	git config --global init.defaultBranch <name>
2026-05-18T15:51:39.5110933Z hint:
2026-05-18T15:51:39.5111429Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2026-05-18T15:51:39.5112311Z hint: 'development'. The just-created branch can be renamed via this command:
2026-05-18T15:51:39.5112981Z hint:
2026-05-18T15:51:39.5113371Z hint: 	git branch -m <name>
2026-05-18T15:51:39.5113740Z hint:
2026-05-18T15:51:39.5114276Z hint: Disable this message with "git config set advice.defaultBranchName false"
2026-05-18T15:51:39.5116622Z Initialized empty Git repository in /home/runner/work/pimp/pimp/.git/
2026-05-18T15:51:39.5128820Z [command]/usr/bin/git remote add origin https://github.com/HisetteTom/pimp
2026-05-18T15:51:39.5170334Z ##[endgroup]
2026-05-18T15:51:39.5171346Z ##[group]Disabling automatic garbage collection
2026-05-18T15:51:39.5175250Z [command]/usr/bin/git config --local gc.auto 0
2026-05-18T15:51:39.5208151Z ##[endgroup]
2026-05-18T15:51:39.5209182Z ##[group]Setting up auth
2026-05-18T15:51:39.5217908Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-05-18T15:51:39.5254111Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-05-18T15:51:39.5592557Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-05-18T15:51:39.5625445Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-05-18T15:51:39.5857266Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-05-18T15:51:39.5890524Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-05-18T15:51:39.6123795Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
2026-05-18T15:51:39.6165028Z ##[endgroup]
2026-05-18T15:51:39.6166172Z ##[group]Fetching the repository
2026-05-18T15:51:39.6174503Z [command]/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/*
2026-05-18T15:51:40.3262031Z From https://github.com/HisetteTom/pimp
2026-05-18T15:51:40.3278496Z  * [new branch]      main       -> origin/main
2026-05-18T15:51:40.3279312Z  * [new branch]      test       -> origin/test
2026-05-18T15:51:40.3281357Z [command]/usr/bin/git branch --list --remote origin/test
2026-05-18T15:51:40.3282139Z   origin/test
2026-05-18T15:51:40.3283852Z [command]/usr/bin/git rev-parse refs/remotes/origin/test
2026-05-18T15:51:40.3284681Z 98d96a50539eb33c6ffa157f1c6f3865cc061220
2026-05-18T15:51:40.3287098Z ##[endgroup]
2026-05-18T15:51:40.3287933Z ##[group]Determining the checkout info
2026-05-18T15:51:40.3288831Z ##[endgroup]
2026-05-18T15:51:40.3289395Z [command]/usr/bin/git sparse-checkout disable
2026-05-18T15:51:40.3291025Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2026-05-18T15:51:40.3293043Z ##[group]Checking out the ref
2026-05-18T15:51:40.3294026Z [command]/usr/bin/git checkout --progress --force -B test refs/remotes/origin/test
2026-05-18T15:51:40.3295369Z Switched to a new branch 'test'
2026-05-18T15:51:40.3296929Z branch 'test' set up to track 'origin/test'.
2026-05-18T15:51:40.3298922Z ##[endgroup]
2026-05-18T15:51:40.3300359Z [command]/usr/bin/git log -1 --format=%H
2026-05-18T15:51:40.3301009Z 98d96a50539eb33c6ffa157f1c6f3865cc061220
2026-05-18T15:51:40.3481634Z ##[group]Run oven-sh/setup-bun@v1
2026-05-18T15:51:40.3481901Z with:
2026-05-18T15:51:40.3482067Z   bun-version: latest
2026-05-18T15:51:40.3482261Z   no-cache: false
2026-05-18T15:51:40.3482427Z env:
2026-05-18T15:51:40.3482581Z   NO_COLOR: 1
2026-05-18T15:51:40.3482747Z ##[endgroup]
2026-05-18T15:51:40.4694075Z Downloading a new version of Bun: https://bun.sh/download/latest/linux/x64?avx2=true&profile=false
2026-05-18T15:51:41.1863172Z [command]/usr/bin/unzip -o -q /home/runner/work/_temp/810ba59c-13b8-40f0-a37c-98013d64d8b7
2026-05-18T15:51:41.9019332Z [command]/home/runner/.bun/bin/bun --revision
2026-05-18T15:51:41.9066023Z 1.3.14+0d9b296af
2026-05-18T15:51:41.9287170Z ##[group]Run millionco/react-doctor@main
2026-05-18T15:51:41.9287457Z with:
2026-05-18T15:51:41.9287855Z   github-token: ***
2026-05-18T15:51:41.9288052Z   fail-on: none
2026-05-18T15:51:41.9288222Z   directory: .
2026-05-18T15:51:41.9288393Z   verbose: true
2026-05-18T15:51:41.9288561Z   offline: false
2026-05-18T15:51:41.9288740Z   annotations: false
2026-05-18T15:51:41.9288932Z   node-version: 22
2026-05-18T15:51:41.9289115Z env:
2026-05-18T15:51:41.9289266Z   NO_COLOR: 1
2026-05-18T15:51:41.9289442Z ##[endgroup]
2026-05-18T15:51:41.9404964Z ##[group]Run actions/setup-node@v4
2026-05-18T15:51:41.9405203Z with:
2026-05-18T15:51:41.9405372Z   node-version: 22
2026-05-18T15:51:41.9406010Z   always-auth: false
2026-05-18T15:51:41.9406253Z   check-latest: false
2026-05-18T15:51:41.9406558Z   token: ***
2026-05-18T15:51:41.9406737Z env:
2026-05-18T15:51:41.9406893Z   NO_COLOR: 1
2026-05-18T15:51:41.9407062Z ##[endgroup]
2026-05-18T15:51:42.1294564Z Found in cache @ /opt/hostedtoolcache/node/22.22.2/x64
2026-05-18T15:51:42.1301953Z ##[group]Environment details
2026-05-18T15:51:42.6817659Z node: v22.22.2
2026-05-18T15:51:42.6818529Z npm: 10.9.7
2026-05-18T15:51:42.6819085Z yarn: 1.22.22
2026-05-18T15:51:42.6820771Z ##[endgroup]
2026-05-18T15:51:42.6947133Z ##[group]Run FLAGS=("--fail-on" "$INPUT_FAIL_ON")
2026-05-18T15:51:42.6947581Z [36;1mFLAGS=("--fail-on" "$INPUT_FAIL_ON")[0m
2026-05-18T15:51:42.6947954Z [36;1mif [ "$INPUT_VERBOSE" = "true" ]; then FLAGS+=("--verbose"); fi[0m
2026-05-18T15:51:42.6948412Z [36;1mif [ -n "$INPUT_PROJECT" ]; then FLAGS+=("--project" "$INPUT_PROJECT"); fi[0m
2026-05-18T15:51:42.6948865Z [36;1mif [ -n "$INPUT_DIFF" ]; then FLAGS+=("--diff" "$INPUT_DIFF"); fi[0m
2026-05-18T15:51:42.6949276Z [36;1mif [ "$INPUT_OFFLINE" = "true" ]; then FLAGS+=("--offline"); fi[0m
2026-05-18T15:51:42.6949715Z [36;1mif [ "$INPUT_ANNOTATIONS" = "true" ]; then FLAGS+=("--annotations"); fi[0m
2026-05-18T15:51:42.6950058Z [36;1m[0m
2026-05-18T15:51:42.6950411Z [36;1mOUTPUT_FILE="${RUNNER_TEMP:-/tmp}/react-doctor-output-${GITHUB_RUN_ID:-$$}.txt"[0m
2026-05-18T15:51:42.6950905Z [36;1mecho "REACT_DOCTOR_OUTPUT_FILE=$OUTPUT_FILE" >> "$GITHUB_ENV"[0m
2026-05-18T15:51:42.6951219Z [36;1m[0m
2026-05-18T15:51:42.6951404Z [36;1mif [ -n "$INPUT_GITHUB_TOKEN" ]; then[0m
2026-05-18T15:51:42.6951739Z [36;1m  # --pr-comment demotes weak-signal rule families (default:[0m
2026-05-18T15:51:42.6952137Z [36;1m  # `design` tag) from the printed output and the fail-on gate[0m
2026-05-18T15:51:42.6952530Z [36;1m  # so style cleanup doesn't dilute meaningful React findings[0m
2026-05-18T15:51:42.6952900Z [36;1m  # in the sticky PR comment. Configure overrides via[0m
2026-05-18T15:51:42.6953319Z [36;1m  # config.surfaces.{prComment,ciFailure} in react-doctor.config.json.[0m
2026-05-18T15:51:42.6953797Z [36;1m  RAW_FILE="${RUNNER_TEMP:-/tmp}/react-doctor-raw-${GITHUB_RUN_ID:-$$}.txt"[0m
2026-05-18T15:51:42.6954151Z [36;1m  set +e[0m
2026-05-18T15:51:42.6954692Z [36;1m  npx react-doctor@latest "$INPUT_DIRECTORY" "${FLAGS[@]}" --pr-comment | tee "$RAW_FILE"[0m
2026-05-18T15:51:42.6955144Z [36;1m  PIPELINE_EXIT_CODES=("${PIPESTATUS[@]}")[0m
2026-05-18T15:51:42.6955416Z [36;1m  set -e[0m
2026-05-18T15:51:42.6955939Z [36;1m  # Strip annotation workflow commands from the PR-comment body;[0m
2026-05-18T15:51:42.6956344Z [36;1m  # the runner still parses them from the live step log.[0m
2026-05-18T15:51:42.6956717Z [36;1m  sed -E '/^::(error|warning) /d' "$RAW_FILE" > "$OUTPUT_FILE"[0m
2026-05-18T15:51:42.6957158Z [36;1m  if [ "${PIPELINE_EXIT_CODES[1]}" -ne 0 ]; then exit "${PIPELINE_EXIT_CODES[1]}"; fi[0m
2026-05-18T15:51:42.6957552Z [36;1m  exit "${PIPELINE_EXIT_CODES[0]}"[0m
2026-05-18T15:51:42.6957788Z [36;1melse[0m
2026-05-18T15:51:42.6958039Z [36;1m  npx react-doctor@latest "$INPUT_DIRECTORY" "${FLAGS[@]}"[0m
2026-05-18T15:51:42.6958334Z [36;1mfi[0m
2026-05-18T15:51:42.7000170Z shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0}
2026-05-18T15:51:42.7000736Z env:
2026-05-18T15:51:42.7000908Z   NO_COLOR: 1
2026-05-18T15:51:42.7001075Z   INPUT_DIRECTORY: .
2026-05-18T15:51:42.7001266Z   INPUT_VERBOSE: true
2026-05-18T15:51:42.7001444Z   INPUT_PROJECT: 
2026-05-18T15:51:42.7001622Z   INPUT_DIFF: 
2026-05-18T15:51:42.7002175Z   INPUT_GITHUB_TOKEN: ***
2026-05-18T15:51:42.7002408Z   INPUT_FAIL_ON: none
2026-05-18T15:51:42.7002605Z   INPUT_OFFLINE: false
2026-05-18T15:51:42.7002795Z   INPUT_ANNOTATIONS: false
2026-05-18T15:51:42.7003018Z   RUNNER_TEMP: /home/runner/work/_temp
2026-05-18T15:51:42.7003255Z   GITHUB_RUN_ID: 26044459399
2026-05-18T15:51:42.7003458Z ##[endgroup]
2026-05-18T15:51:44.8945827Z npm warn exec The following package was not found and will be installed: react-doctor@0.2.1
2026-05-18T15:51:49.1282699Z react-doctor v0.2.1
2026-05-18T15:51:49.1291211Z 
2026-05-18T15:51:49.1300230Z CI detected — scoring locally.
2026-05-18T15:51:49.1301053Z 
2026-05-18T15:51:49.1342031Z ✔ Select projects to scan › pimp
2026-05-18T15:51:49.1366386Z Scanning /home/runner/work/pimp/pimp...
2026-05-18T15:51:49.1386006Z 
2026-05-18T15:51:49.1485172Z 
2026-05-18T15:51:49.1487514Z - Detecting framework. Found Next.js.
2026-05-18T15:51:49.1516785Z ✔ Detecting framework. Found Next.js.
2026-05-18T15:51:49.1517711Z - Detecting React version. Found React 19.2.6.
2026-05-18T15:51:49.1537119Z ✔ Detecting React version. Found React 19.2.6.
2026-05-18T15:51:49.1556225Z - Detecting Tailwind. Found Tailwind ^4.3.0.
2026-05-18T15:51:49.1576339Z ✔ Detecting Tailwind. Found Tailwind ^4.3.0.
2026-05-18T15:51:49.1576979Z - Detecting language. Found TypeScript.
2026-05-18T15:51:49.1577628Z ✔ Detecting language. Found TypeScript.
2026-05-18T15:51:49.1578260Z - Detecting React Compiler. Found React Compiler.
2026-05-18T15:51:49.1579037Z ✔ Detecting React Compiler. Found React Compiler.
2026-05-18T15:51:49.1579575Z - Found 15 source files.
2026-05-18T15:51:49.1580047Z ✔ Found 15 source files.
2026-05-18T15:51:49.1580470Z - Running lint checks...
2026-05-18T15:51:49.3949308Z ✔ Running lint checks.
2026-05-18T15:51:49.3964049Z 
2026-05-18T15:51:49.3970409Z   ⚠ react-doctor/nextjs-missing-metadata
2026-05-18T15:51:49.3972098Z       Page without metadata or generateMetadata export — hurts SEO
2026-05-18T15:51:49.3973929Z       → Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`
2026-05-18T15:51:49.3975295Z       src/app/page.tsx:1
2026-05-18T15:51:49.3976372Z 
2026-05-18T15:51:49.3976937Z   ⚠ react-doctor/no-barrel-import
2026-05-18T15:51:49.3978270Z       Import from barrel/index file — import directly from the source module for better tree-shaking
2026-05-18T15:51:49.3979991Z       → Import from the direct path: `import { Button } from './components/Button'` instead of `./components`
2026-05-18T15:51:49.3981086Z       src/db/index.ts:3
2026-05-18T15:51:49.3981487Z 
2026-05-18T15:51:49.3981911Z   React Doctor (www.react.doctor)
2026-05-18T15:51:49.3982634Z   Score unavailable in offline mode.
2026-05-18T15:51:49.3983517Z 
2026-05-18T15:51:49.3983989Z   2 issues across 2/15 files  in 262ms
2026-05-18T15:51:49.3987129Z   Full diagnostics written to /tmp/react-doctor-c0835b08-faa7-4a19-be1c-3d7136d18218
2026-05-18T15:51:49.3988240Z 
2026-05-18T15:51:49.4724479Z ##[group]Run # HACK: --score is an output-collection step, not a gate. Force
2026-05-18T15:51:49.4724996Z [36;1m# HACK: --score is an output-collection step, not a gate. Force[0m
2026-05-18T15:51:49.4725740Z [36;1m# --fail-on none so older react-doctor releases (which exit[0m
2026-05-18T15:51:49.4726266Z [36;1m# non-zero when the score lands in the "Needs work" band, even[0m
2026-05-18T15:51:49.4726679Z [36;1m# though the value itself is the only meaningful signal here)[0m
2026-05-18T15:51:49.4727099Z [36;1m# don't fail the composite action under `set -e -o pipefail`.[0m
2026-05-18T15:51:49.4727527Z [36;1mSCORE_ARGS=("$INPUT_DIRECTORY" "--score" "--fail-on" "none")[0m
2026-05-18T15:51:49.4727944Z [36;1mif [ "$INPUT_OFFLINE" = "true" ]; then SCORE_ARGS+=("--offline"); fi[0m
2026-05-18T15:51:49.4728690Z [36;1mSCORE=$(npx react-doctor@latest "${SCORE_ARGS[@]}" 2>/dev/null | tail -1 | tr -d '[:space:]') || true[0m
2026-05-18T15:51:49.4729180Z [36;1mif [[ -n "$SCORE" && "$SCORE" =~ ^[0-9]+$ ]]; then[0m
2026-05-18T15:51:49.4729493Z [36;1m  echo "score=$SCORE" >> "$GITHUB_OUTPUT"[0m
2026-05-18T15:51:49.4729743Z [36;1mfi[0m
2026-05-18T15:51:49.4764291Z shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0}
2026-05-18T15:51:49.4764607Z env:
2026-05-18T15:51:49.4764759Z   NO_COLOR: 1
2026-05-18T15:51:49.4765093Z   REACT_DOCTOR_OUTPUT_FILE: /home/runner/work/_temp/react-doctor-output-26044459399.txt
2026-05-18T15:51:49.4765885Z   INPUT_DIRECTORY: .
2026-05-18T15:51:49.4766092Z   INPUT_OFFLINE: false
2026-05-18T15:51:49.4766284Z ##[endgroup]
2026-05-18T15:51:50.7235813Z ##[group]Run SCORE=
2026-05-18T15:51:50.7236076Z [36;1mSCORE=[0m
2026-05-18T15:51:50.7236263Z [36;1mCOLOR="lightgrey"[0m
2026-05-18T15:51:50.7236554Z [36;1mif [[ "$SCORE" =~ ^[0-9]+$ ]]; then[0m
2026-05-18T15:51:50.7236886Z [36;1m  if [ "$SCORE" -gt 85 ]; then COLOR="brightgreen";[0m
2026-05-18T15:51:50.7237213Z [36;1m  elif [ "$SCORE" -gt 70 ]; then COLOR="green";[0m
2026-05-18T15:51:50.7237525Z [36;1m  elif [ "$SCORE" -gt 50 ]; then COLOR="yellow";[0m
2026-05-18T15:51:50.7237822Z [36;1m  elif [ "$SCORE" -gt 25 ]; then COLOR="orange";[0m
2026-05-18T15:51:50.7238092Z [36;1m  else COLOR="red"; fi[0m
2026-05-18T15:51:50.7238298Z [36;1melse[0m
2026-05-18T15:51:50.7238469Z [36;1m  SCORE="0"[0m
2026-05-18T15:51:50.7238653Z [36;1mfi[0m
2026-05-18T15:51:50.7238803Z [36;1m[0m
2026-05-18T15:51:50.7239012Z [36;1m# Use Shields.io endpoint or simple badge. [0m
2026-05-18T15:51:50.7239364Z [36;1m# Spaces should be underscores or %20. React_Doctor is fine.[0m
2026-05-18T15:51:50.7239772Z [36;1m# Slashes in message must be encoded as %2F.[0m
2026-05-18T15:51:50.7240384Z [36;1mBADGE="[![Health Score](https://img.shields.io/badge/React_Doctor-${SCORE}%2F100-${COLOR})](https://github.com/millionco/react-doctor)"[0m
2026-05-18T15:51:50.7240948Z [36;1m[0m
2026-05-18T15:51:50.7241137Z [36;1m# Replace the badge line in README.md[0m
2026-05-18T15:51:50.7241435Z [36;1m# Match the existing badge line and swap it.[0m
2026-05-18T15:51:50.7241905Z [36;1msed -i "s@\[\!\[Health Score\].*@${BADGE} <!-- DOCTOR_BADGE_START --><!-- DOCTOR_BADGE_END -->@g" README.md[0m
2026-05-18T15:51:50.7276896Z shell: /usr/bin/bash -e {0}
2026-05-18T15:51:50.7277121Z env:
2026-05-18T15:51:50.7277281Z   NO_COLOR: 1
2026-05-18T15:51:50.7277612Z   REACT_DOCTOR_OUTPUT_FILE: /home/runner/work/_temp/react-doctor-output-26044459399.txt
2026-05-18T15:51:50.7278002Z ##[endgroup]
2026-05-18T15:51:50.7410866Z ##[group]Run stefanzweifel/git-auto-commit-action@v5
2026-05-18T15:51:50.7411176Z with:
2026-05-18T15:51:50.7411438Z   commit_message: chore: update react-doctor health score [skip ci]
2026-05-18T15:51:50.7411771Z   file_pattern: README.md
2026-05-18T15:51:50.7411983Z   repository: .
2026-05-18T15:51:50.7412340Z   commit_user_name: github-actions[bot]
2026-05-18T15:51:50.7412699Z   commit_user_email: 41898282+github-actions[bot]@users.noreply.github.com
2026-05-18T15:51:50.7413150Z   commit_author: HisetteTom <144245085+HisetteTom@users.noreply.github.com>
2026-05-18T15:51:50.7413505Z   skip_dirty_check: false
2026-05-18T15:51:50.7413695Z   skip_fetch: false
2026-05-18T15:51:50.7413874Z   skip_checkout: false
2026-05-18T15:51:50.7414062Z   disable_globbing: false
2026-05-18T15:51:50.7414258Z   create_branch: false
2026-05-18T15:51:50.7414451Z   create_git_tag_only: false
2026-05-18T15:51:50.7414656Z   internal_git_binary: git
2026-05-18T15:51:50.7414847Z env:
2026-05-18T15:51:50.7415032Z   NO_COLOR: 1
2026-05-18T15:51:50.7415350Z   REACT_DOCTOR_OUTPUT_FILE: /home/runner/work/_temp/react-doctor-output-26044459399.txt
2026-05-18T15:51:50.7416162Z ##[endgroup]
2026-05-18T15:51:50.7706383Z Started: bash /home/runner/work/_actions/stefanzweifel/git-auto-commit-action/v5/entrypoint.sh
2026-05-18T15:51:50.7750751Z INPUT_REPOSITORY value: .
2026-05-18T15:51:50.7751513Z INPUT_STATUS_OPTIONS: 
2026-05-18T15:51:50.7752715Z INPUT_FILE_PATTERN: README.md
2026-05-18T15:51:50.7814928Z INPUT_BRANCH value: 
2026-05-18T15:51:51.3636886Z M	README.md
2026-05-18T15:51:51.3637757Z Your branch is up to date with 'origin/test'.
2026-05-18T15:51:51.3639285Z INPUT_ADD_OPTIONS: 
2026-05-18T15:51:51.3645129Z INPUT_FILE_PATTERN: README.md
2026-05-18T15:51:51.3685776Z INPUT_COMMIT_OPTIONS: 
2026-05-18T15:51:51.3687046Z INPUT_COMMIT_USER_NAME: github-actions[bot]
2026-05-18T15:51:51.3688675Z INPUT_COMMIT_USER_EMAIL: 41898282+github-actions[bot]@users.noreply.github.com
2026-05-18T15:51:51.3689962Z INPUT_COMMIT_MESSAGE: chore: update react-doctor health score [skip ci]
2026-05-18T15:51:51.3691282Z INPUT_COMMIT_AUTHOR: HisetteTom <144245085+HisetteTom@users.noreply.github.com>
2026-05-18T15:51:51.3742633Z [test 06734b7] chore: update react-doctor health score [skip ci]
2026-05-18T15:51:51.3744749Z  Author: HisetteTom <144245085+HisetteTom@users.noreply.github.com>
2026-05-18T15:51:51.3745970Z  1 file changed, 1 insertion(+), 1 deletion(-)
2026-05-18T15:51:51.3761287Z INPUT_TAGGING_MESSAGE: 
2026-05-18T15:51:51.3762093Z No tagging message supplied. No tag will be added.
2026-05-18T15:51:51.3763235Z INPUT_PUSH_OPTIONS: 
2026-05-18T15:51:52.4555164Z To https://github.com/HisetteTom/pimp
2026-05-18T15:51:52.4556392Z    98d96a5..06734b7  test -> test
2026-05-18T15:51:52.4845152Z Post job cleanup.
2026-05-18T15:51:52.4905721Z Post job cleanup.
2026-05-18T15:51:52.6653853Z Post job cleanup.
2026-05-18T15:51:52.8038861Z Post job cleanup.
2026-05-18T15:51:52.9039340Z [command]/usr/bin/git version
2026-05-18T15:51:52.9126542Z git version 2.54.0
2026-05-18T15:51:52.9200807Z Temporarily overriding HOME='/home/runner/work/_temp/7394290f-048c-4b9a-890c-6a07fac84b66' before making global git config changes
2026-05-18T15:51:52.9214806Z Adding repository directory to the temporary git global config as a safe directory
2026-05-18T15:51:52.9216751Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/pimp/pimp
2026-05-18T15:51:52.9265030Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2026-05-18T15:51:52.9313898Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2026-05-18T15:51:52.9559603Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-05-18T15:51:52.9587097Z http.https://github.com/.extraheader
2026-05-18T15:51:52.9604044Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
2026-05-18T15:51:52.9641855Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2026-05-18T15:51:52.9887581Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-05-18T15:51:52.9924775Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
2026-05-18T15:51:53.0297233Z Cleaning up orphan processes
2026-05-18T15:51:53.0667356Z ##[warning]Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/checkout@v4, actions/setup-node@v4, oven-sh/setup-bun@v1, stefanzweifel/git-auto-commit-action@v5. Actions will be forced to run with Node.js 24 by default starting June 2nd, 2026. Node.js 20 will be removed from the runner on September 16th, 2026. Please check if updated versions of these actions are available that support Node.js 24. To opt into Node.js 24 now, set the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true environment variable on the runner or in your workflow file. Once Node.js 24 becomes the default, you can temporarily opt out by setting ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
