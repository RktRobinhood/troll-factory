# Pilot QA

Tested the authored first episode as a self-paced classroom pilot. It is not a controlled assessment or a prototype of the original game's historic assets, simulation or logic.

- Pure engine: six publication/recovery paths, both source-origin relationships, duplicate/unopened source guards, invalid phases cannot bypass the workflow, retained evidence when returning, matched claim evaluation, keyboard-selectable transfer and full reset.
- Real Chromium: 1440×844 light, 1280×650 keyboard, 900×844 light, 390×844 touch light and 320×844 touch dark. Exercised all six outcome branches, no horizontal overflow, 44px button controls, restart cancel and confirm, checkpoint focus, source classification, actual source details and debrief feedback. Each of the three transfer labels appears in the correct place and the deliberately wrong choice is explained without blame.
- Opened the actual `file://index.html` at 390px with browser network disabled and finished the full game and support pages. Browser run observed only same-site assets in HTTP and only local file assets offline. No storage written.
- Separate weak-evidence probe starts with circulating post + resident only. The player can still make a considered editorial decision, but both the evidence desk and decision page point clearly to the full notice and firsthand room check. Following either returns to the right source and preserves earlier thinking; after both are opened the reminder goes away. Restart clears all choices.
- The 320 dark and 390 light screenshots, the desktop briefing and review, the mobile comparison and the transfer were visually inspected. Playwright emulates narrow touch viewports, not full physical handset coverage; a native screen-reader session and a live classroom trial were not run. Play time is an estimate, not measured efficacy.

Use the browser test command to reproduce these results. Test captures and logs do not belong in the classroom site.
