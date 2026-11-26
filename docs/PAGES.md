# Publishing the classroom build

Development and research live on main. The configured GitHub Pages source is gh-pages at its root. The deployment should contain only the authored episode, its local assets, the teacher guide, learner takeaway and optional cold-transfer card, plus the Pages marker. Do not copy internal handoffs, source references, test captures or data collected in a class trial.

1. Run the pure engine test and relevant browser paths from the exact source.
2. Verify the public branch has not advanced unexpectedly. Copy only the tested static files and create a normal deployment commit.
3. Confirm the successful build matches the exact deployment commit, check public asset bytes, then play through the public desktop/phone route.
4. Keep branch history. To roll back, recreate the previous known good tree as a new commit and verify the fresh deployment.

The pilot itself has no analytics, cookies, accounts, local storage or external requests. GitHub hosts the public static files; any school data collection belongs outside this game and requires separate decisions.
