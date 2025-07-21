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

### ALWAYS test BEFORE marking tasks as complete
CRITICAL: You MUST test using the Playwright MCP server BEFORE saying a task is complete or marking it as done. This is a hard requirement - no exceptions. If you cannot test, you cannot claim the task is complete.

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
