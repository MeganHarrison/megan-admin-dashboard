# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Features

### CSV Import to Cloudflare D1
- Page available at `/csv-import` for uploading CSV files
- Imports data to the `text-bc` table in the `megan-personal` D1 database
- Database ID: `f450193b-9536-4ada-8271-2a8cd917069e`
- Worker configuration in `wrangler.toml`
- See `documentation/csv-import-d1.md` for deployment instructions

## Rules

### MANDATORY: TEST BEFORE CLAIMING ANYTHING WORKS
**ABSOLUTE REQUIREMENT**: You MUST test EVERY feature, deployment, or functionality BEFORE saying it works. No exceptions.

1. **NEVER say "it's working" without testing first**
2. **NEVER say "successfully deployed" without verifying the deployment**
3. **NEVER say "the functionality is ready" without running actual tests**
4. **ALWAYS test with real data/files, not just checking if commands succeed**
5. **If you cannot test something, explicitly say "I implemented this but have NOT tested it"**

Testing means:
- For web pages: Actually visiting the URL and verifying it loads correctly
- For APIs: Making real requests and checking responses
- For functionality: Running it end-to-end with test data
- For deployments: Accessing the live URL and confirming it works

This rule exists because untested claims waste time with unnecessary back-and-forth.

### Task Completion Rule
NEVER say "I've completed [task]" or mark a task as done without:
1. Actually running tests using Playwright MCP server
2. Verifying the functionality works in the browser
3. Confirming no errors occur during testing

If testing fails or you cannot test, you must say "I've implemented [task] but need to test it" instead of claiming completion.

### Use Cloudflare Workers MCP anytime you need information on things such as R2 Bucket Files, D1 database information, Agents, ect.

### Be proactive
If you have the ability to complete an action or fix something, do it. Don't ask me to do something that you could have done. 

The goal is to streamline and make the coding process as efficient as possible. It's just a waste of time for you to tell me to do something and then wait for me to do it rather than just doing it yourself.

Again, remember to always test after new code is created to ensure it's working as intended and update documentation in CLAUDE.md and README.md.
